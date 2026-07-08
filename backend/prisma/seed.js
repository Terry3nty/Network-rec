const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const providersData = [
  { name: 'MTN', displayName: 'MTN Nigeria', brandColor: '#FFCC00' },
  { name: 'Airtel', displayName: 'Airtel Nigeria', brandColor: '#E30A17' },
  { name: 'Glo', displayName: 'Globacom (Glo)', brandColor: '#73B72C' },
  { name: '9mobile', displayName: '9mobile', brandColor: '#006643' },
  { name: 'Starlink', displayName: 'Starlink (SpaceX)', brandColor: '#A0AEC0' },
  { name: 'FiberOne', displayName: 'FiberOne Broadband', brandColor: '#D2232A' },
  { name: 'Spectranet', displayName: 'Spectranet LTE', brandColor: '#FF5500' },
  { name: 'Smile', displayName: 'Smile Communications', brandColor: '#9B51E0' },
];

// Coordinates of key locations in Nigeria
const locations = [
  {
    name: 'Osiele, Ogun State (FUNAAB)',
    lat: 7.2241,
    lng: 3.4497,
    metrics: {
      MTN: { downloadSpeed: 58, uploadSpeed: 18, latency: 23, coverage: 95, reliability: 97 },
      Airtel: { downloadSpeed: 48, uploadSpeed: 15, latency: 30, coverage: 90, reliability: 92 },
      Glo: { downloadSpeed: 25, uploadSpeed: 8, latency: 45, coverage: 80, reliability: 75 },
      '9mobile': { downloadSpeed: 15, uploadSpeed: 5, latency: 60, coverage: 70, reliability: 65 },
    },
  },
  {
    name: 'Ikeja, Lagos State (Computer Village)',
    lat: 6.5967,
    lng: 3.3421,
    metrics: {
      Airtel: { downloadSpeed: 65, uploadSpeed: 22, latency: 18, coverage: 97, reliability: 96 },
      MTN: { downloadSpeed: 62, uploadSpeed: 20, latency: 20, coverage: 96, reliability: 95 },
      Glo: { downloadSpeed: 32, uploadSpeed: 10, latency: 40, coverage: 85, reliability: 80 },
      '9mobile': { downloadSpeed: 22, uploadSpeed: 7, latency: 45, coverage: 78, reliability: 76 },
    },
  },
  {
    name: 'Lekki Phase 1, Lagos State',
    lat: 6.4281,
    lng: 3.4219,
    metrics: {
      MTN: { downloadSpeed: 85, uploadSpeed: 30, latency: 15, coverage: 98, reliability: 98 },
      Airtel: { downloadSpeed: 72, uploadSpeed: 25, latency: 18, coverage: 95, reliability: 95 },
      '9mobile': { downloadSpeed: 35, uploadSpeed: 12, latency: 35, coverage: 82, reliability: 80 },
      Glo: { downloadSpeed: 30, uploadSpeed: 10, latency: 38, coverage: 80, reliability: 78 },
    },
  },
  {
    name: 'UI Area, Ibadan, Oyo State',
    lat: 7.4443,
    lng: 3.9003,
    metrics: {
      Airtel: { downloadSpeed: 45, uploadSpeed: 12, latency: 28, coverage: 92, reliability: 93 },
      MTN: { downloadSpeed: 42, uploadSpeed: 10, latency: 32, coverage: 90, reliability: 91 },
      Glo: { downloadSpeed: 28, uploadSpeed: 8, latency: 48, coverage: 88, reliability: 82 },
      '9mobile': { downloadSpeed: 12, uploadSpeed: 4, latency: 55, coverage: 72, reliability: 68 },
    },
  },
  {
    name: 'Wuse II, Abuja, FCT',
    lat: 9.0778,
    lng: 7.4789,
    metrics: {
      MTN: { downloadSpeed: 78, uploadSpeed: 28, latency: 18, coverage: 98, reliability: 97 },
      Airtel: { downloadSpeed: 75, uploadSpeed: 26, latency: 19, coverage: 96, reliability: 96 },
      Glo: { downloadSpeed: 40, uploadSpeed: 15, latency: 35, coverage: 88, reliability: 85 },
      '9mobile': { downloadSpeed: 28, uploadSpeed: 9, latency: 42, coverage: 80, reliability: 82 },
    },
  },
  {
    name: 'Independence Layout, Enugu',
    lat: 6.4428,
    lng: 7.5139,
    metrics: {
      MTN: { downloadSpeed: 50, uploadSpeed: 16, latency: 25, coverage: 92, reliability: 94 },
      Airtel: { downloadSpeed: 44, uploadSpeed: 14, latency: 29, coverage: 90, reliability: 91 },
      Glo: { downloadSpeed: 35, uploadSpeed: 10, latency: 38, coverage: 85, reliability: 80 },
      '9mobile': { downloadSpeed: 18, uploadSpeed: 6, latency: 50, coverage: 75, reliability: 70 },
    },
  },
];

async function main() {
  console.log('Seeding started...');

  // Create Providers
  const dbProviders = {};
  for (const provider of providersData) {
    dbProviders[provider.name] = await prisma.provider.upsert({
      where: { name: provider.name },
      update: { displayName: provider.displayName, brandColor: provider.brandColor },
      create: { name: provider.name, displayName: provider.displayName, brandColor: provider.brandColor },
    });
  }

  console.log('Providers seeded.');

  // Inject Wi-Fi/ISP metrics dynamically for each location before seeding
  for (const loc of locations) {
    loc.metrics['Starlink'] = { downloadSpeed: 95, uploadSpeed: 22, latency: 38, coverage: 98, reliability: 96 };
    
    const isUrban = loc.name.includes('Lekki') || loc.name.includes('Computer Village') || loc.name.includes('Wuse II');
    if (isUrban) {
      loc.metrics['FiberOne'] = { downloadSpeed: 80, uploadSpeed: 25, latency: 14, coverage: 90, reliability: 97 };
      loc.metrics['Spectranet'] = { downloadSpeed: 42, uploadSpeed: 12, latency: 30, coverage: 85, reliability: 86 };
      loc.metrics['Smile'] = { downloadSpeed: 38, uploadSpeed: 10, latency: 28, coverage: 80, reliability: 84 };
    } else {
      loc.metrics['FiberOne'] = { downloadSpeed: 35, uploadSpeed: 10, latency: 20, coverage: 35, reliability: 92 };
      loc.metrics['Spectranet'] = { downloadSpeed: 28, uploadSpeed: 8, latency: 38, coverage: 65, reliability: 78 };
      loc.metrics['Smile'] = { downloadSpeed: 24, uploadSpeed: 6, latency: 35, coverage: 60, reliability: 76 };
    }
  }

  // Create coordinates clusters with some randomized variations to simulate realistic metrics
  for (const loc of locations) {
    console.log(`Seeding metrics for: ${loc.name}`);
    for (let i = 0; i < 5; i++) {
      const latOffset = (Math.random() - 0.5) * 0.015;
      const lngOffset = (Math.random() - 0.5) * 0.015;
      const latitude = loc.lat + latOffset;
      const longitude = loc.lng + lngOffset;

      for (const [providerName, baseMetric] of Object.entries(loc.metrics)) {
        const provider = dbProviders[providerName];
        if (!provider) continue;

        // Add small variations
        const downloadSpeed = Math.max(1, baseMetric.downloadSpeed + (Math.random() - 0.5) * 5);
        const uploadSpeed = Math.max(0.5, baseMetric.uploadSpeed + (Math.random() - 0.5) * 2);
        const latency = Math.max(5, baseMetric.latency + Math.round((Math.random() - 0.5) * 6));
        const coverage = Math.min(100, Math.max(0, baseMetric.coverage + (Math.random() - 0.5) * 8));
        const reliability = Math.min(100, Math.max(0, baseMetric.reliability + (Math.random() - 0.5) * 5));

        await prisma.locationMetric.create({
          data: {
            latitude,
            longitude,
            downloadSpeed,
            uploadSpeed,
            latency,
            coverage,
            reliability,
            providerId: provider.id,
          },
        });
      }
    }
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
