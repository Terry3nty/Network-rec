import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import recommendationRouter from './routes/recommendationRoutes';
import { prisma } from './db';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
// Mount at both /api and root as a convenience
app.use('/api', recommendationRouter);
app.use('/', recommendationRouter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', details: error });
  }
});

// Latency ping endpoint for client speedtest
app.get('/speedtest/ping', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.status(200).json({ status: 'ok' });
});

// Download speedtest endpoint (generates 5MB random non-compressible buffer)
app.get('/speedtest/download', (req, res) => {
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  
  const sizeMb = parseInt(req.query.size as string) || 5;
  const bufferSize = sizeMb * 1024 * 1024;
  const buffer = Buffer.alloc(bufferSize);
  
  // Write random strings into the buffer so it cannot be compressed
  for (let i = 0; i < bufferSize; i += 65536) {
    const chunkEnd = Math.min(i + 65536, bufferSize);
    buffer.write(Math.random().toString(), i, chunkEnd - i);
  }
  
  res.send(buffer);
});

// In-memory fallback ring buffer to ensure analytics work even during DB maintenance
interface InMemoryLog {
  id: string;
  ip: string;
  isp?: string | null;
  city?: string | null;
  country?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  path?: string | null;
  device?: string | null;
  createdAt: Date;
}
const inMemoryLogs: InMemoryLog[] = [];
const MAX_IN_MEMORY_LOGS = 300;

function categorizeReferrer(rawReferrer?: string | null): string {
  if (!rawReferrer || rawReferrer.trim() === '' || rawReferrer === 'direct') {
    return 'Direct / Bookmark';
  }
  const ref = rawReferrer.toLowerCase();
  if (ref.includes('linkedin.com') || ref.includes('lnkd.in')) {
    return 'LinkedIn';
  }
  if (ref.includes('whatsapp.com') || ref.includes('whatsapp') || ref.includes('wa.me')) {
    return 'WhatsApp';
  }
  if (ref.includes('t.co') || ref.includes('twitter.com') || ref.includes('x.com')) {
    return 'Twitter / X';
  }
  if (ref.includes('google.') || ref.includes('bing.') || ref.includes('duckduckgo.')) {
    return 'Google / Search';
  }
  if (ref.includes('facebook.com') || ref.includes('fb.me') || ref.includes('instagram.com')) {
    return 'Social Media';
  }
  if (ref.includes('github.com')) {
    return 'GitHub';
  }
  try {
    const url = new URL(rawReferrer);
    return url.hostname.replace('www.', '');
  } catch {
    return 'Referral Link';
  }
}

function detectDevice(ua?: string | null): string {
  if (!ua) return 'Desktop';
  const lower = ua.toLowerCase();
  if (lower.includes('ipad') || lower.includes('tablet') || (lower.includes('android') && !lower.includes('mobile'))) {
    return 'Tablet';
  }
  if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) {
    return 'Mobile';
  }
  return 'Desktop';
}

// Record visitor details in database with in-memory resilience
app.post('/analytics/log-visit', async (req, res) => {
  try {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || 'Unknown IP');
    const { isp, city, country, userAgent, referrer, path, device } = req.body;

    const rawReferrer = referrer || req.headers['referer'] || req.headers['referrer'] || null;
    const detectedChannel = categorizeReferrer(rawReferrer as string);
    const resolvedUserAgent = userAgent || (req.headers['user-agent'] as string) || null;
    const resolvedDevice = device || detectDevice(resolvedUserAgent);
    const resolvedPath = path || '/';

    const logEntry: InMemoryLog = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ip,
      isp: isp || null,
      city: city || null,
      country: country || null,
      userAgent: resolvedUserAgent,
      referrer: detectedChannel,
      path: resolvedPath,
      device: resolvedDevice,
      createdAt: new Date(),
    };

    inMemoryLogs.unshift(logEntry);
    if (inMemoryLogs.length > MAX_IN_MEMORY_LOGS) {
      inMemoryLogs.pop();
    }

    try {
      const dbLog = await prisma.visitorLog.create({
        data: {
          ip,
          isp: isp || null,
          city: city || null,
          country: country || null,
          userAgent: resolvedUserAgent,
          referrer: detectedChannel,
          path: resolvedPath,
          device: resolvedDevice,
        },
      });
      return res.status(201).json({ status: 'ok', id: dbLog.id, channel: detectedChannel });
    } catch {
      return res.status(201).json({ status: 'ok', id: logEntry.id, channel: detectedChannel, source: 'memory' });
    }
  } catch (error) {
    console.error('Failed to log visitor:', error);
    res.status(500).json({ error: 'Failed to record visit log.' });
  }
});

// Retrieve comprehensive traffic & acquisition intelligence
app.get('/analytics/stats', async (req, res) => {
  try {
    let logs: (InMemoryLog | any)[] = [];
    let isDbConnected = false;

    try {
      logs = await prisma.visitorLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 300,
      });
      isDbConnected = true;
    } catch {
      logs = inMemoryLogs;
    }

    if (logs.length === 0 && inMemoryLogs.length > 0) {
      logs = inMemoryLogs;
    }

    const totalVisits = isDbConnected ? await prisma.visitorLog.count().catch(() => logs.length) : logs.length;
    const uniqueIps = new Set(logs.map((l) => l.ip)).size;

    const referrerCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const ispCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};
    const pathCounts: Record<string, number> = {};

    for (const log of logs) {
      const ref = log.referrer || 'Direct / Bookmark';
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;

      const city = log.city || 'Unknown';
      cityCounts[city] = (cityCounts[city] || 0) + 1;

      const country = log.country || 'Nigeria';
      countryCounts[country] = (countryCounts[country] || 0) + 1;

      const isp = log.isp || 'Unknown';
      ispCounts[isp] = (ispCounts[isp] || 0) + 1;

      const device = log.device || 'Desktop';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;

      const path = log.path || '/';
      pathCounts[path] = (pathCounts[path] || 0) + 1;
    }

    const sortObject = (obj: Record<string, number>, limit = 8) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }));

    res.status(200).json({
      totalVisits: Math.max(totalVisits, logs.length),
      uniqueVisitors: Math.max(uniqueIps, 1),
      topReferrers: sortObject(referrerCounts),
      topCities: sortObject(cityCounts),
      topCountries: sortObject(countryCounts),
      topIsps: sortObject(ispCounts),
      deviceBreakdown: sortObject(deviceCounts),
      popularPages: sortObject(pathCounts),
      recentLogs: logs.slice(0, 30),
      dbConnected: isDbConnected,
    });
  } catch (error) {
    console.error('Failed to fetch analytics statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics stats.' });
  }
});

app.use('/api/analytics', (req, res, next) => {
  // Mount analytics routes under /api as well
  next();
});

// Start Server
const server = app.listen(CONFIG.PORT, () => {
  console.log(`[NetworkWise Server] Running on http://localhost:${CONFIG.PORT}`);
});

// Handle graceful shutdowns
const shutdown = async () => {
  console.log('Shutting down server...');
  server.close(async () => {
    console.log('Express server closed.');
    await prisma.$disconnect();
    console.log('Database connection disconnected.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
