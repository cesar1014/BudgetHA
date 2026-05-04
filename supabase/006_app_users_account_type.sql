-- Site Relatorio - Migracao: tipo de conta de usuario (user|project)
-- Execute este arquivo no SQL Editor do Supabase apos 005_departments.sql.

BEGIN;

ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS account_type text;

UPDATE public.app_users
SET account_type = 'user'
WHERE account_type IS NULL OR btrim(account_type) = '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_users_account_type_chk'
  ) THEN
    ALTER TABLE public.app_users
      ADD CONSTRAINT app_users_account_type_chk
      CHECK (account_type IN ('user', 'project'));
  END IF;
END
$$;

ALTER TABLE public.app_users
  ALTER COLUMN account_type SET DEFAULT 'user';

ALTER TABLE public.app_users
  ALTER COLUMN account_type SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_app_users_account_type
  ON public.app_users (account_type);

-- Backfill inicial:
-- - nao super admin
-- - somente 1 projeto no membership
-- - username igual ao codigo do projeto (login de projeto)
WITH memberships AS (
  SELECT
    pm.user_id,
    COUNT(DISTINCT pm.project_code) AS project_count,
    MIN(pm.project_code) AS only_project_code
  FROM public.project_memberships pm
  GROUP BY pm.user_id
)
UPDATE public.app_users u
SET account_type = CASE
  WHEN u.is_super_admin = false
    AND coalesce(m.project_count, 0) = 1
    AND lower(btrim(u.username)) = lower(btrim(coalesce(m.only_project_code, '')))
  THEN 'project'
  ELSE 'user'
END
FROM memberships m
WHERE m.user_id = u.id;

COMMIT;
