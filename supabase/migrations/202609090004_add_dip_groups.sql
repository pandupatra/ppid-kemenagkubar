-- DIP groups are managed taxonomy. The legacy thematic_group value is retained
-- for compatibility, but group_id is the canonical assignment.
create table if not exists ppid.dip_groups (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z][A-Z0-9_-]{0,11}$'),
  title text not null check (length(btrim(title)) > 0),
  display_order integer not null unique check (display_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into ppid.dip_groups (code, title, display_order)
values
  ('A', 'Informasi Profil dan Organisasi', 1),
  ('B', 'Informasi Program Kegiatan dan Kinerja', 2),
  ('C', 'Informasi Pelayanan', 3),
  ('D', 'Informasi yang Berdampak kepada Masyarakat', 4),
  ('E', 'Informasi Permintaan, Keberatan dan Tata Cara', 5),
  ('F', 'Informasi Layanan Informasi Publik', 6)
on conflict (code) do nothing;

alter table ppid.dip_items
  add column if not exists group_id uuid;

-- The existing public view references thematic_group. It must be replaced
-- before altering that legacy column's type.
drop view if exists ppid.public_dip_items;

alter table ppid.dip_items
  drop constraint if exists dip_items_thematic_group_check,
  drop constraint if exists dip_items_thematic_group_group_order_key;

alter table ppid.dip_items
  alter column thematic_group type text using thematic_group::text;

update ppid.dip_items item
set group_id = dip_group.id
from ppid.dip_groups dip_group
where item.group_id is null and item.thematic_group = dip_group.code;

alter table ppid.dip_items
  alter column group_id set not null,
  add constraint dip_items_group_id_fkey
    foreign key (group_id) references ppid.dip_groups(id),
  add constraint dip_items_group_order_key unique (group_id, group_order);

create index if not exists dip_items_group_id_idx on ppid.dip_items (group_id);
create index if not exists dip_items_public_group_filter_idx
  on ppid.dip_items (publication_state, group_id, group_order);

create or replace view ppid.public_dip_items as
select d.id, d.slug, d.group_id, dip_group.code as group_code,
  dip_group.title as group_title, dip_group.display_order as group_display_order,
  d.group_order, d.disclosure_category, d.official_title,
  d.source_decision_number, d.source_decision_date, d.owner_unit, d.document_year,
  d.keywords, d.published_at,
  case when d.disclosure_category = 'excluded' then null else d.document_id end as document_id,
  case when d.disclosure_category = 'excluded' then null else doc.slug end as document_slug,
  case when d.disclosure_category = 'excluded' then null else version.storage_path end as public_storage_path,
  case when d.disclosure_category = 'excluded' then null else doc.description end as description
from ppid.dip_items d
join ppid.dip_groups dip_group on dip_group.id = d.group_id
left join ppid.documents doc on doc.id = d.document_id and doc.publication_state = 'published'
left join ppid.document_versions version on version.id = doc.active_version_id
  and version.storage_bucket = 'ppid-public-documents'
  and version.approval_state = 'approved'
  and version.scan_state = 'accepted'
where d.publication_state = 'published';
