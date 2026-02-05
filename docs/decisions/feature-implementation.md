# Technical Decision Record: Feature Implementation Plan

**Datum**: 2026-02-05  
**Status**: ✅ Accepted  
**Erstellt von**: GitHub Copilot AI Agent

---

## Kontext

Das SMVBoard-Projekt ist eine vollständige Verwaltungssoftware für Schülermitverwaltungen (SMV) mit Next.js, TypeScript, Prisma, PostgreSQL und Supabase Auth. Die bestehenden Features (Auth, Dashboard, Event-Liste) funktionieren bereits. Ziel ist die Implementierung von fünf zusätzlichen Feature-Gruppen mit vollständiger Test-Coverage, Dokumentation und PR-basiertem Workflow.

---

## Entscheidungen

### 1. Technologie-Stack (Status Quo)

#### Frontend
- **Framework**: Next.js 14 mit React 18
- **Sprache**: TypeScript (strict mode)
- **Styling**: Tailwind CSS mit Custom Design Tokens
- **State Management**: @tanstack/react-query für Server State
- **Forms**: Native React State + Zod Validation

#### Backend
- **API**: Next.js API Routes (`/pages/api/v1/*`)
- **ORM**: Prisma 5.0.0
- **Datenbank**: PostgreSQL (hosted on Supabase)
- **Auth**: Supabase Auth (JWT Bearer Tokens)
- **Payment**: Stripe (bereits integriert in `/api/webhooks/stripe.ts`)

#### Testing
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright
- **Coverage Target**: >80% für neue Features

#### CI/CD
- **Linting**: ESLint + Prettier (mit lint-staged)
- **Type-Check**: TypeScript Compiler
- **Husky**: Pre-commit hooks für Validierung

---

### 2. Architektur-Entscheidungen

#### 2.1 Multi-Tenancy
- Jede Anfrage ist **Organization-scoped** (via `orgId`)
- Middleware `withAuth` prüft JWT + User-Zugehörigkeit zur Org
- Prisma Queries nutzen `where: { orgId }` Filter

#### 2.2 Auth-Flow
```
User Login → Supabase Auth → JWT Token
  ↓
API Request mit Bearer Token
  ↓
withAuth Middleware → Session validieren → User aus DB laden
  ↓
orgId + userId in req.user verfügbar
```

#### 2.3 API-Struktur
- **REST-Pattern**: `/api/v1/<resource>` (events, transactions, members, etc.)
- **Methoden**: GET (list/detail), POST (create), PUT (update), DELETE
- **Response-Format**: JSON mit `{ data, error }` oder direkt Array/Object

#### 2.4 Datenbank-Schema
Alle Tabellen sind bereits vorhanden:
- ✅ **Event** (id, title, start, end, allDay, description, location, recurrence)
- ✅ **Transaction** (id, amount, currency, date, type, categoryId, description)
- ✅ **Category** (id, name, kind: INCOME/EXPENSE)
- ✅ **Member** (id, name, position, email, phone, photoUrl, notes)
- ✅ **Subscription** (id, stripeSubscriptionId, planId, status, currentPeriodEnd)

**Neue Tabellen/Felder** (falls benötigt):
- Invite-Token-System: Neue Tabelle `Invitation` (id, orgId, email, role, token, expiresAt, status)

---

### 3. Feature-Implementierung (Reihenfolge & Branches)

#### **A. Kalender MonthView** (`feature/calendar-month-view`)

**Neue Komponenten:**
```
src/components/calendar/
├── MonthView.tsx          # Kalender-Grid mit Event-Darstellung
├── CalendarToolbar.tsx    # Toggle (List/Month), Filter
├── EventModal.tsx         # Create/Edit Modal (Reuse oder neu)
└── EventCard.tsx          # Event-Darstellung in Zellen
```

**API-Änderungen:**
- Bestehende API `/api/v1/events` bereits funktional (GET mit `?start=&end=`)
- Neue Endpunkte:
  - `PUT /api/v1/events/:id` (Update)
  - `DELETE /api/v1/events/:id` (Delete)

**Tests:**
- Unit: `MonthView.test.tsx`, `CalendarToolbar.test.tsx`
- Integration: `events.test.ts` (API-Tests für PUT/DELETE)
- E2E: `e2e/calendar.spec.ts` (Create → Edit → Delete Flow)

**Mobile Fallback:**
- `<768px`: Automatisch ListView anzeigen
- Toggle-Button ausblenden auf Mobile

---

#### **B. Finanzen MVP** (`feature/finance-transactions`)

**Neue Seiten/Komponenten:**
```
src/pages/finances/index.tsx         # Main Finance Page
src/components/finances/
├── TransactionsTable.tsx            # Liste mit Filter/Sort
├── TransactionForm.tsx              # Create/Edit Modal
├── FinanceSummary.tsx               # Einnahmen/Ausgaben Chart
└── CSVExportButton.tsx              # Export-Funktion
```

**API-Änderungen:**
- Bestehende API `/api/v1/transactions` bereits funktional
- Neue Endpunkte:
  - `GET /api/v1/transactions/export` - CSV-Export mit Query-Params
  - `GET /api/v1/transactions/summary?from=&to=` - Aggregierte Daten

**Datenbank:**
- Tabellen bereits vorhanden (Transaction, Category, Account)
- Keine Migration notwendig

**Tests:**
- Unit: `TransactionsTable.test.tsx`, `FinanceSummary.test.tsx`
- Integration: `transactions.test.ts` (CSV-Export validieren)
- E2E: `e2e/finances.spec.ts` (Create Transaction → Verify Summary)

---

#### **C. Mitglieder Einladungen** (`feature/member-invitations`)

**Neue Tabelle:**
```prisma
model Invitation {
  id        String   @id @default(cuid())
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id])
  email     String
  role      Role     @default(MEMBER)
  token     String   @unique
  expiresAt DateTime
  status    InviteStatus @default(PENDING)
  createdAt DateTime @default(now())
}

enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
}
```

**Neue API-Endpunkte:**
```
POST /api/v1/members/invite      # Create invite token
GET  /api/v1/invitations/:token  # Validate token
POST /api/v1/invitations/:token/accept # Accept invite
DELETE /api/v1/invitations/:id   # Revoke invite
```

**Email-Service:**
- **Dev-Mode**: Invite-Link wird in Console geloggt (keine echten Mails)
- **Prod-Mode**: Optional via SendGrid/SMTP (ENV: `SMTP_HOST`, `SMTP_USER`, etc.)

**Neue Komponenten:**
```
src/pages/members/index.tsx          # Erweitern um Invite-Button
src/components/members/
├── InviteModal.tsx                  # Email + Role auswählen
├── MembersList.tsx                  # Active + Pending Members
└── RoleSelector.tsx                 # Dropdown für OWNER/MEMBER/VIEWER
```

**Tests:**
- Integration: `invitations.test.ts` (Create → Accept → Verify User)
- E2E: `e2e/members.spec.ts` (Invite Flow + Role Change)

---

#### **D. Premium/Upgrade (Stripe)** (`feature/stripe-billing`)

**Status Quo:**
- ✅ Stripe bereits integriert (`stripe` Package installiert)
- ✅ Webhook-Endpoint `/api/webhooks/stripe.ts` funktional
- ✅ Subscription-Tabelle vorhanden

**Neue API-Endpunkte:**
```
POST /api/v1/billing/create-checkout-session  # Start Stripe Checkout
GET  /api/v1/billing/subscription-status      # Current Subscription
POST /api/v1/billing/create-portal-session    # Billing Portal Link
```

**Neue Komponenten:**
```
src/pages/billing/index.tsx          # Billing Dashboard
src/components/billing/
├── BillingCard.tsx                  # Subscription Status Widget
├── UpgradeButton.tsx                # CTA für Checkout
└── PlanComparison.tsx               # Free vs. Premium Table
```

**Stripe Test-Daten:**
- Test Card: `4242 4242 4242 4242` (Exp: any future, CVC: any 3 digits)
- Webhook Events: Lokal mit Stripe CLI testen

**Tests:**
- Integration: `billing.test.ts` (Mock Stripe API)
- E2E: `e2e/billing.spec.ts` (Start Checkout → Simulate Success)

---

#### **E. Profile & Settings** (`feature/user-profile`)

**Neue Seite:**
```
src/pages/profile/index.tsx
src/components/profile/
├── ProfileForm.tsx          # Name, Email, Avatar
├── PasswordChangeForm.tsx   # Current + New Password
└── BillingSection.tsx       # Reuse BillingCard from billing/
```

**API-Änderungen:**
- Bestehende API `/api/v1/me` für GET
- Neue Endpunkte:
  - `PUT /api/v1/me` - Update Profile
  - `PUT /api/v1/me/password` - Change Password
  - `POST /api/v1/me/avatar` - Upload Avatar (optional)

**Avatar-Upload:**
- Speicher in Supabase Storage oder S3 (optional für MVP)
- Falls nicht implementiert: Gravatar-Fallback

**Tests:**
- Integration: `profile.test.ts` (Update validieren)
- E2E: `e2e/profile.spec.ts` (Change Name → Verify Dashboard)

---

#### **F. Tests & CI** (`chore/ci-improvements`)

**Erweiterungen:**
- GitHub Actions Workflow für:
  - Lint + Typecheck
  - Unit Tests (mit Coverage Report)
  - E2E Tests (gegen Test-DB)
- PR-Template mit Checkliste:
  - [ ] Tests passed
  - [ ] Screenshots attached
  - [ ] Migrations documented
  - [ ] README updated

**Dateien:**
```
.github/workflows/ci.yml
.github/pull_request_template.md
```

---

### 4. Branch & PR-Strategie

#### Branch-Naming
```
feature/<short-name>      # z.B. feature/calendar-month-view
fix/<issue-number>        # z.B. fix/auth-redirect-loop
chore/<description>       # z.B. chore/update-dependencies
```

#### PR-Titel-Format
```
[feat] Implement Calendar MonthView with event CRUD
[fix] Resolve authentication redirect loop
[chore] Add CI workflow for automated testing
[docs] Update README with deployment guide
```

#### PR-Beschreibung (Template)
```markdown
## 🎯 Ziel
Kurze Beschreibung (1-2 Sätze).

## 📝 Änderungen
- Neue Komponente X
- API-Endpunkt Y
- Migration Z

## 🧪 Tests
- [ ] Unit Tests (`npm run test`)
- [ ] E2E Tests (`npm run test:e2e`)
- [ ] Manuelle Tests durchgeführt

## 📸 Screenshots
[Screenshot hier einfügen]

## 🚀 Deployment-Hinweise
- Migration ausführen: `npx prisma migrate deploy`
- Neue ENV-Variablen setzen: `XYZ`

## 🔐 Security
Keine sensiblen Daten committed.
```

#### PR-Größe
- **Max. 500-800 LOC** (Lines of Code) pro PR
- Große Features in mehrere PRs aufteilen (z.B. Backend → Frontend)

---

### 5. Testing-Strategie

#### Unit Tests (Jest + RTL)
- **Alle neuen Komponenten**: `*.test.tsx` neben der Komponente
- **Alle neuen Utility-Funktionen**: `*.test.ts` in `src/lib/`
- **Coverage-Target**: >80% für neue Dateien

#### Integration Tests
- **API-Endpunkte**: Testen mit Mock-DB oder Test-DB
- **Middleware**: Auth-Flow validieren
- **Prisma Queries**: Mit In-Memory SQLite für Speed

#### E2E Tests (Playwright)
- **Kritische Flows**:
  - Login → Dashboard
  - Create Event → Edit → Delete
  - Create Transaction → Verify Summary
  - Invite Member → Accept
  - Start Checkout → Verify Subscription
- **Browser**: Chromium, Firefox (optional)
- **Parallelisierung**: Ja, mit isolierten Test-Accounts

---

### 6. Accessibility (a11y)

#### Anforderungen
- **Semantic HTML**: `<button>`, `<nav>`, `<main>`, `<header>`, etc.
- **ARIA Labels**: Für Icon-Buttons und komplexe Widgets
- **Keyboard Navigation**: Tab, Enter, Escape funktionieren
- **Color Contrast**: WCAG AA-Standard (4.5:1)
- **Focus Indicators**: Sichtbare Outlines

#### Tools
- `eslint-plugin-jsx-a11y` (bereits in Next.js integriert)
- Manuelles Testing mit Keyboard

---

### 7. Internationalisierung (i18n)

#### Strategie
- **MVP**: Alle Strings auf Deutsch (hardcoded)
- **Zukünftig**: `next-i18next` oder `react-intl` für Multi-Language

#### String-Verwaltung
- Erstelle `src/lib/translations.ts` für zentrale Strings (optional)
```typescript
export const STRINGS = {
  calendar: {
    title: 'Kalender',
    createEvent: 'Neues Event erstellen',
    // ...
  },
};
```

---

### 8. Environment Variables

#### Erforderliche ENV-Variablen

```env
# Datenbank
DATABASE_URL="postgresql://user:password@host:5432/database"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJxxx..."
SUPABASE_SERVICE_ROLE_KEY="eyJxxx..."  # Für Admin-Tasks

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_xxx"                  # Test Mode!
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
STRIPE_PRICE_ID="price_xxx"                      # Premium Plan Price ID

# SMTP (Optional für Member Invites)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxx"
SMTP_FROM="noreply@smvboard.de"

# App Config
NEXT_PUBLIC_APP_NAME="SMVBoard"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

### 9. Migrations

#### Neue Migration für Invitations

**Datei**: `prisma/migrations/20260205_add_invitations/migration.sql`

```sql
-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_orgId_fkey" 
  FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

**Rollback**: `prisma/migrations/20260205_add_invitations/rollback.sql`

```sql
DROP TABLE "Invitation";
DROP TYPE "InviteStatus";
```

---

### 10. Deployment-Strategie

#### Environments
- **Development**: Lokale DB + Stripe Test Mode
- **Staging**: Supabase Test Project + Stripe Test Mode
- **Production**: Supabase Prod Project + Stripe Live Mode

#### CI/CD Pipeline (GitHub Actions)
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npx prisma generate
      - run: npm run test:e2e
```

#### Deployment Steps (siehe `docs/deployment.md`)
1. Merge PR in `main`
2. Run Migrations: `npx prisma migrate deploy`
3. Build: `npm run build`
4. Deploy zu Vercel/Netlify/Railway
5. Verify Health Check

---

## Offene Fragen (an Maintainer)

1. **Backend-Stack**: ✅ Bestätigt (Next.js API Routes)
2. **Datenbank**: ✅ Bestätigt (PostgreSQL via Supabase)
3. **Stripe**: ✅ Bestätigt (bereits integriert)
4. **Design-Guidelines**: ❓ Figma vorhanden? Oder Tailwind-Standard?
5. **Email-Service**: ❓ SMTP-Config vorhanden oder Dev-Mode mit Console-Logs?
6. **Branch-Naming**: ✅ Bestätigt (`feature/<name>`)

---

## Nächste Schritte

1. ✅ TDR erstellen (dieses Dokument)
2. ⏳ Branch `feature/calendar-month-view` erstellen
3. ⏳ Implementierung starten mit:
   - MonthView-Komponente
   - CalendarToolbar
   - PUT/DELETE API für Events
   - Tests
4. ⏳ PR öffnen mit Screenshots

---

## Änderungshistorie

| Datum      | Änderung                        | Autor          |
|------------|---------------------------------|----------------|
| 2026-02-05 | Initial Draft                   | GitHub Copilot |

