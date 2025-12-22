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
 * NOTE: The test user MUST have the 'doctor' role in Firebase, otherwise
 * they will be redirected to the homepage instead of the dashboard.
 */
export const signIn = async (page: Page) => {
  await page.goto('/signin');

  // Wait for the sign-in form to be fully loaded
  await page.waitForLoadState('domcontentloaded');

  // Wait for form elements to be ready
  const emailInput = page.getByLabel('Email address');
  const passwordInput = page.getByLabel('Password');
  const signInButton = page.getByRole('button', { name: /^sign in$/i });

  await expect(emailInput).toBeVisible({ timeout: 15000 });
  await expect(passwordInput).toBeVisible({ timeout: 15000 });
  await expect(signInButton).toBeVisible({ timeout: 15000 });
  await expect(signInButton).toBeEnabled({ timeout: 15000 });

  await emailInput.fill(E2E_TEST_USER_EMAIL);
  await passwordInput.fill(E2E_TEST_USER_PASSWORD);

  // Click sign in button and wait for navigation simultaneously
  // This prevents race conditions where navigation completes before waitForURL starts listening
  try {
    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 45000 }),
      signInButton.click(),
    ]);
  } catch {
    // If URL wait times out, check if we're still on signin page
    const currentUrl = page.url();
    if (currentUrl.includes('/signin')) {
      // Check for error message on the sign-in page
      const errorMsg = page.getByTestId('error-message');
      const hasError = await errorMsg.isVisible().catch(() => false);
      if (hasError) {
        const errorText = await errorMsg.textContent();
        throw new Error(`Sign-in failed with error: ${errorText}`);
      }
      throw new Error(
        `Sign-in did not redirect to dashboard. Current URL: ${currentUrl}. ` +
        `The test user (${E2E_TEST_USER_EMAIL}) may not have the 'doctor' role in Firebase, ` +
        `or the authentication failed. Please check Firebase user data.`
      );
    }
    if (currentUrl.endsWith('/') && !currentUrl.includes('/dashboard')) {
      throw new Error(
        `Sign-in redirected to homepage instead of dashboard. Current URL: ${currentUrl}. ` +
        `The test user may not have the 'doctor' role in Firebase.`
      );
    }
    // If we're somewhere else, it might be okay - continue
  }

  // Wait for the dashboard to fully render (auth context and role check to complete)
  // Look for a dashboard-specific element
  await expect(page.getByRole('heading', { name: /Agent News/i })).toBeVisible({ timeout: 45000 });

  // Final verification that we're on dashboard
  const dashboardUrl = page.url();
  if (!dashboardUrl.includes('/dashboard')) {
    throw new Error(`Expected to be on dashboard but current URL is: ${dashboardUrl}`);
  }
};