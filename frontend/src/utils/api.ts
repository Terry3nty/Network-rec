export interface ProviderInfo {
  name: string;
  score: number;
  coverage: number;
  speed: number;
  latency: number;
  reliability: number;
}

export interface RecommendationResponse {
  location: string;
  recommended: string;
  providers: ProviderInfo[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchRecommendation(latitude: number, longitude: number): Promise<RecommendationResponse> {
  const response = await fetch(`${API_BASE_URL}/recommend?latitude=${latitude}&longitude=${longitude}`);
  
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch network recommendation.');
  }
  
  return response.json();
}

/**
 * Perform manual lookup using Nominatim search to resolve city name into coordinates
 */
export interface GeocodeResult {
  display_name: string;
  lat: number;
  lon: number;
}

export async function searchLocation(query: string): Promise<GeocodeResult[]> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'User-Agent': 'NetworkWise-Recommender/1.0 (contact: terry@networkwise.app)',
        },
      }
    );

    if (!response.ok) throw new Error('Search failed');

    const data = await response.json();
    return data.map((item: { display_name: string; lat: string; lon: string }) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch (err) {
    console.error('Location search error:', err);
    // Fallback: if offline, check matching Nigeria cities
    const fallbackCities = [
      { display_name: 'Osiele, Ogun State', lat: 7.2241, lon: 3.4497 },
      { display_name: 'Ikeja, Lagos State', lat: 6.5967, lon: 3.3421 },
      { display_name: 'Lekki Phase 1, Lagos State', lat: 6.4281, lon: 3.4219 },
      { display_name: 'UI Area, Ibadan, Oyo State', lat: 7.4443, lon: 3.9003 },
      { display_name: 'Wuse II, Abuja, FCT', lat: 9.0778, lon: 7.4789 },
      { display_name: 'Independence Layout, Enugu', lat: 6.4428, lon: 7.5139 },
    ];

    return fallbackCities.filter(city => 
      city.display_name.toLowerCase().includes(query.toLowerCase())
    );
  }
}
