'use client';

// ─────────────────────────────────────────────────────
// Document Detail Page — Shows analysis results
// ─────────────────────────────────────────────────────
// This is a Client Component because we poll for status
// when the document is still PROCESSING.

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  FileText,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysisResult } from '@/components/AnalysisResult';
import { formatDate, formatFileSize, documentTypeLabel } from '@/lib/utils';
import type { DocumentWithAnalysis, ParsedAnalysis } from '@/types';

type DocStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [document, setDocument] = useState<DocumentWithAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch document data ───────────────────────────

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/documents/${id}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Document not found');
        return null;
      }
      const data = await res.json();
      setDocument(data);
      return data;
    } catch {
      setError('Failed to load document');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ── Poll while PROCESSING ─────────────────────────

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const init = async () => {
      const doc = await fetchDocument();

      if (doc?.status === 'PROCESSING' || doc?.status === 'PENDING') {
        // Poll every 3 seconds until complete
        pollInterval = setInterval(async () => {
          const statusRes = await fetch(`/api/documents/${id}/status`);
          const status = await statusRes.json();

          if (status.status === 'COMPLETED' || status.status === 'FAILED') {
            clearInterval(pollInterval);
            await fetchDocument(); // Fetch full data with analysis
          }
        }, 3000);
      }
    };

    init();
    return () => clearInterval(pollInterval);
  }, [id]);

  // ── Delete document ───────────────────────────────

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document? This cannot be undone.')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Document deleted');
      router.push('/dashboard');
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  // ── Loading state ──────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────

  if (error || !document) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h2 className="text-xl font-semibold">{error || 'Document not found'}</h2>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
        </Link>
      </div>
    );
  }

  // ── Processing state ──────────────────────────────

  if (document.status === 'PROCESSING' || document.status === 'PENDING') {
    return (
      <div className="mx-auto max-w-xl text-center py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 mx-auto mb-6">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Analyzing your document...</h2>
        <p className="text-muted-foreground text-sm mb-2">
          Claude AI is reading and analyzing <strong>{document.name}</strong>.
        </p>
        <p className="text-xs text-muted-foreground">
          This usually takes 15–30 seconds. The page will update automatically.
        </p>
        {/* Progress animation */}
        <div className="mt-8 mx-auto w-48 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-blue-500 animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    );
  }

  // ── Failed state ──────────────────────────────────

  if (document.status === 'FAILED') {
    return (
      <div className="mx-auto max-w-xl text-center py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Analysis failed</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {(document as any).error || 'Something went wrong while analyzing this document.'}
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/upload">
            <Button variant="gradient" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    );
  }

  // ── Completed: show analysis ──────────────────────

  const analysis = document.analysis as ParsedAnalysis | null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">{document.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {documentTypeLabel(document.type)} · {formatFileSize(document.fileSize)} ·{' '}
                {formatDate(document.createdAt)}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-red-600"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete document"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </div>

      {/* ── Analysis ── */}
      {analysis ? (
        <AnalysisResult analysis={analysis} documentName={document.name} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No analysis available for this document.
        </div>
      )}
    </div>
  );
}
