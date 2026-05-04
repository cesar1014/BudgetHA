-- Site Relatorio - Migracao: categorias multiplas para projetos/cursos
-- Execute este arquivo no SQL Editor do Supabase apos 002_admin_migration.sql.

BEGIN;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}'::text[];

-- Garantir formato consistente e sem nulos.
UPDATE public.projects
SET categories = '{}'::text[]
WHERE categories IS NULL;

-- Backfill: se ainda nao houver categorias e houver department, usar department como categoria inicial.
UPDATE public.projects
SET categories = ARRAY[btrim(department)]::text[]
WHERE coalesce(array_length(categories, 1), 0) = 0
  AND department IS NOT NULL
  AND btrim(department) <> '';

-- Normalizacao: remove vazios/duplicados e aplica trim.
WITH normalized AS (
  SELECT
    p.code,
    coalesce(
      ARRAY(
        SELECT DISTINCT btrim(item)
        FROM unnest(p.categories) AS item
        WHERE btrim(item) <> ''
        ORDER BY btrim(item)
      ),
      '{}'::text[]
    ) AS categories_clean
  FROM public.projects p
)
UPDATE public.projects p
SET categories = n.categories_clean
FROM normalized n
WHERE n.code = p.code;

CREATE INDEX IF NOT EXISTS idx_projects_categories_gin
  ON public.projects USING GIN (categories);

COMMIT;
