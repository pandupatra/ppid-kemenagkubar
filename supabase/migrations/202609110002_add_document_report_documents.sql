-- A separate collection keeps reports out of the DIP register while reusing
-- the reviewed document/version lifecycle and public storage bucket.
create table if not exists ppid.document_report_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  document_id uuid references ppid.documents(id),
  display_order integer not null check (display_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (display_order)
);

create index if not exists document_report_documents_order_idx
  on ppid.document_report_documents (display_order);

insert into ppid.document_categories (slug, title)
values ('document-report', 'Dokumen dan Laporan')
on conflict (slug) do nothing;

insert into ppid.document_report_documents (title, display_order)
values
  ('DIPA 2026', 1),
  ('Rencana Kerja Kemenag Kutai Barat 2026', 2),
  ('Agenda Penting Kemenag 2025', 3),
  ('Laporan Capaian Kinerja Triwulan IV Kemenag Kutai Barat', 4),
  ('Neraca', 5),
  ('Laporan Keuangan UAKPA 2025', 6),
  ('Perjanjian Kinerja Kemenag Kutai Barat', 7),
  ('Rekapan Data Informasi Publik yang Diterima', 8),
  ('Laporan Realisasi Anggaran 2025', 9),
  ('Rencana Strategis', 10)
on conflict (display_order) do nothing;
