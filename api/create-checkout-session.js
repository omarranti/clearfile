import { json, stripe, stripePrices } from "./_lib/clients.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const { plan, email, scenario } = req.body || {};
    if (!plan || !stripePrices[plan]) return json(res, 400, { error: "Invalid plan" });

    const origin = req.headers.origin || process.env.VITE_APP_URL || "http://localhost:5173";
    const successUrl = `${origin}/calculator?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/calculator?checkout=cancelled`;

    const isLifetime = plan === "full";
    const sessionParams = {
      mode: isLifetime ? "payment" : "subscription",
      line_items: [{ price: stripePrices[plan], quantity: 1 }],
      customer_email: email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        plan_tier: plan,
        income: String(scenario?.income ?? ""),
        filing_status: String(scenario?.filingStatus ?? ""),
      },
    };

    if (!isLifetime) {
      sessionParams.subscription_data = {
        metadata: { plan_tier: plan },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return json(res, 200, { id: session.id, url: session.url });
  } catch (error) {
    return json(res, 500, { error: error.message || "Checkout session failed" });
  }
}
