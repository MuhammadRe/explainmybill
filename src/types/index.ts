// ─────────────────────────────────────────────────────
// Shared TypeScript types for ExplainMyBill
// ─────────────────────────────────────────────────────

import type { Document, Analysis, User, Plan, DocumentStatus, DocumentType } from '@prisma/client';

// Re-export Prisma enums for convenience
export { Plan, DocumentStatus, DocumentType };

// ─── Analysis structured fields ───────────────────────

export interface HiddenFee {
  title: string;
  description: string;
  amount?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Risk {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ImportantDate {
  label: string;
  date: string;
  description: string;
}

export interface SavingsSuggestion {
  title: string;
  description: string;
  potentialSaving?: string;
}

export interface ComparisonHint {
  title: string;
  description: string;
  benchmark?: string;
  userValue?: string;
}

export interface KeyFigure {
  label: string;
  value: string;
  unit?: string;
}

// ─── Full Analysis with parsed JSON fields ────────────

export interface ParsedAnalysis extends Omit<Analysis, 'hiddenFees' | 'risks' | 'importantDates' | 'savingsSuggestions' | 'comparisonHints' | 'keyFigures'> {
  hiddenFees: HiddenFee[];
  risks: Risk[];
  importantDates: ImportantDate[];
  savingsSuggestions: SavingsSuggestion[];
  comparisonHints: ComparisonHint[];
  keyFigures: KeyFigure[];
}

// ─── Document with its analysis ───────────────────────

export interface DocumentWithAnalysis extends Document {
  analysis: ParsedAnalysis | null;
}

// ─── API Response types ───────────────────────────────

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  documentId: string;
  status: DocumentStatus;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Session user (extends NextAuth) ─────────────────

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  plan: Plan;
  documentsUsedThisMonth: number;
}

// ─── Usage info ───────────────────────────────────────

export interface UsageInfo {
  used: number;
  limit: number | null; // null = unlimited (Pro plan)
  plan: Plan;
  resetAt: Date;
}
