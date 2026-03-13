export default function handler(req, res) {
  const sk = process.env.STRIPE_SECRET_KEY || "";
  const pk = process.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
  const priceFull = process.env.STRIPE_PRICE_FULL_MONTHLY || "";
  const pricePro = process.env.STRIPE_PRICE_PRO_MONTHLY || "";

  res.status(200).json({
    STRIPE_SECRET_KEY: sk ? sk.slice(0, 7) + "..." + sk.slice(-4) + " (" + sk.length + " chars)" : "MISSING",
    VITE_STRIPE_PUBLISHABLE_KEY: pk ? pk.slice(0, 7) + "..." + pk.slice(-4) + " (" + pk.length + " chars)" : "MISSING",
    STRIPE_PRICE_FULL_MONTHLY: priceFull || "MISSING",
    STRIPE_PRICE_PRO_MONTHLY: pricePro || "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? "SET" : "MISSING",
    VITE_APP_URL: process.env.VITE_APP_URL || "MISSING",
  });
}
