import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/networkwise?schema=public',
  // Scoring Algorithm Weights (must sum to 1.0)
  WEIGHT_SPEED: parseFloat(process.env.WEIGHT_SPEED || '0.50'),
  WEIGHT_COVERAGE: parseFloat(process.env.WEIGHT_COVERAGE || '0.25'),
  WEIGHT_LATENCY: parseFloat(process.env.WEIGHT_LATENCY || '0.15'),
  WEIGHT_RELIABILITY: parseFloat(process.env.WEIGHT_RELIABILITY || '0.10'),
  // Max geofence query range in degrees (~5km is ~0.05 degrees)
  LOCATION_BOUNDING_BOX_RANGE: 0.05,
};
