// src/lib/firebase/services/__tests__/helpers.test.ts
import { describe, it, expect } from 'vitest';
import { convertToDateString, formatDate, formatDuration } from '../helpers';
import { Timestamp } from 'firebase/firestore';

describe('helpers', () => {
  describe('convertToDateString', () => {
    it('should return string as-is if input is a string', () => {
      const dateString = '2024-01-15T10:30:00Z';
      expect(convertToDateString(dateString)).toBe(dateString);
    });

    it('should convert Date to ISO string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = convertToDateString(date);
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should convert Firestore Timestamp to ISO string', () => {
      const timestamp = new Timestamp(1705315800, 0); // Jan 15, 2024
      const result = convertToDateString(timestamp);
      expect(result).toMatch(/2024-01-15/);
    });
  });

  describe('formatDate', () => {
    it('should format ISO string date correctly', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const result = formatDate(dateString);
      expect(result).toMatch(/Jan 15, 2024/);
    });

    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toMatch(/Jan 15, 2024/);
    });

    it('should format Firestore Timestamp correctly', () => {
      const timestamp = new Timestamp(1705315800, 0);
      const result = formatDate(timestamp);
      expect(result).toMatch(/Jan 15, 2024/);
    });

    it('should handle invalid date strings', () => {
      const invalidString = 'invalid-date';
      const result = formatDate(invalidString);
      // The function tries to convert to Date first, which results in Invalid Date
      expect(result).toMatch(/Invalid Date|invalid-date/);
    });

    it('should return "Invalid Date" on error if input is not string', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate);
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds less than 60 as "Xs"', () => {
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('should format exactly 60 seconds as "1m"', () => {
      expect(formatDuration(60)).toBe('1m');
    });

    it('should format minutes without remaining seconds as "Xm"', () => {
      expect(formatDuration(120)).toBe('2m');
      expect(formatDuration(180)).toBe('3m');
      expect(formatDuration(300)).toBe('5m');
    });

    it('should format minutes with remaining seconds as "Xm Ys"', () => {
      expect(formatDuration(65)).toBe('1m 5s');
      expect(formatDuration(135)).toBe('2m 15s');
      expect(formatDuration(317)).toBe('5m 17s');
    });

    it('should handle zero seconds', () => {
      expect(formatDuration(0)).toBe('0s');
    });

    it('should handle large durations', () => {
      expect(formatDuration(3600)).toBe('60m'); // 1 hour
      expect(formatDuration(3665)).toBe('61m 5s'); // 1 hour 1 minute 5 seconds
    });
  });
});
