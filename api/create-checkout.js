import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_TO_PRICE = {
  full_access: process.env.STRIPE_PRICE_FULL_MONTHLY,
  full: process.env.STRIPE_PRICE_FULL_MONTHLY,
  pro_ai: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY,
  monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
};

const ONE_TIME_PLANS = new Set(["full_access", "full"]);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    plan,
    email,
    success_url = `${process.env.VITE_APP_URL}/calculator?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url = `${process.env.VITE_APP_URL}/calculator?checkout=canceled`,
  } = req.body;

  const priceId = PLAN_TO_PRICE[plan];
  if (!priceId) {
    return res.status(400).json({ error: `Unknown plan: ${plan}` });
  }

  const isOneTime = ONE_TIME_PLANS.has(plan);

  try {
    const sessionParams = {
      mode: isOneTime ? 'payment' : 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url,
      cancel_url,
      metadata: { plan },
      allow_promotion_codes: true,
    };

    if (!isOneTime) {
      sessionParams.subscription_data = {
        metadata: { plan },
      };
    }

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}
