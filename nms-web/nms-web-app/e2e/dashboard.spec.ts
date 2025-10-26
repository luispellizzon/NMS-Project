// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('should display all main dashboard cards after login', async ({ page }) => {
    const cardTitles = [
      'News', 'Geographic Distribution', 'Score Range', 'Avg Scores',
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
    const searchInput = newsCard.getByPlaceholder('Search topics or title');

    await searchInput.fill('Ginkgo');
    await expect(page.getByText(/New Study on Ginkgo Biloba/i)).toBeVisible();
    await expect(page.getByText(/Retinal Scan Analysis/i)).not.toBeVisible();
  });
});