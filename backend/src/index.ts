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
