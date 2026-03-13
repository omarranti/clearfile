// api/claim-purchase.js
// Called after a guest completes payment and then creates/logs in
// POST /api/claim-purchase  { session_id, user_id }

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { session_id, user_id } = req.body;
  if (!session_id || !user_id) {
    return res.status(400).json({ error: 'session_id and user_id required' });
  }

  // 1. Find the unclaimed purchase
  const { data: claim, error: fetchErr } = await supabase
    .from('purchase_claims')
    .select('*')
    .eq('stripe_session_id', session_id)
    .is('claimed_by', null)
    .single();

  if (fetchErr || !claim) {
    return res.status(404).json({ error: 'Purchase not found or already claimed' });
  }

  // 2. Fetch subscription from Stripe to get live status
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['subscription'],
  });

  const subscription = session.subscription;
  if (!subscription) {
    return res.status(400).json({ error: 'No subscription found for this session' });
  }

  const priceId = subscription.items.data[0].price.id;
  const plan = PRICE_TO_PLAN[priceId] || claim.plan;

  // 3. Upsert subscription for the user
  const { error: subErr } = await supabase.from('subscriptions').upsert({
    user_id,
    stripe_customer_id: claim.stripe_customer_id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    plan,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'stripe_subscription_id' });

  if (subErr) {
    console.error('Error linking subscription:', subErr);
    return res.status(500).json({ error: 'Failed to link subscription' });
  }

  // 4. Mark claim as claimed
  await supabase.from('purchase_claims').update({
    claimed_by: user_id,
    claimed_at: new Date().toISOString(),
  }).eq('stripe_session_id', session_id);

  return res.status(200).json({ success: true, plan });
}
