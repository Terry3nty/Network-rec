import { IDataProvider, ProviderMetric } from './dataProvider.interface';
import { prisma } from '../db';
import { CONFIG } from '../config';

export class DatabaseProvider implements IDataProvider {
  name = 'DatabaseProvider';

  async getMetrics(latitude: number, longitude: number): Promise<ProviderMetric[]> {
    const range = CONFIG.LOCATION_BOUNDING_BOX_RANGE;
    
    // Find all metrics in the bounding box
    const records = await prisma.locationMetric.findMany({
      where: {
        latitude: {
          gte: latitude - range,
          lte: latitude + range,
        },
        longitude: {
          gte: longitude - range,
          lte: longitude + range,
        },
      },
      include: {
        provider: true,
      },
    });

    if (records.length === 0) {
      return [];
    }

    // Group records by provider name
    const grouped: Record<string, typeof records> = {};
    for (const record of records) {
      const pName = record.provider.name;
      if (!grouped[pName]) {
        grouped[pName] = [];
      }
      grouped[pName].push(record);
    }

    // Calculate averages per provider
    const metrics: ProviderMetric[] = [];
    for (const [providerName, providerRecords] of Object.entries(grouped)) {
      const count = providerRecords.length;
      let totalDownload = 0;
      let totalUpload = 0;
      let totalLatency = 0;
      let totalCoverage = 0;
      let totalReliability = 0;

      for (const rec of providerRecords) {
        totalDownload += rec.downloadSpeed;
        totalUpload += rec.uploadSpeed;
        totalLatency += rec.latency;
        totalCoverage += rec.coverage;
        totalReliability += rec.reliability;
      }

      metrics.push({
        providerName,
        downloadSpeed: Math.round((totalDownload / count) * 100) / 100,
        uploadSpeed: Math.round((totalUpload / count) * 100) / 100,
        latency: Math.round(totalLatency / count),
        coverage: Math.round((totalCoverage / count) * 100) / 100,
        reliability: Math.round((totalReliability / count) * 100) / 100,
        source: this.name,
      });
    }

    return metrics;
  }
}
