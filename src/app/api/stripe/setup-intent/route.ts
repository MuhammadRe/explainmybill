// ─────────────────────────────────────────────────────
// POST /api/stripe/setup-intent
// Creates a Stripe Checkout session in setup mode.
// No charge — just saves the user's payment method.
// On completion, the webhook sets cardOnFile = true.
// ─────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';

export async function POST() {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const email = session.user.email!;
  const name = session.user.name;

  const customerId = await getOrCreateStripeCustomer(userId, email, name);

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'setup',
    currency: 'eur',
    payment_method_types: ['card'],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?card=added`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    metadata: { userId },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
