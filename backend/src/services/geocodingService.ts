import axios from 'axios';

interface LocalRegion {
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// Bounding box definitions for Nigeria seeds to resolve names locally if offline
const REGIONS: LocalRegion[] = [
  { name: 'Osiele, Ogun State', minLat: 7.20, maxLat: 7.24, minLng: 3.43, maxLng: 3.47 },
  { name: 'Ikeja, Lagos State', minLat: 6.57, maxLat: 6.62, minLng: 3.32, maxLng: 3.37 },
  { name: 'Lekki Phase 1, Lagos State', minLat: 6.40, maxLat: 6.45, minLng: 3.40, maxLng: 3.45 },
  { name: 'UI Area, Ibadan, Oyo State', minLat: 7.42, maxLat: 7.46, minLng: 3.88, maxLng: 3.92 },
  { name: 'Wuse II, Abuja, FCT', minLat: 9.05, maxLat: 9.10, minLng: 7.45, maxLng: 7.50 },
  { name: 'Independence Layout, Enugu', minLat: 6.42, maxLat: 6.46, minLng: 7.49, maxLng: 7.53 },
];

export class GeocodingService {
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      // Nominatim requires a descriptive User-Agent
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          format: 'json',
          lat: latitude,
          lon: longitude,
          zoom: 14,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'NetworkWise-Recommender/1.0 (contact: terry@networkwise.app)',
        },
        timeout: 3000, // 3 seconds timeout
      });

      if (response.data && response.data.display_name) {
        const address = response.data.address;
        // Construct a clean location string from parts
        const city = address.city || address.town || address.village || address.suburb || address.county || '';
        const state = address.state || '';
        const country = address.country || '';
        
        const parts = [city, state].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
        return response.data.display_name.split(',').slice(0, 2).join(', ').trim();
      }
    } catch (error) {
      console.warn('External geocoding failed or timed out. Using local bounding-box fallbacks.');
    }

    // Fallback to local region check
    for (const region of REGIONS) {
      if (
        latitude >= region.minLat &&
        latitude <= region.maxLat &&
        longitude >= region.minLng &&
        longitude <= region.maxLng
      ) {
        return region.name;
      }
    }

    // Ultimate fallback if coordinate is elsewhere
    return `Region near (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  }
}

export const geocodingService = new GeocodingService();
