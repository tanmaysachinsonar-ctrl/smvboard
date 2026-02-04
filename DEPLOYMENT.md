# SMVBoard Deployment Guide

## Übersicht

Dieser Guide hilft dir, SMVBoard in einer Produktionsumgebung zu deployen.

## Voraussetzungen

- Supabase-Account mit eingerichtetem Projekt
- Stripe-Account (Live Mode)
- GitHub-Account
- Vercel-Account (empfohlen) oder anderer Hosting-Provider

## Schritt-für-Schritt Anleitung

### 1. Supabase Production Setup

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt (Production)
2. Unter **Settings → Database**:
   - Kopiere die Connection String
   - Format: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
3. Unter **Settings → API**:
   - Kopiere `URL` (NEXT_PUBLIC_SUPABASE_URL)
   - Kopiere `anon public` Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Kopiere `service_role` Key (SUPABASE_SERVICE_ROLE_KEY) - **GEHEIM!**

### 2. Stripe Production Setup

1. Gehe zu [stripe.com](https://stripe.com) Dashboard
2. Wechsle von "Test Mode" zu "Live Mode"
3. **API Keys** (unter Developers → API keys):
   - Kopiere "Secret key" (STRIPE_SECRET_KEY) - **GEHEIM!**
4. **Produkte erstellen**:
   - Dashboard → Products → Add Product
   - Erstelle deine Preispläne (z.B. "Basic" €4.99/mo, "Premium" €9.99/mo)
   - Notiere die Price IDs (beginnen mit `price_...`)
5. **Webhooks einrichten**:
   - Dashboard → Developers → Webhooks → Add endpoint
   - Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - Ereignisse auswählen:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Webhook erstellen
   - Kopiere "Signing secret" (STRIPE_WEBHOOK_SECRET) - **GEHEIM!**

### 3. GitHub Repository Setup

1. Pushe dein Code zu GitHub:
```bash
git init
git add .
git commit -m "Initial commit - SMVBoard Production Ready"
git remote add origin https://github.com/yourusername/smvboard.git
git push -u origin main
```

2. Setze Repository Secrets für GitHub Actions (Settings → Secrets and variables → Actions):
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `VERCEL_TOKEN` (falls Vercel Deployment)
   - `VERCEL_ORG_ID` (falls Vercel Deployment)
   - `VERCEL_PROJECT_ID` (falls Vercel Deployment)

### 4. Vercel Deployment

#### Option A: Über Vercel Dashboard

1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke "Add New..." → "Project"
3. Wähle dein GitHub Repository
4. **Environment Variables** hinzufügen:
   ```
   DATABASE_URL=postgresql://...
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXTAUTH_URL=https://your-domain.com
   NEXT_PUBLIC_APP_NAME=SMVBoard
   ```
5. Klicke "Deploy"

#### Option B: Über Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Folge den Anweisungen und setze die Environment Variables über das Dashboard.

### 5. Datenbank-Migration

Nach dem ersten Deployment:

```bash
# Über Vercel CLI mit Production DB
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# Oder über Vercel Console
# In Vercel Dashboard → Settings → Functions → Terminal
npx prisma migrate deploy
```

### 6. Domain Setup

1. In Vercel: Settings → Domains
2. Füge deine Custom Domain hinzu
3. Folge den DNS-Setup-Anweisungen
4. Warte auf SSL-Zertifikat (automatisch via Let's Encrypt)

### 7. Post-Deployment Checks

#### A. Teste Authentifizierung
1. Öffne https://your-domain.com/signup
2. Erstelle einen Test-Account
3. Login prüfen

#### B. Teste Stripe Integration
1. Gehe zu /subscription (als Owner)
2. Teste Checkout-Flow im Live-Mode
3. Überprüfe Webhook-Empfang in Stripe Dashboard

#### C. Teste API Endpoints
```bash
# Health Check (erstelle diesen Endpoint)
curl https://your-domain.com/api/health

# Mit Auth Token
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-domain.com/api/v1/accounts
```

## Sicherheit Checklist

- [ ] Alle Secrets sind in Environment Variables (nicht im Code!)
- [ ] SUPABASE_SERVICE_ROLE_KEY ist nur server-side zugänglich
- [ ] STRIPE_SECRET_KEY ist nur server-side zugänglich
- [ ] Stripe Webhook Signature Verification ist aktiv
- [ ] SSL/HTTPS ist konfiguriert
- [ ] Security Headers sind gesetzt (siehe next.config.mjs)
- [ ] Rate Limiting ist implementiert
- [ ] CORS-Einstellungen sind korrekt
- [ ] Database Row Level Security (RLS) ist aktiv (optional)

## Monitoring & Logs

### Vercel
- Dashboard → Deployment → Logs
- Real-time Function Logs
- Error Tracking

### Supabase
- Dashboard → Database → Database
- Query Performance
- Connection Pooling

### Stripe
- Dashboard → Developers → Events
- Webhook-Status überprüfen

## Backup-Strategie

### Datenbank Backups

Supabase bietet automatische Backups. Zusätzlich:

```bash
# Manuelles Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20260203.sql
```

### Code Backups
- GitHub Repository ist die Single Source of Truth
- Nutze Git Tags für Releases: `git tag v1.0.0`

## Rollback-Prozedur

### Bei fehlerhaftem Deployment:

1. **Sofort**: In Vercel Dashboard → Deployments → Vorherige Version → "Redeploy"
2. **Datenbank**: Falls Migration fehlschlug:
   ```bash
   npx prisma migrate resolve --rolled-back "MIGRATION_NAME"
   ```
3. **GitHub**: Revert Commit und re-deploy

## Performance-Optimierung

### Database
- Erstelle Indizes für häufige Queries:
```sql
CREATE INDEX idx_transactions_org_date ON "Transaction"(orgId, date DESC);
CREATE INDEX idx_members_org ON "Member"(orgId);
CREATE INDEX idx_events_org_start ON "Event"(orgId, start);
```

### Vercel
- Edge Functions für statische Inhalte
- Image Optimization via Next.js `<Image />`
- ISR (Incremental Static Regeneration) für langsame Seiten

### Caching
- Implementiere Redis für Session Storage (optional)
- API Response Caching via Next.js

## Kostenübersicht

### Freie Tiers ausreichend für Start:
- **Supabase**: 500 MB Database, 2 GB Bandwidth/Monat (FREE)
- **Vercel**: 100 GB Bandwidth, Unlimited Deployments (FREE)
- **Stripe**: Keine monatlichen Kosten, nur Transaktionsgebühren (2.9% + $0.30)

### Skalierung:
- **Supabase Pro**: $25/Monat (8 GB Database, 250 GB Bandwidth)
- **Vercel Pro**: $20/Monat (1 TB Bandwidth, Analytics)

## Support & Troubleshooting

### Häufige Probleme:

**1. "Database connection failed"**
- Prüfe DATABASE_URL Format
- Supabase Projekt ist aktiv
- IP Allowlist in Supabase (falls aktiviert)

**2. "Stripe webhook failed"**
- Webhook URL ist korrekt
- STRIPE_WEBHOOK_SECRET ist gesetzt
- Teste mit Stripe CLI: `stripe trigger checkout.session.completed`

**3. "Auth not working"**
- Supabase Keys sind korrekt
- NEXTAUTH_URL ist production URL
- Browser Cookies sind erlaubt

### Logs einsehen:

```bash
# Vercel CLI
vercel logs YOUR_DEPLOYMENT_URL

# Or in Dashboard: Deployments → Functions → View Function Logs
```

## Nächste Schritte

1. [ ] Custom Domain einrichten
2. [ ] Google Analytics / Plausible hinzufügen
3. [ ] Error Monitoring (Sentry) einrichten
4. [ ] Email-Service einrichten (z.B. SendGrid für Transaktions-Emails)
5. [ ] Content Delivery Network (CDN) für Assets
6. [ ] Backup-Automatisierung einrichten
7. [ ] Uptime Monitoring (z.B. UptimeRobot)

## Zusätzliche Ressourcen

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Stripe Production Checklist](https://stripe.com/docs/security/guide)

---

**Viel Erfolg mit deinem SMVBoard Deployment! 🚀**

Bei Fragen: [GitHub Issues](https://github.com/tanmaysachinsonar-ctrl/smvboard/issues)
