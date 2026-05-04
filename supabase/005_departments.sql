-- Site Relatorio - Migracao: departamentos dedicados com ramal
-- Execute este arquivo no SQL Editor do Supabase apos 004_project_status.sql.

BEGIN;

CREATE TABLE IF NOT EXISTS public.departments (
  id text PRIMARY KEY DEFAULT ('dept_' || substr(md5((random()::text || clock_timestamp()::text)), 1, 12)),
  name text NOT NULL,
  phone_extension text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT departments_name_len_chk CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  CONSTRAINT departments_phone_extension_len_chk CHECK (char_length(coalesce(phone_extension, '')) <= 20)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'ux_departments_name_lower'
  ) THEN
    CREATE UNIQUE INDEX ux_departments_name_lower
      ON public.departments (lower(btrim(name)));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_departments_name
  ON public.departments (name);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'set_updated_at_timestamp'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_departments_updated_at'
  ) THEN
    CREATE TRIGGER trg_departments_updated_at
      BEFORE UPDATE ON public.departments
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END
$$;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS department_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'projects_department_id_fk'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_department_id_fk
      FOREIGN KEY (department_id)
      REFERENCES public.departments(id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_projects_department_id
  ON public.projects (department_id)
  WHERE department_id IS NOT NULL;

-- Backfill dos departamentos antigos (campo projects.department).
INSERT INTO public.departments (name)
SELECT DISTINCT btrim(p.department)
FROM public.projects p
WHERE p.department IS NOT NULL
  AND btrim(p.department) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM public.departments d
    WHERE lower(btrim(d.name)) = lower(btrim(p.department))
  );

-- Vincula projects.department_id usando o nome antigo.
UPDATE public.projects p
SET department_id = d.id
FROM public.departments d
WHERE p.department IS NOT NULL
  AND btrim(p.department) <> ''
  AND lower(btrim(d.name)) = lower(btrim(p.department))
  AND (p.department_id IS NULL OR p.department_id <> d.id);

COMMIT;
