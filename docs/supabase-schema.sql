-- Taxed HQ: Supabase schema + RLS policies
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- 1) Profiles table (1 row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Projects table (stores scenario payloads)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'latest_scenario',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists projects_user_id_idx on public.projects(user_id);

-- 3) updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- 4) Enable RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;

-- 5) Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 6) Projects policies
drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
on public.projects
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
on public.projects
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
on public.projects
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
on public.projects
for delete
to authenticated
using (auth.uid() = user_id);

-- 7) Billing tables
create table if not exists public.billing_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  stripe_customer_id text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_customers_email_idx on public.billing_customers(lower(email));

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  stripe_customer_id text not null,
  stripe_subscription_id text unique not null,
  stripe_price_id text not null,
  plan_tier text not null check (plan_tier in ('full', 'pro')),
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  min_commitment_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_user_id_idx on public.billing_subscriptions(user_id);
create index if not exists billing_subscriptions_email_idx on public.billing_subscriptions(lower(email));

create table if not exists public.billing_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_access boolean not null default false,
  pro_ai boolean not null default false,
  status text not null default 'inactive',
  source_subscription_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_guest_access (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text unique not null,
  email text not null,
  plan_tier text not null check (plan_tier in ('full', 'pro')),
  status text not null default 'active',
  expires_at timestamptz not null default (now() + interval '7 days'),
  claimed_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_guest_access_email_idx on public.billing_guest_access(lower(email));

drop trigger if exists billing_customers_set_updated_at on public.billing_customers;
create trigger billing_customers_set_updated_at
before update on public.billing_customers
for each row execute function public.set_updated_at();

drop trigger if exists billing_subscriptions_set_updated_at on public.billing_subscriptions;
create trigger billing_subscriptions_set_updated_at
before update on public.billing_subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists billing_guest_access_set_updated_at on public.billing_guest_access;
create trigger billing_guest_access_set_updated_at
before update on public.billing_guest_access
for each row execute function public.set_updated_at();

drop trigger if exists billing_entitlements_set_updated_at on public.billing_entitlements;
create trigger billing_entitlements_set_updated_at
before update on public.billing_entitlements
for each row execute function public.set_updated_at();

-- 8) Enable RLS for billing tables
alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_entitlements enable row level security;
alter table public.billing_guest_access enable row level security;

-- 9) Billing policies (user-owned reads only)
drop policy if exists "billing_customers_select_own" on public.billing_customers;
create policy "billing_customers_select_own"
on public.billing_customers
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "billing_subscriptions_select_own" on public.billing_subscriptions;
create policy "billing_subscriptions_select_own"
on public.billing_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "billing_entitlements_select_own" on public.billing_entitlements;
create policy "billing_entitlements_select_own"
on public.billing_entitlements
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "billing_entitlements_upsert_own" on public.billing_entitlements;
create policy "billing_entitlements_upsert_own"
on public.billing_entitlements
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "billing_entitlements_update_own" on public.billing_entitlements;
create policy "billing_entitlements_update_own"
on public.billing_entitlements
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "billing_guest_access_select_claimed" on public.billing_guest_access;
create policy "billing_guest_access_select_claimed"
on public.billing_guest_access
for select
to authenticated
using (auth.uid() = claimed_by_user_id);
