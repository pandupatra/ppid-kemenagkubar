-- Objection attachments remain private in ppid-quarantine for PPID review.
create table if not exists ppid.information_objections (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null unique,
  full_name text not null,
  address text not null,
  whatsapp_number text not null,
  email text,
  applicant_status text not null check (applicant_status in ('individual', 'legal_entity', 'group_or_organization', 'other')),
  request_date date not null,
  requested_information text not null,
  request_channel text not null check (request_channel in ('email', 'whatsapp', 'social_media', 'in_person')),
  objection_reasons text[] not null,
  other_reason text,
  objection_detail text not null,
  expected_response text not null,
  attachment_bucket text not null default 'ppid-quarantine',
  attachment_path text not null,
  attachment_name text not null,
  attachment_content_type text not null check (attachment_content_type in ('application/pdf', 'image/png')),
  attachment_byte_size bigint not null check (attachment_byte_size between 1 and 15728640),
  attachment_sha256 text not null,
  status text not null default 'submitted',
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(receipt_number) between 20 and 64),
  check (char_length(full_name) between 2 and 200),
  check (char_length(address) between 10 and 2000),
  check (char_length(whatsapp_number) between 8 and 32),
  check (email is null or char_length(email) <= 320),
  check (cardinality(objection_reasons) > 0),
  check (char_length(requested_information) between 3 and 5000),
  check (char_length(objection_detail) between 10 and 5000),
  check (char_length(expected_response) between 3 and 2000),
  check (attachment_bucket = 'ppid-quarantine'),
  check (char_length(attachment_sha256) = 64)
);

create index if not exists information_objections_status_submitted_idx
  on ppid.information_objections (status, submitted_at desc);

alter table ppid.information_objections enable row level security;
revoke all on ppid.information_objections from public;
