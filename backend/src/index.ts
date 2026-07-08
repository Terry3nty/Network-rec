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

// Record visitor details in database
app.post('/analytics/log-visit', async (req, res) => {
  try {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || 'Unknown IP');
    const { isp, city, country, userAgent } = req.body;
    
    const log = await prisma.visitorLog.create({
      data: {
        ip,
        isp: isp || null,
        city: city || null,
        country: country || null,
        userAgent: userAgent || req.headers['user-agent'] || null,
      },
    });
    res.status(201).json({ status: 'ok', id: log.id });
  } catch (error) {
    console.error('Failed to log visitor:', error);
    res.status(500).json({ error: 'Failed to record visit log.' });
  }
});

// Retrieve traffic and connection stats
app.get('/analytics/stats', async (req, res) => {
  try {
    const totalVisits = await prisma.visitorLog.count();
    
    // Group unique IPs count using raw query
    const uniqueIps = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT ip) as count FROM "VisitorLog"
    `;
    const uniqueCount = uniqueIps[0]?.count ? Number(uniqueIps[0].count) : 0;

    // Group and rank popular ISPs
    const topIsps = await prisma.visitorLog.groupBy({
      by: ['isp'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Fetch the 15 most recent visitors
    const recentLogs = await prisma.visitorLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 15,
    });

    res.status(200).json({
      totalVisits,
      uniqueVisitors: uniqueCount,
      topIsps: topIsps.map((item) => ({
        isp: item.isp || 'Unknown',
        count: item._count.id,
      })),
      recentLogs,
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
