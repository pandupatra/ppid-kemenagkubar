alter table ppid.dip_items add column if not exists slug text;
update ppid.dip_items
set slug = trim(both '-' from regexp_replace(lower(official_title), '[^a-z0-9]+', '-', 'g'))
where slug is null;
alter table ppid.dip_items alter column slug set not null;
create unique index if not exists dip_items_slug_idx on ppid.dip_items (slug);

create or replace view ppid.public_dip_items as
select d.id, d.thematic_group, d.group_order, d.disclosure_category, d.official_title,
  d.source_decision_number, d.source_decision_date, d.owner_unit, d.document_year, d.keywords,
  d.published_at, case when d.disclosure_category = 'excluded' then null else d.document_id end as document_id,
  case when d.disclosure_category = 'excluded' then null else doc.slug end as document_slug,
  d.slug,
  case when d.disclosure_category = 'excluded' then null else version.storage_path end as public_storage_path
from ppid.dip_items d
left join ppid.documents doc on doc.id = d.document_id and doc.publication_state = 'published'
left join ppid.document_versions version on version.id = doc.active_version_id
  and version.storage_bucket = 'ppid-public-documents'
  and version.approval_state = 'approved'
  and version.scan_state = 'accepted'
where d.publication_state = 'published';
