# SMVBoard Developer Guide
**Version:** 1.0  
**Letzte Aktualisierung:** 4. Februar 2026

---

## 🚀 Quick Start (15-Minuten Setup)

### Voraussetzungen
- **Node.js:** 18+ (LTS empfohlen)
- **npm:** 9+
- **Git:** Latest
- **PostgreSQL-Datenbank:** via Supabase (empfohlen)

### Setup-Schritte

```bash
# 1. Repository klonen
git clone https://github.com/tanmaysachinsonar-ctrl/smvboard.git
cd smvboard

# 2. Dependencies installieren
npm install

# 3. Environment Variables einrichten
cp .env.example .env
# Öffne .env und füge deine Credentials ein

# 4. Prisma Client generieren
npm run prisma:generate

# 5. Datenbank migrieren
npm run prisma:migrate

# 6. Seed-Daten (optional)
npm run prisma:seed

# 7. Dev-Server starten
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

---

## 📁 Projektstruktur

```
smvboard/
├── .github/workflows/    # CI/CD Pipeline
│   └── ci.yml
├── e2e/                  # Playwright E2E Tests
│   └── auth.spec.ts
├── prisma/               # Datenbank
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── __tests__/        # Unit & Integration Tests
│   │   ├── lib/
│   │   ├── contexts/
│   │   └── components/
│   ├── components/       # React Komponenten
│   │   └── Layout.tsx
│   ├── contexts/         # React Contexts
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities & Helpers
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── supabaseClient.ts
│   │   ├── apiMiddleware.ts
│   │   ├── validationSchemas.ts
│   │   └── designTokens.ts
│   ├── pages/            # Next.js Pages & API Routes
│   │   ├── _app.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── dashboard.tsx
│   │   ├── api/
│   │   │   ├── transactions.ts
│   │   │   ├── auth/
│   │   │   ├── stripe/
│   │   │   ├── v1/
│   │   │   └── webhooks/
│   │   ├── events/
│   │   ├── finances/
│   │   ├── members/
│   │   └── legal/
│   └── styles/
│       └── globals.css
├── .eslintrc.json
├── .prettierrc.json
├── .husky/               # Git Hooks
├── jest.config.js
├── jest.setup.js
├── next.config.mjs
├── playwright.config.ts
├── tailwind.config.cjs
├── tsconfig.json
└── package.json
```

---

## 🔧 Verfügbare Scripts

### Development
```bash
npm run dev              # Start Dev-Server (Port 3000)
npm run build            # Production Build
npm run start            # Start Production Server
```

### Code Quality
```bash
npm run lint             # ESLint prüfen
npm run lint:fix         # ESLint automatisch fixen
npm run format           # Prettier formatieren
npm run format:check     # Prettier prüfen
npm run type-check       # TypeScript prüfen
npm run validate         # Alle Checks (type + lint + test)
```

### Testing
```bash
npm test                 # Jest Unit Tests
npm run test:unit        # Tests mit Coverage
npm run test:watch       # Watch Mode
npm run test:e2e         # Playwright E2E Tests
```

### Datenbank
```bash
npm run prisma:generate  # Prisma Client generieren
npm run prisma:migrate   # Migrations anwenden
npm run prisma:push      # Schema direkt pushen (Dev)
npm run prisma:studio    # Prisma Studio öffnen
npm run prisma:seed      # Seed-Daten einfügen
```

---

## 🌿 Git Workflow & Branching

### Branch-Naming
- `feature/<kurze-beschreibung>` → Neue Features
- `fix/<issue-id>-kurz` → Bug Fixes
- `chore/<task>` → Maintenance/Refactoring
- `docs/<topic>` → Dokumentation

**Beispiele:**
```bash
feature/stripe-webhooks
fix/123-auth-redirect
chore/update-dependencies
docs/api-documentation
```

### Commit Messages (Conventional Commits)
```bash
feat: Add member export feature
fix: Resolve auth token expiration issue
docs: Update API documentation
style: Format code with prettier
refactor: Simplify transaction validation
test: Add tests for account creation
chore: Update dependencies
```

### Workflow

```bash
# 1. Neuen Branch erstellen
git checkout -b feature/my-feature

# 2. Änderungen committen
git add .
git commit -m "feat: add my feature"

# 3. Pushen
git push origin feature/my-feature

# 4. Pull Request erstellen (GitHub)
# 5. Code Review
# 6. Merge nach main
```

---

## ✅ Pre-Commit Hooks

Automatisch bei `git commit`:
- **Prettier:** Formatiert geänderte Dateien
- **ESLint:** Prüft und fixt Lint-Fehler

Konfiguration in `package.json`:
```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

---

## 🧪 Testing Best Practices

### Unit Tests schreiben

**Datei:** `src/__tests__/lib/myModule.test.ts`

```typescript
import { myFunction } from '../../lib/myModule';

describe('myModule', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### API-Route Tests

```typescript
import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/v1/accounts';

describe('/api/v1/accounts', () => {
  it('returns 401 without auth', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });
});
```

### E2E Tests mit Playwright

**Datei:** `e2e/myFlow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('should complete user flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 🏗️ API-Entwicklung

### Neue API-Route erstellen

**1. Schema definieren (`src/lib/validationSchemas.ts`):**
```typescript
export const createItemSchema = z.object({
  name: z.string().min(2),
  value: z.number(),
});
```

**2. API-Route erstellen (`src/pages/api/v1/items.ts`):**
```typescript
import type { NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withAuth, AuthenticatedRequest, logAudit } from '../../../lib/apiMiddleware';
import { createItemSchema } from '../../../lib/validationSchemas';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { orgId, user } = req;

  if (req.method === 'POST') {
    try {
      const validatedData = createItemSchema.parse(req.body);
      
      const item = await prisma.item.create({
        data: {
          ...validatedData,
          orgId,
        },
      });

      await logAudit(orgId, user.id, 'ITEM_CREATED', { itemId: item.id });
      
      return res.status(201).json(item);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create item' });
    }
  }

  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default withAuth(handler, { requiredRole: 'MEMBER' });
```

---

## 🎨 UI-Komponenten

### Design Tokens nutzen
```typescript
import { tokens } from '../lib/designTokens';

function MyComponent() {
  return (
    <div style={{ 
      backgroundColor: tokens.colors.card,
      padding: tokens.spacing.md,
      borderRadius: tokens.radius.md 
    }}>
      Content
    </div>
  );
}
```

### Tailwind CSS Custom Classes
```jsx
<div className="bg-card text-white p-4 rounded-lg hover:ring-2 hover:ring-accent">
  Card Content
</div>
```

---

## 🔐 Authentifizierung

### Protected Pages
```typescript
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div>Loading...</div>;

  return <div>Protected Content</div>;
}
```

### API Auth Check
```typescript
// Automatisch via withAuth Middleware
export default withAuth(handler, { requiredRole: 'OWNER' });
```

---

## 🐛 Debugging

### Development Logs
```typescript
// API-Route
console.log('[API] /api/v1/accounts - Request:', req.body);

// Client-Side
if (process.env.NODE_ENV === 'development') {
  console.log('[DEBUG] User:', user);
}
```

### Prisma Studio
```bash
npm run prisma:studio
# Öffnet GUI auf http://localhost:5555
```

### TypeScript Errors
```bash
npm run type-check
# Zeigt alle TS-Fehler ohne Build
```

---

## 📊 Code-Qualitäts-Checkliste

### Vor jedem Commit
- [ ] `npm run type-check` → Keine TS-Fehler
- [ ] `npm run lint` → Keine Lint-Fehler
- [ ] `npm run format:check` → Code formatiert
- [ ] `npm test` → Tests bestehen
- [ ] Keine `any`-Typen ohne Kommentar

### Vor jedem PR
- [ ] Branch aktuell mit `main`
- [ ] Alle CI-Checks grün
- [ ] Tests für neue Features
- [ ] README/Docs aktualisiert (falls nötig)
- [ ] Screenshot bei UI-Änderungen

---

## 🚨 Häufige Probleme & Lösungen

### Problem: "Cannot find module '@prisma/client'"
**Lösung:**
```bash
npm run prisma:generate
```

### Problem: ESLint-Fehler nach Update
**Lösung:**
```bash
npm install --save-dev eslint@^8.57.0 eslint-config-next@^14.0.0
```

### Problem: TypeScript "possibly undefined"
**Lösung:** Optional Chaining nutzen
```typescript
// Falsch
const price = subscription.items.data[0].price.id;

// Richtig
const price = subscription.items.data[0]?.price.id || 'default';
```

### Problem: Tests schlagen fehl (Mocks)
**Lösung:** Module vor Import mocken
```typescript
jest.mock('../../lib/myModule');
import { myFunction } from '../../lib/myModule';
```

---

## 📈 Performance Best Practices

### 1. Next.js Image Optimization
```typescript
import Image from 'next/image';

<Image 
  src="/logo.png" 
  width={200} 
  height={100} 
  alt="Logo"
/>
```

### 2. Dynamic Imports
```typescript
const HeavyComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <div>Loading...</div>,
});
```

### 3. Prisma Queries optimieren
```typescript
// Falsch: N+1 Problem
const users = await prisma.user.findMany();
for (const user of users) {
  const org = await prisma.organization.findUnique({ where: { id: user.orgId } });
}

// Richtig: Include
const users = await prisma.user.findMany({
  include: { org: true },
});
```

---

## 🔒 Security Checklist

- [ ] **Keine Secrets in Code** (nutze `.env`)
- [ ] **Input Validation** (Zod schemas)
- [ ] **Auth Middleware** auf allen geschützten Routes
- [ ] **Rate Limiting** aktiviert
- [ ] **CSRF Protection** (Next.js built-in)
- [ ] **SQL Injection** Prevention (Prisma ORM)
- [ ] **XSS Protection** (React built-in)

---

## 📚 Weiterführende Ressourcen

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Testing Library](https://testing-library.com/)
- [Playwright Docs](https://playwright.dev/)

---

## 🤝 Contributing

Siehe [CONTRIBUTING.md](./CONTRIBUTING.md) für:
- Code Style Guidelines
- PR Process
- Review Checkliste

---

**Bei Fragen:** Issue erstellen oder Team kontaktieren  
**Maintainer:** GitHub Copilot Agent  
**Lizenz:** Siehe LICENSE
