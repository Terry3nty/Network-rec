import { ProviderMetric } from '../adapters/dataProvider.interface';
import { CONFIG } from '../config';

export interface RankedProvider {
  name: string;
  score: number;
  downloadSpeed: number;
  uploadSpeed: number;
  latency: number;
  coverage: number;
  reliability: number;
  details?: {
    speedScore: number;
    coverageScore: number;
    latencyScore: number;
    reliabilityScore: number;
  };
}

export class ScoringService {
  calculateScores(metrics: ProviderMetric[]): RankedProvider[] {
    const ranked: RankedProvider[] = metrics.map((metric) => {
      // 1. Normalize Download Speed (cap at 100 Mbps for 100% score)
      const maxExpectedSpeed = 100; // Mbps
      const speedScore = Math.min(100, (metric.downloadSpeed / maxExpectedSpeed) * 100);

      // 2. Normalize Coverage (already 0-100)
      const coverageScore = Math.min(100, Math.max(0, metric.coverage));

      // 3. Normalize Latency (Lower is better: <=10ms is 100%, >=150ms is 0%)
      let latencyScore = 0;
      if (metric.latency <= 10) {
        latencyScore = 100;
      } else if (metric.latency >= 150) {
        latencyScore = 0;
      } else {
        latencyScore = 100 - ((metric.latency - 10) / 140) * 100;
      }

      // 4. Normalize Reliability (already 0-100)
      const reliabilityScore = Math.min(100, Math.max(0, metric.reliability));

      // Weighted calculation
      const totalScore =
        speedScore * CONFIG.WEIGHT_SPEED +
        coverageScore * CONFIG.WEIGHT_COVERAGE +
        latencyScore * CONFIG.WEIGHT_LATENCY +
        reliabilityScore * CONFIG.WEIGHT_RELIABILITY;

      return {
        name: metric.providerName,
        score: Math.round(totalScore),
        downloadSpeed: metric.downloadSpeed,
        uploadSpeed: metric.uploadSpeed,
        latency: metric.latency,
        coverage: metric.coverage,
        reliability: metric.reliability,
        details: {
          speedScore: Math.round(speedScore),
          coverageScore: Math.round(coverageScore),
          latencyScore: Math.round(latencyScore),
          reliabilityScore: Math.round(reliabilityScore),
        },
      };
    });

    // Sort by score descending
    return ranked.sort((a, b) => b.score - a.score);
  }
}

export const scoringService = new ScoringService();
