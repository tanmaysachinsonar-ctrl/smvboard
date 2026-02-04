import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('SMVBoard');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Jetzt registrieren');
    await expect(page).toHaveURL('/signup');
  });
});

test.describe('Dashboard', () => {
  test('should show login prompt for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Willkommen bei SMVBoard')).toBeVisible();
  });
});
