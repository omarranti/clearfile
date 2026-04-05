-- Migration: Switch from subscription model to $0.99 one-time lifetime purchase
-- Date: 2026-04-05

-- Add lifetime access columns to profiles
alter table public.profiles
  add column if not exists has_lifetime_access boolean not null default false,
  add column if not exists lifetime_purchase_date timestamptz,
  add column if not exists stripe_payment_intent_id text;

-- Drop old billing columns from profiles if they exist
alter table public.profiles
  drop column if exists subscription_status,
  drop column if exists stripe_customer_id,
  drop column if exists plan,
  drop column if exists tier;

-- RLS: users can read their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- RLS: only service role can update has_lifetime_access (set by webhook)
drop policy if exists "Service role updates lifetime access" on public.profiles;
create policy "Service role updates lifetime access"
  on public.profiles for update
  using (auth.role() = 'service_role');
