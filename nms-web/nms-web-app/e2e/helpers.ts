// e2e/helpers.ts

import { expect, Page } from '@playwright/test';

const E2E_TEST_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL || 'doctor@example.com';
const E2E_TEST_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD || 'password123';

if (!E2E_TEST_USER_EMAIL || !E2E_TEST_USER_PASSWORD) {
  throw new Error('E2E test credentials are not set in environment variables.');
}

/**
 * A robust, reusable sign-in function that fills credentials,
 * clicks the sign-in button, and waits for the dashboard to load.
 *
 * Handles browser-specific timing differences and live Firebase data loading.
 */
export const signIn = async (page: Page) => {
  await page.goto('/signin');

  // Wait for the sign-in form to be fully loaded
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Email address').fill(E2E_TEST_USER_EMAIL);
  await page.getByLabel('Password').fill(E2E_TEST_USER_PASSWORD);

  // Click sign in and wait for navigation
  await page.getByRole('button', { name: /^sign in$/i }).click();

  // Wait for navigation away from sign-in page
  await page.waitForURL((url) => !url.pathname.includes('/signin'), { timeout: 90000 });

  // Wait for dashboard to load - give more time for live Firebase data
  // Wait for either the News heading or the loading spinner to disappear
  await page.waitForFunction(
    () => {
      const newsHeading = document.querySelector('h1');
      const loadingSpinner = document.querySelector('[class*="animate-spin"]');
      return (newsHeading && newsHeading.textContent === 'News') || !loadingSpinner;
    },
    { timeout: 90000 }
  );

  // Final verification that we're on the dashboard
  await expect(page.getByRole('heading', { name: 'News' })).toBeVisible({ timeout: 30000 });
};