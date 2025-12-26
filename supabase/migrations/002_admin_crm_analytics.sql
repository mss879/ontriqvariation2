-- Analytics helpers for admin dashboard
-- Apply after 001_admin_crm.sql

-- Helpful indexes
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_converted_idx on public.inquiries (converted_to_lead);

create index if not exists crm_leads_created_at_idx on public.crm_leads (created_at desc);
create index if not exists crm_leads_stage_id_idx on public.crm_leads (stage_id);

-- Optional: monthly inquiry counts (admins only due to inquiries RLS)
create or replace view public.inquiries_monthly_counts as
select
  date_trunc('month', created_at)::date as month,
  count(*)::int as inquiry_count
from public.inquiries
group by 1
order by 1;
