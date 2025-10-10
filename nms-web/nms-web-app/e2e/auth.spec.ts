// tests/e2e/auth.spec.ts
import { test, expect, Page } from '@playwright/test';

const E2E_TEST_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL || 'doctor@example.com';
const E2E_TEST_USER_PASSWORD = process.env.E2E_TEST_USER_PASSWORD || 'password123';

// Reusable sign-in function
const signIn = async (page: Page, email: string, password: string) => {
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /^sign in$/i }).click();
};

test.describe('Authentication and Authorization Flows', () => {

  test('should allow a user to sign in and redirect to the dashboard', async ({ page }) => {
    await page.goto('/signin');

    await signIn(page, E2E_TEST_USER_EMAIL, E2E_TEST_USER_PASSWORD);

    // Wait for the navigation to complete
    await page.waitForURL('/dashboard');

    const dashboardHeader = page.getByRole('heading', { name: /risk dashboard/i });
    await expect(dashboardHeader).toBeVisible();
  });

  test('should show an error for invalid credentials', async ({ page }) => {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    await page.route(`**/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 400,
            message: 'INVALID_LOGIN_CREDENTIALS',
          }
        }),
      });
    });

    await page.goto('/signin');
    await signIn(page, 'wrong@user.com', 'wrongpassword');
    
    const errorMessage = page.getByText('Invalid email or password.');
    await expect(errorMessage).toBeVisible();

    // Verify that we remain on the sign-in page
    await expect(page).toHaveURL('/signin');
  });
});