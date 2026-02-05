/**
 * Central Type Definitions for SMVBoard
 *
 * Diese Datei enthält alle TypeScript-Interfaces für Domain-Models
 * und API-Contracts.
 */

// ============================================
// Domain Models
// ============================================

export interface Event {
  id: string;
  title: string;
  startAt: string; // ISO 8601
  endAt?: string; // ISO 8601
  allDay?: boolean;
  description?: string;
  location?: string;
  color?: string;
  recurrence?: string;
  orgId: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  participants?: EventParticipant[];
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId?: string;
  name?: string;
  status: 'YES' | 'NO' | 'MAYBE';
}

export interface Transaction {
  id: string;
  orgId: string;
  accountId: string;
  account?: Account;
  amount: number;
  currency: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryId?: string;
  category?: Category;
  description?: string;
  receiptUrl?: string;
  reconciled: boolean;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface Account {
  id: string;
  orgId: string;
  name: string;
  type: 'CASH' | 'BANK' | 'GRANT' | 'OTHER';
  balance: number;
  createdAt: string;
}

export interface Category {
  id: string;
  orgId: string;
  name: string;
  kind: 'INCOME' | 'EXPENSE';
  color?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  orgId: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'OWNER' | 'MEMBER' | 'VIEWER';
  avatarUrl?: string;
  orgId: string;
  org?: Organization;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  stripeCustomerId?: string;
  subscription?: Subscription;
  createdAt: string;
}

export interface Subscription {
  id: string;
  orgId: string;
  stripeSubscriptionId: string;
  planId: string;
  status:
    | 'active'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'past_due'
    | 'trialing'
    | 'unpaid';
  currentPeriodEnd?: string; // ISO 8601
  createdAt: string;
}

export interface Invitation {
  id: string;
  orgId: string;
  email: string;
  role: 'OWNER' | 'MEMBER' | 'VIEWER';
  token: string;
  expiresAt: string; // ISO 8601
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  createdAt: string;
}

export interface Invoice {
  id: string;
  orgId: string;
  number: string;
  issuedTo: string;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
  dueDate?: string; // ISO 8601
  pdfUrl?: string;
  createdById: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  userId?: string;
  action: string;
  meta?: Record<string, any>;
  createdAt: string;
}

// ============================================
// API Request/Response Types
// ============================================

// Events
export interface CreateEventRequest {
  title: string;
  start: string; // ISO 8601
  end?: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  color?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export interface EventsQueryParams {
  start?: string; // ISO 8601
  end?: string; // ISO 8601
}

// Transactions
export interface CreateTransactionRequest {
  accountId: string;
  amount: number;
  currency?: string;
  date: string; // YYYY-MM-DD
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryId?: string;
  description?: string;
}

export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {}

export interface TransactionsQueryParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryId?: string;
  accountId?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  currency: string;
  period: {
    from: string;
    to: string;
  };
  byCategory: {
    categoryId: string;
    categoryName: string;
    total: number;
  }[];
}

// Members & Invitations
export interface CreateInvitationRequest {
  email: string;
  role: 'OWNER' | 'MEMBER' | 'VIEWER';
}

export interface InvitationResponse {
  id: string;
  email: string;
  role: string;
  inviteLink: string;
  expiresAt: string;
}

export interface AcceptInvitationRequest {
  token: string;
  name: string;
  password: string;
}

export interface UpdateMemberRoleRequest {
  role: 'OWNER' | 'MEMBER' | 'VIEWER';
}

// Billing
export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface SubscriptionStatusResponse {
  hasSubscription: boolean;
  status?: string;
  planId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CreatePortalSessionRequest {
  returnUrl?: string;
}

export interface PortalSessionResponse {
  url: string;
}

// Profile
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// UI Component Props Types
// ============================================

export interface CalendarViewMode {
  mode: 'list' | 'month' | 'week' | 'day';
}

export interface CalendarFilters {
  categoryIds?: string[];
  search?: string;
}

export interface TransactionFilters {
  dateRange: {
    from: string;
    to: string;
  };
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  categoryIds?: string[];
  accountIds?: string[];
}

// ============================================
// Utility Types
// ============================================

export type ApiResponse<T> =
  | {
      data: T;
      error?: never;
    }
  | {
      data?: never;
      error: string;
    };

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export type SortOrder = 'asc' | 'desc';

export interface SortConfig<T> {
  field: keyof T;
  order: SortOrder;
}
