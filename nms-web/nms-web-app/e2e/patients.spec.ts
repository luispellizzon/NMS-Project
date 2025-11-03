// e2e/patients.spec.ts
import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Patients Dashboard E2E Tests', () => {
  // Before each test, sign in and navigate to the patients page
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.getByRole('link', { name: 'Patients' }).click();
    await page.waitForURL('**/patients');

    // Wait for the main heading to ensure the page is loaded
    await expect(page.getByRole('heading', { name: 'Patients Dashboard' })).toBeVisible();
  });

  test('should display patients table and statistics', async ({ page }) => {
    // Check for key elements using more specific locators
    await expect(page.getByText('Total Patients')).toBeVisible();
    
    // Specifically target the stat card containing "High Risk" and its value.
    const highRiskStatCard = page.locator('.bg-card', { hasText: 'High Risk' });
    await expect(highRiskStatCard.getByText('4')).toBeVisible(); // From mock data

    await expect(page.getByRole('button', { name: 'Add Patient' })).toBeVisible();
    
    // Check for a patient in the table
    await expect(page.getByText('Jenny Wilson')).toBeVisible();
  });

  test('should filter patients by risk level', async ({ page }) => {
    // Initially, multiple patients are visible
    await expect(page.getByText('Jenny Wilson')).toBeVisible(); // High
    await expect(page.getByText('Esther Howard')).toBeVisible(); // Moderate

    // Click on the 'High Risk' filter button
    await page.getByRole('button', { name: 'High Risk' }).click();

    // Verify that only high-risk patients are now visible
    await expect(page.getByText('Jenny Wilson')).toBeVisible();
    await expect(page.getByText('Robert Fox')).toBeVisible();
    
    // Verify that moderate-risk patient is no longer visible
    await expect(page.getByText('Esther Howard')).not.toBeVisible();
  });

  test('should filter patients by search term', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search patient by name or ID...');
    await searchInput.fill('Esther');

    // Check that only 'Esther Howard' is now in the table
    await expect(page.getByText('Esther Howard')).toBeVisible();
    await expect(page.getByText('Jenny Wilson')).not.toBeVisible();
  });
  
  test('should open the add patient modal and show form fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Patient' }).click();

    // Wait for the modal to appear and check for its title and form fields
    await expect(page.getByRole('heading', { name: 'Add New Patient' })).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('should navigate to patient detail page on row click', async ({ page }) => {
    // Click on the table row containing the patient's name
    await page.getByRole('link', { name: /Jenny Wilson/ }).click();

    // The URL should change to the specific patient's page
    await page.waitForURL(/.*\/patients\/P001/);

    // Verify a key element on the detail page
    await expect(page.getByRole('heading', { name: 'Jenny Wilson' })).toBeVisible();
    await expect(page.getByText('Patient Game Scores')).toBeVisible();
  });
  
  test('should show a confirmation modal before deleting a patient', async ({ page }) => {
    // Find the row for 'Jenny Wilson'
    const jennyRow = page.getByRole('row', { name: /Jenny Wilson/i });

    // Use the specific data-testid for the "More Actions" button
    await jennyRow.getByTestId('more-actions-P001').click();

    // Click the 'Delete Patient' button from the dropdown menu
    await page.getByRole('button', { name: /Delete Patient/i }).click();

    // Assert that the confirmation modal is now visible
    await expect(page.getByRole('heading', { name: 'Confirm Deletion' })).toBeVisible();
    await expect(page.getByText(/Are you sure you want to delete the record/)).toBeVisible();
    
    // Use the 'exact: true' option to distinguish from "Delete Patient"
    await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeVisible();
  });
});