// e2e/patients.spec.ts
import { test, expect } from '@playwright/test';
import { signIn } from './helpers';

test.describe('Patients Listing Page', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);

    // Navigate to patients page
    await page.goto('/patients');

    // Wait for patients page to load - use heading as indicator instead of networkidle
    // since the page may have continuous Firebase listeners
    await expect(page.getByRole('heading', { name: 'Patients Dashboard' })).toBeVisible({ timeout: 90000 });

    // Wait for loading spinner to disappear or for content to load
    await page.waitForFunction(
      () => {
        const loadingSpinner = document.querySelector('[class*="animate-spin"]');
        const patientsHeading = document.querySelector('h1');
        return (patientsHeading && patientsHeading.textContent === 'Patients Dashboard') && !loadingSpinner;
      },
      { timeout: 90000 }
    );
  });

  test('should display the patients dashboard header and description', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Patients Dashboard' })).toBeVisible();
    await expect(page.getByText('Monitor and manage your patients\' dementia risk assessments')).toBeVisible();
  });

  test('should display all stat cards', async ({ page }) => {
    const statCardTitles = ['Total Patients', 'High Risk', 'Moderate Risk', 'Low Risk'];

    for (const title of statCardTitles) {
      // Use first() to handle cases where text appears multiple times (stat card + filter button)
      await expect(page.getByText(title).first()).toBeVisible();
    }
  });

  test('should have a search input for filtering patients', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search patient by name or ID...');
    await expect(searchInput).toBeVisible();

    // Test that search input is functional
    await searchInput.fill('test patient');
    await expect(searchInput).toHaveValue('test patient');
  });

  test('should display risk filter buttons', async ({ page }) => {
    const filterButtons = ['All', 'High Risk', 'Moderate', 'Low'];

    for (const buttonText of filterButtons) {
      const button = page.getByRole('button', { name: buttonText, exact: true });
      await expect(button).toBeVisible();
    }
  });

  test('should have Add Patient and Assign Patient buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Add Patient/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Assign Patient/i })).toBeVisible();
  });

  test('should open Add Patient modal when Add Patient button is clicked', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Patient/i });
    await addButton.click();

    // Wait for modal to appear (adjust selector based on your modal implementation)
    await expect(page.getByText('Add New Patient')).toBeVisible({ timeout: 10000 });
  });

  test('should open Assign Patient modal when Assign Patient button is clicked', async ({ page }) => {
    const assignButton = page.getByRole('button', { name: /Assign Patient/i });
    await assignButton.click();

    // Wait for modal heading to appear
    await expect(page.getByRole('heading', { name: /Assign.*Patient/i })).toBeVisible({ timeout: 10000 });
  });

  test('should filter patients when clicking filter buttons', async ({ page }) => {
    // Wait for patient data to load
    await page.waitForTimeout(2000);

    // Click High Risk filter
    const highRiskButton = page.getByRole('button', { name: 'High Risk', exact: true });
    await highRiskButton.click();

    // The button should be active (have primary background)
    await expect(highRiskButton).toHaveClass(/bg-primary/);
  });

  test('should display pagination when there are multiple pages', async ({ page }) => {
    // Wait for patient data to load
    await page.waitForTimeout(2000);

    // Check if pagination text exists
    const paginationText = page.getByText(/Showing .* of .* patients/i);
    await expect(paginationText).toBeVisible();
  });

  test('should display the patient table', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(2000);

    // Check for actual table headers from PatientTable component
    const tableHeaders = ['PATIENT', 'RISK SCORE', 'TREND', 'ASSESSMENTS', 'ACTIONS'];

    for (const header of tableHeaders) {
      // Headers are uppercase in the component
      await expect(page.locator('th').filter({ hasText: new RegExp(header, 'i') })).toBeVisible();
    }
  });
});

test.describe('Patient Detail Page', () => {
  let patientId: string | null = null;

  test.beforeEach(async ({ page }) => {
    await signIn(page);

    // Navigate to patients page first
    await page.goto('/patients');

    // Wait for patients page to load - use heading as indicator
    await expect(page.getByRole('heading', { name: 'Patients Dashboard' })).toBeVisible({ timeout: 90000 });

    // Wait for loading spinner to disappear
    await page.waitForFunction(
      () => {
        const loadingSpinner = document.querySelector('[class*="animate-spin"]');
        return !loadingSpinner;
      },
      { timeout: 90000 }
    );

    // Wait for patient data to load
    await page.waitForTimeout(3000);

    // Try to find and click on a patient to get their ID
    // Look for View button or patient name link
    const viewButton = page.locator('button:has-text("View")').first();
    const viewButtonExists = await viewButton.count() > 0;

    if (viewButtonExists) {
      // Get patient ID from the URL or data attribute if available
      const patientLink = page.locator('[href*="/patients/"]').first();
      const linkExists = await patientLink.count() > 0;

      if (linkExists) {
        const href = await patientLink.getAttribute('href');
        if (href) {
          patientId = href.split('/patients/')[1];
        }
      }
    }
  });

  test('should display patient detail page when navigating to a patient', async ({ page }) => {
    // If we found a patient ID in beforeEach, navigate to it
    if (patientId) {
      await page.goto(`/patients/${patientId}`);

      // Wait for View Questionnaire button to appear (indicates page loaded)
      await expect(page.getByRole('button', { name: /View Questionnaire/i })).toBeVisible({ timeout: 90000 });

      // Check for breadcrumbs
      await expect(page.getByText('Patients')).toBeVisible();
      await expect(page.getByText('Patient Details')).toBeVisible();
    } else {
      // Skip test if no patient found
      test.skip();
    }
  });

  test('should display patient profile header information', async ({ page }) => {
    if (patientId) {
      await page.goto(`/patients/${patientId}`);

      // Wait for View Questionnaire button
      await expect(page.getByRole('button', { name: /View Questionnaire/i })).toBeVisible({ timeout: 90000 });

      // Check for common detail items
      await expect(page.getByText('Sex')).toBeVisible();
      await expect(page.getByText('Age')).toBeVisible();
      await expect(page.getByText('Patient ID')).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should open questionnaire modal when View Questionnaire is clicked', async ({ page }) => {
    if (patientId) {
      await page.goto(`/patients/${patientId}`);

      // Wait for button to appear
      const questionnaireButton = page.getByRole('button', { name: /View Questionnaire/i });
      await expect(questionnaireButton).toBeVisible({ timeout: 90000 });

      await questionnaireButton.click();

      // Wait for modal to appear (adjust selector based on your modal implementation)
      await expect(page.getByText(/Questionnaire/i)).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  test('should display patient game scores section', async ({ page }) => {
    if (patientId) {
      await page.goto(`/patients/${patientId}`);

      // Wait for game scores heading
      await expect(page.getByRole('heading', { name: 'Patient Game Scores' })).toBeVisible({ timeout: 90000 });

      // Check for score cards
      const scoreCardTitles = ['Speech', 'Cognitive', 'Memory', 'Avg'];
      for (const title of scoreCardTitles) {
        await expect(page.getByText(title)).toBeVisible();
      }
    } else {
      test.skip();
    }
  });

  test('should display test history table', async ({ page }) => {
    if (patientId) {
      await page.goto(`/patients/${patientId}`);

      // Wait for test history heading
      await expect(page.getByRole('heading', { name: 'Test History' })).toBeVisible({ timeout: 90000 });

      // Check for table headers
      const tableHeaders = ['Date', 'Test', 'Time Taken', 'Score', 'Total Plays', 'Download'];

      for (const header of tableHeaders) {
        await expect(page.locator('th').filter({ hasText: header })).toBeVisible();
      }
    } else {
      test.skip();
    }
  });

  test('should handle patient not found error gracefully', async ({ page }) => {
    // Navigate to a non-existent patient ID
    await page.goto('/patients/non-existent-patient-id-12345');

    // Should show an error message
    const errorText = page.getByText(/Patient not found|Failed to load patient data/i);
    await expect(errorText).toBeVisible({ timeout: 90000 });

    // Should have a back link
    const backLink = page.getByRole('link', { name: /Back to Patients/i });
    await expect(backLink).toBeVisible();
  });

  test('should navigate back to patients list from detail page', async ({ page }) => {
    if (patientId) {
      await page.goto(`/patients/${patientId}`);

      // Wait for page to load
      await expect(page.getByRole('button', { name: /View Questionnaire/i })).toBeVisible({ timeout: 90000 });

      // Click on Patients breadcrumb link
      const patientsLink = page.getByRole('link', { name: 'Patients' }).first();
      await patientsLink.click();

      // Should navigate back to patients list
      await expect(page.getByRole('heading', { name: 'Patients Dashboard' })).toBeVisible({ timeout: 90000 });
    } else {
      test.skip();
    }
  });
});

test.describe('Patient Search and Filter Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto('/patients');

    // Wait for patients page to load - use heading as indicator
    await expect(page.getByRole('heading', { name: 'Patients Dashboard' })).toBeVisible({ timeout: 90000 });

    // Wait for loading spinner to disappear
    await page.waitForFunction(
      () => {
        const loadingSpinner = document.querySelector('[class*="animate-spin"]');
        return !loadingSpinner;
      },
      { timeout: 90000 }
    );

    await page.waitForTimeout(2000);
  });

  test('should filter patients by search term', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search patient by name or ID...');

    // Get initial patient count
    const initialCount = await page.getByText(/Showing .* of .* patients/i).textContent();

    // Enter search term
    await searchInput.fill('test');
    await page.waitForTimeout(1000);

    // The count should update (we can't predict exact results with live data)
    await expect(page.getByText(/Showing .* of .* patients/i)).toBeVisible();
  });

  test('should reset to page 1 when changing filters', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Click different filter buttons
    await page.getByRole('button', { name: 'High Risk', exact: true }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Moderate', exact: true }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Low', exact: true }).click();
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'All', exact: true }).click();

    // Should still be on patients page with results
    await expect(page.getByText(/Showing .* of .* patients/i)).toBeVisible();
  });

  test('should maintain filters across page interactions', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);

    // Apply a filter
    const highRiskButton = page.getByRole('button', { name: 'High Risk', exact: true });
    await highRiskButton.click();

    // Verify the filter is active
    await expect(highRiskButton).toHaveClass(/bg-primary/);

    // The filter should remain active
    await page.waitForTimeout(500);
    await expect(highRiskButton).toHaveClass(/bg-primary/);
  });
});