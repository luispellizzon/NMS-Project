// e2e/helpers.ts

import { expect, Page } from '@playwright/test';

// Ensure these are loaded, especially in CI environments.
const E2E_TEST_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL || 'doctor@example.com';
const E2E_TEST_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD || 'password123';

if (!E2E_TEST_USER_EMAIL || !E2E_TEST_USER_PASSWORD) {
  throw new Error('E2E test credentials are not set in environment variables.');
}

/**
 * A robust, reusable sign-in function that fills credentials,
 * clicks the sign-in button, and waits for the dashboard to load.
 */
export const signIn = async (page: Page) => {
  await page.goto('/signin');
  await page.getByLabel('Email address').fill(E2E_TEST_USER_EMAIL);
  await page.getByLabel('Password').fill(E2E_TEST_USER_PASSWORD);
  await page.getByRole('button', { name: /^sign in$/i }).click();

  await page.waitForURL('/dashboard');
  const newsHeader = page.getByRole('heading', { name: 'News' });
  await expect(newsHeader).toBeVisible();
};