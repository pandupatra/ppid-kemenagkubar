alter table ppid.request_applicants
  drop constraint if exists request_applicants_applicant_type_check;

alter table ppid.request_applicants
  add column if not exists applicant_type_other text,
  add constraint request_applicants_applicant_type_check
    check (applicant_type in ('individual', 'community_group', 'legal_entity', 'organization', 'other')),
  add constraint request_applicants_other_type_check
    check (
      (applicant_type = 'other' and char_length(applicant_type_other) between 2 and 200)
      or (applicant_type <> 'other' and applicant_type_other is null)
    );

create table if not exists ppid.request_attachments (
  id uuid primary key default gen_random_uuid(),
  information_request_id uuid not null references ppid.information_requests(id) on delete restrict,
  attachment_kind text not null check (attachment_kind in ('identity', 'authorization')),
  storage_bucket text not null default 'ppid-quarantine',
  storage_path text not null unique,
  original_filename text not null,
  content_type text not null check (content_type in ('application/pdf', 'image/png')),
  byte_size bigint not null check (byte_size between 1 and 15728640),
  sha256 text not null,
  scan_state text not null default 'pending' check (scan_state in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  unique (information_request_id, attachment_kind),
  check (storage_bucket = 'ppid-quarantine'),
  check (char_length(sha256) = 64)
);

create index if not exists request_attachments_request_idx
  on ppid.request_attachments (information_request_id);

alter table ppid.request_attachments enable row level security;
revoke all on ppid.request_attachments from public;
