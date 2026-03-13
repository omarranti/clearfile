import { json, readRawBody, stripe, stripePrices, supabaseAdmin } from "./_lib/clients.js";

const planFromPrice = (priceId) => {
  if (priceId === stripePrices.pro) return "pro";
  return "full";
};

const fromUnix = (v) => (v ? new Date(v * 1000).toISOString() : null);

const upsertEntitlementForUser = async (userId, plan, subscriptionId, status) => {
  if (!userId) return;
  const active = ["active", "trialing", "past_due"].includes(status || "");
  await supabaseAdmin.from("billing_entitlements").upsert(
    {
      user_id: userId,
      full_access: active,
      pro_ai: active && plan === "pro",
      status: active ? "active" : "inactive",
      source_subscription_id: subscriptionId,
    },
    { onConflict: "user_id" }
  );
};

const syncSubscriptionByStripeId = async (subscription) => {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  const priceId = subscription.items?.data?.[0]?.price?.id || "";
  const plan = planFromPrice(priceId);

  const customer = await stripe.customers.retrieve(customerId);
  const email =
    (typeof customer !== "string" && !customer.deleted ? customer.email : null) ||
    subscription.metadata?.email ||
    "";

  const { data: customerRow } = await supabaseAdmin
    .from("billing_customers")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  const userId = customerRow?.user_id || null;

  await supabaseAdmin.from("billing_subscriptions").upsert(
    {
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      plan_tier: plan,
      status: subscription.status,
      email: (email || "").toLowerCase(),
      user_id: userId,
      current_period_start: fromUnix(subscription.current_period_start),
      current_period_end: fromUnix(subscription.current_period_end),
      min_commitment_end: fromUnix(subscription.start_date ? subscription.start_date + 60 * 60 * 24 * 30 * 3 : null),
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (email) {
    await supabaseAdmin.from("billing_customers").upsert(
      {
        email: email.toLowerCase(),
        stripe_customer_id: customerId,
        user_id: userId,
      },
      { onConflict: "stripe_customer_id" }
    );
  }

  await upsertEntitlementForUser(userId, plan, subscription.id, subscription.status);
};

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const signature = req.headers["stripe-signature"];
    if (!signature) return json(res, 400, { error: "Missing stripe-signature header" });

    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        await syncSubscriptionByStripeId(sub);

        const email = (session.customer_details?.email || session.customer_email || "").toLowerCase();
        const plan = session.metadata?.plan_tier === "pro" ? "pro" : "full";
        if (email) {
          await supabaseAdmin.from("billing_guest_access").upsert(
            {
              stripe_checkout_session_id: session.id,
              email,
              plan_tier: plan,
              status: "active",
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            { onConflict: "stripe_checkout_session_id" }
          );
        }
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      await syncSubscriptionByStripeId(event.data.object);
    }

    return json(res, 200, { received: true });
  } catch (error) {
    return json(res, 400, { error: error.message || "Webhook processing failed" });
  }
}
