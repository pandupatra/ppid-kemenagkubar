-- Singleton content for the public Kementerian Agama profile page.
create table if not exists ppid.ministry_profile (
  id boolean primary key default true check (id),
  organization_chart_alt text not null check (
    char_length(organization_chart_alt) between 1 and 240
  ),
  storage_bucket text,
  storage_path text,
  original_filename text,
  content_type text check (
    content_type is null or content_type in ('image/png', 'image/jpeg', 'image/webp')
  ),
  byte_size bigint check (byte_size is null or byte_size between 1 and 8388608),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (storage_bucket is null and storage_path is null)
    or (storage_bucket is not null and storage_path is not null)
  )
);

insert into ppid.ministry_profile (id, organization_chart_alt)
values (
  true,
  'Struktur Organisasi Kantor Kementerian Agama Kabupaten Kutai Barat'
)
on conflict (id) do nothing;
