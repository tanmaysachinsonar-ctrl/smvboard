# STEP1_ANALYSIS.md — Initiale Code-Analyse

## 1. Projektzusammenfassung

**Ziel:**  
SMVBoard ist ein MVP-Scaffold für Schülersprecher (SMV = Schülermitverantwortung), der eine zentrale Plattform für folgende Bereiche bietet:
- Buchhaltung und Finanzverwaltung (Konten, Transaktionen, Rechnungen)
- Mitgliederverwaltung
- Kalender und Event-Management
- Subscription-Verwaltung über Stripe

Das System soll Schulorganisationen helfen, ihre administrativen Aufgaben digital und strukturiert zu verwalten.

**Tech-Stack:**
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Datenbank:** PostgreSQL via Prisma ORM
- **Authentication & Storage:** Supabase
- **Payments:** Stripe
- **Deployment:** Vercel (empfohlen)

**Hauptkomponenten:**
- Prisma Schema mit vollständigem Datenmodell (Organizations, Users, Members, Accounts, Transactions, Invoices, Events, Subscriptions, etc.)
- API-Routen für Transaktionen und Stripe Webhooks
- Dashboard-Seite mit Übersicht über Finanzen und letzte Transaktionen
- Design Tokens für konsistentes UI-Design

---

## 2. Aktueller Umsetzungsstand

### ✅ Implementiert:

**Datenmodell (Prisma Schema):**
- ✅ Organization-Model mit allen Beziehungen
- ✅ User-Model mit Rollen (OWNER, MEMBER, VIEWER)
- ✅ Member-Model für Mitgliederverwaltung
- ✅ Account-Model für verschiedene Kontoarten (CASH, BANK, GRANT, OTHER)
- ✅ Transaction-Model mit Kategorien und Belegen
- ✅ Category-Model für Einnahmen/Ausgaben
- ✅ Invoice-Model mit Status-Tracking (DRAFT, ISSUED, PAID, CANCELLED)
- ✅ Event-Model mit Teilnehmern
- ✅ Subscription-Model für Stripe-Integration
- ✅ AuditLog-Model für Audit-Trail

**API-Routen:**
- ✅ `/api/transactions` — GET/POST für Transaktionen
- ✅ `/api/webhooks/stripe` — Webhook-Handler für Stripe Events

**Frontend:**
- ✅ Dashboard-Seite (`/`) mit Übersicht
- ✅ Design Tokens (Farben, Spacing, Radius)
- ✅ Tailwind CSS Konfiguration
- ✅ App-Struktur mit Next.js

**Infrastruktur:**
- ✅ Prisma Client Setup
- ✅ Supabase Client Setup
- ✅ Environment Variables Template (.env.example)
- ✅ Package.json mit allen Dependencies
- ✅ TypeScript Konfiguration

### ❌ Fehlend/Unvollständig:

**Authentication:**
- ❌ Keine User-Authentication implementiert
- ❌ Keine Auth-Middleware für API-Routen
- ❌ Keine Session-Management
- ❌ Keine Login/Signup Seiten

**Frontend-Seiten:**
- ❌ Keine detaillierten Finanz-Seiten (Konten, Transaktionen, Kategorien)
- ❌ Keine Mitglieder-Verwaltungsseiten
- ❌ Keine Kalender/Event-Seiten
- ❌ Keine Rechnungs-Verwaltungsseiten
- ❌ Keine Einstellungs-Seiten
- ❌ Keine Subscription/Upgrade-Seiten

**API-Routen:**
- ❌ Fehlende CRUD-Routen für Accounts, Members, Events, Invoices, Categories
- ❌ Keine Upload-Funktionalität für Belege/Dokumente
- ❌ Keine Dashboard-Statistik-Endpoints
- ❌ Keine Stripe-Checkout-Integration

**Business Logic:**
- ❌ Stripe Webhook-Handler hat nur Logging, keine DB-Updates
- ❌ Keine automatische Balance-Berechnung
- ❌ Keine Rechte-Verwaltung basierend auf User-Rollen
- ❌ Keine Validierung von Transaktionen

**DevOps:**
- ❌ Keine CI/CD Pipeline
- ❌ Keine Tests
- ❌ Keine Deployment-Konfiguration für Vercel
- ❌ Keine Migrations-Strategie für Production

---

## 3. Priorisierte To-Do-Liste (Nächste 3 Aufgaben)

### 🔴 Aufgabe 1: Authentication & Authorization System (GROSS)
**Aufwand:** GROSS (~3-5 Tage)  
**Beschreibung:**
- Supabase Auth Integration (Login, Signup, Session-Management)
- Auth-Middleware für API-Routen erstellen
- User-Context Provider für Frontend
- Login/Signup/Logout Seiten erstellen
- Rolle-basierte Zugriffskontrollen implementieren
- Protected Routes Setup

**Grund der Priorisierung:** Ohne Auth ist das System nicht produktiv nutzbar. Alle weiteren Features benötigen Nutzer-Kontext.

---

### 🟡 Aufgabe 2: Finanzverwaltung — Core Features (MITTEL)
**Aufwand:** MITTEL (~2-3 Tage)  
**Beschreibung:**
- CRUD API-Routen für Accounts erstellen
- CRUD API-Routen für Categories erstellen  
- Transaktions-Liste Seite mit Filter/Suche
- Konten-Übersicht Seite
- Formular für neue Transaktionen
- Balance-Berechnung automatisieren
- Beleg-Upload mit Supabase Storage

**Grund der Priorisierung:** Finanzverwaltung ist das Kern-Feature der Anwendung.

---

### 🟢 Aufgabe 3: Stripe Subscription Integration vervollständigen (KLEIN)
**Aufwand:** KLEIN (~1 Tag)  
**Beschreibung:**
- Stripe Checkout Session API-Route erstellen
- Webhook-Handler vervollständigen (DB-Updates für subscriptions)
- Upgrade-Button auf Dashboard funktional machen
- Subscription Status auf Dashboard anzeigen
- Plan-Auswahl Seite erstellen

**Grund der Priorisierung:** Monetarisierung ist wichtig für Nachhaltigkeit des Projekts. Relativ schnell umsetzbar mit vorhandenem Stripe-Setup.

---

## 4. Code-Stellen mit Platzhaltern/TODOs

### 📍 src/pages/api/transactions.ts

**Zeile 19:**
```typescript
orgId: "org_placeholder", // replace with actual orgId from auth
```
**Beschreibung:** Hardcoded Placeholder für Organization ID. Muss durch echte orgId aus Auth-Session ersetzt werden.

**Zeile 27:**
```typescript
createdById: createdById || "user_placeholder"
```
**Beschreibung:** Fallback auf Placeholder-User ID. Muss durch echte userId aus Auth-Session ersetzt werden.

**Zeile 49:**
```typescript
where: { orgId: "org_placeholder" },
```
**Beschreibung:** Hardcoded Placeholder für Organization ID im GET-Request. Muss durch echte orgId aus Auth-Session ersetzt werden.

---

### 📍 src/pages/api/webhooks/stripe.ts

**Zeile 22:**
```typescript
// TODO: mark subscription active / create customer link in DB
console.log('Checkout session completed', event.data.object);
```
**Beschreibung:** Stripe Webhook für `checkout.session.completed` ist nicht implementiert. Es fehlt die Logik zum Erstellen/Aktualisieren von Subscription-Records in der Datenbank.

---

### 📍 src/pages/api/transactions.ts (Allgemein)

**Kommentar in Zeilen 5-7:**
```typescript
/**
 * Example API route to create/get transactions.
 * NOTE: This route assumes an auth middleware that provides user & orgId.
 * For initial scaffold it's unauthenticated — plug Supabase auth server-side checks.
 */
```
**Beschreibung:** Die gesamte Route ist aktuell ohne Authentifizierung. Es fehlt eine Auth-Middleware.

---

## 5. Secrets/Settings für Maintainer

Folgende Environment Variables müssen vom Maintainer gesetzt werden:

### 🔑 Supabase (Erforderlich)

**DATABASE_URL**
- PostgreSQL Connection String von Supabase
- Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
- Bezugsquelle: Supabase Dashboard → Settings → Database → Connection String

**NEXT_PUBLIC_SUPABASE_URL**
- Public Supabase Project URL
- Format: `https://[project-id].supabase.co`
- Bezugsquelle: Supabase Dashboard → Settings → API → Project URL

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Public Anon/Public Key (Client-side safe)
- Bezugsquelle: Supabase Dashboard → Settings → API → Project API keys → anon/public

**SUPABASE_SERVICE_ROLE_KEY**
- Service Role Key für server-side Operations (GEHEIM!)
- Bezugsquelle: Supabase Dashboard → Settings → API → Project API keys → service_role
- ⚠️ ACHTUNG: Niemals im Client-Code verwenden!

---

### 💳 Stripe (Erforderlich für Subscriptions)

**STRIPE_SECRET_KEY**
- Stripe Secret Key (Test oder Live)
- Format: `sk_test_...` (Test) oder `sk_live_...` (Production)
- Bezugsquelle: Stripe Dashboard → Developers → API keys → Secret key

**STRIPE_WEBHOOK_SECRET**
- Webhook Signing Secret für Event-Verifizierung
- Format: `whsec_...`
- Bezugsquelle: Stripe Dashboard → Developers → Webhooks → Endpoint → Signing secret
- ⚠️ WICHTIG: Webhook-Endpoint muss auf `/api/webhooks/stripe` konfiguriert sein

---

### 🔧 Next.js (Optional)

**NEXTAUTH_URL**
- Base URL der Anwendung
- Lokal: `http://localhost:3000`
- Production: `https://your-domain.com`

**NEXT_PUBLIC_APP_NAME**
- Anwendungsname für Branding
- Default: `SMVBoard`

---

### 📋 Setup-Schritte für Maintainer:

1. **Supabase Projekt erstellen:**
   - Account auf https://supabase.com erstellen
   - Neues Projekt anlegen
   - DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY und SERVICE_ROLE_KEY kopieren

2. **Prisma Migrations ausführen:**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Stripe Account konfigurieren:**
   - Account auf https://stripe.com erstellen
   - API Keys (Test-Mode) kopieren
   - Webhook-Endpoint in Stripe Dashboard registrieren
   - Test-Produkte und Preise erstellen

4. **Vercel Deployment (Optional):**
   - GitHub Repository mit Vercel verbinden
   - Alle Environment Variables in Vercel Settings eintragen
   - Auto-Deploy von main Branch aktivieren

5. **Supabase Storage konfigurieren:**
   - Bucket für `receipts` erstellen (für Belege)
   - Bucket für `invoices` erstellen (für Rechnungen)
   - Public Access Policies konfigurieren

---

## ⚠️ WICHTIGER HINWEIS

**NICHT MERGEN OHNE ZUSTIMMUNG DES MAINTAINERS!**

Diese Analyse-Datei dient als Grundlage für die weitere Entwicklung. Bevor weitere Änderungen vorgenommen oder Branches gemerged werden, sollte der Maintainer:

1. Diese Analyse überprüfen und bestätigen
2. Priorisierung der To-Do-Liste absegnen
3. Entscheiden, welche Features als nächstes implementiert werden sollen
4. Environment Variables korrekt konfigurieren
5. Deployment-Strategie festlegen

**Kontakt:** Bei Fragen oder Unklarheiten bitte den Maintainer kontaktieren bevor mit der Implementierung begonnen wird.

---

## 📝 Nächste Schritte

Nach Zustimmung des Maintainers:
1. Branch für Aufgabe 1 (Authentication) erstellen
2. Feature-Spezifikation für Auth-System schreiben
3. Implementation gemäß To-Do-Liste starten
4. Nach jedem Feature: Code Review, Testing, PR erstellen

---

*Erstellt am: 2026-02-03*  
*Branch: copilot/add-initial-code-analysis*  
*Status: Wartend auf Review durch Maintainer*
