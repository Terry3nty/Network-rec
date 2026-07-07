import { Request, Response } from 'express';
import { geocodingService } from '../services/geocodingService';
import { adapterManager } from '../services/providerAdapterManager';
import { scoringService } from '../services/scoringService';

export class RecommendationController {
  getRecommendation = async (req: Request, res: Response) => {
    try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: 'Missing query parameters. Please provide both "latitude" and "longitude".',
        });
      }

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          error: 'Invalid coordinates. "latitude" and "longitude" must be valid decimal numbers.',
        });
      }

      // 1. Determine location name
      const locationName = await geocodingService.reverseGeocode(lat, lng);

      // 2. Fetch aggregated metrics across active data providers
      const aggregatedMetrics = await adapterManager.getAggregatedMetrics(lat, lng);

      if (aggregatedMetrics.length === 0) {
        return res.status(404).json({
          error: `No network coverage records found near (${lat.toFixed(4)}, ${lng.toFixed(4)}).`,
        });
      }

      // 3. Compute score and rank providers
      const rankedProviders = scoringService.calculateScores(aggregatedMetrics);

      // 4. Determine recommendation
      const recommended = rankedProviders.length > 0 ? rankedProviders[0].name : 'N/A';

      // 5. Structure payload matching specification
      const responseData = {
        location: locationName,
        recommended,
        providers: rankedProviders.map((p) => ({
          name: p.name,
          score: p.score,
          coverage: p.coverage,
          speed: p.downloadSpeed,
          latency: p.latency,
          reliability: p.reliability,
        })),
      };

      return res.status(200).json(responseData);
    } catch (error: any) {
      console.error('Error handling recommendation request:', error);
      return res.status(500).json({
        error: 'An internal server error occurred while processing network recommendations.',
        details: error.message,
      });
    }
  };
}

export const recommendationController = new RecommendationController();
