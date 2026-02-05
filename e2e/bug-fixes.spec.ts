import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Bug Fixes
 * 
 * 1. Event Modal Input Bug: Users could not type into input fields
 * 2. 404 Routes Bug: Some pages returned 404 errors
 */

test.describe('Bug Fix: Event Modal Input Fields', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    
    // Wait for login page to load
    await page.waitForSelector('input[type="email"]');
    
    // Fill in credentials (adjust based on your test user)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/);
  });

  test('should allow typing in event title field', async ({ page }) => {
    // Navigate to calendar
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    // Open event creation modal
    await page.click('button:has-text("Neues Event")');
    
    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"]');

    // Type into title field
    const titleInput = page.locator('input#event-title');
    await titleInput.click();
    await titleInput.fill('Test Event Title');

    // Verify the value was set
    await expect(titleInput).toHaveValue('Test Event Title');
  });

  test('should allow typing in event description field', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.click('button:has-text("Neues Event")');
    await page.waitForSelector('[role="dialog"]');

    // Type into description
    const descriptionField = page.locator('textarea#event-description');
    await descriptionField.click();
    await descriptionField.fill('This is a test description with multiple words');

    await expect(descriptionField).toHaveValue('This is a test description with multiple words');
  });

  test('should allow typing in location field', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Neues Event")');
    await page.waitForSelector('[role="dialog"]');

    const locationInput = page.locator('input#event-location');
    await locationInput.click();
    await locationInput.fill('Conference Room A');

    await expect(locationInput).toHaveValue('Conference Room A');
  });

  test('should allow changing date/time inputs', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Neues Event")');
    await page.waitForSelector('[role="dialog"]');

    const startInput = page.locator('input#event-start');
    await startInput.click();
    await startInput.fill('2026-03-15T14:30');

    await expect(startInput).toHaveValue('2026-03-15T14:30');
  });

  test('should maintain focus when clicking inside modal', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Neues Event")');
    await page.waitForSelector('[role="dialog"]');

    const titleInput = page.locator('input#event-title');
    await titleInput.click();
    
    // Input should be focused
    await expect(titleInput).toBeFocused();

    // Type some text
    await page.keyboard.type('My Event');
    
    // Value should update
    await expect(titleInput).toHaveValue('My Event');
  });

  test('should NOT close modal when clicking on input fields', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Neues Event")');
    await page.waitForSelector('[role="dialog"]');

    // Click on various inputs
    await page.click('input#event-title');
    await page.waitForTimeout(100);
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.click('textarea#event-description');
    await page.waitForTimeout(100);
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.click('input#event-location');
    await page.waitForTimeout(100);
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('should submit form with typed values', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Neues Event")');
    await page.waitForSelector('[role="dialog"]');

    // Fill out form
    await page.fill('input#event-title', 'E2E Test Event');
    await page.fill('input#event-start', '2026-03-20T10:00');
    await page.fill('textarea#event-description', 'This is an E2E test');
    await page.fill('input#event-location', 'Test Room');

    // Submit
    await page.click('button:has-text("Erstellen")');

    // Wait for modal to close and event to appear
    await page.waitForTimeout(1000);
    
    // Verify event was created (should appear in list or calendar)
    await expect(page.locator('text=E2E Test Event')).toBeVisible();
  });
});

test.describe('Bug Fix: Route 404 Issues', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
  });

  test('should load finances page without 404', async ({ page }) => {
    await page.goto('/finances');
    await page.waitForLoadState('networkidle');

    // Should NOT show 404 error
    await expect(page.locator('text=404')).not.toBeVisible();
    
    // Should show finances page content
    await expect(page.locator('h1, h2, h3')).toContainText(/Finanzen|Konten|Accounts/i);
  });

  test('should load members page without 404', async ({ page }) => {
    await page.goto('/members');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=404')).not.toBeVisible();
    await expect(page.locator('h1, h2, h3')).toContainText(/Mitglieder|Members/i);
  });

  test('should load events/calendar page without 404', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=404')).not.toBeVisible();
    await expect(page.locator('h1, h2, h3, button')).toContainText(/Kalender|Event/i);
  });

  test('should navigate between pages using navigation menu', async ({ page }) => {
    await page.goto('/dashboard');

    // Try clicking navigation links (adjust selectors based on your nav structure)
    const navLinks = [
      { text: /Finanzen/i, expectedUrl: '/finances' },
      { text: /Mitglieder/i, expectedUrl: '/members' },
      { text: /Kalender|Events/i, expectedUrl: '/events' },
    ];

    for (const link of navLinks) {
      // Click navigation link
      await page.click(`a:has-text("${link.text.source.replace(/\\/g, '')}")`);
      
      // Wait for navigation
      await page.waitForURL(new RegExp(link.expectedUrl));
      
      // Verify no 404
      await expect(page.locator('text=404')).not.toBeVisible();
      
      // Go back to dashboard for next iteration
      await page.goto('/dashboard');
    }
  });

  test('should handle direct URL navigation correctly', async ({ page }) => {
    const routes = ['/dashboard', '/finances', '/members', '/events'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Should not show 404
      const is404 = await page.locator('text=404').isVisible().catch(() => false);
      expect(is404).toBe(false);
      
      // Should show authenticated content (not login page)
      const isLoginPage = await page.locator('input[type="email"]').isVisible().catch(() => false);
      expect(isLoginPage).toBe(false);
    }
  });
});
