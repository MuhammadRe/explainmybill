'use client';

import Link from 'next/link';
import { FileText, Image, File, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate, formatFileSize, documentTypeLabel, riskScoreLabel, cn } from '@/lib/utils';

interface DocumentCardProps {
  document: {
    id: string;
    name: string;
    type: string;
    mimeType: string;
    fileSize: number;
    status: string;
    createdAt: string | Date;
    analysis?: {
      riskScore: number;
      documentType: string;
      simpleExplanation: string;
    } | null;
  };
}

// Icon based on MIME type
function FileIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  if (mimeType.startsWith('image/')) return <Image className={cn('text-purple-500', className)} />;
  if (mimeType === 'application/pdf') return <FileText className={cn('text-red-500', className)} />;
  return <File className={cn('text-blue-500', className)} />;
}

// Status indicator
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Complete
        </div>
      );
    case 'PROCESSING':
      return (
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Analyzing...
        </div>
      );
    case 'FAILED':
      return (
        <div className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5" />
          Failed
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Queued
        </div>
      );
  }
}

export function DocumentCard({ document }: DocumentCardProps) {
  const riskInfo = document.analysis ? riskScoreLabel(document.analysis.riskScore) : null;

  return (
    <Link href={`/documents/${document.id}`}>
      <Card className="group transition-all hover:shadow-md hover:border-blue-200 cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* File type icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-blue-50 transition-colors">
              <FileIcon mimeType={document.mimeType} className="h-6 w-6" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-medium text-foreground text-sm leading-tight">
                  {document.name}
                </p>
                <StatusBadge status={document.status} />
              </div>

              {/* Document type badge */}
              {document.analysis?.documentType && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {document.analysis.documentType}
                </p>
              )}

              {/* Summary preview */}
              {document.analysis?.simpleExplanation && (
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {document.analysis.simpleExplanation}
                </p>
              )}

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>·</span>
                  <span>{formatRelativeDate(document.createdAt)}</span>
                </div>

                {/* Risk score */}
                {riskInfo && (
                  <span className={cn('text-xs font-medium', riskInfo.color)}>
                    Risk: {document.analysis!.riskScore}/10
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
