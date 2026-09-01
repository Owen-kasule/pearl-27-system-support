-- Pearl 27 System Support: database, authorization, and private storage schema.

create type public.ticket_status as enum ('SUBMITTED', 'IN_PROGRESS', 'RESOLVED');
create type public.support_role as enum ('ADMIN', 'DEVELOPER');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.support_role not null,
  created_at timestamptz not null default now()
);

create sequence public.ticket_number_seq start with 1 increment by 1 no cycle;

create table public.tickets (
  id uuid primary key,
  ticket_number text unique not null check (ticket_number ~ '^P27-[0-9]{6,}$'),
  employee_name text not null check (char_length(employee_name) between 1 and 100),
  employee_email text not null check (char_length(employee_email) between 3 and 254),
  issue_title text not null check (char_length(issue_title) between 1 and 160),
  issue_description text not null check (char_length(issue_description) between 1 and 5000),
  attachment_path text,
  attachment_name text,
  attachment_type text check (attachment_type is null or attachment_type in ('image/png', 'image/jpeg', 'image/webp', 'application/pdf')),
  attachment_size integer check (attachment_size is null or attachment_size between 1 and 5242880),
  status public.ticket_status not null default 'SUBMITTED',
  resolution_notes text check (resolution_notes is null or char_length(resolution_notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id),
  constraint resolved_requires_notes check (status <> 'RESOLVED' or (resolution_notes is not null and char_length(trim(resolution_notes)) > 0)),
  constraint attachment_metadata_consistent check (
    (attachment_path is null and attachment_name is null and attachment_type is null and attachment_size is null)
    or
    (attachment_path is not null and attachment_name is not null and attachment_type is not null and attachment_size is not null)
  )
);

create index tickets_created_at_idx on public.tickets (created_at desc);
create index tickets_status_created_at_idx on public.tickets (status, created_at desc);
create index tickets_employee_email_idx on public.tickets (lower(employee_email));

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tickets_set_updated_at before update on public.tickets
for each row execute function public.set_updated_at();

create or replace function public.is_support_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('ADMIN', 'DEVELOPER')
  );
$$;

revoke all on function public.is_support_user() from public;
grant execute on function public.is_support_user() to authenticated;

create or replace function public.next_ticket_number()
returns text
language sql
security definer
set search_path = ''
as $$
  select 'P27-' || lpad(nextval('public.ticket_number_seq')::text, 6, '0');
$$;

revoke all on function public.next_ticket_number() from public, anon, authenticated;
grant execute on function public.next_ticket_number() to service_role;

create or replace function public.update_ticket_status(
  p_ticket_number text,
  p_status public.ticket_status,
  p_resolution_notes text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_ticket public.tickets%rowtype;
  did_resolve boolean;
begin
  if not public.is_support_user() then
    raise exception 'not authorized';
  end if;

  select * into current_ticket from public.tickets
  where ticket_number = p_ticket_number
  for update;

  if not found then raise exception 'ticket not found'; end if;
  if p_status = 'RESOLVED' and nullif(trim(p_resolution_notes), '') is null then
    raise exception 'resolution notes required';
  end if;

  did_resolve := current_ticket.status <> 'RESOLVED' and p_status = 'RESOLVED';

  update public.tickets set
    status = p_status,
    resolution_notes = case when p_status = 'RESOLVED' then trim(p_resolution_notes) else resolution_notes end,
    resolved_at = case when p_status = 'RESOLVED' then coalesce(resolved_at, now()) else null end,
    resolved_by = case when p_status = 'RESOLVED' then coalesce(resolved_by, auth.uid()) else null end
  where id = current_ticket.id;

  return did_resolve;
end;
$$;

revoke all on function public.update_ticket_status(text, public.ticket_status, text) from public, anon;
grant execute on function public.update_ticket_status(text, public.ticket_status, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.tickets enable row level security;

create policy "Support users can read their profile"
on public.profiles for select to authenticated
using (id = auth.uid() and public.is_support_user());

create policy "Support users can read tickets"
on public.tickets for select to authenticated
using (public.is_support_user());

create policy "Support users can update tickets"
on public.tickets for update to authenticated
using (public.is_support_user())
with check (public.is_support_user());

-- No anon ticket policies are created. Public submission is only through the
-- validated server route, which uses the service role key.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-attachments',
  'support-attachments',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Support users can view attachments"
on storage.objects for select to authenticated
using (bucket_id = 'support-attachments' and public.is_support_user());

-- Uploads and cleanup are performed only by the server-side service role.

comment on table public.tickets is 'Employee Sphere support requests managed by Pearl 27 System Support.';
comment on function public.next_ticket_number() is 'Generates concurrency-safe user-facing P27 ticket numbers for the server submission route.';
