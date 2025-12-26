```markdown
# SMVBoard — MVP scaffold

Kurzanleitung: Next.js + TypeScript + Tailwind + Prisma + Supabase + Stripe
Ziel: MVP für Schülersprecher (Buchhaltung, Mitglieder, Kalender, Subscriptions)

Wichtigste Schritte (lokal)
1. Repo klonen / Dateien kopieren
2. Node installieren (v18+ empfohlen)
3. .env aus .env.example erstellen und Werte ergänzen
4. npm install
5. Prisma Migrations:
   - npx prisma migrate dev --name init
6. Development:
   - npm run dev
7. Öffne http://localhost:3000

Supabase Setup (empfohlen)
1. Erstelle ein Projekt auf https://supabase.com
2. Kopiere die DATABASE_URL in .env (DATABASE_URL)
3. Aus Supabase → Settings → API kopiere SUPABASE_URL und SUPABASE_ANON_KEY in .env
4. Erstelle ein Service Role Key (SUPABASE_SERVICE_ROLE_KEY) für server-side operations (secure!)
5. Lauf prisma migrate dev (siehe oben)

Stripe Setup
1. Erstelle ein Stripe Konto (https://stripe.com)
2. In Developers → API keys: kopiere STRIPE_SECRET_KEY (test) in .env
3. Erstelle Test Price(s) in Stripe Dashboard, notiere priceId(s) für plans
4. Webhook: (für Prod) konfiguriere URL /api/webhooks/stripe und setze STRIPE_WEBHOOK_SECRET

Deploy
- Vercel: GitHub -> import repo -> set environment variables from .env
- Supabase: keep DB + Auth active
- Stripe keys in Vercel env

Files in this scaffold (high level)
- package.json, tsconfig.json, next.config.mjs
- prisma/schema.prisma
- src/pages (Next.js pages + API routes)
- src/lib (prisma client, supabase client, design tokens)
- tailwind.config.cjs, postcss.config.cjs
- README.md, .env.example

Support
Wenn du möchtest, mache ich dir auf Wunsch:
- eine Pull‑Request Vorlage mit CI (GitHub Actions)
- ein Deployment‑Setup für Vercel
- Hilfestellung beim Anlegen des Supabase Projekts
```