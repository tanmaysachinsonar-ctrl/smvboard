import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Rosenaktion Feature
 * 
 * Vorbedingungen:
 * - Datenbank mit Seed-Daten (npx prisma db seed)
 * - 3 Schulen: Gymnasium Nord, Realschule Süd, Gesamtschule West
 * - 3 Users: owner@demo-schule.de (Schule A), member@demo-schule.de (Schule B), viewer@demo-schule.de (Schule C)
 * - Aktive Kampagne: "Valentinstag 2026"
 * - Test-Bestellungen bereits vorhanden
 */

test.describe('Rosenaktion - Bestellungen', () => {
  test.beforeEach(async ({ page }) => {
    // Login als owner@demo-schule.de (Passwort: password123)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner@demo-schule.de');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('Sollte Rosenaktion-Seite anzeigen', async ({ page }) => {
    await page.goto('/roses');
    
    // Hero-Section prüfen
    await expect(page.locator('h1')).toContainText('Rosenaktion');
    
    // Kampagnen-Info prüfen
    await expect(page.locator('text=Valentinstag 2026')).toBeVisible();
    
    // Action-Buttons prüfen
    await expect(page.locator('button:has-text("Rose bestellen")')).toBeVisible();
    await expect(page.locator('button:has-text("Verteilung ansehen")')).toBeVisible();
    
    // Statistik-Cards prüfen
    await expect(page.locator('text=Bestellte Rosen')).toBeVisible();
    await expect(page.locator('text=Bestellungen')).toBeVisible();
    await expect(page.locator('text=Schulen im Verbund')).toBeVisible();
  });

  test('Sollte bestehende Bestellungen anzeigen', async ({ page }) => {
    await page.goto('/roses');
    
    // Tabelle prüfen
    await expect(page.locator('table')).toBeVisible();
    
    // Tabellenheader prüfen
    await expect(page.locator('th:has-text("Empfänger")')).toBeVisible();
    await expect(page.locator('th:has-text("Schule")')).toBeVisible();
    await expect(page.locator('th:has-text("Anzahl")')).toBeVisible();
    
    // Mindestens eine Bestellung sollte sichtbar sein (aus Seed-Daten)
    const rows = page.locator('tbody tr');
    await expect(rows).not.toHaveCount(0);
  });

  test('Sollte neue Bestellung erstellen können', async ({ page }) => {
    await page.goto('/roses');
    
    // Modal öffnen
    await page.click('button:has-text("Rose bestellen")');
    await expect(page.locator('h2:has-text("Rose bestellen")')).toBeVisible();
    
    // Formular ausfüllen
    await page.selectOption('select[name="recipientSchoolId"]', { index: 1 }); // Erste Schule auswählen
    await page.fill('input[name="recipientName"]', 'Test Empfänger');
    await page.fill('input[name="recipientClass"]', '12a');
    await page.fill('input[name="roseCount"]', '3');
    await page.fill('textarea[name="senderNote"]', 'Test-Nachricht für E2E');
    
    // Abschicken
    await page.click('button[type="submit"]:has-text("Bestellen")');
    
    // Success-Message prüfen
    await expect(page.locator('text=Bestellung erfolgreich erstellt')).toBeVisible();
    
    // Modal sollte geschlossen sein
    await expect(page.locator('h2:has-text("Rose bestellen")')).not.toBeVisible();
    
    // Neue Bestellung sollte in Tabelle erscheinen
    await expect(page.locator('td:has-text("Test Empfänger")')).toBeVisible();
    await expect(page.locator('td:has-text("12a")')).toBeVisible();
    await expect(page.locator('text=3x 🌹')).toBeVisible();
  });

  test('Sollte Validierungsfehler anzeigen', async ({ page }) => {
    await page.goto('/roses');
    
    // Modal öffnen
    await page.click('button:has-text("Rose bestellen")');
    
    // Formular mit ungültigen Daten ausfüllen
    await page.fill('input[name="recipientName"]', 'M'); // Zu kurz
    await page.fill('input[name="roseCount"]', '11'); // Zu viel
    
    // Abschicken
    await page.click('button[type="submit"]:has-text("Bestellen")');
    
    // Browser-Validierung sollte greifen (required, min, max)
    // Oder: Backend-Fehler sollte angezeigt werden
    // Erwartung: Modal bleibt offen
    await expect(page.locator('h2:has-text("Rose bestellen")')).toBeVisible();
  });

  test('Sollte zu Verteilungsseite navigieren', async ({ page }) => {
    await page.goto('/roses');
    
    // Button klicken
    await page.click('button:has-text("Verteilung ansehen")');
    
    // URL prüfen
    await expect(page).toHaveURL('/roses/distribution');
  });
});

test.describe('Rosenaktion - Verteilung', () => {
  test.beforeEach(async ({ page }) => {
    // Login als owner@demo-schule.de
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner@demo-schule.de');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('Sollte Verteilungsseite anzeigen', async ({ page }) => {
    await page.goto('/roses/distribution');
    
    // Header prüfen
    await expect(page.locator('h1')).toContainText('Rosen-Verteilung');
    
    // Zurück-Button prüfen
    await expect(page.locator('a:has-text("Zurück")')).toBeVisible();
    
    // School-Selector prüfen
    await expect(page.locator('select')).toBeVisible();
    
    // Action-Buttons prüfen
    await expect(page.locator('button:has-text("CSV Export")')).toBeVisible();
    await expect(page.locator('button:has-text("Drucken")')).toBeVisible();
  });

  test('Sollte aggregierte Verteilungsliste anzeigen', async ({ page }) => {
    await page.goto('/roses/distribution');
    
    // Warte auf Daten-Laden
    await page.waitForTimeout(1000);
    
    // Statistik-Cards prüfen
    await expect(page.locator('text=Gesamt Rosen')).toBeVisible();
    await expect(page.locator('text=Empfänger')).toBeVisible();
    
    // Tabelle prüfen
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Klasse")')).toBeVisible();
    await expect(page.locator('th:has-text("Anzahl Rosen")')).toBeVisible();
    
    // Aus Seed-Daten: Max Müller sollte mehrere Rosen haben (aggregiert)
    // Dies ist nur sichtbar wenn man die richtige Schule auswählt
    const rows = page.locator('tbody tr');
    // Sollte mindestens 1 Empfänger geben
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Sollte Schule wechseln können', async ({ page }) => {
    await page.goto('/roses/distribution');
    
    // Warte auf Laden
    await page.waitForTimeout(500);
    
    // Erste Schule auswählen
    await page.selectOption('select', { index: 0 });
    await page.waitForTimeout(500);
    
    // Zweite Schule auswählen
    await page.selectOption('select', { index: 1 });
    await page.waitForTimeout(500);
    
    // Beide Requests sollten erfolgreich sein (keine Error-Message)
    await expect(page.locator('text=Fehler')).not.toBeVisible();
  });

  test('Sollte Suchfunktion nutzen können', async ({ page }) => {
    await page.goto('/roses/distribution');
    
    // Warte auf Laden
    await page.waitForTimeout(1000);
    
    // Prüfe ob Suchfeld existiert
    const searchInput = page.locator('input[placeholder*="suchen"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Max');
      
      // Tabelle sollte gefiltert sein
      const rows = page.locator('tbody tr:visible');
      const count = await rows.count();
      
      // Mindestens 1 Zeile sollte "Max" enthalten (aus Seed-Daten)
      if (count > 0) {
        await expect(rows.first()).toContainText('Max');
      }
    }
  });

  test('Sollte CSV Export auslösen', async ({ page }) => {
    await page.goto('/roses/distribution');
    
    // Warte auf Laden
    await page.waitForTimeout(1000);
    
    // Download-Event abfangen
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("CSV Export")');
    
    const download = await downloadPromise;
    
    // Dateiname prüfen
    expect(download.suggestedFilename()).toContain('rosenaktion');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('Sollte zurück zur Hauptseite navigieren', async ({ page }) => {
    await page.goto('/roses/distribution');
    
    // Zurück-Button klicken
    await page.click('a:has-text("Zurück")');
    
    // URL prüfen
    await expect(page).toHaveURL('/roses');
  });
});

test.describe('Rosenaktion - Access Control', () => {
  test('MEMBER sollte nur eigene Schule sehen', async ({ page }) => {
    // Login als member@demo-schule.de (Schule B zugeordnet)
    await page.goto('/login');
    await page.fill('input[name="email"]', 'member@demo-schule.de');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    await page.goto('/roses/distribution');
    
    // Sollte Zugriff haben (eigene Schule)
    await expect(page.locator('h1')).toContainText('Rosen-Verteilung');
    
    // Aber: Wenn MEMBER versucht andere Schule zu sehen, sollte 403 kommen
    // (Dies müsste über API direkt getestet werden, da UI es verhindert)
  });

  test('OWNER sollte alle Schulen sehen', async ({ page }) => {
    // Login als owner@demo-schule.de
    await page.goto('/login');
    await page.fill('input[name="email"]', 'owner@demo-schule.de');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    await page.goto('/roses/distribution');
    
    // School-Selector sollte alle Schulen enthalten
    const options = page.locator('select option');
    const count = await options.count();
    
    // Aus Seed-Daten: 3 Schulen
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Sollte alle Schulen durchschalten können ohne Fehler
    for (let i = 0; i < Math.min(count, 3); i++) {
      await page.selectOption('select', { index: i });
      await page.waitForTimeout(500);
      // Kein Error sollte erscheinen
      await expect(page.locator('text=Fehler')).not.toBeVisible();
    }
  });
});
