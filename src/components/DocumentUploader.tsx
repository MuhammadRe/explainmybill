'use client';

// ─────────────────────────────────────────────────────
// DocumentUploader — Drag-and-drop file upload component
// ─────────────────────────────────────────────────────
// Supports: PDF, images (PNG/JPG/WebP), text files
// Also allows pasting text directly

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload, FileText, Image, AlertCircle, Loader2, ClipboardPaste } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatFileSize, isAllowedFileType } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  onUploadStart?: () => void;
  onUploadComplete?: (documentId: string) => void;
}

export function DocumentUploader({ onUploadStart, onUploadComplete }: DocumentUploaderProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [draggedFile, setDraggedFile] = useState<File | null>(null);

  // ── File drop handler ─────────────────────────────

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setDraggedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'text/plain': ['.txt'],
    },
  });

  // ── Upload file ───────────────────────────────────

  const uploadFile = async (file: File) => {
    setUploading(true);
    onUploadStart?.();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'USAGE_LIMIT_EXCEEDED') {
          toast.error(data.error);
          router.push('/settings#billing');
          return;
        }
        throw new Error(data.error || 'Upload failed');
      }

      toast.success('Document uploaded! Analysis starting...');

      // Navigate to document page and poll for completion
      router.push(`/documents/${data.documentId}`);
      onUploadComplete?.(data.documentId);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setDraggedFile(null);
    }
  };

  // ── Submit pasted text ────────────────────────────

  const uploadText = async () => {
    if (pastedText.trim().length < 20) {
      toast.error('Please paste more text (at least 20 characters)');
      return;
    }

    setUploading(true);
    onUploadStart?.();

    try {
      const formData = new FormData();
      formData.append('text', pastedText);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast.success('Text submitted! Analysis starting...');
      router.push(`/documents/${data.documentId}`);
      onUploadComplete?.(data.documentId);
    } catch (error: any) {
      toast.error(error.message || 'Failed. Please try again.');
    } finally {
      setUploading(false);
      setPastedText('');
    }
  };

  return (
    <Tabs defaultValue="file" className="w-full">
      <TabsList className="mb-6 w-full">
        <TabsTrigger value="file" className="flex-1 gap-2">
          <Upload className="h-4 w-4" />
          Upload File
        </TabsTrigger>
        <TabsTrigger value="text" className="flex-1 gap-2">
          <ClipboardPaste className="h-4 w-4" />
          Paste Text
        </TabsTrigger>
      </TabsList>

      {/* ── File upload tab ── */}
      <TabsContent value="file">
        <div
          {...getRootProps()}
          className={cn(
            'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-all cursor-pointer',
            isDragActive
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : draggedFile
              ? 'border-green-400 bg-green-50'
              : 'border-border hover:border-blue-400 hover:bg-muted/50'
          )}
        >
          <input {...getInputProps()} />

          {/* Icon */}
          <div className={cn(
            'mb-4 flex h-16 w-16 items-center justify-center rounded-full',
            draggedFile ? 'bg-green-100' : 'bg-blue-50'
          )}>
            {draggedFile ? (
              draggedFile.type.startsWith('image/') ? (
                <Image className="h-8 w-8 text-green-600" />
              ) : (
                <FileText className="h-8 w-8 text-green-600" />
              )
            ) : (
              <Upload className="h-8 w-8 text-blue-600" />
            )}
          </div>

          {draggedFile ? (
            <>
              <p className="text-lg font-semibold text-green-700">{draggedFile.name}</p>
              <p className="mt-1 text-sm text-green-600">{formatFileSize(draggedFile.size)}</p>
              <Button
                className="mt-6"
                variant="gradient"
                onClick={(e) => { e.stopPropagation(); uploadFile(draggedFile); }}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze this document'
                )}
              </Button>
              <button
                className="mt-2 text-xs text-muted-foreground hover:underline"
                onClick={(e) => { e.stopPropagation(); setDraggedFile(null); }}
              >
                Remove
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">
                {isDragActive ? 'Drop it here!' : 'Drag & drop your document'}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                or click to browse your files
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['PDF', 'PNG', 'JPG', 'WebP', 'TXT'].map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {type}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Max 10MB per file</p>
            </>
          )}
        </div>

        {/* File rejection errors */}
        {fileRejections.length > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {fileRejections[0].errors[0].code === 'file-too-large'
                ? 'File is too large. Maximum size is 10MB.'
                : fileRejections[0].errors[0].code === 'file-invalid-type'
                ? 'File type not supported. Please upload PDF, image, or text files.'
                : fileRejections[0].errors[0].message}
            </span>
          </div>
        )}
      </TabsContent>

      {/* ── Paste text tab ── */}
      <TabsContent value="text">
        <div className="space-y-4">
          <Textarea
            placeholder="Paste the text from your bill, contract, or email here...

Example:
'Monthly electricity bill — Account #12345
Usage: 234 kWh @ €0.42/kWh = €98.28
Standing charge: €12.50/month
Optional Green Energy tariff: €7.00/month
Total due: €117.78 by 15th March 2025'"
            className="min-h-[220px] resize-none font-mono text-sm"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            disabled={uploading}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {pastedText.length} characters
            </p>
            <Button
              variant="gradient"
              onClick={uploadText}
              disabled={uploading || pastedText.trim().length < 20}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze text
                </>
              )}
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
