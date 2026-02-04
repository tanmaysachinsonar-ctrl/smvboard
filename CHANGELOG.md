# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/lang/de/).

## [1.0.0] - 2026-02-03

### Hinzugefügt

#### Authentifizierung & Authorization
- Vollständige Supabase Auth Integration
- Login/Logout/Registrierung
- Multi-Tenancy mit Organization-Kontext
- Role-based Access Control (OWNER, MEMBER, VIEWER)
- JWT Token-basierte API-Authentifizierung
- Auth Context Provider für Frontend

#### Finanzverwaltung
- Konten-Verwaltung (Cash, Bank, Grant, Other)
- Transaktions-Tracking (Income, Expense, Transfer)
- Kategorien-System
- Echtzeit-Balance-Berechnung
- Dashboard mit Finanzübersicht
- Transaktionsfilter nach Datum, Konto, Typ

#### Mitgliederverwaltung
- SMV-Mitglieder erstellen und verwalten
- Positionen und Kontaktdaten
- Mitglieder-Profile mit Fotos (optional)
- Übersichtsseite mit Grid-Layout

#### Event-Management
- Kalender-Events erstellen
- Event-Details (Titel, Beschreibung, Datum, Ort)
- Teilnehmerverwaltung
- Chronologische Event-Liste

#### Stripe Integration
- Checkout Session Flow
- Subscription-Verwaltung
- Billing Portal Integration
- Webhook Handler für alle Events:
  - checkout.session.completed
  - invoice.payment_succeeded/failed
  - customer.subscription.updated/deleted
- Subscription-Status-Sync in Datenbank

#### API & Backend
- RESTful API mit versionierten Endpunkten (/api/v1/*)
- Zod-basierte Input Validation
- Rate Limiting Middleware
- Error Handling & Logging
- Audit Log für alle kritischen Aktionen
- CSRF Protection

#### UI/UX
- Responsive Design (Mobile-first)
- Custom Tailwind Theme (Dark Mode)
- Layout-Komponente mit Navigation
- User Menu mit Dropdown
- Loading & Error States
- Modal-Dialoge für Formulare

#### Testing & Qualität
- Jest Setup für Unit Tests
- Playwright Setup für E2E Tests
- ESLint Konfiguration
- Prettier Code Formatting
- TypeScript Strict Mode

#### CI/CD
- GitHub Actions Workflow
- Automatische Linting
- Build Verification
- Deployment zu Vercel

#### Rechtliches & Compliance
- AGB-Seite
- Datenschutzerklärung
- Impressum
- Footer mit Legal Links

#### Dokumentation
- Vollständiges README mit Setup-Anleitung
- Deployment Guide (DEPLOYMENT.md)
- Contributing Guidelines (CONTRIBUTING.md)
- Code-Kommentare und TSDoc

#### Datenbank
- Prisma ORM Integration
- PostgreSQL Schema
- Migrationen
- Seed-Skript mit Demo-Daten
- Relationen und Constraints

#### Security
- Security Headers (X-Frame-Options, CSP, etc.)
- Input Sanitization
- SQL Injection Prevention (Prisma)
- XSS Protection (React)
- Password Hashing (bcrypt)
- Environment Variable Validation

### Technologie-Stack
- Next.js 14.0.0
- React 18.2.0
- TypeScript 5.x
- Tailwind CSS 3.3.0
- Prisma 5.x
- Supabase (Auth & Database)
- Stripe (Payments)
- Jest & Playwright (Testing)

## [Unreleased]

### Geplant für zukünftige Versionen

#### v1.1.0
- [ ] Rechnungs-Generator (PDF)
- [ ] Export-Funktionen (CSV, Excel)
- [ ] Erweiterte Filteroptionen
- [ ] Budget-Planung

#### v1.2.0
- [ ] Email-Benachrichtigungen
- [ ] Push Notifications
- [ ] Multi-Language Support (i18n)
- [ ] Dark/Light Mode Toggle

#### v1.3.0
- [ ] Erweiterte Analytics
- [ ] Reporting Dashboard
- [ ] Datenvisualisierung (Charts)
- [ ] Vergleichsansichten

#### Backlog
- [ ] Mobile App (React Native)
- [ ] Bulk-Operationen
- [ ] Advanced Search
- [ ] File Upload für Belege
- [ ] Integration mit Banking APIs
- [ ] Recurring Transactions
- [ ] Multi-Currency Support
- [ ] Team Collaboration Features
- [ ] Audit Trail Viewer
- [ ] Data Import/Export Wizard

---

[1.0.0]: https://github.com/tanmaysachinsonar-ctrl/smvboard/releases/tag/v1.0.0
