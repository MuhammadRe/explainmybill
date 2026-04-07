// ─────────────────────────────────────────────────────
// All Documents Page — Full history view
// ─────────────────────────────────────────────────────

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Upload, ArrowLeft } from 'lucide-react';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/db';
import { Button } from '@/components/ui/button';
import { DocumentCard } from '@/components/DocumentCard';

export const metadata = { title: 'All Documents' };

export default async function DocumentsPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id as string;

  const documents = await prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      analysis: {
        select: {
          riskScore: true,
          documentType: true,
          simpleExplanation: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Documents</h1>
          <p className="text-muted-foreground mt-1">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} total
          </p>
        </div>
        <Link href="/upload">
          <Button variant="gradient" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload new
          </Button>
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No documents yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={{ ...doc, createdAt: doc.createdAt.toISOString() }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
