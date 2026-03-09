// ─────────────────────────────────────────────────────
// POST /api/stripe/billing-portal
// Creates a Stripe Billing Portal session for subscription management
// ─────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { createBillingPortalSession } from '@/lib/stripe';
import prisma from '@/lib/db';

export async function POST() {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No billing account found' },
      { status: 400 }
    );
  }

  try {
    const url = await createBillingPortalSession(user.stripeCustomerId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
