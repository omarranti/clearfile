// api/stripe-webhook.js
// Vercel serverless function — handles Stripe events
// Deploy at: https://your-domain.com/api/stripe-webhook

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PRICE_TO_PLAN = {
  [process.env.STRIPE_PRICE_FULL_MONTHLY]: 'full_access',
  [process.env.STRIPE_PRICE_PRO_MONTHLY]: 'pro_ai',
};

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  console.log(`Processing Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ── checkout.session.completed ──────────────────────────────
async function handleCheckoutCompleted(session) {
  const { customer, subscription: subscriptionId, customer_email } = session;

  // Fetch full subscription from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;
  const plan = PRICE_TO_PLAN[priceId] || 'full_access';

  // Try to find user by email
  const { data: users } = await supabase.auth.admin.listUsers();
  const matchedUser = users?.users?.find(
    (u) => u.email?.toLowerCase() === customer_email?.toLowerCase()
  );

  if (matchedUser) {
    // Authenticated user — upsert subscription directly
    await upsertSubscription({
      userId: matchedUser.id,
      stripeCustomerId: customer,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      plan,
      subscription,
    });
    console.log(`Linked subscription to user: ${matchedUser.id}`);
  } else {
    // Guest checkout — store as claimable purchase
    await supabase.from('purchase_claims').upsert({
      stripe_session_id: session.id,
      stripe_customer_id: customer,
      stripe_price_id: priceId,
      plan,
      email: customer_email,
    });
    console.log(`Stored guest purchase claim for: ${customer_email}`);
  }
}

// ── customer.subscription.updated ──────────────────────────
async function handleSubscriptionUpdated(subscription) {
  const priceId = subscription.items.data[0].price.id;
  const plan = PRICE_TO_PLAN[priceId] || 'full_access';

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      stripe_price_id: priceId,
      plan,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) console.error('Error updating subscription:', error);
}

// ── customer.subscription.deleted ──────────────────────────
async function handleSubscriptionDeleted(subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscription.id);

  if (error) console.error('Error canceling subscription:', error);
}

// ── helpers ─────────────────────────────────────────────────
async function upsertSubscription({ userId, stripeCustomerId, stripeSubscriptionId, stripePriceId, plan, subscription }) {
  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_price_id: stripePriceId,
    plan,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'stripe_subscription_id' });

  if (error) throw error;
}
