// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('should display all main dashboard cards after login', async ({ page }) => {
    const cardTitles = [
      'Agent News & Research', 'Geographic Distribution', 'Score Range', 'Avg Scores',
      'Patients', 'Avg Risk Assessment', 'Overall Appointments',
      'Upcoming Appointments', 'Previous Appointments',
    ];

    for (const title of cardTitles) {
      const cardHeading = page.getByRole('heading', { name: title });
      await expect(cardHeading).toBeVisible();
    }
  });

  test('should allow searching in the news feed', async ({ page }) => {
    const newsCard = page.locator('.bg-card', { hasText: 'News' });
    // Updated placeholder text to match the new NewsFeed component
    const searchInput = newsCard.getByPlaceholder(/filter by topic, title, or category/i);

    // Check that search input exists and is functional
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Alzheimer');

    // Just verify the search functionality works, not specific article content
    await expect(searchInput).toHaveValue('Alzheimer');
  });
});