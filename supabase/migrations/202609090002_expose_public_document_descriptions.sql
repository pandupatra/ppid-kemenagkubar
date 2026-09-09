-- A published document description is public metadata; excluded records never
-- expose their source document or its description through this view.
create or replace view ppid.public_dip_items as
select d.id, d.thematic_group, d.group_order, d.disclosure_category, d.official_title,
  d.source_decision_number, d.source_decision_date, d.owner_unit, d.document_year, d.keywords,
  d.published_at, case when d.disclosure_category = 'excluded' then null else d.document_id end as document_id,
  case when d.disclosure_category = 'excluded' then null else doc.slug end as document_slug,
  d.slug,
  case when d.disclosure_category = 'excluded' then null else version.storage_path end as public_storage_path,
  case when d.disclosure_category = 'excluded' then null else doc.description end as description
from ppid.dip_items d
left join ppid.documents doc on doc.id = d.document_id and doc.publication_state = 'published'
left join ppid.document_versions version on version.id = doc.active_version_id
  and version.storage_bucket = 'ppid-public-documents'
  and version.approval_state = 'approved'
  and version.scan_state = 'accepted'
where d.publication_state = 'published';
