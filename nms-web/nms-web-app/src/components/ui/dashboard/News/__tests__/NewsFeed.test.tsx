// src/components/ui/dashboard/News/NewsFeed.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewsFeed from '../NewsFeed';
import type { NewsArticle } from '@/types/news';

// Mock the newsService module
vi.mock('@/lib/services/newsService', () => ({
  fetchArticles: vi.fn(),
  generateArticleWithStream: vi.fn(),
}));

import { fetchArticles } from '@/lib/services/newsService';

describe('NewsFeed', () => {
  const mockArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'New Alzheimer Treatment Shows Promise',
      summary: 'Recent studies show promising results for a new Alzheimer treatment approach.',
      content: 'Detailed content about the treatment...',
      author: 'Dr. Smith',
      publishedAt: '2025-01-15T10:00:00Z',
      category: 'Research',
      tags: ['alzheimer', 'treatment'],
      imageUrl: '',
      source: 'https://example.com/article1',
      readTime: 5,
    },
    {
      id: '2',
      title: 'Cognitive Health Tips for Seniors',
      summary: 'Simple daily habits that can help maintain cognitive health in older adults.',
      content: 'Tips and advice for cognitive health...',
      author: 'Dr. Johnson',
      publishedAt: '2025-01-14T15:30:00Z',
      category: 'Wellness',
      tags: ['cognitive', 'health'],
      imageUrl: '',
      source: 'https://example.com/article2',
      readTime: 3,
    },
    {
      id: '3',
      title: 'Understanding Dementia Symptoms',
      summary: 'A comprehensive guide to recognizing early dementia symptoms.',
      content: 'Guide about dementia symptoms...',
      author: 'Dr. Williams',
      publishedAt: '2025-01-13T09:00:00Z',
      category: 'Education',
      tags: ['dementia', 'symptoms'],
      imageUrl: '',
      source: 'https://example.com/article3',
      readTime: 7,
    },
    {
      id: '4',
      title: 'Latest Research in Neurology',
      summary: 'Breakthrough findings in neurological research.',
      content: 'Latest research details...',
      author: 'Dr. Brown',
      publishedAt: '2025-01-12T11:00:00Z',
      category: 'Research',
      tags: ['neurology', 'research'],
      imageUrl: '',
      source: 'https://example.com/article4',
      readTime: 6,
    },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Setup default mock implementation
    (fetchArticles as ReturnType<typeof vi.fn>).mockResolvedValue(mockArticles);
  });

  it('renders the news feed component after loading', async () => {
    render(<NewsFeed />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Should show the news header
    expect(screen.getByText('Agent News & Research')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<NewsFeed />);

    // Should show loading spinner initially
    const spinner = document.querySelector('.lucide-loader-circle');
    expect(spinner).toBeInTheDocument();
  });

  it('displays articles after loading (respecting pagination)', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    // Should show first 3 articles (pagination limit)
    expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockArticles[1].title)).toBeInTheDocument();
    expect(screen.getByText(mockArticles[2].title)).toBeInTheDocument();

    // Fourth article should not be visible on first page
    expect(screen.queryByText(mockArticles[3].title)).not.toBeInTheDocument();
  });

  it('renders search bar with correct placeholder for FilterExisting mode', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const searchBar = screen.getByPlaceholderText('Filter by topic, title, or category...');
    expect(searchBar).toBeInTheDocument();
  });

  it('renders mode toggle buttons', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText('Filter Existing')).toBeInTheDocument();
    });

    expect(screen.getByText('Filter Existing')).toBeInTheDocument();
    expect(screen.getByText('Query New Report')).toBeInTheDocument();
  });

  it('changes placeholder when switching to Query mode', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText('Filter Existing')).toBeInTheDocument();
    });

    // Click Query New Report button
    const queryButton = screen.getByText('Query New Report');
    fireEvent.click(queryButton);

    // Placeholder should change
    expect(screen.getByPlaceholderText('Describe the research report you need...')).toBeInTheDocument();
  });

  it('renders Read buttons for visible articles', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const readButtons = screen.getAllByText('Read');
    // Should have 3 Read buttons (one per visible article due to pagination)
    expect(readButtons.length).toBe(3);
  });

  it('filters articles by title when searching', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Filter by topic, title, or category...');
    fireEvent.change(searchInput, { target: { value: 'Alzheimer' } });

    // Should show only the matching article
    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
      expect(screen.queryByText(mockArticles[1].title)).not.toBeInTheDocument();
    });
  });

  it('filters articles by category when searching', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Filter by topic, title, or category...');
    fireEvent.change(searchInput, { target: { value: 'Wellness' } });

    // Should show articles with matching category
    await waitFor(() => {
      expect(screen.getByText(mockArticles[1].title)).toBeInTheDocument();
      expect(screen.queryByText(mockArticles[0].title)).not.toBeInTheDocument();
    });
  });

  it('clears search when clear button is clicked', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Filter by topic, title, or category...') as HTMLInputElement;

    // Enter search text
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');

    // Click clear button
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
  });

  it('shows article detail when Read button is clicked', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    // Should show article detail view
    expect(screen.getByText('AI Generated Summary')).toBeInTheDocument();
  });

  it('displays article summary in detail view', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    expect(screen.getByText(mockArticles[0].summary)).toBeInTheDocument();
  });

  it('shows back button in detail view', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    const backButton = screen.getByLabelText('Go back to news list');
    expect(backButton).toBeInTheDocument();
  });

  it('returns to list view when back button is clicked', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    // Go to detail view
    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    expect(screen.getByText('AI Generated Summary')).toBeInTheDocument();

    // Click back button
    const backButton = screen.getByLabelText('Go back to news list');
    fireEvent.click(backButton);

    // Should be back in list view
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Filter by topic, title, or category...')).toBeInTheDocument();
      expect(screen.queryByText('AI Generated Summary')).not.toBeInTheDocument();
    });
  });

  it('displays article category in detail view', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    // Category should be visible in detail view
    expect(screen.getByText(mockArticles[0].category)).toBeInTheDocument();
  });

  it('displays published date in detail view', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    expect(screen.getByText(/Published:/)).toBeInTheDocument();
  });

  it('renders external link in detail view', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    // Check for source link
    const sourceLinks = screen.getAllByRole('link', { name: /Source:/i });
    expect(sourceLinks.length).toBeGreaterThan(0);
  });

  it('handles case-insensitive search', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Filter by topic, title, or category...');
    fireEvent.change(searchInput, { target: { value: 'ALZHEIMER' } });

    // Should still find the article with case-insensitive search
    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });
  });

  it('shows no results message when search does not match', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Filter by topic, title, or category...');
    fireEvent.change(searchInput, { target: { value: 'NonexistentArticle12345' } });

    // Should show no results
    await waitFor(() => {
      expect(screen.getByText('No articles found')).toBeInTheDocument();
    });
  });

  it('displays pagination controls when more than 3 articles', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    // Should show page navigation buttons
    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeInTheDocument();
  });

  it('navigates to next page when next button clicked', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    // Click next page button
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);

    // Should show the 4th article
    await waitFor(() => {
      expect(screen.getByText(mockArticles[3].title)).toBeInTheDocument();
      expect(screen.queryByText(mockArticles[0].title)).not.toBeInTheDocument();
    });
  });

  it('displays refresh button', async () => {
    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(mockArticles[0].title)).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    expect(refreshButton).toBeInTheDocument();
  });

  it('handles fetch error gracefully', async () => {
    (fetchArticles as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText(/Could not load news feed/i)).toBeInTheDocument();
    });
  });
});