create table if not exists analytics_page_views (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  session_id uuid not null,
  path text not null default '/',
  created_at timestamptz not null default now()
);

create table if not exists analytics_presence (
  session_id uuid primary key,
  visitor_id uuid not null,
  path text not null default '/',
  last_seen timestamptz not null default now()
);

create index if not exists analytics_page_views_created_at_idx
  on analytics_page_views (created_at desc);

create index if not exists analytics_page_views_visitor_id_idx
  on analytics_page_views (visitor_id);

create index if not exists analytics_presence_last_seen_idx
  on analytics_presence (last_seen desc);

alter table analytics_page_views enable row level security;
alter table analytics_presence enable row level security;

drop policy if exists analytics_page_views_insert on analytics_page_views;
drop policy if exists analytics_page_views_select on analytics_page_views;
drop policy if exists analytics_presence_insert on analytics_presence;
drop policy if exists analytics_presence_update on analytics_presence;
drop policy if exists analytics_presence_select on analytics_presence;

create policy analytics_page_views_insert on analytics_page_views
  for insert to anon, authenticated
  with check (true);

create policy analytics_page_views_select on analytics_page_views
  for select to authenticated
  using (true);

create policy analytics_presence_insert on analytics_presence
  for insert to anon, authenticated
  with check (true);

create policy analytics_presence_update on analytics_presence
  for update to anon, authenticated
  using (true)
  with check (true);

create policy analytics_presence_select on analytics_presence
  for select to authenticated
  using (true);

create or replace function get_site_analytics()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  now_ts timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;

  delete from analytics_presence
  where last_seen < now_ts - interval '1 day';

  return json_build_object(
    'live', (
      select count(*)::int
      from analytics_presence
      where last_seen > now_ts - interval '2 minutes'
    ),
    'yesterday', (
      select count(distinct visitor_id)::int
      from analytics_page_views
      where created_at >= date_trunc('day', now_ts - interval '1 day')
        and created_at < date_trunc('day', now_ts)
    ),
    'last_7_days', (
      select count(distinct visitor_id)::int
      from analytics_page_views
      where created_at >= now_ts - interval '7 days'
    ),
    'last_30_days', (
      select count(distinct visitor_id)::int
      from analytics_page_views
      where created_at >= now_ts - interval '30 days'
    ),
    'last_6_months', (
      select count(distinct visitor_id)::int
      from analytics_page_views
      where created_at >= now_ts - interval '6 months'
    ),
    'last_year', (
      select count(distinct visitor_id)::int
      from analytics_page_views
      where created_at >= now_ts - interval '1 year'
    )
  );
end;
$$;

grant execute on function get_site_analytics() to authenticated;
