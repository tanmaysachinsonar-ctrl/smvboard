# 🧪 SMVBoard Testing & Usage Guide

## Quick Start (5 Minuten)

### 1. Dependencies installieren (falls noch nicht geschehen)
```bash
npm install
```

### 2. Umgebungsvariablen einrichten
```bash
# .env Datei existiert bereits mit Supabase Credentials
# Falls du neue Credentials brauchst, kopiere .env.example
```

### 3. Prisma Client generieren
```bash
npm run prisma:generate
```

### 4. Datenbank migrieren
```bash
npm run prisma:migrate
```

### 5. Dev-Server starten
```bash
npm run dev
```

➡️ Öffne Browser: **http://localhost:3000**

---

## 🎯 Testing Checkliste

### ✅ Automatisierte Tests

#### Unit Tests ausführen
```bash
npm test
# Oder mit Coverage:
npm run test:unit
```

**Erwartet:** `17/17 Tests passing` ✅

#### TypeScript Type-Check
```bash
npm run type-check
```

**Erwartet:** Keine Fehler ✅

#### ESLint
```bash
npm run lint
```

**Erwartet:** `✔ No ESLint warnings or errors` ✅

#### E2E Tests (Playwright)
```bash
# Browser installieren (einmalig)
npx playwright install

# Tests ausführen
npm run test:e2e

# Mit UI
npx playwright test --ui
```

---

## 🖱️ Manuelle Tests (Dashboard Interaktionen)

### Test 1: Homepage & Navigation
1. ✅ Öffne http://localhost:3000
2. ✅ Prüfe: "SMVBoard" Titel sichtbar
3. ✅ Klicke: "Anmelden" → Weiterleitung zu `/login`
4. ✅ Klicke: "Jetzt registrieren" → Weiterleitung zu `/signup`

### Test 2: Registrierung & Login
```
Demo-Account:
Email: demo@smvboard.de
Password: password123
```

#### Registrierung testen:
1. Gehe zu `/signup`
2. Fülle Formular aus:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
   - Organisation: `Test SMV`
3. Klicke "Registrieren"
4. ✅ Prüfe: Email-Bestätigungs-Nachricht erscheint

#### Login testen:
1. Gehe zu `/login`
2. Login mit Demo-Account (siehe oben)
3. ✅ Prüfe: Weiterleitung zu `/dashboard`

### Test 3: Dashboard Übersicht
1. Nach Login: Du bist auf `/dashboard`
2. ✅ Prüfe: "Willkommen, [Name]!" angezeigt
3. ✅ Prüfe: 4 Karten sichtbar:
   - 💰 Finanzen
   - 👥 Mitglieder
   - 📅 Kalender
   - ⭐ Premium
4. ✅ Hover über Karten → Ring-Effect
5. ✅ Klicke jede Karte → Navigation funktioniert

### Test 4: Finanzen-Seite 🎯 **NEU REPARIERT**
1. Navigiere zu `/finances`
2. **Empty State testen:**
   - ✅ Prüfe: "Keine Konten vorhanden" angezeigt
   - ✅ Button: "Erstes Konto erstellen" sichtbar

3. **Konto erstellen:**
   - ✅ Klicke: "+ Neues Konto" (oben rechts)
   - ✅ Modal öffnet sich
   - ✅ Fülle Formular aus:
     - Name: `Klassenkasse`
     - Typ: `Bargeld`
     - Anfangssaldo: `500.00`
   - ✅ Klicke: "Erstellen"
   - ✅ Modal schließt sich
   - ✅ Konto erscheint in Grid

4. **Fehlerbehandlung testen:**
   - ✅ Öffne Modal
   - ✅ Klicke "Erstellen" ohne Eingabe → Browser-Validation
   - ✅ Klicke "Abbrechen" → Modal schließt sich

5. **Gesamtguthaben prüfen:**
   - ✅ Oben: Lila Card zeigt Gesamtsumme aller Konten

### Test 5: Mitglieder-Seite 🎯 **NEU REPARIERT**
1. Navigiere zu `/members`
2. **Empty State testen:**
   - ✅ Prüfe: "Keine Mitglieder vorhanden"
   - ✅ Button: "Erstes Mitglied hinzufügen"

3. **Mitglied hinzufügen:**
   - ✅ Klicke: "+ Neues Mitglied"
   - ✅ Weiterleitung zu `/members/new` (Seite existiert noch nicht)
   - ⚠️ Falls 404: Feature noch nicht implementiert (Normal!)

### Test 6: Events-Seite 🎯 **NEU REPARIERT**
1. Navigiere zu `/events`
2. **Empty State testen:**
   - ✅ Prüfe: "Keine Events vorhanden"
   - ✅ Button: "Erstes Event erstellen"

3. **Event erstellen:**
   - ✅ Klicke: "+ Neues Event" (oben rechts)
   - ✅ Modal öffnet sich
   - ✅ Fülle Formular aus:
     - Titel: `SMV-Sitzung`
     - Beschreibung: `Monatliche Planungssitzung`
     - Startdatum: Wähle Datum/Zeit
     - Ort: `Raum 201`
   - ✅ Klicke: "Erstellen"
   - ✅ Modal schließt sich
   - ✅ Event erscheint in Liste

4. **Modal-Interaktionen:**
   - ✅ Öffne Modal
   - ✅ Klicke "Abbrechen" → Modal schließt sich
   - ✅ Öffne Modal
   - ✅ Klicke außerhalb Modal → Modal bleibt offen
   - ✅ ESC-Taste → (Feature noch nicht implementiert)

### Test 7: Error Boundary 🎯 **NEU IMPLEMENTIERT**
**Simuliere einen Fehler:**

Option A - Browser Console:
```javascript
// Öffne Dev Tools (F12) auf beliebiger Seite
throw new Error('Test Error Boundary')
```

Option B - Manuell Fehler provozieren:
1. Gehe zu `/dashboard`
2. Öffne Dev Tools → Console Tab
3. Führe aus: `localStorage.clear()` (löscht Session)
4. Navigiere zu `/finances`
5. ✅ Prüfe: Falls API-Fehler → Roter Alert erscheint

**Error Boundary UI prüfen:**
- ✅ ⚠️ Icon sichtbar
- ✅ "Etwas ist schiefgelaufen" Titel
- ✅ User-freundlicher Text
- ✅ "Seite neu laden" Button funktioniert
- ✅ "Zum Dashboard" Button funktioniert
- ✅ (Dev-Mode) Technische Details ausklappbar

### Test 8: API-Fehlerbehandlung 🎯 **NEU IMPLEMENTIERT**

#### Fehler-Alerts testen:
1. **Netzwerk simulieren:**
   - Dev Tools öffnen (F12)
   - Network Tab → Throttling: "Offline"
   - Navigiere zu `/finances`
   - ✅ Roter Alert: "Konten konnten nicht geladen werden"
   - ✅ ✕ Button schließt Alert

2. **Auth-Token ungültig:**
   - Console: `localStorage.removeItem('supabase.auth.token')`
   - Refresh Seite
   - ✅ Redirect zu `/login`

### Test 9: Loading-States 🎯 **NEU IMPLEMENTIERT**
1. Gehe zu `/finances`
2. Öffne "+ Neues Konto" Modal
3. Fülle Formular aus
4. **Während API-Call:**
   - ✅ Button zeigt "Erstelle..." (statt "Erstellen")
   - ✅ Button ist disabled (grau)
   - ✅ "Abbrechen" Button auch disabled
5. Nach Success:
   - ✅ Buttons wieder enabled
   - ✅ Modal schließt sich

### Test 10: Responsive Design
```bash
# Chrome Dev Tools (F12) → Device Toolbar (Ctrl+Shift+M)
```

**Teste Breakpoints:**
- ✅ Mobile (375px): 1-spaltig
- ✅ Tablet (768px): 2-spaltig
- ✅ Desktop (1024px+): 3-4-spaltig
- ✅ Navigation: Hamburger-Menü (falls implementiert)

---

## 🔍 API-Endpoints testen (Optional)

### Mit curl:
```bash
# Health Check (falls implementiert)
curl http://localhost:3000/api/health

# Accounts (benötigt Auth-Token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/accounts
```

### Mit Postman/Insomnia:
1. Importiere Collection (falls vorhanden)
2. Teste alle `/api/v1/*` Endpoints

---

## 🐛 Häufige Probleme & Lösungen

### Problem: "Module not found"
```bash
# Lösung:
rm -rf node_modules package-lock.json
npm install
```

### Problem: Prisma-Fehler
```bash
# Lösung:
npm run prisma:generate
npm run prisma:migrate
```

### Problem: Port 3000 belegt
```bash
# Lösung:
npm run dev -- -p 3001  # Anderer Port
```

### Problem: Supabase Auth-Fehler
```bash
# Prüfe .env Datei:
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

### Problem: Tests schlagen fehl
```bash
# Cache leeren:
npm test -- --clearCache
npm test
```

---

## 📊 Test-Coverage anzeigen

```bash
npm run test:unit

# Coverage-Report öffnen:
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html  # Windows
```

---

## 🚀 Production-Build testen

```bash
# Build erstellen
npm run build

# Production-Server starten
npm start
```

➡️ Öffne: http://localhost:3000

**Prüfe:**
- ✅ Keine Console-Errors
- ✅ Alle Seiten laden
- ✅ Optimierte Bundle-Größe

---

## ✅ Test-Checkliste Zusammenfassung

- [ ] `npm test` → 17/17 passing
- [ ] `npm run lint` → 0 errors
- [ ] `npm run type-check` → 0 errors
- [ ] Dev-Server läuft
- [ ] Login funktioniert
- [ ] Dashboard Navigation
- [ ] Finances: Modal + API
- [ ] Events: Modal + API
- [ ] Members: Navigation
- [ ] Error Boundary zeigt UI
- [ ] Error-Alerts erscheinen
- [ ] Loading-States sichtbar
- [ ] Responsive auf Mobile
- [ ] Production-Build erfolgreich

---

## 📞 Support

Bei Problemen:
1. Check [DASHBOARD_REPAIR_REPORT.md](DASHBOARD_REPAIR_REPORT.md)
2. GitHub Issues: https://github.com/tanmaysachinsonar-ctrl/smvboard/issues
3. Logs prüfen: Browser Console + Terminal

**Happy Testing! 🎉**
