import Stripe from 'stripe';

// ─────────────────────────────────────────────────────
// Stripe Client Singleton
// ─────────────────────────────────────────────────────

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
});

// ─── Helper: Create or retrieve Stripe customer ───────

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  const { default: prisma } = await import('@/lib/db');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  // Return existing customer ID if present
  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });

  // Save customer ID to database
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// ─── Helper: Create checkout session for Pro upgrade ──

export async function createCheckoutSession(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId, email, name);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?cancelled=true`,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
    // Allow promotion codes
    allow_promotion_codes: true,
  });

  return session.url!;
}

// ─── Helper: Create billing portal session ────────────

export async function createBillingPortalSession(
  stripeCustomerId: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return session.url;
}
