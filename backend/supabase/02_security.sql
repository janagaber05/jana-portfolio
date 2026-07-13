alter table site_content enable row level security;
alter table projects enable row level security;
alter table case_studies enable row level security;

drop policy if exists site_content_public_read on site_content;
drop policy if exists site_content_auth_write on site_content;
drop policy if exists projects_public_read on projects;
drop policy if exists projects_auth_write on projects;
drop policy if exists case_studies_public_read on case_studies;
drop policy if exists case_studies_auth_write on case_studies;

create policy site_content_public_read on site_content for select using (true);
create policy site_content_auth_write on site_content for all to authenticated using (true) with check (true);

create policy projects_public_read on projects for select using (true);
create policy projects_auth_write on projects for all to authenticated using (true) with check (true);

create policy case_studies_public_read on case_studies for select using (true);
create policy case_studies_auth_write on case_studies for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do update set public = true;

drop policy if exists portfolio_media_public_read on storage.objects;
drop policy if exists portfolio_media_auth_write on storage.objects;

create policy portfolio_media_public_read on storage.objects
  for select using (bucket_id = 'portfolio-media');

create policy portfolio_media_auth_write on storage.objects
  for all to authenticated
  using (bucket_id = 'portfolio-media')
  with check (bucket_id = 'portfolio-media');
