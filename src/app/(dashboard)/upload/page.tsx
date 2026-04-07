// ─────────────────────────────────────────────────────
// Upload Page — Document upload interface
// ─────────────────────────────────────────────────────

import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/db';
import { DocumentUploader } from '@/components/DocumentUploader';
import { UsageMeter } from '@/components/UsageMeter';
import { FREE_PLAN_LIMIT } from '@/lib/utils';
import { Shield, Zap, FileText } from 'lucide-react';

export const metadata = { title: 'Upload Document' };

export default async function UploadPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      documentsUsedThisMonth: true,
      documentsResetAt: true,
      credits: true,
    },
  });

  if (!user) redirect('/login');

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold">Analyze a Document</h1>
        <p className="mt-1 text-muted-foreground">
          Upload a bill, contract, or paste text — we'll explain it in plain English.
        </p>
      </div>

      {/* ── Usage meter ── */}
      <UsageMeter
        used={user.documentsUsedThisMonth}
        limit={user.plan === 'PRO' ? null : FREE_PLAN_LIMIT}
        plan={user.plan}
        credits={user.credits}
      />

      {/* ── Upload widget ── */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <DocumentUploader />
      </div>

      {/* ── Tips ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            title: 'Works best with',
            body: 'Clear PDFs or high-resolution images. Poor quality scans may give incomplete results.',
          },
          {
            icon: Shield,
            color: 'text-green-600',
            bg: 'bg-green-50',
            title: 'Your privacy',
            body: 'Documents are processed securely. We never share your data with third parties.',
          },
          {
            icon: Zap,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            title: 'Processing time',
            body: 'Most documents are analyzed within 15–30 seconds using Claude AI.',
          },
        ].map(({ icon: Icon, color, bg, title, body }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-4">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-4.5 w-4.5 ${color}`} />
            </div>
            <p className="text-sm font-medium mb-1">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
