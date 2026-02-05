# SMVBoard — Vollständige Verwaltungssoftware für Schülermitverwaltungen

SMVBoard ist eine umfassende Web-Plattform zur Verwaltung von Schülermitverwaltungen (SMV). Die Anwendung bietet Funktionen für Finanzverwaltung, Mitgliederverwaltung, Event-Planung und Subscription-Management.

## 🚀 Features

### Kernfunktionen
- ✅ **Authentifizierung & Multi-Tenancy**: Vollständige Supabase Auth-Integration mit Organisationen
- ✅ **Kalender mit MonthView**: Toggle zwischen Listen- und Monatsansicht, Event CRUD, Mobile-optimiert
- ✅ **Finanzverwaltung**: Konten, Transaktionen, Kategorien, Budgets
- ✅ **Mitgliederverwaltung**: Mitgliederprofile mit Positionen und Kontaktdaten
- ✅ **Event-Management**: Kalender mit Events und Teilnehmerverwaltung
- ✅ **Stripe Integration**: Subscription-Verwaltung mit Webhooks
- ✅ **Audit Logging**: Vollständige Nachverfolgbarkeit aller Aktionen
- ✅ **Responsive Design**: Tailwind CSS mit Custom Design Tokens

### Neu: Kalender MonthView (Feature A)
- 📅 **Monatsansicht**: Vollständiger Kalender-Grid mit Events
- 🔄 **View Toggle**: Wechsel zwischen Listen- und Monatsansicht
- 📱 **Mobile-First**: Automatische ListView auf Bildschirmen < 768px
- ✏️ **Event CRUD**: Erstellen, Bearbeiten, Löschen direkt im Kalender
- 🎨 **Custom Colors**: Event-Farben für bessere Kategorisierung
- ⌨️ **Keyboard Navigation**: Volle Tastaturunterstützung für Accessibility
- 🧪 **Test Coverage**: Unit-Tests für alle Komponenten

### Technologie-Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Datenbank**: PostgreSQL (via Supabase)
- **Authentifizierung**: Supabase Auth
- **Zahlungen**: Stripe
- **Testing**: Jest, Playwright
- **CI/CD**: GitHub Actions

## 📋 Voraussetzungen

- Node.js 18+ 
- PostgreSQL-Datenbank (empfohlen: Supabase)
- Stripe-Account (für Zahlungen)
- Git

## 🛠️ Installation & Setup

### 1. Repository klonen

```bash
git clone https://github.com/tanmaysachinsonar-ctrl/smvboard.git
cd smvboard
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

Kopiere `.env.example` zu `.env` und fülle die Werte aus:

```bash
cp .env.example .env
```

Erforderliche Variablen:

```env
# Datenbank
DATABASE_URL="postgresql://user:password@host:5432/database"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJxxx..."
SUPABASE_SERVICE_ROLE_KEY="eyJxxx..."

# Stripe
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# App
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="SMVBoard"
```

### 4. Datenbank einrichten

#### Mit Supabase (empfohlen):

1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Kopiere die DATABASE_URL aus Settings → Database
3. Kopiere SUPABASE_URL und ANON_KEY aus Settings → API

#### Migration ausführen:

```bash
npx prisma migrate dev --name init
```

### 5. Demo-Daten einfügen (optional)

```bash
npx tsx prisma/seed.ts
```

Dies erstellt:
- Eine Demo-Organisation "Demo Schule SMV"
- 3 Benutzer (Owner, Member, Viewer)
- 4 SMV-Mitglieder
- 3 Konten (Kasse, Bank, Fördergelder)
- 9 Kategorien
- 5 Beispiel-Transaktionen
- 3 Events

**Demo-Login:**
- E-Mail: `owner@demo-schule.de`
- Passwort: `password123`

### 6. Development Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## 🏗️ Projektstruktur

```
smvboard/
├── .github/workflows/        # GitHub Actions CI/CD
├── e2e/                      # Playwright E2E Tests
├── prisma/                   # Datenbank Schema & Migrationen
├── src/
│   ├── components/           # React Komponenten
│   ├── contexts/             # React Contexts
│   ├── lib/                  # Utilities & Helpers
│   ├── pages/                # Next.js Pages & API Routes
│   └── styles/               # Global Styles
└── ...config files
```

## 🔐 Stripe Setup

### 1. Stripe Account erstellen

Registriere dich auf [stripe.com](https://stripe.com) und wechsle in den Test-Modus.

### 2. API Keys kopieren

1. Dashboard → Developers → API keys
2. Kopiere "Secret key" in `.env` als `STRIPE_SECRET_KEY`

### 3. Webhook einrichten

Für lokale Entwicklung:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Für Produktion:

1. Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-domain.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `invoice.payment_succeeded`, etc.
4. Kopiere "Signing secret" als `STRIPE_WEBHOOK_SECRET`

## 🧪 Testing

```bash
# Unit Tests
npm test

# E2E Tests
npm run test:e2e

# Linting
npm run lint

# Formatting
npm run format
```

## 🚢 Deployment

### Vercel (empfohlen)

1. Pushe den Code auf GitHub
2. Verbinde Repository mit [Vercel](https://vercel.com)
3. Setze Umgebungsvariablen in Vercel Dashboard
4. Deploy!

### Datenbank-Migration in Production:

```bash
npx prisma migrate deploy
```

## 📚 API Dokumentation

### Authentifizierung

Alle geschützten Routen benötigen einen Bearer Token:

```
Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN
```

### Endpoints

- **Auth**: `/api/auth/signin`, `/api/auth/signup`, `/api/auth/signout`
- **Accounts**: `/api/v1/accounts`
- **Transactions**: `/api/v1/transactions`
- **Members**: `/api/v1/members`
- **Events**: `/api/v1/events`
- **Stripe**: `/api/stripe/create-checkout-session`, `/api/stripe/create-portal-session`

## 🔒 Sicherheit

- ✅ Supabase Auth mit JWT-Tokens
- ✅ Row Level Security via Org-ID
- ✅ Input Validation mit Zod
- ✅ Rate Limiting
- ✅ Audit Logging

## 📝 Lizenz

MIT License

## 💡 Support

- 📧 E-Mail: support@smvboard.de
- 🐛 Issues: [GitHub Issues](https://github.com/tanmaysachinsonar-ctrl/smvboard/issues)

---

**Stand:** Februar 2026 | Entwickelt mit ❤️ für Schülermitverwaltungen
