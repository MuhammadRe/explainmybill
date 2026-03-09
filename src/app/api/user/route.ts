// ─────────────────────────────────────────────────────
// GET /api/user  — Get current user profile + usage
// PATCH /api/user — Update profile (name, etc.)
// ─────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/db';
import { FREE_PLAN_LIMIT } from '@/lib/utils';

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      plan: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      documentsUsedThisMonth: true,
      documentsResetAt: true,
      createdAt: true,
      _count: { select: { documents: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
    usage: {
      used: user.documentsUsedThisMonth,
      limit: user.plan === 'PRO' ? null : FREE_PLAN_LIMIT,
      plan: user.plan,
      resetAt: user.documentsResetAt,
    },
  });
}

const updateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await req.json();

  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: result.data,
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(updatedUser);
}
