-- PPID staff access is independent from the legacy global user.role column.
create table if not exists ppid.staff_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  role text not null check (role in ('content_editor', 'ppid_officer', 'reviewer', 'ppid_supervisor', 'administrator', 'auditor')),
  unit_scope text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, role, unit_scope)
);

create index if not exists staff_memberships_active_user_idx
  on ppid.staff_memberships (user_id) where is_active;

create table if not exists ppid.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id text references public."user"(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  request_id uuid not null default gen_random_uuid(),
  change_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (jsonb_typeof(change_summary) = 'object')
);

create index if not exists audit_logs_resource_idx
  on ppid.audit_logs (resource_type, resource_id, created_at desc);
create index if not exists audit_logs_actor_idx
  on ppid.audit_logs (actor_user_id, created_at desc);

alter table ppid.staff_memberships enable row level security;
alter table ppid.audit_logs enable row level security;
revoke all on ppid.staff_memberships, ppid.audit_logs from public;

