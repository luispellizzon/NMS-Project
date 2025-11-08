// src/components/ui/dashboard/News/NewsFeed.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import NewsFeed from '../NewsFeed';
import { richNewsFeedData } from '@/lib/mock_data';

describe('NewsFeed', () => {
  beforeEach(() => {
    // Reset any state before each test
  });

  it('renders the news feed component', () => {
    render(<NewsFeed />);

    expect(screen.getByPlaceholderText('Search topics or title')).toBeInTheDocument();
  });

  it('displays all articles initially', () => {
    render(<NewsFeed />);

    // Check that all articles are present (some titles may appear multiple times due to duplicate data)
    richNewsFeedData.forEach((article) => {
      const elements = screen.getAllByText(article.title);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('renders search bar', () => {
    render(<NewsFeed />);

    const searchBar = screen.getByPlaceholderText('Search topics or title');
    expect(searchBar).toBeInTheDocument();
  });

  it('renders Read buttons for each article', () => {
    render(<NewsFeed />);

    const readButtons = screen.getAllByText('Read');
    expect(readButtons.length).toBe(richNewsFeedData.length);
  });

  it('filters articles by title when searching', () => {
    render(<NewsFeed />);

    const searchInput = screen.getByPlaceholderText('Search topics or title');
    const firstArticleTitle = richNewsFeedData[0].title;

    fireEvent.change(searchInput, { target: { value: firstArticleTitle } });

    // Should show the matching article
    expect(screen.getByText(firstArticleTitle)).toBeInTheDocument();
  });

  it('filters articles by topic when searching', () => {
    render(<NewsFeed />);

    const searchInput = screen.getByPlaceholderText('Search topics or title');
    const firstArticleTopic = richNewsFeedData[0].topic;

    fireEvent.change(searchInput, { target: { value: firstArticleTopic } });

    // Should show articles with matching topic (may appear multiple times for mobile/desktop)
    const topicElements = screen.getAllByText(firstArticleTopic);
    expect(topicElements.length).toBeGreaterThan(0);
  });

  it('clears search when clear button is clicked', () => {
    render(<NewsFeed />);

    const searchInput = screen.getByPlaceholderText('Search topics or title') as HTMLInputElement;

    // Enter search text
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');

    // Click clear button
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
  });

  it('shows article detail when Read button is clicked', () => {
    render(<NewsFeed />);

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    // Should show article detail view
    expect(screen.getByText('AI Generated Summary')).toBeInTheDocument();
    expect(screen.getByText('View Original Source')).toBeInTheDocument();
  });

  it('displays article summary in detail view', () => {
    render(<NewsFeed />);

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    const articleSummary = richNewsFeedData[0].agentSummary;
    expect(screen.getByText(articleSummary)).toBeInTheDocument();
  });

  it('shows back button in detail view', () => {
    render(<NewsFeed />);

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    const backButton = screen.getByLabelText('Go back to news list');
    expect(backButton).toBeInTheDocument();
  });

  it('returns to list view when back button is clicked', () => {
    render(<NewsFeed />);

    // Go to detail view
    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    expect(screen.getByText('AI Generated Summary')).toBeInTheDocument();

    // Click back button
    const backButton = screen.getByLabelText('Go back to news list');
    fireEvent.click(backButton);

    // Should be back in list view
    expect(screen.getByPlaceholderText('Search topics or title')).toBeInTheDocument();
    expect(screen.queryByText('AI Generated Summary')).not.toBeInTheDocument();
  });

  it('displays article topic in detail view', () => {
    render(<NewsFeed />);

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    const articleTopic = richNewsFeedData[0].topic;
    // Topic appears in the detail view header
    const topics = screen.getAllByText(articleTopic);
    expect(topics.length).toBeGreaterThan(0);
  });

  it('displays published date in detail view', () => {
    render(<NewsFeed />);

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    expect(screen.getByText(/Published:/)).toBeInTheDocument();
  });

  it('renders external link in detail view', () => {
    render(<NewsFeed />);

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    const externalLink = screen.getByText('View Original Source').closest('a');
    expect(externalLink).toHaveAttribute('href', richNewsFeedData[0].sourceUrl);
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders article icons in list view', () => {
    const { container } = render(<NewsFeed />);

    const icons = container.querySelectorAll('.lucide-book-open');
    expect(icons.length).toBe(richNewsFeedData.length);
  });

  it('displays read time for articles', () => {
    render(<NewsFeed />);

    // Check that read times are present (may appear multiple times due to duplicates)
    richNewsFeedData.forEach((article) => {
      const elements = screen.getAllByText(article.readTime);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('handles case-insensitive search', () => {
    render(<NewsFeed />);

    const searchInput = screen.getByPlaceholderText('Search topics or title');
    const firstArticleTitle = richNewsFeedData[0].title.toUpperCase();

    fireEvent.change(searchInput, { target: { value: firstArticleTitle } });

    // Should still find the article with case-insensitive search
    expect(screen.getByText(richNewsFeedData[0].title)).toBeInTheDocument();
  });

  it('shows no results when search does not match', () => {
    render(<NewsFeed />);

    const searchInput = screen.getByPlaceholderText('Search topics or title');
    fireEvent.change(searchInput, { target: { value: 'NonexistentArticle12345' } });

    // Should not show any Read buttons
    expect(screen.queryByText('Read')).not.toBeInTheDocument();
  });

  it('displays article title in detail view header', () => {
    render(<NewsFeed />);

    const firstReadButton = screen.getAllByText('Read')[0];
    fireEvent.click(firstReadButton);

    const articleTitle = richNewsFeedData[0].title;
    // Title should appear in the detail view (may appear multiple times)
    const titles = screen.getAllByText(articleTitle);
    expect(titles.length).toBeGreaterThan(0);
  });

  it('renders with correct initial state', () => {
    const { container } = render(<NewsFeed />);

    // Should show list view initially
    expect(screen.getByPlaceholderText('Search topics or title')).toBeInTheDocument();
    expect(screen.queryByText('AI Generated Summary')).not.toBeInTheDocument();
  });
});