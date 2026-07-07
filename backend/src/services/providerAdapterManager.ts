import { IDataProvider, ProviderMetric } from '../adapters/dataProvider.interface';
import { DatabaseProvider } from '../adapters/databaseProvider';
import { MockExternalProvider } from '../adapters/mockExternalProvider';

export class ProviderAdapterManager {
  private providers: IDataProvider[] = [];

  constructor() {
    // Register active data providers
    this.providers.push(new DatabaseProvider());
    this.providers.push(new MockExternalProvider());
  }

  // Allow dynamic registration of new providers
  registerProvider(provider: IDataProvider) {
    this.providers.push(provider);
  }

  async getAggregatedMetrics(latitude: number, longitude: number): Promise<ProviderMetric[]> {
    // Execute all providers concurrently
    const results = await Promise.allSettled(
      this.providers.map((p) => p.getMetrics(latitude, longitude))
    );

    const allMetrics: ProviderMetric[] = [];
    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        allMetrics.push(...res.value);
      } else {
        console.error(`Provider ${this.providers[index].name} failed:`, res.reason);
      }
    });

    if (allMetrics.length === 0) {
      return [];
    }

    // Group metrics by provider name
    const grouped: Record<string, ProviderMetric[]> = {};
    for (const metric of allMetrics) {
      const pName = metric.providerName;
      if (!grouped[pName]) {
        grouped[pName] = [];
      }
      grouped[pName].push(metric);
    }

    // Blend metrics per provider (simple mathematical average)
    const blended: ProviderMetric[] = [];
    for (const [providerName, metricsList] of Object.entries(grouped)) {
      const count = metricsList.length;
      let downloadSpeed = 0;
      let uploadSpeed = 0;
      let latency = 0;
      let coverage = 0;
      let reliability = 0;

      for (const m of metricsList) {
        downloadSpeed += m.downloadSpeed;
        uploadSpeed += m.uploadSpeed;
        latency += m.latency;
        coverage += m.coverage;
        reliability += m.reliability;
      }

      blended.push({
        providerName,
        downloadSpeed: Math.round((downloadSpeed / count) * 100) / 100,
        uploadSpeed: Math.round((uploadSpeed / count) * 100) / 100,
        latency: Math.round(latency / count),
        coverage: Math.round((coverage / count) * 100) / 100,
        reliability: Math.round((reliability / count) * 100) / 100,
        source: 'Aggregated',
      });
    }

    return blended;
  }
}
export const adapterManager = new ProviderAdapterManager();
