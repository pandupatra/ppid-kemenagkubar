-- SOP and policy files are managed independently from the DIP register, while
-- retaining the same reviewed document and audit trail used elsewhere.
create table if not exists ppid.service_standard_documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('sop', 'policy')),
  title text not null,
  fallback_path text,
  document_id uuid references ppid.documents(id),
  display_order integer not null check (display_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, display_order)
);

create index if not exists service_standard_documents_kind_order_idx
  on ppid.service_standard_documents (kind, display_order);

insert into ppid.service_standard_documents (kind, title, fallback_path, display_order)
values
  ('sop', 'SOP Monitoring dan Evaluasi Pelayanan Publik', '/standar-layanan-files/sop/1-sop-monitoring-dan-evaluasi-pelayanan-publik.pdf', 1),
  ('sop', 'SOP Pengelolaan Pelayanan Informasi', '/standar-layanan-files/sop/10-sop-pengelolaan-pelayanan-informasi.pdf', 2),
  ('sop', 'SOP Penetapan dan Pemutakhiran Daftar Informasi Publik', '/standar-layanan-files/sop/11-sop-penetapan-dan-pemutakhiran-daftar-informasi-publik.pdf', 3),
  ('sop', 'SOP Pendokumentasian Informasi Publik', '/standar-layanan-files/sop/2-sop-pendokumentasian-informasi-publik.pdf', 4),
  ('sop', 'SOP Pendokumentasian Informasi yang Dikecualikan', '/standar-layanan-files/sop/3-sop-pendokumentasian-informasi-yang-dikecualikan.pdf', 5),
  ('sop', 'SOP Pengelolaan Pengaduan Keberatan Informasi', '/standar-layanan-files/sop/4-sop-pengelolaan-pengaduan-keberatan-informasi.pdf', 6),
  ('sop', 'SOP Monitoring dan Evaluasi Pelayanan Publik', '/standar-layanan-files/sop/5-sop-monitoring-dan-evaluasi-pelayanan-publik.pdf', 7),
  ('sop', 'SOP Koordinasi Penilaian Kepatuhan Pelayanan Publik', '/standar-layanan-files/sop/6-sop-koordinasi-penilaian-kepatuhan-pelayanan-publik.pdf', 8),
  ('sop', 'SOP Monitoring dan Evaluasi Keterbukaan Informasi Publik', '/standar-layanan-files/sop/7-sop-monitoring-dan-evaluasi-keterbukaan-informasi-publik.pdf', 9),
  ('sop', 'SOP Penanganan Sengketa Informasi', '/standar-layanan-files/sop/8-sop-penanganan-sengketa-informasi.pdf', 10),
  ('sop', 'SOP Pengelolaan Data Publikasi PPID pada Website', '/standar-layanan-files/sop/9-sop-pengelolaan-data-publikasi-ppid-pada-website.pdf', 11),
  ('policy', 'Standar Jangka Waktu Pelayanan Informasi Publik (maksimal 3 hari)', '/standar-layanan-files/kebijakan/11-2-21-standar-jangka-waktu-pelayanan-informasi-publik-maksimal-3-hari.pdf', 1),
  ('policy', 'Kebijakan Standar Pelayanan Informasi Publik Tidak Lebih Dari 1 Hari', '/standar-layanan-files/kebijakan/20-kebijakan-standar-pelayanan-informasi-publik-tidak-lebih-dari-1-hari.pdf', 2),
  ('policy', 'Kebijakan Penegakan Disiplin dan Sanksi Internal dalam Pelayanan Informasi Publik', '/standar-layanan-files/kebijakan/23-kebijakan-penegakan-disiplin-dan-sanksi-internal-dalam-pelayanan-informasi-publik.pdf', 3),
  ('policy', 'Kebijakan Penegakan Disiplin dan Sanksi Internal Atasan Badan Publik', '/standar-layanan-files/kebijakan/24-kebijakan-penegakan-disiplin-dan-sanksi-internal-atasan-badan-publik.pdf', 4),
  ('policy', 'Kebijakan Reward Pelaksana Layanan Informasi Publik', '/standar-layanan-files/kebijakan/25-kebijakan-reward-pelaksana-layanan-informasi-publik.pdf', 5),
  ('policy', 'SK Kebijakan 2025', '/standar-layanan-files/kebijakan/5-2-sk-kebijakan-2025.pdf', 6)
on conflict (kind, display_order) do nothing;
