import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
};

export const stripe = new Stripe(required("STRIPE_SECRET_KEY"));

export const supabaseAdmin = createClient(
  required("VITE_SUPABASE_URL"),
  required("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

export const json = (res, status, body) => {
  res.status(status).setHeader("Content-Type", "application/json");
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  res.end(JSON.stringify(body));
};

export const readRawBody = async (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
