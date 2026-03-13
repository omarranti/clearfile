import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "./supabase";

let stripePromise;

const api = async (path, options = {}) => {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Billing request failed");
  return data;
};

export const startCheckout = async ({ plan, email, scenario }) => {
  const data = await api("/api/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({ plan, email, scenario }),
  });

  if (data.url) {
    window.location.href = data.url;
    return;
  }

  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) throw new Error("Missing VITE_STRIPE_PUBLISHABLE_KEY");
  stripePromise = stripePromise || loadStripe(key);
  const stripe = await stripePromise;
  if (!stripe) throw new Error("Stripe failed to initialize");
  const { error } = await stripe.redirectToCheckout({ sessionId: data.id });
  if (error) throw error;
};

export const getCheckoutStatus = async (sessionId) => api(`/api/checkout-status?session_id=${encodeURIComponent(sessionId)}`);

export const claimEntitlement = async (sessionId) => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("Please log in to claim this purchase.");
  return api("/api/claim-entitlement", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ session_id: sessionId }),
  });
};

export const loadEntitlement = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("billing_entitlements")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return null;
  return data;
};
