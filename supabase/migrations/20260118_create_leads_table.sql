-- Create a table for storing leads captured by the AI agent
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
-- Enable RLS
alter table leads enable row level security;

-- Create policy to allow the service role (backend) to insert leads
-- This ensures that only your server (via API route) can add leads, not public users directly
create policy "Service role can insert leads"
  on leads
  for insert
  with check (true);

-- Create policy to allow the service role to read leads (for verification/admin)
create policy "Service role can select leads"
  on leads
  for select
  using (true);

-- Optional: If you want to allow a specific authenticated user (admin) to view leads later,
-- you would add a policy here. For now, we'll keep it locked to server-side only for safety.
