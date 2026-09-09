-- PPID canonical public-information register. Source decision: 318/2026, 2026-09-01.
create extension if not exists pgcrypto;
create schema if not exists ppid;

create table if not exists ppid.document_categories (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  title text not null, created_at timestamptz not null default now()
);
create table if not exists ppid.documents (
  id uuid primary key default gen_random_uuid(), category_id uuid references ppid.document_categories(id),
  slug text not null unique, title text not null, owner_unit text, document_year integer,
  keywords text[] not null default '{}', publication_state text not null default 'draft'
    check (publication_state in ('draft','in_review','published','archived')),
  active_version_id uuid, created_at timestamptz not null default now(), published_at timestamptz
);
create table if not exists ppid.document_versions (
  id uuid primary key default gen_random_uuid(), document_id uuid not null references ppid.documents(id),
  storage_bucket text not null, storage_path text not null, scan_state text not null default 'pending'
    check (scan_state in ('pending','accepted','rejected')),
  approval_state text not null default 'draft' check (approval_state in ('draft','approved','rejected')),
  created_at timestamptz not null default now(), unique (storage_bucket, storage_path)
);
alter table ppid.documents drop constraint if exists documents_active_version_id_fkey;
alter table ppid.documents add constraint documents_active_version_id_fkey foreign key (active_version_id) references ppid.document_versions(id);
create table if not exists ppid.publication_reviews (
  id uuid primary key default gen_random_uuid(), document_id uuid references ppid.documents(id),
  document_version_id uuid references ppid.document_versions(id), decision text not null check (decision in ('approved','rejected')),
  public_summary text, decided_at timestamptz not null default now()
);
create table if not exists ppid.dip_items (
  id uuid primary key default gen_random_uuid(), thematic_group char(1) not null check (thematic_group in ('A','B','C','D','E','F')),
  slug text,
  group_order integer not null check (group_order > 0), disclosure_category text not null
    check (disclosure_category in ('periodic','available_anytime','immediate','excluded')),
  official_title text not null, source_decision_number text not null, source_decision_date date not null,
  publication_state text not null default 'published' check (publication_state in ('draft','published','archived')),
  document_id uuid references ppid.documents(id), page_id uuid, owner_unit text,
  document_year integer, keywords text[] not null default '{}', published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (thematic_group, group_order), unique (official_title, source_decision_number)
);
create index if not exists dip_items_public_filter_idx on ppid.dip_items (publication_state, disclosure_category, thematic_group, group_order);
create index if not exists dip_items_owner_year_idx on ppid.dip_items (owner_unit, document_year);
create index if not exists documents_public_filter_idx on ppid.documents (publication_state, category_id, document_year);

-- Public metadata view: never joins excluded records to a source file.
create or replace view ppid.public_dip_items as
select d.id, d.slug, d.thematic_group, d.group_order, d.disclosure_category, d.official_title,
  d.source_decision_number, d.source_decision_date, d.owner_unit, d.document_year, d.keywords,
  d.published_at, case when d.disclosure_category = 'excluded' then null else d.document_id end as document_id,
  case when d.disclosure_category = 'excluded' then null else doc.slug end as document_slug
from ppid.dip_items d left join ppid.documents doc on doc.id = d.document_id
  and doc.publication_state = 'published'
where d.publication_state = 'published';

with seed(group_code, position, title, category) as (values
('A',1,'Profil Kantor Kementerian Agama Kabupaten Kutai Barat','periodic'),('A',2,'Alamat dan kontak kantor','periodic'),('A',3,'Visi dan misi','periodic'),('A',4,'Tugas dan fungsi','periodic'),('A',5,'Struktur organisasi','periodic'),('A',6,'Profil Kepala Kantor','periodic'),('A',7,'Profil pejabat struktural','periodic'),('A',8,'Profil unit kerja','periodic'),('A',9,'Daftar KUA Kecamatan','periodic'),('A',10,'Daftar madrasah','periodic'),
('B',1,'Rencana kerja tahunan','periodic'),('B',2,'Rencana strategis','periodic'),('B',3,'DIPA','periodic'),('B',4,'RKA-K/L','periodic'),('B',5,'Realisasi anggaran','periodic'),('B',6,'Laporan keuangan','periodic'),('B',7,'Laporan kinerja','periodic'),('B',8,'Laporan tahunan','periodic'),('B',9,'Rencana umum pengadaan','periodic'),('B',10,'Informasi pengadaan barang/jasa','periodic'),('B',11,'Daftar SOP pelayanan','available_anytime'),('B',12,'Standar pelayanan','available_anytime'),('B',13,'Maklumat pelayanan','available_anytime'),('B',14,'Survei Kepuasan Masyarakat (SKM)','periodic'),('B',15,'Hasil evaluasi pelayanan publik','periodic'),
('C',1,'Jenis layanan PTSP','available_anytime'),('C',2,'Persyaratan layanan PTSP','available_anytime'),('C',3,'Mekanisme pelayanan PTSP','available_anytime'),('C',4,'Informasi layanan KUA','available_anytime'),('C',5,'Informasi pencatatan nikah','available_anytime'),('C',6,'Informasi bimbingan perkawinan','available_anytime'),('C',7,'Informasi penyuluhan agama','available_anytime'),('C',8,'Informasi pembinaan madrasah','available_anytime'),('C',9,'Informasi program Seksi Pendidikan Islam','periodic'),('C',10,'Informasi bantuan pendidikan yang dapat diumumkan','periodic'),('C',11,'Informasi program Bimas Islam','periodic'),('C',12,'Informasi pembinaan kerukunan umat beragama','periodic'),('C',13,'Informasi kegiatan penyuluh agama','periodic'),('C',14,'Informasi program bantuan keagamaan','periodic'),
('D',1,'Keputusan Kepala Kantor yang berdampak kepada masyarakat','available_anytime'),('D',2,'Surat edaran yang berdampak kepada masyarakat','available_anytime'),('D',3,'Mekanisme pengaduan masyarakat','available_anytime'),('D',4,'Informasi SP4N-LAPOR!','available_anytime'),('D',5,'Informasi keadaan darurat yang berdampak kepada masyarakat','immediate'),('D',6,'Daftar Informasi Publik (DIP) Kemenag Kutai Barat','available_anytime'),
('E',1,'Formulir permohonan informasi','available_anytime'),('E',2,'Formulir keberatan informasi','available_anytime'),('E',3,'Tata cara permohonan informasi','available_anytime'),('E',4,'Tata cara pengajuan keberatan','available_anytime'),('E',5,'Daftar Informasi yang Dikecualikan berdasarkan hasil uji konsekuensi','excluded'),('E',6,'Daftar SOP PPID','available_anytime'),('E',7,'Laporan layanan informasi publik','periodic'),
('F',1,'Statistik permohonan informasi','periodic'),('F',2,'Statistik keberatan informasi','periodic'),('F',3,'Rekapitulasi pengaduan masyarakat','periodic')
)
insert into ppid.dip_items (thematic_group, group_order, official_title, disclosure_category, source_decision_number, source_decision_date, publication_state, owner_unit, document_year, keywords, published_at)
select group_code, position, title, category, '318 Tahun 2026', date '2026-09-01', 'published', 'Kantor Kementerian Agama Kabupaten Kutai Barat', 2026, array['DIP','Kemenag Kutai Barat'], now() from seed
on conflict (official_title, source_decision_number) do nothing;

do $$ begin
  if (select count(*) from ppid.dip_items where source_decision_number = '318 Tahun 2026') <> 55 then raise exception 'DIP seed count must be 55'; end if;
  if (select count(*) from ppid.dip_items where disclosure_category='periodic' and source_decision_number='318 Tahun 2026') <> 32 then raise exception 'DIP periodic count must be 32'; end if;
  if (select count(*) from ppid.dip_items where disclosure_category='available_anytime' and source_decision_number='318 Tahun 2026') <> 21 then raise exception 'DIP anytime count must be 21'; end if;
end $$;
