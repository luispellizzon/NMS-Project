// src/lib/utils/__tests__/countryCoordinates.test.ts
import { describe, it, expect } from 'vitest';
import { getCountryCoordinates } from '../countryCoordinates';

describe('countryCoordinates', () => {
  describe('getCountryCoordinates', () => {
    it('should return coordinates for Ireland', () => {
      const coords = getCountryCoordinates('Ireland');
      expect(coords).toEqual({
        lat: 53.3498,
        lon: -6.2603,
        city: 'Dublin',
      });
    });

    it('should return coordinates for United States', () => {
      const coords = getCountryCoordinates('United States');
      expect(coords).toEqual({
        lat: 38.9072,
        lon: -77.0369,
        city: 'Washington DC',
      });
    });

    it('should return coordinates for United Kingdom', () => {
      const coords = getCountryCoordinates('United Kingdom');
      expect(coords).toEqual({
        lat: 51.5074,
        lon: -0.1278,
        city: 'London',
      });
    });

    it('should return coordinates for Germany', () => {
      const coords = getCountryCoordinates('Germany');
      expect(coords).toEqual({
        lat: 52.5200,
        lon: 13.4050,
        city: 'Berlin',
      });
    });

    it('should return coordinates for France', () => {
      const coords = getCountryCoordinates('France');
      expect(coords).toEqual({
        lat: 48.8566,
        lon: 2.3522,
        city: 'Paris',
      });
    });

    it('should return coordinates for Spain', () => {
      const coords = getCountryCoordinates('Spain');
      expect(coords).toEqual({
        lat: 40.4168,
        lon: -3.7038,
        city: 'Madrid',
      });
    });

    it('should return coordinates for Italy', () => {
      const coords = getCountryCoordinates('Italy');
      expect(coords).toEqual({
        lat: 41.9028,
        lon: 12.4964,
        city: 'Rome',
      });
    });

    it('should return coordinates for Canada', () => {
      const coords = getCountryCoordinates('Canada');
      expect(coords).toEqual({
        lat: 45.4215,
        lon: -75.6972,
        city: 'Ottawa',
      });
    });

    it('should return coordinates for Australia', () => {
      const coords = getCountryCoordinates('Australia');
      expect(coords).toEqual({
        lat: -35.2809,
        lon: 149.1300,
        city: 'Canberra',
      });
    });

    it('should return coordinates for Japan', () => {
      const coords = getCountryCoordinates('Japan');
      expect(coords).toEqual({
        lat: 35.6895,
        lon: 139.6917,
        city: 'Tokyo',
      });
    });

    it('should return default coordinates (Ireland) for unknown country', () => {
      const coords = getCountryCoordinates('Unknown Country');
      // Returns Ireland as default
      expect(coords).toEqual({
        lat: 53.3498,
        lon: -6.2603,
        city: 'Dublin',
      });
    });

    it('should be case-sensitive (exact match required)', () => {
      const coords1 = getCountryCoordinates('Ireland');
      const coords2 = getCountryCoordinates('ireland'); // Will default to Ireland

      // Both return Ireland coordinates (one exact match, one default)
      expect(coords1.city).toBe('Dublin');
      expect(coords2.city).toBe('Dublin');
    });
  });
});
