// ─────────────────────────────────────────────────────
// POST /api/stripe/buy-credits
// Creates a Stripe Checkout session for credit pack purchase
// ─────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { createCreditCheckout } from '@/lib/stripe';
import { CREDIT_PACKS } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;

  const { packId } = await req.json();
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) {
    return NextResponse.json({ error: 'Invalid credit pack' }, { status: 400 });
  }

  try {
    const checkoutUrl = await createCreditCheckout(
      user.id,
      user.email!,
      user.name,
      pack.credits,
      pack.price
    );
    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Credit checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
