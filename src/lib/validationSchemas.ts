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
