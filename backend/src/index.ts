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
