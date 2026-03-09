// ─────────────────────────────────────────────────────
// GET /api/documents/[id]    — Fetch single document + analysis
// DELETE /api/documents/[id] — Delete a document
// ─────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/db';
import { deleteFile } from '@/lib/parsers/document';

interface RouteParams {
  params: { id: string };
}

// ── GET ───────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: { analysis: true },
  });

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // Ensure the document belongs to the current user (ownership check)
  if (document.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(document);
}

// ── DELETE ────────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    select: { userId: true, filePath: true },
  });

  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  if (document.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Delete from database (cascades to Analysis)
  await prisma.document.delete({ where: { id: params.id } });

  // Clean up file from disk
  if (document.filePath) {
    await deleteFile(document.filePath);
  }

  return NextResponse.json({ success: true });
}
