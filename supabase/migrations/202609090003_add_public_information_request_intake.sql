-- Public intake is deliberately server-only. The receipt number is a
-- high-entropy bearer identifier used solely for applicant self-tracking.
create table if not exists ppid.information_requests (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null unique,
  status text not null default 'submitted'
    check (status in ('submitted', 'needs_correction', 'verified', 'assigned', 'in_progress', 'extended', 'fulfilled', 'partially_fulfilled', 'rejected', 'withdrawn', 'closed')),
  requested_title text not null,
  requested_detail text not null,
  intended_use text not null,
  information_period text,
  requested_format text not null,
  delivery_method text not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(receipt_number) between 20 and 64),
  check (char_length(requested_title) between 3 and 500),
  check (char_length(requested_detail) between 10 and 5000),
  check (char_length(intended_use) between 3 and 2000)
);

create table if not exists ppid.request_applicants (
  id uuid primary key default gen_random_uuid(),
  information_request_id uuid not null unique references ppid.information_requests(id) on delete restrict,
  full_name text not null,
  applicant_type text not null check (applicant_type in ('individual', 'community_group', 'legal_entity', 'organization')),
  address text not null,
  whatsapp_number text not null,
  email text,
  created_at timestamptz not null default now(),
  check (char_length(full_name) between 2 and 200),
  check (char_length(address) between 10 and 2000),
  check (char_length(whatsapp_number) between 8 and 32),
  check (email is null or char_length(email) <= 320)
);

create table if not exists ppid.request_events (
  id uuid primary key default gen_random_uuid(),
  information_request_id uuid not null references ppid.information_requests(id) on delete restrict,
  actor_user_id text references public."user"(id) on delete set null,
  event_type text not null check (event_type in ('submitted', 'status_changed', 'assigned', 'response_recorded')),
  event_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (jsonb_typeof(event_summary) = 'object')
);

create index if not exists information_requests_status_submitted_idx
  on ppid.information_requests (status, submitted_at desc);
create index if not exists request_events_request_created_idx
  on ppid.request_events (information_request_id, created_at);

alter table ppid.information_requests enable row level security;
alter table ppid.request_applicants enable row level security;
alter table ppid.request_events enable row level security;
revoke all on ppid.information_requests, ppid.request_applicants, ppid.request_events from public;
