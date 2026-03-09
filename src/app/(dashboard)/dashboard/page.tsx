// ─────────────────────────────────────────────────────
// Dashboard — User's home page after login
// Shows usage meter, recent documents, and quick upload CTA
// ─────────────────────────────────────────────────────

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Upload, Plus, FileText } from 'lucide-react';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/db';
import { Button } from '@/components/ui/button';
import { DocumentCard } from '@/components/DocumentCard';
import { UsageMeter } from '@/components/UsageMeter';
import { FREE_PLAN_LIMIT } from '@/lib/utils';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id as string;

  // Fetch user + recent documents in parallel
  const [user, documents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        plan: true,
        documentsUsedThisMonth: true,
        documentsResetAt: true,
        _count: { select: { documents: true } },
      },
    }),
    prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        analysis: {
          select: {
            riskScore: true,
            documentType: true,
            simpleExplanation: true,
          },
        },
      },
    }),
  ]);

  if (!user) redirect('/login');

  const firstName = user.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1">
            You have analyzed{' '}
            <span className="font-semibold text-foreground">{user._count.documents}</span>{' '}
            {user._count.documents === 1 ? 'document' : 'documents'} in total.
          </p>
        </div>
        <Link href="/upload">
          <Button variant="gradient" className="gap-2">
            <Plus className="h-4 w-4" />
            Analyze new document
          </Button>
        </Link>
      </div>

      {/* ── Usage meter ── */}
      <UsageMeter
        used={user.documentsUsedThisMonth}
        limit={user.plan === 'PRO' ? null : FREE_PLAN_LIMIT}
        plan={user.plan}
      />

      {/* ── Recent documents ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Documents</h2>
          {documents.length > 0 && (
            <Link href="/documents" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          )}
        </div>

        {documents.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Upload your first bill or contract to get started. We'll explain it in plain English.
            </p>
            <Link href="/upload">
              <Button variant="gradient" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload your first document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={{
                  ...doc,
                  createdAt: doc.createdAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
