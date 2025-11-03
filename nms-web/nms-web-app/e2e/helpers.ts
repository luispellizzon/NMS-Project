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
 * Handles browser-specific timing differences, particularly for WebKit.
 */
export const signIn = async (page: Page) => {
  await page.goto('/signin');
  await page.getByLabel('Email address').fill(E2E_TEST_USER_EMAIL);
  await page.getByLabel('Password').fill(E2E_TEST_USER_PASSWORD);

  await page.getByRole('button', { name: /^sign in$/i }).click();

  // Wait for either URL to match OR dashboard element to appear
  await Promise.race([
    page.waitForURL('**/dashboard*', { timeout: 60000 }),
    page.waitForSelector('h1:has-text("News")', { timeout: 60000 }),
  ]);

  await expect(page.getByRole('heading', { name: 'News' })).toBeVisible();
};