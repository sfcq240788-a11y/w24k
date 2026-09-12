-- Migration 020: Auto-provisioning of public.clientes on new auth.users registration
--
-- Problem solved:
--   Users registered via Supabase Auth have a row in auth.users but no
--   corresponding row in public.clientes. This violates the FK
--   carritos.cliente_id → clientes.id, making cart creation impossible (PG 23503).
--
-- What this migration does:
--   1. Creates handle_new_user() — a SECURITY DEFINER trigger function that
--      inserts into public.clientes immediately after a row is added to auth.users.
--   2. Attaches the trigger on auth.users (AFTER INSERT).
--   3. Backfills any existing auth.users rows that have no matching clientes row.
--
-- Idempotency:
--   • Function: CREATE OR REPLACE — always safe to re-run.
--   • Trigger:  DROP IF EXISTS + CREATE — no IF NOT EXISTS variant exists in PG.
--   • Backfill: INSERT … ON CONFLICT (id) DO NOTHING — re-running adds nothing.
--
-- Safety:
--   • Does NOT delete, UPDATE, or ALTER any existing rows or columns.
--   • The trigger function wraps its INSERT in an EXCEPTION block — a failure
--     inside it logs a WARNING but does NOT prevent the auth.users insert
--     from completing, so user registration is never broken by this trigger.

-- ── 1. TRIGGER FUNCTION ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.clientes (id, email, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    -- nombre: parte local del email como valor provisional.
    -- NULLIF descarta el caso en que split_part devuelva '' (email nulo o sin '@').
    -- Fallback a 'Cliente' cuando el email es NULL o no contiene '@'.
    COALESCE(NULLIF(split_part(NEW.email, '@', 1), ''), 'Cliente')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- No bloquear el registro si el insert falla por cualquier razón inesperada.
  RAISE WARNING 'handle_new_user: could not insert clientes row for user %: % %',
    NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ── 2. TRIGGER ───────────────────────────────────────────────────────────────
-- CREATE TRIGGER IF NOT EXISTS is not valid PostgreSQL syntax.
-- The canonical idempotent pattern is DROP IF EXISTS + CREATE.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── 3. BACKFILL — usuarios huérfanos existentes ──────────────────────────────
-- Inserts a clientes row for every auth.users row that has no match.
-- ON CONFLICT DO NOTHING makes this safe to re-run any number of times.
-- Uses SELECT (not literal values) so it covers the current user and any future
-- orphans introduced before this migration was applied.

INSERT INTO public.clientes (id, email, nombre)
SELECT
  u.id,
  u.email,
  COALESCE(NULLIF(split_part(u.email, '@', 1), ''), 'Cliente')
FROM auth.users u
LEFT JOIN public.clientes c ON c.id = u.id
WHERE c.id IS NULL
ON CONFLICT (id) DO NOTHING;
