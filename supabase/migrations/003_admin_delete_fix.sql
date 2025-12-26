-- Fix delete behavior between inquiries and CRM leads
--
-- Goals:
-- 1) Admins can DELETE inquiries (RLS policy)
-- 2) Deleting an inquiry deletes its CRM lead (FK ON DELETE CASCADE)
-- 3) Deleting a lead also removes its originating inquiry (trigger)

begin;

-- 1) Allow admins to delete inquiries (RLS)
drop policy if exists "inquiries_delete_admin" on public.inquiries;
create policy "inquiries_delete_admin" on public.inquiries
  for delete
  to authenticated
  using (public.is_admin());

-- 2) Ensure inquiries -> crm_leads relationship cascades so deleting an inquiry also deletes its lead.
-- Default from 001_admin_crm.sql was ON DELETE SET NULL, which leaves orphaned leads.
alter table public.crm_leads
  drop constraint if exists crm_leads_inquiry_id_fkey;

alter table public.crm_leads
  add constraint crm_leads_inquiry_id_fkey
  foreign key (inquiry_id)
  references public.inquiries(id)
  on delete cascade;

-- 3) If an admin deletes a lead directly in CRM, also remove the inquiry so it doesn't reappear.
-- This is implemented as a trigger (not an FK) to avoid cascade cycles (inquiries also reference leads).
create or replace function public.delete_inquiry_when_lead_deleted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.inquiries i
   where i.lead_id = old.id
      or (old.inquiry_id is not null and i.id = old.inquiry_id);

  return old;
end;
$$;

drop trigger if exists crm_leads_delete_inquiry on public.crm_leads;
create trigger crm_leads_delete_inquiry
  after delete on public.crm_leads
  for each row
  execute procedure public.delete_inquiry_when_lead_deleted();

commit;
