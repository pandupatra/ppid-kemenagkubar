-- A policy-controlled calendar date for document publication.
alter table ppid.documents
  add column if not exists publish_date date;

create index if not exists documents_publication_state_publish_date_idx
  on ppid.documents (publication_state, publish_date desc);
