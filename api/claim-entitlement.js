import { json, supabaseAdmin } from "./_lib/clients.js";

const getBearer = (req) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return "";
  return auth.slice(7);
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const token = getBearer(req);
    if (!token) return json(res, 401, { error: "Missing auth token" });

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) return json(res, 401, { error: "Invalid auth token" });

    const sessionId = req.body?.session_id;
    if (!sessionId) return json(res, 400, { error: "Missing session_id" });

    const user = authData.user;
    const email = (user.email || "").toLowerCase();

    const { data: guestAccess, error: guestErr } = await supabaseAdmin
      .from("billing_guest_access")
      .select("*")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

    if (guestErr || !guestAccess) return json(res, 404, { error: "Purchase record not found" });
    if ((guestAccess.email || "").toLowerCase() !== email) {
      return json(res, 403, { error: "Purchase email does not match your account email" });
    }
    if (guestAccess.status !== "active") return json(res, 400, { error: "Purchase is not active" });

    const proAI = guestAccess.plan_tier === "pro";
    const { error: entitlementErr } = await supabaseAdmin.from("billing_entitlements").upsert(
      {
        user_id: user.id,
        full_access: true,
        pro_ai: proAI,
        status: "active",
      },
      { onConflict: "user_id" }
    );
    if (entitlementErr) return json(res, 500, { error: entitlementErr.message });

    await supabaseAdmin
      .from("billing_guest_access")
      .update({ claimed_by_user_id: user.id })
      .eq("stripe_checkout_session_id", sessionId);

    await supabaseAdmin
      .from("billing_subscriptions")
      .update({ user_id: user.id })
      .eq("email", email);

    return json(res, 200, { ok: true, full_access: true, pro_ai: proAI });
  } catch (error) {
    return json(res, 500, { error: error.message || "Claim failed" });
  }
}
