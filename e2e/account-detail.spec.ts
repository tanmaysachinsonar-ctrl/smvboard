import { test, expect } from '@playwright/test';

/**
 * E2E Tests für Account Detail Feature
 */

test.describe('Account Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login vor jedem Test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'demo@smvboard.de');
    await page.fill('input[type="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('sollte Account-Detail-Seite erfolgreich laden', async ({ page }) => {
    // Navigiere zu Finanzen
    await page.goto('/finances');
    await page.waitForSelector('text=Finanzen');

    // Warte auf Account-Liste
    await page.waitForSelector('table', { timeout: 10000 });

    // Klicke auf ersten Account (falls vorhanden)
    const firstAccountRow = page.locator('tbody tr').first();
    const accountExists = await firstAccountRow.count() > 0;

    if (accountExists) {
      const accountName = await firstAccountRow.locator('td').first().textContent();
      await firstAccountRow.click();

      // Warte auf Detail-Seite
      await page.waitForURL(/\/finances\/accounts\/[a-z0-9]+/);

      // Überprüfe Header mit Account-Namen
      await expect(page.locator('h1')).toContainText(accountName || '');

      // Überprüfe, dass die Seite nicht 404 ist
      await expect(page.locator('text=Fehler')).toHaveCount(0);
      await expect(page.locator('text=nicht gefunden')).toHaveCount(0);
    } else {
      console.log('Keine Accounts vorhanden - Test übersprungen');
    }
  });

  test('sollte Balance anzeigen', async ({ page }) => {
    // Erstelle Test-Account
    await page.goto('/finances');
    
    // Wenn "Neues Konto" Button existiert, erstelle Account
    const createButton = page.locator('text=Neues Konto');
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.fill('input[name="name"]', 'Test Account E2E');
      await page.selectOption('select[name="type"]', 'CASH');
      await page.fill('input[name="balance"]', '1500');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
    }

    // Navigiere zu erstem Account
    const firstAccountRow = page.locator('tbody tr').first();
    if (await firstAccountRow.count() > 0) {
      await firstAccountRow.click();

      // Überprüfe Balance-Anzeige
      await expect(page.locator('text=Aktueller Saldo')).toBeVisible();
      await expect(page.locator('text=€')).toBeVisible();
    }
  });

  test('sollte Transaktionen-Liste anzeigen', async ({ page }) => {
    await page.goto('/finances');

    const firstAccountRow = page.locator('tbody tr').first();
    if (await firstAccountRow.count() > 0) {
      await firstAccountRow.click();
      await page.waitForURL(/\/finances\/accounts\/[a-z0-9]+/);

      // Überprüfe Transaktionen-Sektion
      await expect(page.locator('text=Transaktionen')).toBeVisible();
      
      // Button "Neue Transaktion" sollte vorhanden sein
      await expect(page.locator('text=Neue Transaktion')).toBeVisible();
    }
  });

  test('sollte "Zurück zu Finanzen" Link funktionieren', async ({ page }) => {
    await page.goto('/finances');

    const firstAccountRow = page.locator('tbody tr').first();
    if (await firstAccountRow.count() > 0) {
      await firstAccountRow.click();
      await page.waitForURL(/\/finances\/accounts\/[a-z0-9]+/);

      // Klicke auf "Zurück"-Link
      await page.click('text=Zurück zu Finanzen');
      await page.waitForURL('/finances');

      // Überprüfe, dass wir wieder auf Finanzen-Seite sind
      await expect(page.locator('h1')).toContainText('Finanzen');
    }
  });

  test('sollte Edit/Delete Buttons für OWNER anzeigen', async ({ page }) => {
    await page.goto('/finances');

    const firstAccountRow = page.locator('tbody tr').first();
    if (await firstAccountRow.count() > 0) {
      await firstAccountRow.click();
      await page.waitForURL(/\/finances\/accounts\/[a-z0-9]+/);

      // Überprüfe ob Bearbeiten-Button existiert (nur für OWNER)
      const editButton = page.locator('button:has-text("Bearbeiten")');
      const deleteButton = page.locator('button:has-text("Löschen")');

      // Buttons sollten sichtbar sein wenn User OWNER ist
      // (Können wir nicht direkt testen ohne User-Role zu kennen)
      const editExists = await editButton.count() > 0;
      const deleteExists = await deleteButton.count() > 0;

      // Wenn einer existiert, sollten beide existieren
      if (editExists || deleteExists) {
        expect(editExists).toBe(deleteExists);
      }
    }
  });

  test('sollte 404-Fehler für nicht existierenden Account zeigen', async ({ page }) => {
    // Navigiere zu nicht existierender Account-ID
    await page.goto('/finances/accounts/nonexistent-id-12345');

    // Überprüfe Fehler-Meldung
    await expect(page.locator('text=Konto nicht gefunden')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Zurück zu Finanzen')).toBeVisible();
  });
});
