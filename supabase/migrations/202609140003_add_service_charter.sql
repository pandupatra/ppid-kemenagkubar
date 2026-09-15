-- Singleton portal content for the public Maklumat Pelayanan poster.
create table if not exists ppid.service_charter (
  id boolean primary key default true check (id),
  alt_text text not null check (char_length(alt_text) between 1 and 240),
  fallback_path text not null default '/maklumat-pelayanan.png',
  storage_bucket text,
  storage_path text,
  original_filename text,
  content_type text check (
    content_type is null or content_type in ('image/png', 'image/jpeg', 'image/webp')
  ),
  byte_size bigint check (byte_size is null or byte_size between 1 and 8388608),
  updated_by text references public."user"(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (storage_bucket is null and storage_path is null)
    or (storage_bucket is not null and storage_path is not null)
  )
);

insert into ppid.service_charter (id, alt_text)
values (
  true,
  'Maklumat Pelayanan Kantor Kementerian Agama Kabupaten Kutai Barat'
)
on conflict (id) do nothing;
