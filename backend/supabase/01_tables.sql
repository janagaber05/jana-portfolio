create table if not exists site_content (
  id text primary key default 'main',
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists projects (
  id text primary key,
  slug text unique not null,
  index_label text,
  title text,
  tag text,
  accent text,
  year text,
  role text,
  client text,
  summary text,
  challenge text,
  outcome text,
  tools text[],
  sort_order integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists case_studies (
  project_slug text primary key references projects(slug) on delete cascade,
  abbreviation text,
  facts jsonb,
  overview jsonb,
  my_role jsonb,
  research jsonb,
  quote jsonb,
  design_process jsonb,
  final_design jsonb,
  outcomes jsonb,
  updated_at timestamptz default now()
);

create index if not exists projects_slug_idx on projects(slug);
create index if not exists projects_sort_order_idx on projects(sort_order);
