alter table ppid.documents
  add column if not exists group_id uuid references ppid.dip_groups(id);

create index if not exists documents_group_id_idx
  on ppid.documents (group_id);
