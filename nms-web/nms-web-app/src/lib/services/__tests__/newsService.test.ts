// src/lib/services/__tests__/newsService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchArticles, generateArticle } from '../newsService';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  getDocs: vi.fn(),
}));

// Mock firebase config
vi.mock('@/lib/firebase/config', () => ({
  db: {},
}));

// Mock fetch
global.fetch = vi.fn();

describe('newsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('fetchArticles', () => {
    it('should fetch and map articles from Firestore', async () => {
      const mockArticles = [
        {
          id: 'article-1',
          data: () => ({
            title: 'Breaking News in Neurology',
            agentSummary: 'Summary of the article',
            author: 'Dr. Smith',
            publishedDate: {
              toDate: () => new Date('2024-01-15'),
            },
            topic: 'Neurology',
            tags: ['brain', 'research'],
            imageUrl: 'https://example.com/image.jpg',
            sourceUrl: 'https://example.com/article',
            readTime: '5 min',
            createdAt: {
              toDate: () => new Date('2024-01-15'),
            },
          }),
        },
        {
          id: 'article-2',
          data: () => ({
            title: 'New Treatment Discovered',
            summary: 'Treatment summary',
            authors: ['Dr. Jones', 'Dr. Brown'],
            createdAt: {
              toDate: () => new Date('2024-01-14'),
            },
            topic: 'Treatment',
            tags: [],
            source: 'Medical Journal',
            readTime: '10 min',
          }),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        forEach: (callback: any) => {
          mockArticles.forEach(callback);
        },
      } as any);

      const articles = await fetchArticles();

      expect(articles).toHaveLength(2);
      expect(articles[0]).toMatchObject({
        id: 'article-1',
        title: 'Breaking News in Neurology',
        summary: 'Summary of the article',
        author: 'Dr. Smith',
        category: 'Neurology',
        tags: ['brain', 'research'],
        readTime: 5,
      });
      expect(articles[1]).toMatchObject({
        id: 'article-2',
        title: 'New Treatment Discovered',
        author: 'Dr. Jones, Dr. Brown',
        category: 'Treatment',
        readTime: 10,
      });
    });

    it('should handle articles with missing fields', async () => {
      const mockArticles = [
        {
          id: 'article-1',
          data: () => ({}),
        },
      ];

      vi.mocked(getDocs).mockResolvedValue({
        forEach: (callback: any) => {
          mockArticles.forEach(callback);
        },
      } as any);

      const articles = await fetchArticles();

      expect(articles).toHaveLength(1);
      expect(articles[0]).toMatchObject({
        title: 'Untitled',
        summary: 'No summary available',
        author: 'Unknown',
        category: 'General',
        source: 'Unknown',
        readTime: 5,
      });
    });

    it('should throw error on Firestore failure', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(fetchArticles()).rejects.toThrow(
        'Failed to fetch news articles from Firestore.'
      );
    });
  });

  describe('generateArticle', () => {
    it('should successfully generate article with families audience', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'Generation started' }),
      } as Response);

      await generateArticle({
        topic: 'Alzheimer Disease',
        target_audience: 'families',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/generate-news'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"audience":"patient"'),
        })
      );
    });

    it('should successfully generate article with professionals audience', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'Generation started' }),
      } as Response);

      await generateArticle({
        topic: 'Parkinson Research',
        target_audience: 'professionals',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/generate-news'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"audience":"medical"'),
        })
      );
    });

    it('should throw error if API returns error status', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(
        generateArticle({ topic: 'Test Topic' })
      ).rejects.toThrow('Failed to generate article from AI agents.');
    });

    it('should throw error on network failure', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await expect(
        generateArticle({ topic: 'Test Topic' })
      ).rejects.toThrow('Failed to generate article from AI agents.');
    });
  });
});
