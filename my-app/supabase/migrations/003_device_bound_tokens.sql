-- ============================================================
-- Migration: 003_device_bound_tokens.sql
-- Purpose  : Upgrade multi-use tokens to "Device-Bound" model.
--
-- WHAT CHANGES:
--   1. Adds `claimed_device_id` column (TEXT, nullable).
--      NULL  → token has never been clicked.
--      value → the UUID of the first device that clicked it.
--
--   2. Adds `claimed_at` column — when the device binding occurred.
--
--   3. Introduces `verify_device_bound_token` RPC which returns a
--      typed composite result so callers can distinguish:
--        status = 'ok'             → valid, proceed
--        status = 'not_found'      → token doesn't exist
--        status = 'expired'        → past expires_at
--        status = 'device_mismatch'→ claimed by a different device
--
-- BACKWARD COMPAT:
--   `consume_token` is kept (used by admin tools) but its behaviour
--   is now expiry-only and it is superseded by this new function
--   for the end-user link flow.
-- ============================================================

-- ----------------------------------------------------------
-- 1. Add claimed_device_id and claimed_at columns
-- ----------------------------------------------------------
alter table public.magic_tokens
  add column if not exists claimed_device_id text        null,
  add column if not exists claimed_at        timestamptz null;

comment on column public.magic_tokens.claimed_device_id
  is 'UUID of the first device (browser) that clicked the link. NULL = unclaimed. Set once on first click and never changed.';

comment on column public.magic_tokens.claimed_at
  is 'Timestamp when the device binding was first established (first click).';

-- Partial index – only rows with a claim benefit from this
create index if not exists idx_magic_tokens_claimed_device
  on public.magic_tokens (claimed_device_id)
  where claimed_device_id is not null;

-- ----------------------------------------------------------
-- 2. Composite return type for verify_device_bound_token
-- ----------------------------------------------------------
drop type if exists public.device_bound_token_result cascade;

create type public.device_bound_token_result as (
  status            text,        -- 'ok' | 'not_found' | 'expired' | 'device_mismatch'
  token_id          uuid,        -- magic_tokens.id
  recipient         text,        -- magic_tokens.recipient (display name / email)
  expires_at        timestamptz, -- caller uses this to set cookie maxAge
  claimed_device_id text         -- the device UUID now bound to this token
);

-- ----------------------------------------------------------
-- 3. Function: verify_device_bound_token
--
-- Parameters
--   p_token         – raw URL token string from ?token=
--   p_device_id     – crew_device_id cookie value from the browser
--                     (NULL/empty on first visit)
--   p_client_ip     – for audit trail
--   p_new_device_id – a fresh UUID generated server-side by the caller;
--                     only applied when p_device_id is NULL (first claim)
--
-- Logic
--   1. SELECT … FOR UPDATE to lock and prevent concurrent races.
--   2. Return 'not_found' if token doesn't exist.
--   3. Return 'expired'   if expires_at <= now().
--   4. If claimed_device_id IS NULL (first click):
--        • Set claimed_device_id = p_new_device_id
--        • Set claimed_at = now()
--        • Update used / used_at / used_by_ip (audit)
--        • Return status='ok'
--   5. If claimed_device_id IS NOT NULL (returning visitor):
--        • If claimed_device_id = p_device_id → status='ok'
--        • Otherwise                          → status='device_mismatch'
-- ----------------------------------------------------------
create or replace function public.verify_device_bound_token(
  p_token         text,
  p_device_id     text    default null,
  p_client_ip     text    default null,
  p_new_device_id text    default null
)
returns public.device_bound_token_result
language plpgsql
security definer   -- runs as table owner; bypasses RLS
set search_path = public
as $$
declare
  v_row    public.magic_tokens%rowtype;
  v_result public.device_bound_token_result;
begin
  -- Lock the row exclusively to serialise concurrent requests
  select *
    into v_row
    from public.magic_tokens
   where token = p_token
     for update;

  -- ── Not found ───────────────────────────────────────────────────────────
  if not found then
    v_result.status := 'not_found';
    return v_result;
  end if;

  -- ── Expired ─────────────────────────────────────────────────────────────
  if v_row.expires_at <= now() then
    v_result.status := 'expired';
    return v_result;
  end if;

  -- ── First click: token is unclaimed ─────────────────────────────────────
  if v_row.claimed_device_id is null then
    update public.magic_tokens
       set claimed_device_id = p_new_device_id,
           claimed_at        = now(),
           used              = true,
           used_at           = now(),
           used_by_ip        = p_client_ip
     where id = v_row.id
    returning * into v_row;

    v_result.status            := 'ok';
    v_result.token_id          := v_row.id;
    v_result.recipient         := v_row.recipient;
    v_result.expires_at        := v_row.expires_at;
    v_result.claimed_device_id := v_row.claimed_device_id;
    return v_result;
  end if;

  -- ── Returning visitor: verify device matches ─────────────────────────────
  if v_row.claimed_device_id = p_device_id then
    -- Known device — update last-access audit trail only
    update public.magic_tokens
       set used_at    = now(),
           used_by_ip = p_client_ip
     where id = v_row.id;

    v_result.status            := 'ok';
    v_result.token_id          := v_row.id;
    v_result.recipient         := v_row.recipient;
    v_result.expires_at        := v_row.expires_at;
    v_result.claimed_device_id := v_row.claimed_device_id;
    return v_result;
  end if;

  -- ── Device mismatch: link was shared to a different device ───────────────
  v_result.status := 'device_mismatch';
  return v_result;
end;
$$;

comment on function public.verify_device_bound_token
  is 'Device-bound token verification. Returns a typed composite: ok | not_found | expired | device_mismatch. On first click, atomically claims the token for p_new_device_id. On subsequent clicks, verifies p_device_id matches the stored claim.';

-- ----------------------------------------------------------
-- 4. Update table-level comment
-- ----------------------------------------------------------
comment on table public.magic_tokens
  is 'Time-limited, device-bound, multi-use magic link tokens for Crew-MG access control';
