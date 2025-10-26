// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Authentication and Authorization Flows', () => {

  test('should allow a user to sign in and redirect to the dashboard', async ({ page }) => {
    await signIn(page);
    const newsHeader = page.getByRole('heading', { name: 'News' });
    await expect(newsHeader).toBeVisible();
  });

  test('should show an error for invalid credentials', async ({ page }) => {
    const signInUrlPattern = /identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword/;

    await page.route(
      (url) => signInUrlPattern.test(url.href),
      async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: { code: 400, message: 'INVALID_LOGIN_CREDENTIALS' } }),
        });
      }
    );

    await page.goto('/signin');

    await page.getByLabel('Email address').fill('wrong@user.com');
    await page.getByLabel('Password').fill('wrongpassword');

    // synchronize the click action with the network response wait.
    await Promise.all([
      page.waitForResponse((response) => signInUrlPattern.test(response.url())),
      page.getByRole('button', { name: /^sign in$/i }).click(), // This is the only action inside.
    ]);

    const errorMessage = page.getByTestId('error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Invalid email or password.');

    await expect(page).toHaveURL('/signin');
  });
});