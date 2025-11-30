// src/lib/utils/countryCoordinates.ts

/**
 * Mapping of country names to their capital city coordinates (lat, lon)
 * This is used for plotting patient locations on the globe
 */
export const countryCoordinates: Record<string, { lat: number; lon: number; city: string }> = {
  // Europe
  'Ireland': { lat: 53.3498, lon: -6.2603, city: 'Dublin' },
  'United Kingdom': { lat: 51.5074, lon: -0.1278, city: 'London' },
  'UK': { lat: 51.5074, lon: -0.1278, city: 'London' },
  'England': { lat: 51.5074, lon: -0.1278, city: 'London' },
  'France': { lat: 48.8566, lon: 2.3522, city: 'Paris' },
  'Germany': { lat: 52.5200, lon: 13.4050, city: 'Berlin' },
  'Italy': { lat: 41.9028, lon: 12.4964, city: 'Rome' },
  'Spain': { lat: 40.4168, lon: -3.7038, city: 'Madrid' },
  'Portugal': { lat: 38.7223, lon: -9.1393, city: 'Lisbon' },
  'Netherlands': { lat: 52.3676, lon: 4.9041, city: 'Amsterdam' },
  'Belgium': { lat: 50.8503, lon: 4.3517, city: 'Brussels' },
  'Switzerland': { lat: 46.9480, lon: 7.4474, city: 'Bern' },
  'Austria': { lat: 48.2082, lon: 16.3738, city: 'Vienna' },
  'Sweden': { lat: 59.3293, lon: 18.0686, city: 'Stockholm' },
  'Norway': { lat: 59.9139, lon: 10.7522, city: 'Oslo' },
  'Denmark': { lat: 55.6761, lon: 12.5683, city: 'Copenhagen' },
  'Finland': { lat: 60.1699, lon: 24.9384, city: 'Helsinki' },
  'Poland': { lat: 52.2297, lon: 21.0122, city: 'Warsaw' },
  'Czech Republic': { lat: 50.0755, lon: 14.4378, city: 'Prague' },
  'Greece': { lat: 37.9838, lon: 23.7275, city: 'Athens' },

  // North America
  'United States': { lat: 38.9072, lon: -77.0369, city: 'Washington DC' },
  'USA': { lat: 38.9072, lon: -77.0369, city: 'Washington DC' },
  'US': { lat: 38.9072, lon: -77.0369, city: 'Washington DC' },
  'Canada': { lat: 45.4215, lon: -75.6972, city: 'Ottawa' },
  'Mexico': { lat: 19.4326, lon: -99.1332, city: 'Mexico City' },

  // South America
  'Brazil': { lat: -15.8267, lon: -47.9218, city: 'Brasília' },
  'Argentina': { lat: -34.6037, lon: -58.3816, city: 'Buenos Aires' },
  'Chile': { lat: -33.4489, lon: -70.6693, city: 'Santiago' },
  'Colombia': { lat: 4.7110, lon: -74.0721, city: 'Bogotá' },
  'Peru': { lat: -12.0464, lon: -77.0428, city: 'Lima' },

  // Asia
  'Japan': { lat: 35.6895, lon: 139.6917, city: 'Tokyo' },
  'China': { lat: 39.9042, lon: 116.4074, city: 'Beijing' },
  'India': { lat: 28.6139, lon: 77.2090, city: 'New Delhi' },
  'South Korea': { lat: 37.5665, lon: 126.9780, city: 'Seoul' },
  'Thailand': { lat: 13.7563, lon: 100.5018, city: 'Bangkok' },
  'Singapore': { lat: 1.3521, lon: 103.8198, city: 'Singapore' },
  'Malaysia': { lat: 3.1390, lon: 101.6869, city: 'Kuala Lumpur' },
  'Indonesia': { lat: -6.2088, lon: 106.8456, city: 'Jakarta' },
  'Philippines': { lat: 14.5995, lon: 120.9842, city: 'Manila' },
  'Vietnam': { lat: 21.0285, lon: 105.8542, city: 'Hanoi' },
  'Israel': { lat: 31.7683, lon: 35.2137, city: 'Jerusalem' },
  'Saudi Arabia': { lat: 24.7136, lon: 46.6753, city: 'Riyadh' },
  'UAE': { lat: 24.4539, lon: 54.3773, city: 'Abu Dhabi' },
  'Turkey': { lat: 39.9334, lon: 32.8597, city: 'Ankara' },

  // Oceania
  'Australia': { lat: -35.2809, lon: 149.1300, city: 'Canberra' },
  'New Zealand': { lat: -41.2865, lon: 174.7762, city: 'Wellington' },

  // Africa
  'South Africa': { lat: -25.7479, lon: 28.2293, city: 'Pretoria' },
  'Egypt': { lat: 30.0444, lon: 31.2357, city: 'Cairo' },
  'Nigeria': { lat: 9.0765, lon: 7.3986, city: 'Abuja' },
  'Kenya': { lat: -1.2864, lon: 36.8172, city: 'Nairobi' },
  'Morocco': { lat: 34.0209, lon: -6.8416, city: 'Rabat' },
};

/**
 * Get coordinates for a country name
 * Returns default coordinates (Ireland) if country not found
 */
export function getCountryCoordinates(country: string): { lat: number; lon: number; city: string } {
  const trimmedCountry = country.trim();
  const coordinates = countryCoordinates[trimmedCountry];

  if (!coordinates) {
    console.warn(`Country "${trimmedCountry}" not found in coordinates mapping. Using default (Ireland).`);
    return countryCoordinates['Ireland'];
  }

  return coordinates;
}

/**
 * Check if a country exists in the mapping
 */
export function isCountrySupported(country: string): boolean {
  return country.trim() in countryCoordinates;
}

/**
 * Get all supported country names
 */
export function getSupportedCountries(): string[] {
  return Object.keys(countryCoordinates).sort();
}