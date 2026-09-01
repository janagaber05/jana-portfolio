-- CMS features: draft/publish, revisions, activity, contact inbox, analytics top pages

create table if not exists site_content_revisions (
  id bigint generated always as identity primary key,
  content jsonb not null,
  label text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists cms_activity_log (
  id bigint generated always as identity primary key,
  action text not null,
  detail text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists contact_submissions (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists site_content_revisions_created_at_idx
  on site_content_revisions (created_at desc);

create index if not exists cms_activity_log_created_at_idx
  on cms_activity_log (created_at desc);

create index if not exists contact_submissions_created_at_idx
  on contact_submissions (created_at desc);

alter table site_content_revisions enable row level security;
alter table cms_activity_log enable row level security;
alter table contact_submissions enable row level security;

drop policy if exists site_content_revisions_select on site_content_revisions;
drop policy if exists site_content_revisions_insert on site_content_revisions;
drop policy if exists cms_activity_log_select on cms_activity_log;
drop policy if exists cms_activity_log_insert on cms_activity_log;
drop policy if exists contact_submissions_insert on contact_submissions;
drop policy if exists contact_submissions_select on contact_submissions;
drop policy if exists contact_submissions_update on contact_submissions;

create policy site_content_revisions_select on site_content_revisions
  for select to authenticated using (true);

create policy site_content_revisions_insert on site_content_revisions
  for insert to authenticated with check (true);

create policy cms_activity_log_select on cms_activity_log
  for select to authenticated using (true);

create policy cms_activity_log_insert on cms_activity_log
  for insert to authenticated with check (auth.uid() = created_by);

create policy contact_submissions_insert on contact_submissions
  for insert to anon, authenticated with check (true);

create policy contact_submissions_select on contact_submissions
  for select to authenticated using (true);

create policy contact_submissions_update on contact_submissions
  for update to authenticated using (true) with check (true);

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
    ),
    'top_pages', coalesce((
      select json_agg(row_to_json(t))
      from (
        select path, count(*)::int as views
        from analytics_page_views
        where created_at >= now_ts - interval '30 days'
        group by path
        order by views desc
        limit 10
      ) t
    ), '[]'::json)
  );
end;
$$;

grant execute on function get_site_analytics() to authenticated;
