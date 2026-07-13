create or replace function get_site_content()
returns jsonb
language sql
stable
as $$
  select data from site_content where id = 'main';
$$;

grant execute on function get_site_content() to anon, authenticated;
