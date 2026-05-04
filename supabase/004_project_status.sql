-- Site Relatorio - Migracao: status de projetos (ativo, inativo, concluido)
-- Execute este arquivo no SQL Editor do Supabase apos 003_project_categories.sql.

BEGIN;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS status text;

-- Backfill inicial baseado em is_active.
UPDATE public.projects
SET status = CASE
  WHEN is_active = false THEN 'inativo'
  ELSE 'ativo'
END
WHERE status IS NULL OR btrim(status) = '';

-- Normaliza valores fora do dominio para o dominio oficial.
UPDATE public.projects
SET status = CASE
  WHEN lower(btrim(status)) IN ('ativo', 'inativo', 'concluido') THEN lower(btrim(status))
  WHEN is_active = false THEN 'inativo'
  ELSE 'ativo'
END;

ALTER TABLE public.projects
  ALTER COLUMN status SET DEFAULT 'ativo';

ALTER TABLE public.projects
  ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_status_chk'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_status_chk
      CHECK (status IN ('ativo', 'inativo', 'concluido'));
  END IF;
END
$$;

-- Compatibilidade: status continua derivando is_active.
UPDATE public.projects
SET is_active = CASE
  WHEN status = 'ativo' THEN true
  ELSE false
END
WHERE is_active IS DISTINCT FROM CASE
  WHEN status = 'ativo' THEN true
  ELSE false
END;

CREATE INDEX IF NOT EXISTS idx_projects_status
  ON public.projects (status);

COMMIT;
