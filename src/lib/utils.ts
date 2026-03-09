import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

// ─── Tailwind class merging utility ──────────────────
// Merges Tailwind classes intelligently (handles conflicts)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── File helpers ─────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

export function isAllowedFileType(mimeType: string): boolean {
  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'text/plain',
  ];
  return allowed.includes(mimeType);
}

// ─── Date helpers ─────────────────────────────────────

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatRelativeDate(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ─── Plan helpers ─────────────────────────────────────

export const FREE_PLAN_LIMIT = parseInt(process.env.FREE_PLAN_LIMIT ?? '3', 10);

export function canUploadDocument(
  plan: string,
  documentsUsedThisMonth: number
): { allowed: boolean; reason?: string } {
  if (plan === 'PRO') {
    return { allowed: true };
  }
  if (documentsUsedThisMonth >= FREE_PLAN_LIMIT) {
    return {
      allowed: false,
      reason: `You've used all ${FREE_PLAN_LIMIT} free analyses this month. Upgrade to Pro for unlimited analyses.`,
    };
  }
  return { allowed: true };
}

// ─── Severity color mapping ───────────────────────────

export function severityColor(severity: 'low' | 'medium' | 'high'): string {
  switch (severity) {
    case 'low':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'medium':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function severityBadgeVariant(severity: 'low' | 'medium' | 'high'): string {
  switch (severity) {
    case 'low':
      return 'warning';
    case 'medium':
      return 'orange';
    case 'high':
      return 'destructive';
    default:
      return 'secondary';
  }
}

// ─── Risk score label ─────────────────────────────────

export function riskScoreLabel(score: number): { label: string; color: string } {
  if (score <= 3) return { label: 'Low Risk', color: 'text-green-600' };
  if (score <= 6) return { label: 'Medium Risk', color: 'text-yellow-600' };
  return { label: 'High Risk', color: 'text-red-600' };
}

// ─── Document type display ────────────────────────────

export function documentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ENERGY_BILL: 'Energy Bill',
    PHONE_BILL: 'Phone Bill',
    INTERNET_BILL: 'Internet Bill',
    INSURANCE: 'Insurance',
    CONTRACT: 'Contract',
    BANK_STATEMENT: 'Bank Statement',
    INVOICE: 'Invoice',
    RENT_AGREEMENT: 'Rent Agreement',
    SUBSCRIPTION: 'Subscription',
    OTHER: 'Document',
  };
  return labels[type] ?? type;
}

// ─── Status display ───────────────────────────────────

export function documentStatusLabel(status: string): { label: string; color: string } {
  switch (status) {
    case 'PENDING':
      return { label: 'Queued', color: 'text-gray-500' };
    case 'PROCESSING':
      return { label: 'Analyzing...', color: 'text-blue-600' };
    case 'COMPLETED':
      return { label: 'Complete', color: 'text-green-600' };
    case 'FAILED':
      return { label: 'Failed', color: 'text-red-600' };
    default:
      return { label: status, color: 'text-gray-500' };
  }
}

// ─── Truncate text ────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
