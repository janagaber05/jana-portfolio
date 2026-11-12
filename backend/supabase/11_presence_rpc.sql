-- Fix: "live visitors" heartbeat failed with 401 after 10_security_hardening.
-- PostgREST upsert = INSERT ... ON CONFLICT DO UPDATE, which needs SELECT on the
-- table. Anon correctly has no SELECT, so every heartbeat was rejected.
-- Solution: one narrow security-definer RPC; anon gets no direct table writes.
-- Idempotent. Run after 10_security_hardening.sql.

create or replace function public.track_presence(
  p_session_id uuid,
  p_visitor_id uuid,
  p_path text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_path text := left(coalesce(nullif(btrim(p_path), ''), '/'), 300);
begin
  if p_session_id is null or p_visitor_id is null then
    return;
  end if;

  if left(clean_path, 1) <> '/' then
    clean_path := left('/' || clean_path, 300);
  end if;

  insert into public.analytics_presence (session_id, visitor_id, path, last_seen)
  values (p_session_id, p_visitor_id, clean_path, now())
  on conflict (session_id) do update
    set path = excluded.path,
        last_seen = now()
    -- A session can only be refreshed by the visitor that created it.
    where public.analytics_presence.visitor_id = excluded.visitor_id;
end;
$$;

revoke all on function public.track_presence(uuid, uuid, text) from public;
grant execute on function public.track_presence(uuid, uuid, text) to anon, authenticated;

-- Direct table writes are no longer needed (and allowed rewriting any row).
drop policy if exists analytics_presence_insert on public.analytics_presence;
drop policy if exists analytics_presence_update on public.analytics_presence;
