export interface ProviderMetric {
  providerName: string;
  downloadSpeed: number; // Mbps
  uploadSpeed: number;   // Mbps
  latency: number;       // ms
  coverage: number;      // 0-100 percentage
  reliability: number;   // 0-100 percentage
  source: string;        // E.g. "Database", "MockExternalAPI", "Crowdsourced"
}

export interface IDataProvider {
  name: string;
  getMetrics(latitude: number, longitude: number): Promise<ProviderMetric[]>;
}
