-- ============================================================
-- Migration: 002_multi_use_tokens.sql
-- Purpose  : Convert tokens from single-use to multi-use,
--            time-limited passes.
--
-- WHAT CHANGES:
--   1. The `used` / `used_at` columns are KEPT on the table for
--      audit purposes (last-use tracking) but they no longer
--      BLOCK access.  They are purely informational.
--   2. The `consume_token` function is replaced:
--        OLD: rejects if used = true
--        NEW: only rejects if expires_at <= now()
--            Updates used/used_at/used_by_ip on every successful
--            validation (records the most recent access).
-- ============================================================

-- ----------------------------------------------------------
-- Optional: rename columns for clarity (non-breaking)
-- The column `used` is repurposed to mean "ever accessed"
-- and `used_at` becomes the most-recent-access timestamp.
-- We add a comment to document this intent.
-- ----------------------------------------------------------
comment on column public.magic_tokens.used
  is 'True once the token has been accessed at least once (informational only — does NOT block further access)';

comment on column public.magic_tokens.used_at
  is 'Timestamp of the most recent successful access (updated on every valid redemption)';

comment on column public.magic_tokens.used_by_ip
  is 'IP address of the most recent successful access';

-- ----------------------------------------------------------
-- REPLACE FUNCTION: consume_token
--
-- New behaviour:
--   • Locks the row (SELECT … FOR UPDATE) to prevent races.
--   • Returns empty set if token not found or expired.
--   • Does NOT check the `used` flag.
--   • Updates used/used_at/used_by_ip on every valid call
--     so the admin dashboard can see the last access time.
-- ----------------------------------------------------------
create or replace function public.consume_token(
  p_token      text,
  p_client_ip  text default null
)
returns setof public.magic_tokens
language plpgsql
security definer   -- runs as table owner; bypasses RLS
set search_path = public
as $$
declare
  v_row public.magic_tokens%rowtype;
begin
  -- Lock the row exclusively to serialise concurrent requests
  select *
    into v_row
    from public.magic_tokens
   where token = p_token
     for update;

  -- Token not found
  if not found then
    return;
  end if;

  -- Token expired  (sole blocking condition)
  if v_row.expires_at <= now() then
    return;
  end if;

  -- Valid — record latest access (non-blocking audit trail)
  update public.magic_tokens
     set used        = true,
         used_at     = now(),
         used_by_ip  = p_client_ip
   where id = v_row.id
  returning * into v_row;

  return next v_row;
end;
$$;

comment on function public.consume_token
  is 'Validates a time-limited magic token. Returns the row on success (expiry check only — multi-use until expires_at). Returns empty set if not found or expired.';

-- ----------------------------------------------------------
-- COMMENT: Update table-level comment to reflect new model
-- ----------------------------------------------------------
comment on table public.magic_tokens
  is 'Time-limited, multi-use magic link tokens for Crew-MG access control';
