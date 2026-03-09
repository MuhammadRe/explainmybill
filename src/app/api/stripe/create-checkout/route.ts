// ─────────────────────────────────────────────────────
// POST /api/stripe/create-checkout
// Creates a Stripe Checkout session for Pro upgrade
// ─────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;

  // Don't charge if already Pro
  if (user.plan === 'PRO') {
    return NextResponse.json({ error: 'You are already on the Pro plan' }, { status: 400 });
  }

  try {
    const checkoutUrl = await createCheckoutSession(
      user.id,
      user.email!,
      user.name
    );

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
