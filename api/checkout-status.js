import { json, stripe, supabaseAdmin } from "./_lib/clients.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const sessionId = req.query?.session_id;
    if (!sessionId) return json(res, 400, { error: "Missing session_id" });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const planTier = session.metadata?.plan_tier || "full";
    const email = session.customer_details?.email || session.customer_email || "";
    const isComplete = session.status === "complete";
    const subStatus = typeof session.subscription === "object" ? session.subscription?.status : null;
    const isActive = ["active", "trialing", "past_due"].includes(subStatus || "");

    if (isComplete && isActive && email) {
      await supabaseAdmin.from("billing_guest_access").upsert(
        {
          stripe_checkout_session_id: session.id,
          email: email.toLowerCase(),
          plan_tier: planTier === "pro" ? "pro" : "full",
          status: "active",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: "stripe_checkout_session_id" }
      );
    }

    return json(res, 200, {
      sessionId: session.id,
      status: session.status,
      subscriptionStatus: subStatus,
      active: isComplete && isActive,
      plan: planTier === "pro" ? "pro" : "full",
      email,
    });
  } catch (error) {
    return json(res, 500, { error: error.message || "Failed to fetch checkout status" });
  }
}
