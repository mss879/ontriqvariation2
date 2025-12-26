-- Admin/CRM schema for Ontriq
-- Apply this in Supabase SQL Editor (in order).

-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

-- Profiles (links auth.users -> app roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_admin = true
  );
$$;

-- First user becomes admin (you said you'll manually create the first user)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  should_be_admin boolean;
begin
  select not exists (select 1 from public.profiles where is_admin = true)
    into should_be_admin;

  insert into public.profiles (id, email, is_admin)
  values (new.id, new.email, should_be_admin)
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Public inquiries (from Contact page)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  message text not null,
  source_url text,
  converted_to_lead boolean not null default false,
  lead_id uuid
);

-- CRM pipelines (stages)
create table if not exists public.crm_stages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  position int not null
);

create unique index if not exists crm_stages_position_unique on public.crm_stages(position);

-- CRM leads
create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stage_id uuid not null references public.crm_stages(id) on delete restrict,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  company text,
  notes text
);

alter table public.inquiries
  add constraint inquiries_lead_id_fkey
  foreign key (lead_id)
  references public.crm_leads(id)
  on delete set null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crm_leads_set_updated_at on public.crm_leads;
create trigger crm_leads_set_updated_at
  before update on public.crm_leads
  for each row execute procedure public.set_updated_at();

-- Seed default stages (minimal)
insert into public.crm_stages (name, position)
select * from (values
  ('New Lead', 1),
  ('Proposal Sent', 2)
) as v(name, position)
where not exists (select 1 from public.crm_stages);

-- RLS
alter table public.profiles enable row level security;
alter table public.inquiries enable row level security;
alter table public.crm_stages enable row level security;
alter table public.crm_leads enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Inquiries policies
-- Public can insert inquiries (Contact form). Nobody can read except admins.
drop policy if exists "inquiries_insert_public" on public.inquiries;
create policy "inquiries_insert_public" on public.inquiries
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "inquiries_select_admin" on public.inquiries;
create policy "inquiries_select_admin" on public.inquiries
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "inquiries_update_admin" on public.inquiries;
create policy "inquiries_update_admin" on public.inquiries
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- CRM policies (admin only)
drop policy if exists "crm_stages_admin_all" on public.crm_stages;
create policy "crm_stages_admin_all" on public.crm_stages
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "crm_leads_admin_all" on public.crm_leads;
create policy "crm_leads_admin_all" on public.crm_leads
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
