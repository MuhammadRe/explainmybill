// ─────────────────────────────────────────────────────
// GET /api/documents/[id]/status
// Lightweight polling endpoint to check processing status
// Frontend polls this every 2s while status = PROCESSING
// ─────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/db';

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      status: true,
      error: true,
      userId: true,
    },
  });

  if (!document || document.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: document.id,
    status: document.status,
    error: document.error,
  });
}
