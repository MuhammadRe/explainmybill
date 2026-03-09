// ─────────────────────────────────────────────────────
// GET /api/documents
// Returns paginated list of user's documents
// ─────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  // Parse pagination params
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(50, parseInt(searchParams.get('pageSize') ?? '10', 10));
  const skip = (page - 1) * pageSize;

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        analysis: {
          select: {
            id: true,
            simpleExplanation: true,
            documentType: true,
            riskScore: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.document.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    items: documents,
    total,
    page,
    pageSize,
    hasMore: skip + pageSize < total,
  });
}

// ─────────────────────────────────────────────────────
// DELETE /api/documents
// Bulk delete documents by IDs
// ─────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const { ids } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No document IDs provided' }, { status: 400 });
  }

  // Only delete documents that belong to this user
  await prisma.document.deleteMany({
    where: { id: { in: ids }, userId },
  });

  return NextResponse.json({ success: true });
}
