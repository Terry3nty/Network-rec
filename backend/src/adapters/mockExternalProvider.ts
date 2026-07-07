import { IDataProvider, ProviderMetric } from './dataProvider.interface';

export class MockExternalProvider implements IDataProvider {
  name = 'MockExternalProvider';

  async getMetrics(latitude: number, longitude: number): Promise<ProviderMetric[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Base performance benchmarks for Nigerian operators
    const basePerformances = [
      { providerName: 'MTN', baseDownload: 55, baseUpload: 15, baseLatency: 25, baseCoverage: 92, baseReliability: 95 },
      { providerName: 'Airtel', baseDownload: 50, baseUpload: 14, baseLatency: 28, baseCoverage: 90, baseReliability: 93 },
      { providerName: 'Glo', baseDownload: 30, baseUpload: 9, baseLatency: 42, baseCoverage: 82, baseReliability: 80 },
      { providerName: '9mobile', baseDownload: 20, baseUpload: 6, baseLatency: 52, baseCoverage: 75, baseReliability: 70 },
    ];

    // Generate deterministic variations based on lat/lng coordinate fractions
    // to simulate changes across regions.
    const coordHash = Math.abs(Math.sin(latitude * 12.9898 + longitude * 78.233) * 43758.5453);
    const varianceFactor = (coordHash % 1) * 2 - 1; // Between -1 and 1

    return basePerformances.map((base) => {
      // MTN gets stronger in some areas, Airtel in others
      let localVariance = varianceFactor;
      if (base.providerName === 'Airtel') {
        localVariance = -varianceFactor; // Antiphase to make Airtel competitive
      } else if (base.providerName === 'Glo') {
        localVariance = Math.sin(latitude * 50) * 0.8;
      } else if (base.providerName === '9mobile') {
        localVariance = Math.cos(longitude * 50) * 0.8;
      }

      const downloadSpeed = Math.max(2, base.baseDownload + localVariance * 15);
      const uploadSpeed = Math.max(0.5, base.baseUpload + localVariance * 5);
      const latency = Math.max(5, Math.round(base.baseLatency - localVariance * 8));
      const coverage = Math.min(100, Math.max(10, base.baseCoverage + localVariance * 12));
      const reliability = Math.min(100, Math.max(10, base.baseReliability + localVariance * 10));

      return {
        providerName: base.providerName,
        downloadSpeed: Math.round(downloadSpeed * 100) / 100,
        uploadSpeed: Math.round(uploadSpeed * 100) / 100,
        latency,
        coverage: Math.round(coverage * 100) / 100,
        reliability: Math.round(reliability * 100) / 100,
        source: this.name,
      };
    });
  }
}
