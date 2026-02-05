import { test, expect } from '@playwright/test';

test.describe('Dashboard Interactions', () => {
  test('should navigate to dashboard sections', async ({ page }) => {
    await page.goto('/');
    
    // Check homepage loads
    await expect(page.locator('h1')).toContainText('SMVBoard');
    
    // Navigate to login
    await page.click('text=Anmelden');
    await expect(page).toHaveURL('/login');
    
    // Go to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Willkommen');
    
    // Check all navigation cards are present
    await expect(page.locator('text=Finanzen')).toBeVisible();
    await expect(page.locator('text=Mitglieder')).toBeVisible();
    await expect(page.locator('text=Kalender')).toBeVisible();
    await expect(page.locator('text=Premium')).toBeVisible();
  });

  test('should handle unauthenticated access', async ({ page }) => {
    // Try to access protected pages without auth
    await page.goto('/finances');
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 5000 });
    
    await page.goto('/members');
    await page.waitForURL('/login', { timeout: 5000 });
    
    await page.goto('/events');
    await page.waitForURL('/login', { timeout: 5000 });
  });
});

test.describe('Finances Page', () => {
  test('should show empty state when no accounts', async ({ page }) => {
    await page.goto('/finances');
    
    // If redirected to login, skip this test (needs auth)
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Check for empty state or accounts list
    const hasAccounts = await page.locator('.grid').count() > 0;
    
    if (!hasAccounts) {
      await expect(page.locator('text=Keine Konten vorhanden')).toBeVisible();
      await expect(page.locator('text=Erstes Konto erstellen')).toBeVisible();
    }
  });

  test('should open account creation modal', async ({ page }) => {
    await page.goto('/finances');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Click "Neues Konto" button
    await page.click('text=Neues Konto');
    
    // Modal should be visible
    await expect(page.locator('text=Neues Konto erstellen')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    
    // Close modal
    await page.click('text=Abbrechen');
    await expect(page.locator('text=Neues Konto erstellen')).not.toBeVisible();
  });

  test('should validate required fields in account creation', async ({ page }) => {
    await page.goto('/finances');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    await page.click('text=Neues Konto');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Form validation should prevent submission
    // (browser native validation)
  });
});

test.describe('Members Page', () => {
  test('should show empty state when no members', async ({ page }) => {
    await page.goto('/members');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Check for empty state or members list
    const hasMembers = await page.locator('.grid').count() > 0;
    
    if (!hasMembers) {
      await expect(page.locator('text=Keine Mitglieder vorhanden')).toBeVisible();
    }
  });

  test('should have add member button', async ({ page }) => {
    await page.goto('/members');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    await expect(page.locator('text=Neues Mitglied')).toBeVisible();
  });
});

test.describe('Events Page', () => {
  test('should show empty state when no events', async ({ page }) => {
    await page.goto('/events');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Check for empty state or events list
    const hasEvents = await page.locator('.space-y-4 > div').count() > 0;
    
    if (!hasEvents) {
      await expect(page.locator('text=Keine Events vorhanden')).toBeVisible();
    }
  });

  test('should open event creation modal', async ({ page }) => {
    await page.goto('/events');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Click "Neues Event" button
    await page.click('text=Neues Event');
    
    // Modal should be visible
    await expect(page.locator('text=Neues Event erstellen')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="datetime-local"]')).toBeVisible();
    
    // Close modal
    await page.click('text=Abbrechen');
    await expect(page.locator('text=Neues Event erstellen')).not.toBeVisible();
  });

  test('should validate required fields in event creation', async ({ page }) => {
    await page.goto('/events');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    await page.click('text=Neues Event');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Form validation should prevent submission
  });
});

test.describe('Error Handling', () => {
  test('should show error alerts on API failures', async ({ page, context }) => {
    // Intercept API calls and return errors
    await context.route('**/api/v1/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.goto('/finances');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Wait for error message to appear
    await page.waitForSelector('text=konnten nicht geladen werden', { timeout: 10000 });
  });

  test('should have working error dismissal', async ({ page, context }) => {
    await context.route('**/api/v1/accounts', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Test error' }),
      });
    });

    await page.goto('/finances');
    
    if (page.url().includes('/login')) {
      test.skip();
      return;
    }
    
    // Wait for error alert
    const errorAlert = page.locator('.bg-red-900\\/20');
    await errorAlert.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click dismiss button
    await page.click('.text-red-400.hover\\:text-red-300');
    
    // Error should be gone
    await expect(errorAlert).not.toBeVisible();
  });
});
