-- Security hardening: admin-only CMS writes, constrained public inserts, safer RPCs.
-- Idempotent. Run after 01–09. Does not weaken existing public reads of published content.

-- ---------------------------------------------------------------------------
-- Admins registry (no API policies → inaccessible via PostgREST)
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- Intentionally no policies: only security definer functions can read this table.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Make yourself admin (run once in SQL editor, replace email):
-- insert into public.admins (user_id)
-- select id from auth.users where email = '<MY_EMAIL>';

-- ---------------------------------------------------------------------------
-- site_content / projects / case_studies
-- ---------------------------------------------------------------------------
drop policy if exists site_content_public_read on public.site_content;
drop policy if exists site_content_auth_write on public.site_content;
drop policy if exists site_content_admin_select on public.site_content;
drop policy if exists site_content_admin_insert on public.site_content;
drop policy if exists site_content_admin_update on public.site_content;
drop policy if exists site_content_admin_delete on public.site_content;

-- Public site only sees published content
create policy site_content_public_read on public.site_content
  for select to anon
  using (id = 'main');

create policy site_content_admin_select on public.site_content
  for select to authenticated
  using (public.is_admin());

create policy site_content_admin_insert on public.site_content
  for insert to authenticated
  with check (public.is_admin());

create policy site_content_admin_update on public.site_content
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy site_content_admin_delete on public.site_content
  for delete to authenticated
  using (public.is_admin());

drop policy if exists projects_public_read on public.projects;
drop policy if exists projects_auth_write on public.projects;
drop policy if exists projects_admin_insert on public.projects;
drop policy if exists projects_admin_update on public.projects;
drop policy if exists projects_admin_delete on public.projects;

create policy projects_public_read on public.projects
  for select using (true);

create policy projects_admin_insert on public.projects
  for insert to authenticated
  with check (public.is_admin());

create policy projects_admin_update on public.projects
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy projects_admin_delete on public.projects
  for delete to authenticated
  using (public.is_admin());

drop policy if exists case_studies_public_read on public.case_studies;
drop policy if exists case_studies_auth_write on public.case_studies;
drop policy if exists case_studies_admin_insert on public.case_studies;
drop policy if exists case_studies_admin_update on public.case_studies;
drop policy if exists case_studies_admin_delete on public.case_studies;

create policy case_studies_public_read on public.case_studies
  for select using (true);

create policy case_studies_admin_insert on public.case_studies
  for insert to authenticated
  with check (public.is_admin());

create policy case_studies_admin_update on public.case_studies
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy case_studies_admin_delete on public.case_studies
  for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: portfolio-media
-- ---------------------------------------------------------------------------
update storage.buckets
set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/avif',
    'video/mp4',
    'video/webm',
    'application/pdf'
  ]
where id = 'portfolio-media';

drop policy if exists portfolio_media_public_read on storage.objects;
drop policy if exists portfolio_media_auth_write on storage.objects;
drop policy if exists portfolio_media_admin_insert on storage.objects;
drop policy if exists portfolio_media_admin_update on storage.objects;
drop policy if exists portfolio_media_admin_delete on storage.objects;

create policy portfolio_media_public_read on storage.objects
  for select
  using (bucket_id = 'portfolio-media');

create policy portfolio_media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin());

create policy portfolio_media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin())
  with check (bucket_id = 'portfolio-media' and public.is_admin());

create policy portfolio_media_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- CMS revisions / activity / contact
-- ---------------------------------------------------------------------------
drop policy if exists site_content_revisions_select on public.site_content_revisions;
drop policy if exists site_content_revisions_insert on public.site_content_revisions;
drop policy if exists cms_activity_log_select on public.cms_activity_log;
drop policy if exists cms_activity_log_insert on public.cms_activity_log;
drop policy if exists contact_submissions_insert on public.contact_submissions;
drop policy if exists contact_submissions_select on public.contact_submissions;
drop policy if exists contact_submissions_update on public.contact_submissions;

create policy site_content_revisions_select on public.site_content_revisions
  for select to authenticated
  using (public.is_admin());

create policy site_content_revisions_insert on public.site_content_revisions
  for insert to authenticated
  with check (public.is_admin() and created_by = auth.uid());

create policy cms_activity_log_select on public.cms_activity_log
  for select to authenticated
  using (public.is_admin());

create policy cms_activity_log_insert on public.cms_activity_log
  for insert to authenticated
  with check (public.is_admin() and created_by = auth.uid());

-- Contact: public insert with validation; admin read/update only
alter table public.contact_submissions
  drop constraint if exists contact_submissions_name_len;
alter table public.contact_submissions
  drop constraint if exists contact_submissions_email_len;
alter table public.contact_submissions
  drop constraint if exists contact_submissions_email_format;
alter table public.contact_submissions
  drop constraint if exists contact_submissions_message_len;

alter table public.contact_submissions
  add constraint contact_submissions_name_len
    check (char_length(btrim(name)) >= 1 and char_length(name) <= 100);
alter table public.contact_submissions
  add constraint contact_submissions_email_len
    check (char_length(email) <= 200);
alter table public.contact_submissions
  add constraint contact_submissions_email_format
    check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
alter table public.contact_submissions
  add constraint contact_submissions_message_len
    check (char_length(btrim(message)) >= 1 and char_length(message) <= 5000);

create policy contact_submissions_insert on public.contact_submissions
  for insert to anon, authenticated
  with check (
    char_length(btrim(name)) >= 1 and char_length(name) <= 100
    and char_length(email) <= 200
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(btrim(message)) >= 1 and char_length(message) <= 5000
    and read_at is null
  );

create policy contact_submissions_select on public.contact_submissions
  for select to authenticated
  using (public.is_admin());

create policy contact_submissions_update on public.contact_submissions
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ~5 contact messages per email per hour
create or replace function public.enforce_contact_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  select count(*)::int into recent_count
  from public.contact_submissions
  where lower(email) = lower(new.email)
    and created_at > now() - interval '1 hour';

  if recent_count >= 5 then
    raise exception 'rate limit exceeded';
  end if;

  new.name := left(btrim(new.name), 100);
  new.email := left(lower(btrim(new.email)), 200);
  new.message := left(btrim(new.message), 5000);
  new.read_at := null;
  return new;
end;
$$;

drop trigger if exists contact_submissions_rate_limit on public.contact_submissions;
create trigger contact_submissions_rate_limit
  before insert on public.contact_submissions
  for each row execute function public.enforce_contact_rate_limit();

-- ---------------------------------------------------------------------------
-- Analytics constraints + tighter policies
-- ---------------------------------------------------------------------------
alter table public.analytics_page_views
  drop constraint if exists analytics_page_views_path_len;
alter table public.analytics_page_views
  drop constraint if exists analytics_page_views_path_format;

alter table public.analytics_page_views
  add constraint analytics_page_views_path_len
    check (char_length(path) <= 300);
alter table public.analytics_page_views
  add constraint analytics_page_views_path_format
    check (path like '/%');

alter table public.analytics_presence
  drop constraint if exists analytics_presence_path_len;
alter table public.analytics_presence
  drop constraint if exists analytics_presence_path_format;

alter table public.analytics_presence
  add constraint analytics_presence_path_len
    check (char_length(path) <= 300);
alter table public.analytics_presence
  add constraint analytics_presence_path_format
    check (path like '/%');

drop policy if exists analytics_page_views_insert on public.analytics_page_views;
drop policy if exists analytics_page_views_select on public.analytics_page_views;
drop policy if exists analytics_presence_insert on public.analytics_presence;
drop policy if exists analytics_presence_update on public.analytics_presence;
drop policy if exists analytics_presence_select on public.analytics_presence;

create policy analytics_page_views_insert on public.analytics_page_views
  for insert to anon, authenticated
  with check (
    path like '/%'
    and char_length(path) <= 300
  );

create policy analytics_page_views_select on public.analytics_page_views
  for select to authenticated
  using (public.is_admin());

create policy analytics_presence_insert on public.analytics_presence
  for insert to anon, authenticated
  with check (
    path like '/%'
    and char_length(path) <= 300
  );

-- Upsert updates the row matching session_id (PK). Session IDs are UUIDs;
-- without SELECT, guessing another session is impractical. Still constrain payload.
create policy analytics_presence_update on public.analytics_presence
  for update to anon, authenticated
  using (true)
  with check (
    path like '/%'
    and char_length(path) <= 300
    and last_seen <= now() + interval '2 minutes'
  );

create policy analytics_presence_select on public.analytics_presence
  for select to authenticated
  using (public.is_admin());

-- ~1 page view insert per session every 2 seconds
create or replace function public.enforce_analytics_view_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.analytics_page_views
    where session_id = new.session_id
      and created_at > now() - interval '2 seconds'
  ) then
    raise exception 'rate limit exceeded';
  end if;

  new.path := left(new.path, 300);
  if left(new.path, 1) <> '/' then
    new.path := '/' || new.path;
  end if;
  return new;
end;
$$;

drop trigger if exists analytics_page_views_rate_limit on public.analytics_page_views;
create trigger analytics_page_views_rate_limit
  before insert on public.analytics_page_views
  for each row execute function public.enforce_analytics_view_rate_limit();

create or replace function public.sanitize_analytics_presence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.path := left(coalesce(new.path, '/'), 300);
  if left(new.path, 1) <> '/' then
    new.path := '/' || new.path;
  end if;
  if new.last_seen is null or new.last_seen > now() + interval '2 minutes' then
    new.last_seen := now();
  end if;
  return new;
end;
$$;

drop trigger if exists analytics_presence_rate_limit on public.analytics_presence;
drop trigger if exists analytics_presence_sanitize on public.analytics_presence;
create trigger analytics_presence_sanitize
  before insert or update on public.analytics_presence
  for each row execute function public.sanitize_analytics_presence();

-- ---------------------------------------------------------------------------
-- Security definer RPCs
-- ---------------------------------------------------------------------------
create or replace function public.get_site_content()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return (select data from public.site_content where id = 'main');
end;
$$;

revoke all on function public.get_site_content() from public;
grant execute on function public.get_site_content() to anon, authenticated;

create or replace function public.get_site_analytics()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  now_ts timestamptz := now();
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  delete from public.analytics_presence
  where last_seen < now_ts - interval '1 day';

  return json_build_object(
    'live', (
      select count(*)::int
      from public.analytics_presence
      where last_seen > now_ts - interval '2 minutes'
    ),
    'yesterday', (
      select count(distinct visitor_id)::int
      from public.analytics_page_views
      where created_at >= date_trunc('day', now_ts - interval '1 day')
        and created_at < date_trunc('day', now_ts)
    ),
    'last_7_days', (
      select count(distinct visitor_id)::int
      from public.analytics_page_views
      where created_at >= now_ts - interval '7 days'
    ),
    'last_30_days', (
      select count(distinct visitor_id)::int
      from public.analytics_page_views
      where created_at >= now_ts - interval '30 days'
    ),
    'last_6_months', (
      select count(distinct visitor_id)::int
      from public.analytics_page_views
      where created_at >= now_ts - interval '6 months'
    ),
    'last_year', (
      select count(distinct visitor_id)::int
      from public.analytics_page_views
      where created_at >= now_ts - interval '1 year'
    ),
    'top_pages', coalesce((
      select json_agg(row_to_json(t))
      from (
        select path, count(*)::int as views
        from public.analytics_page_views
        where created_at >= now_ts - interval '30 days'
        group by path
        order by views desc
        limit 10
      ) t
    ), '[]'::json)
  );
end;
$$;

revoke all on function public.get_site_analytics() from public, anon;
grant execute on function public.get_site_analytics() to authenticated;
