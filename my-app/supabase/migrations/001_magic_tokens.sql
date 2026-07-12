-- ============================================================
-- Migration: 001_magic_tokens.sql
-- Purpose  : Single-use magic link token store for Crew-MG
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() (already enabled by default in Supabase)
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------
-- TABLE: magic_tokens
-- ----------------------------------------------------------
create table if not exists public.magic_tokens (
  id            uuid          primary key default gen_random_uuid(),

  -- The opaque token value embedded in the access URL
  token         text          not null unique,

  -- Optional: tie a token to a specific recipient (email / employee ID)
  recipient     text          null,

  -- Optional: human-readable label set by the admin (e.g. "John Smith – Dubai Visa")
  label         text          null,

  -- Has this token already been consumed?
  used          boolean       not null default false,

  -- When the token was consumed (NULL until first use)
  used_at       timestamptz   null,

  -- IP address that consumed the token (forensic / audit trail)
  used_by_ip    text          null,

  -- Hard expiry – token is invalid after this timestamp regardless of `used`
  expires_at    timestamptz   not null default (now() + interval '7 days'),

  -- Audit timestamps
  created_at    timestamptz   not null default now(),
  created_by    uuid          null  -- FK to auth.users (admin who generated it)
);

-- ----------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------
-- Primary lookup is always by token value → must be lightning fast
create unique index if not exists idx_magic_tokens_token
  on public.magic_tokens (token);

-- Admins will list tokens by creation date
create index if not exists idx_magic_tokens_created_at
  on public.magic_tokens (created_at desc);

-- ----------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------
alter table public.magic_tokens enable row level security;

-- Policy: only the Supabase service-role key (used server-side) may
-- read, insert, or update rows.  No policy is defined for the anon key,
-- so anonymous / authenticated client-side requests are denied entirely.
-- The middleware runs with the service-role key via the admin client,
-- so it bypasses RLS by design.

-- Explicitly deny everything for the anon role (belt-and-suspenders)
create policy "deny_anon_select" on public.magic_tokens
  as restrictive
  for select
  to anon
  using (false);

create policy "deny_anon_insert" on public.magic_tokens
  as restrictive
  for insert
  to anon
  with check (false);

create policy "deny_anon_update" on public.magic_tokens
  as restrictive
  for update
  to anon
  using (false);

-- Allow authenticated admin users to manage tokens they created
create policy "admins_manage_own_tokens" on public.magic_tokens
  as permissive
  for all
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- ----------------------------------------------------------
-- FUNCTION: consume_token (atomic single-use enforcement)
-- ----------------------------------------------------------
-- This function is called inside a transaction by the middleware.
-- It performs a SELECT … FOR UPDATE to lock the row, checks validity,
-- then flips `used` to true – all atomically.  Returns the full row
-- so the caller can inspect it.
--
-- Returns NULL when the token does not exist, is already used, or has expired.
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
  -- Lock the row exclusively to prevent concurrent double-use
  select *
    into v_row
    from public.magic_tokens
   where token = p_token
     for update;

  -- Token not found
  if not found then
    return;
  end if;

  -- Token already consumed
  if v_row.used = true then
    return;
  end if;

  -- Token expired
  if v_row.expires_at < now() then
    return;
  end if;

  -- All checks passed – mark as consumed
  update public.magic_tokens
     set used        = true,
         used_at     = now(),
         used_by_ip  = p_client_ip
   where id = v_row.id
  returning * into v_row;

  return next v_row;
end;
$$;

-- ----------------------------------------------------------
-- COMMENT
-- ----------------------------------------------------------
comment on table  public.magic_tokens              is 'Single-use magic link tokens for Crew-MG access control';
comment on column public.magic_tokens.token        is 'Cryptographically random opaque token (URL-safe base64, 32 bytes)';
comment on column public.magic_tokens.used         is 'True once the token has been successfully validated and consumed';
comment on column public.magic_tokens.expires_at   is 'Hard expiry; tokens are rejected after this timestamp regardless of used flag';
comment on function public.consume_token           is 'Atomically validates and marks a magic token as used. Returns the row on success, empty set on failure.';
