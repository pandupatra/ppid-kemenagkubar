-- Metadata required to validate, retain, and audit uploaded PPID documents.
alter table ppid.documents
  add column if not exists description text not null default '',
  add column if not exists document_number text,
  add column if not exists language text not null default 'id',
  add column if not exists created_by text references public."user"(id);

alter table ppid.document_versions
  add column if not exists original_filename text,
  add column if not exists content_type text,
  add column if not exists byte_size bigint,
  add column if not exists sha256 text,
  add column if not exists uploaded_by text references public."user"(id),
  add constraint document_versions_byte_size_check
    check (byte_size is null or byte_size > 0) not valid;

alter table ppid.document_versions
  validate constraint document_versions_byte_size_check;

create index if not exists documents_publication_state_created_at_idx
  on ppid.documents (publication_state, created_at desc);
create index if not exists document_versions_document_id_created_at_idx
  on ppid.document_versions (document_id, created_at desc);

insert into ppid.document_categories (slug, title)
values
  ('periodic', 'Informasi Berkala'),
  ('immediate', 'Informasi Serta-Merta'),
  ('available-anytime', 'Informasi Setiap Saat'),
  ('dip', 'Daftar Informasi Publik'),
  ('regulation', 'Regulasi'),
  ('service-standard', 'Standar Layanan'),
  ('service-report', 'Laporan Layanan')
on conflict (slug) do nothing;
