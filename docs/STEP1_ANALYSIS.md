# STEP 1: Initiale Codeanalyse — SMVBoard Projekt

## Projektziel

SMVBoard ist eine MVP-Webanwendung für Schülersprecher (SMV = Schülermitverwaltung), die zentrale Verwaltungsaufgaben digitalisiert:

- **Buchhaltung**: Konten, Transaktionen, Kategorien, Rechnungen
- **Mitgliederverwaltung**: Erfassung von SMV-Mitgliedern mit Kontaktdaten
- **Kalender**: Events und Termine mit Teilnehmerverwaltung
- **Subscription-Management**: Integration mit Stripe für Premium-Funktionen
- **Multi-Tenancy**: Organisation-basiertes System mit Benutzerrollen

Technologie-Stack:
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Datenbank**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (geplant)
- **Payments**: Stripe

---

## Zusammenfassung des aktuellen Stands

### ✅ Was implementiert ist:

1. **Datenbankschema (Prisma)**:
   - Vollständiges Schema mit allen Entitäten definiert (Organization, User, Member, Account, Transaction, Category, Invoice, Event, Subscription, AuditLog)
   - Beziehungen zwischen Entitäten korrekt modelliert
   - Enums für Rollen, Transaktionstypen, Kontoarten, Rechnungsstatus, etc.

2. **Infrastruktur**:
   - Next.js Projekt korrekt aufgesetzt
   - Prisma Client initialisiert (`src/lib/prisma.ts`)
   - Supabase Client konfiguriert (`src/lib/supabaseClient.ts`)
   - Design-Tokens für UI-Styling (`src/lib/designTokens.ts`)
   - Tailwind CSS konfiguriert

3. **API Routes**:
   - `/api/transactions` - POST und GET Endpunkte für Transaktionen
   - `/api/webhooks/stripe` - Webhook-Handler für Stripe Events

4. **Frontend**:
   - Dashboard-Startseite mit statischen Beispieldaten (`src/pages/index.tsx`)
   - Grundlegendes Layout mit Header und Cards
   - Dark-Mode Design (SMVBoard-Branding)

5. **Konfiguration**:
   - `.env.example` mit allen notwendigen Umgebungsvariablen
   - README mit Setup-Anleitung

### ❌ Was fehlt:

1. **Authentifizierung**:
   - Keine Login/Signup Seiten
   - Keine Auth-Middleware für geschützte Routes
   - Keine Session-Verwaltung
   - Supabase Auth ist konfiguriert, aber nicht implementiert

2. **Vollständige API-Implementierung**:
   - Fehlende API Routes für: Members, Accounts, Categories, Invoices, Events
   - Keine CRUD-Operationen für die meisten Entitäten
   - Keine Validierung und Error Handling in API Routes

3. **Frontend-Seiten**:
   - Nur Dashboard vorhanden
   - Fehlende Seiten für:
     - Finanzen (Konten, Transaktionen, Kategorien, Berichte)
     - Mitglieder (Liste, Detailansicht, Bearbeitung)
     - Kalender (Events, Terminverwaltung)
     - Rechnungen
     - Einstellungen
     - Profil

4. **Stripe Integration**:
   - Webhook-Handler ist Grundgerüst, aber ohne Logik
   - Keine Checkout-Flow Implementierung
   - Keine Subscription-Verwaltung im Frontend

5. **Datenmigration**:
   - Keine initiale Migration durchgeführt (siehe README Punkt 5)

6. **Tests**:
   - Keine Tests vorhanden

7. **CI/CD**:
   - Keine GitHub Actions oder andere CI/CD Pipelines

---

## Die drei wichtigsten nächsten Schritte

### 1. Authentifizierung implementieren (Aufwand: ~8 Stunden)
   - Login/Signup Seiten mit Supabase Auth erstellen
   - Auth-Middleware für API Routes implementieren
   - Session-Management und Protected Routes
   - User Context für Frontend bereitstellen
   - **Priorität**: HOCH (Blocker für alle anderen Features)

### 2. Finanzen-Modul vervollständigen (Aufwand: ~16 Stunden)
   - API Routes für Accounts, Categories erstellen
   - Transaktionen-API aus Placeholder-Modus befreien
   - Frontend-Seiten: Kontenübersicht, Transaktionsliste mit Filter/Suche
   - Formular für neue Transaktionen
   - Einfache Reports (Einnahmen/Ausgaben, Kategorien)
   - **Priorität**: HOCH (Kern-Feature)

### 3. Mitglieder- und Event-Module implementieren (Aufwand: ~12 Stunden)
   - API Routes für Members und Events (CRUD)
   - Frontend: Mitgliederliste, Mitglieder hinzufügen/bearbeiten
   - Frontend: Kalenderansicht (z.B. mit react-big-calendar)
   - Event-Detail mit Teilnehmerverwaltung
   - **Priorität**: MITTEL (wichtig, aber nach Finanzen)

---

## Stellen im Code mit Platzhaltern oder TODO-Kommentaren

### `/src/pages/api/transactions.ts`:
- **Zeile 19**: `orgId: "org_placeholder"` - Hardcoded Placeholder für Organization ID, muss durch echte Auth-Info ersetzt werden
- **Zeile 27**: `createdById: createdById || "user_placeholder"` - Fallback auf Placeholder User ID
- **Zeile 49**: `where: { orgId: "org_placeholder" }` - Hardcoded Placeholder bei GET-Request
- **Zeile 6-7**: Kommentar weist darauf hin, dass Auth-Middleware fehlt

### `/src/pages/api/webhooks/stripe.ts`:
- **Zeile 22**: `// TODO: mark subscription active / create customer link in DB` - Stripe Checkout Session Handling nicht implementiert

### `/.env.example`:
- **Zeile 6-7**: Placeholder-Werte für Stripe Keys (`sk_test_xxx`, `whsec_xxx`) müssen ersetzt werden

### Fehlende Dateien/Routes:
- Keine API Routes für: `/api/accounts`, `/api/members`, `/api/categories`, `/api/invoices`, `/api/events`
- Keine Frontend-Pages für Unterseiten (nur `index.tsx` vorhanden)

---

## Übersicht notwendiger Umgebungsvariablen und Secrets

### Supabase (erforderlich):
1. **`DATABASE_URL`**: PostgreSQL Connection String  
   - Quelle: Supabase Dashboard → Settings → Database → Connection string (Transaction Mode)
   - Beispiel: `postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres`

2. **`NEXT_PUBLIC_SUPABASE_URL`**: Public Supabase Project URL  
   - Quelle: Supabase Dashboard → Settings → API → Project URL
   - Beispiel: `https://[PROJECT].supabase.co`

3. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Public Anon Key (client-side safe)  
   - Quelle: Supabase Dashboard → Settings → API → anon/public key

4. **`SUPABASE_SERVICE_ROLE_KEY`**: Service Role Key (server-side only, GEHEIM!)  
   - Quelle: Supabase Dashboard → Settings → API → service_role key
   - ⚠️ **NIEMALS im Frontend verwenden oder committen!**

### Stripe (erforderlich für Payments):
5. **`STRIPE_SECRET_KEY`**: Stripe Secret Key (Test oder Live)  
   - Quelle: Stripe Dashboard → Developers → API keys → Secret key
   - Test-Modus: `sk_test_...`
   - Live-Modus: `sk_live_...`
   - ⚠️ **GEHEIM, server-side only!**

6. **`STRIPE_WEBHOOK_SECRET`**: Webhook Signing Secret  
   - Quelle: Stripe Dashboard → Developers → Webhooks → Add endpoint → Signing secret
   - Format: `whsec_...`
   - Notwendig für: `/api/webhooks/stripe` Signatur-Verifizierung

### Allgemein:
7. **`NEXTAUTH_URL`**: Base URL der Anwendung  
   - Lokal: `http://localhost:3000`
   - Produktion: `https://yourdomain.com`

8. **`NEXT_PUBLIC_APP_NAME`**: App-Name für Branding  
   - Standard: `"SMVBoard"`
   - Optional, kann angepasst werden

### Hinweise zur Bereitstellung:
- **Lokale Entwicklung**: `.env` Datei im Root-Verzeichnis erstellen (aus `.env.example` kopieren)
- **Produktion (Vercel)**: Environment Variables in Vercel Dashboard → Project → Settings → Environment Variables eintragen
- **Supabase Setup**: Maintainer muss Supabase-Projekt anlegen und Prisma Migrations ausführen (`npx prisma migrate dev`)
- **Stripe Setup**: Maintainer muss Stripe-Account einrichten, Test Products/Prices anlegen, Webhook-Endpoint konfigurieren

---

## ⚠️ WICHTIGER HINWEIS

**Diese Analyse (STEP 1) dient nur zur Bestandsaufnahme und Planung.**

**Nicht mergen ohne explizite Maintainer-Freigabe!**

Die Implementierung der identifizierten nächsten Schritte sollte in separaten Pull Requests erfolgen, nachdem der Maintainer:
1. Diese Analyse geprüft und freigegeben hat
2. Die notwendigen Secrets (Supabase, Stripe) bereitgestellt hat
3. Die Prioritäten und Reihenfolge bestätigt hat

---

**Erstellt**: 2026-02-03  
**Status**: ✅ Initiale Analyse abgeschlossen
