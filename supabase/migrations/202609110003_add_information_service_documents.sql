create table if not exists ppid.information_service_documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('procedure', 'announcement')),
  title text not null,
  document_id uuid references ppid.documents(id),
  display_order integer not null check (display_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, display_order)
);

create index if not exists information_service_documents_kind_order_idx
  on ppid.information_service_documents (kind, display_order);

insert into ppid.information_service_documents (kind, title, display_order)
values
  ('procedure', 'Alur Permintaan Informasi Publik', 1),
  ('procedure', 'Tata Cara Pengajuan Keberatan', 2),
  ('procedure', 'Tata Cara Pengaduan Penyalahgunaan Wewenang oleh Pejabat', 3),
  ('announcement', 'Standar Pengumuman', 1),
  ('announcement', 'Standar Permintaan Informasi Publik', 2),
  ('announcement', 'Standar Penetapan dan Pemutakhiran Daftar Informasi Publik', 3),
  ('announcement', 'Standar Pendokumentasian Informasi', 4)
on conflict (kind, display_order) do nothing;
