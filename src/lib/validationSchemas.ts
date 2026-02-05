import { z } from 'zod';

// Auth schemas
export const signInSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
});

export const signUpSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  orgName: z.string().min(2, 'Organisationsname muss mindestens 2 Zeichen lang sein'),
});

// Transaction schemas
export const createTransactionSchema = z.object({
  accountId: z.string().cuid(),
  amount: z.number(),
  currency: z.string().default('EUR'),
  date: z.string().or(z.date()),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  categoryId: z.string().cuid().optional(),
  description: z.string().optional(),
  receiptUrl: z.string().url().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

// Account schemas
export const createAccountSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  type: z.enum(['CASH', 'BANK', 'GRANT', 'OTHER']),
  balance: z.number().default(0),
});

export const updateAccountSchema = createAccountSchema.partial();

// Member schemas
export const createMemberSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  position: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  photoUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export const updateMemberSchema = createMemberSchema.partial();

// Event schemas
export const createEventSchema = z.object({
  title: z.string().min(2, 'Titel muss mindestens 2 Zeichen lang sein'),
  description: z.string().optional(),
  start: z.string().or(z.date()),
  end: z.string().or(z.date()).optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  recurrence: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  kind: z.enum(['INCOME', 'EXPENSE']),
});

export const updateCategorySchema = createCategorySchema.partial();

// Invoice schemas
export const createInvoiceSchema = z.object({
  number: z.string().min(1, 'Rechnungsnummer erforderlich'),
  issuedTo: z.string().min(2, 'Empfänger erforderlich'),
  amount: z.number().positive('Betrag muss positiv sein'),
  currency: z.string().default('EUR'),
  status: z.enum(['DRAFT', 'ISSUED', 'PAID', 'CANCELLED']).default('DRAFT'),
  dueDate: z.string().or(z.date()).optional(),
  pdfUrl: z.string().url().optional(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

// Rose Order schemas
export const createRoseOrderSchema = z.object({
  recipientSchoolId: z.string().cuid('Ungültige Schul-ID'),
  recipientName: z
    .string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein')
    .regex(
      /^[a-zA-ZäöüÄÖÜß\s-]+$/,
      'Name darf nur Buchstaben, Bindestriche und Leerzeichen enthalten'
    ),
  recipientClass: z.string().max(10, 'Klasse darf maximal 10 Zeichen lang sein').optional(),
  roseCount: z
    .number()
    .int('Anzahl muss eine ganze Zahl sein')
    .min(1, 'Mindestens 1 Rose')
    .max(10, 'Maximal 10 Rosen pro Bestellung'),
  senderNote: z.string().max(200, 'Nachricht darf maximal 200 Zeichen lang sein').optional(),
  isAnonymous: z.boolean().default(false),
  campaignId: z.string().cuid().optional(),
});

// School schemas
export const createSchoolSchema = z.object({
  name: z.string().min(2, 'Schulname muss mindestens 2 Zeichen lang sein'),
  accessCode: z
    .string()
    .min(6, 'Zugangscode muss mindestens 6 Zeichen lang sein')
    .max(20, 'Zugangscode darf maximal 20 Zeichen lang sein')
    .regex(/^[A-Z0-9_-]+$/, 'Zugangscode darf nur Großbuchstaben, Zahlen, _ und - enthalten'),
  description: z.string().optional(),
});

export const updateSchoolSchema = createSchoolSchema.partial();

// Rose Campaign schemas
export const createRoseCampaignSchema = z.object({
  name: z.string().min(2, 'Kampagnenname muss mindestens 2 Zeichen lang sein'),
  description: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  pricePerRose: z.number().positive('Preis muss positiv sein').default(1.5),
  status: z.enum(['PLANNED', 'OPEN', 'CLOSED', 'ARCHIVED']).default('OPEN'),
});

export const updateRoseCampaignSchema = createRoseCampaignSchema.partial();
