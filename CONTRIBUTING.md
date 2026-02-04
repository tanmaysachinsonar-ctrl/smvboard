# Contributing to SMVBoard

Danke, dass du dich für einen Beitrag zu SMVBoard interessierst! 🎉

## Entwicklungsrichtlinien

### Code Style

- **TypeScript**: Verwende strikte Typisierung
- **ESLint**: Befolge die ESLint-Regeln
- **Prettier**: Code wird automatisch formatiert
- **Naming Conventions**:
  - Komponenten: PascalCase (`UserProfile.tsx`)
  - Funktionen: camelCase (`getUserData()`)
  - Konstanten: UPPER_SNAKE_CASE (`MAX_RETRIES`)
  - Dateien: kebab-case für utilities (`api-middleware.ts`)

### Commit Messages

Verwende [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add member export feature
fix: Resolve auth token expiration issue
docs: Update API documentation
style: Format code with prettier
refactor: Simplify transaction validation
test: Add tests for account creation
chore: Update dependencies
```

### Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/feature-name`: Neue Features
- `bugfix/issue-number`: Bug Fixes
- `hotfix/critical-fix`: Kritische Production Fixes

## Entwicklungsprozess

### 1. Setup

```bash
# Repository forken und klonen
git clone https://github.com/YOUR_USERNAME/smvboard.git
cd smvboard

# Dependencies installieren
npm install

# .env einrichten
cp .env.example .env
# Fülle die Werte aus

# Datenbank setup
npx prisma migrate dev
npx tsx prisma/seed.ts

# Dev Server starten
npm run dev
```

### 2. Feature Branch erstellen

```bash
git checkout -b feature/amazing-new-feature
```

### 3. Entwickeln

- Schreibe sauberen, getesteten Code
- Füge Tests hinzu für neue Features
- Update Dokumentation falls nötig
- Committe regelmäßig mit aussagekräftigen Messages

### 4. Tests ausführen

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Tests (falls vorhanden)
npm test

# E2E Tests
npm run test:e2e
```

### 5. Pull Request erstellen

1. Pushe deinen Branch: `git push origin feature/amazing-new-feature`
2. Gehe zu GitHub und öffne einen Pull Request
3. Beschreibe deine Änderungen ausführlich
4. Verlinke relevante Issues
5. Warte auf Code Review

## Code Review Prozess

- Mindestens 1 Approval erforderlich
- Alle Checks müssen grün sein
- Keine merge conflicts
- Dokumentation ist aktuell

## Testing

### Unit Tests schreiben

```typescript
// src/__tests__/lib/auth.test.ts
import { signIn } from '../lib/auth';

describe('Auth', () => {
  it('should authenticate user with valid credentials', async () => {
    const result = await signIn('test@example.com', 'password123');
    expect(result).toBeDefined();
    expect(result.user).toHaveProperty('email', 'test@example.com');
  });
});
```

### API Tests

```typescript
// src/__tests__/api/accounts.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/v1/accounts';

describe('/api/v1/accounts', () => {
  it('returns accounts for authenticated user', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
  });
});
```

## Bereich-spezifische Guidelines

### Frontend (UI)

- Verwende Tailwind CSS Utility Classes
- Responsive Design für Mobile, Tablet, Desktop
- Accessibility (ARIA labels, keyboard navigation)
- Loading & Error States implementieren

### Backend (API)

- Validiere alle Inputs mit Zod
- Implementiere Error Handling
- Logge wichtige Events
- Schreibe Audit Logs für kritische Aktionen
- Rate Limiting für API-Endpunkte

### Datenbank

- Prisma Schema sauber halten
- Migrationen testen
- Indizes für Performance
- Relationshipskonsistenz

### Security

- Keine Secrets im Code
- Input Validation
- SQL Injection Prevention (via Prisma)
- XSS Prevention
- CSRF Protection
- Audit Logging

## Feature Requests

Öffne ein Issue mit:

- **Titel**: Kurze Beschreibung
- **Beschreibung**: Was und warum?
- **Use Case**: Wer profitiert davon?
- **Mockups**: (optional) Designs/Wireframes

## Bug Reports

Öffne ein Issue mit:

- **Titel**: Kurze Beschreibung des Bugs
- **Reproduktion**: Schritte zum Reproduzieren
- **Erwartetes Verhalten**: Was sollte passieren?
- **Aktuelles Verhalten**: Was passiert stattdessen?
- **Screenshots**: Falls hilfreich
- **Environment**: Browser, OS, Version

## Dokumentation

- Code kommentieren (TSDoc für Funktionen)
- README aktualisieren bei neuen Features
- API-Dokumentation erweitern
- CHANGELOG.md pflegen

## Community

- Sei respektvoll und konstruktiv
- Hilf anderen Contributors
- Teile dein Wissen
- Feiere Erfolge gemeinsam

## Lizenz

Mit deinem Beitrag stimmst du zu, dass dein Code unter der MIT-Lizenz veröffentlicht wird.

---

**Danke für deinen Beitrag! 🙏**
