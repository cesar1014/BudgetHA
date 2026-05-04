-- Site Relatorio - Schema completo para Supabase
-- Projeto padrao: PEOCON
-- Se necessario, ajuste o codigo do projeto em:
-- 1) INSERT em projects
-- 2) UPDATE de project_code em lancamentos

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.projects (
  code text PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT projects_code_format_chk CHECK (code ~ '^[A-Z0-9_-]{1,64}$')
);

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_projects_updated_at'
  ) THEN
    CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END
$$;

INSERT INTO public.projects (code, name, is_active)
VALUES ('PEOCON', 'Projeto PEOCON', true)
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  is_active = true,
  updated_at = now();

CREATE TABLE IF NOT EXISTS public.topicos (
  project_code text NOT NULL REFERENCES public.projects(code) ON UPDATE CASCADE ON DELETE CASCADE,
  id text NOT NULL,
  nome text NOT NULL,
  grupo text NOT NULL,
  template_row integer,
  incluir_no_resumo boolean NOT NULL DEFAULT true,
  permitir_lancamento boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  orcamento_programa_brl numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT topicos_pk PRIMARY KEY (project_code, id),
  CONSTRAINT topicos_id_len_chk CHECK (char_length(btrim(id)) BETWEEN 1 AND 80),
  CONSTRAINT topicos_nome_len_chk CHECK (char_length(btrim(nome)) BETWEEN 1 AND 120),
  CONSTRAINT topicos_grupo_len_chk CHECK (char_length(btrim(grupo)) BETWEEN 1 AND 80),
  CONSTRAINT topicos_orcamento_chk CHECK (orcamento_programa_brl >= 0)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_topicos_updated_at'
  ) THEN
    CREATE TRIGGER trg_topicos_updated_at
    BEFORE UPDATE ON public.topicos
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_topicos_project_ordem
  ON public.topicos (project_code, ordem);

CREATE TABLE IF NOT EXISTS public.app_config (
  project_code text PRIMARY KEY REFERENCES public.projects(code) ON UPDATE CASCADE ON DELETE CASCADE,
  team_hires_unlocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_app_config_updated_at'
  ) THEN
    CREATE TRIGGER trg_app_config_updated_at
    BEFORE UPDATE ON public.app_config
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.auth_sessions (
  project_code text NOT NULL REFERENCES public.projects(code) ON UPDATE CASCADE ON DELETE CASCADE,
  session_id text NOT NULL,
  username text NOT NULL,
  role text NOT NULL,
  allowed_projects text[] NOT NULL DEFAULT '{}'::text[],
  active_project_code text,
  requires_project_selection boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_sessions_pk PRIMARY KEY (project_code, session_id),
  CONSTRAINT auth_sessions_role_chk CHECK (role IN ('admin', 'editor', 'viewer')),
  CONSTRAINT auth_sessions_username_len_chk CHECK (char_length(btrim(username)) BETWEEN 1 AND 120),
  CONSTRAINT auth_sessions_active_project_code_len_chk CHECK (
    active_project_code IS NULL OR char_length(btrim(active_project_code)) BETWEEN 1 AND 64
  )
);

ALTER TABLE public.auth_sessions
  ADD COLUMN IF NOT EXISTS allowed_projects text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.auth_sessions
  ADD COLUMN IF NOT EXISTS active_project_code text;

ALTER TABLE public.auth_sessions
  ADD COLUMN IF NOT EXISTS requires_project_selection boolean NOT NULL DEFAULT false;

UPDATE public.auth_sessions
SET allowed_projects = ARRAY[project_code]
WHERE coalesce(array_length(allowed_projects, 1), 0) = 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'auth_sessions_active_project_code_len_chk'
  ) THEN
    ALTER TABLE public.auth_sessions
      ADD CONSTRAINT auth_sessions_active_project_code_len_chk
      CHECK (active_project_code IS NULL OR char_length(btrim(active_project_code)) BETWEEN 1 AND 64);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_auth_sessions_project_expires
  ON public.auth_sessions (project_code, expires_at);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigserial PRIMARY KEY,
  project_code text NOT NULL REFERENCES public.projects(code) ON UPDATE CASCADE ON DELETE CASCADE,
  actor_username text NOT NULL,
  actor_role text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_project_created
  ON public.audit_log (project_code, created_at DESC);

CREATE TABLE IF NOT EXISTS public.lancamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_code text NOT NULL,
  topico_id text NOT NULL,
  data date NOT NULL,
  descricao text NOT NULL,
  fornecedor text NOT NULL DEFAULT '',
  responsavel text NOT NULL DEFAULT '',
  valor numeric(14,2) NOT NULL,
  semestre text NOT NULL,
  ano integer NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lancamentos_pk PRIMARY KEY (id)
);

ALTER TABLE public.lancamentos
  ADD COLUMN IF NOT EXISTS project_code text;

ALTER TABLE public.lancamentos
  ADD COLUMN IF NOT EXISTS fornecedor text NOT NULL DEFAULT '';

ALTER TABLE public.lancamentos
  ADD COLUMN IF NOT EXISTS responsavel text NOT NULL DEFAULT '';

ALTER TABLE public.lancamentos
  ADD COLUMN IF NOT EXISTS criado_em timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.lancamentos
  ADD COLUMN IF NOT EXISTS atualizado_em timestamptz NOT NULL DEFAULT now();

UPDATE public.lancamentos
SET project_code = 'PEOCON'
WHERE project_code IS NULL OR btrim(project_code) = '';

ALTER TABLE public.lancamentos
  ALTER COLUMN project_code SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lancamentos_project_fk'
  ) THEN
    ALTER TABLE public.lancamentos
      ADD CONSTRAINT lancamentos_project_fk
      FOREIGN KEY (project_code)
      REFERENCES public.projects(code)
      ON UPDATE CASCADE
      ON DELETE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lancamentos_valor_pos_chk') THEN
    ALTER TABLE public.lancamentos
      ADD CONSTRAINT lancamentos_valor_pos_chk CHECK (valor > 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lancamentos_semestre_chk') THEN
    ALTER TABLE public.lancamentos
      ADD CONSTRAINT lancamentos_semestre_chk CHECK (semestre IN ('S1', 'S2'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lancamentos_ano_chk') THEN
    ALTER TABLE public.lancamentos
      ADD CONSTRAINT lancamentos_ano_chk CHECK (ano BETWEEN 2000 AND 2100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lancamentos_topico_len_chk') THEN
    ALTER TABLE public.lancamentos
      ADD CONSTRAINT lancamentos_topico_len_chk CHECK (char_length(btrim(topico_id)) BETWEEN 1 AND 80);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lancamentos_descricao_len_chk') THEN
    ALTER TABLE public.lancamentos
      ADD CONSTRAINT lancamentos_descricao_len_chk CHECK (char_length(btrim(descricao)) BETWEEN 1 AND 500);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lancamentos_fornecedor_len_chk') THEN
    ALTER TABLE public.lancamentos
      ADD CONSTRAINT lancamentos_fornecedor_len_chk CHECK (char_length(fornecedor) <= 160);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lancamentos_responsavel_len_chk') THEN
    ALTER TABLE public.lancamentos
      ADD CONSTRAINT lancamentos_responsavel_len_chk CHECK (char_length(responsavel) <= 160);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lancamentos_project_code_len_chk') THEN
    ALTER TABLE public.lancamentos
      ADD CONSTRAINT lancamentos_project_code_len_chk CHECK (char_length(btrim(project_code)) BETWEEN 1 AND 64);
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_lancamentos_project_id
  ON public.lancamentos (project_code, id);

CREATE INDEX IF NOT EXISTS idx_lancamentos_project_data
  ON public.lancamentos (project_code, data DESC);

CREATE INDEX IF NOT EXISTS idx_lancamentos_project_ano_semestre
  ON public.lancamentos (project_code, ano, semestre);

CREATE INDEX IF NOT EXISTS idx_lancamentos_project_topico_data
  ON public.lancamentos (project_code, topico_id, data DESC);

CREATE OR REPLACE FUNCTION public.set_lancamentos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_lancamentos_updated_at'
  ) THEN
    CREATE TRIGGER trg_lancamentos_updated_at
    BEFORE UPDATE ON public.lancamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.set_lancamentos_updated_at();
  END IF;
END
$$;

-- Garante placeholders de topicos para ids antigos que possam existir em lancamentos.
INSERT INTO public.topicos (
  project_code,
  id,
  nome,
  grupo,
  template_row,
  incluir_no_resumo,
  permitir_lancamento,
  ordem,
  orcamento_programa_brl
)
SELECT DISTINCT
  l.project_code,
  l.topico_id,
  l.topico_id,
  'COMMUNICATIONS & PUBLICATIONS'::text,
  NULL::integer,
  true::boolean,
  true::boolean,
  999::integer,
  0::numeric(14,2)
FROM public.lancamentos l
LEFT JOIN public.topicos t
  ON t.project_code = l.project_code
 AND t.id = l.topico_id
WHERE t.id IS NULL
  AND l.project_code IS NOT NULL
  AND btrim(l.topico_id) <> '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lancamentos_topico_fk'
  ) THEN
    ALTER TABLE public.lancamentos
      ADD CONSTRAINT lancamentos_topico_fk
      FOREIGN KEY (project_code, topico_id)
      REFERENCES public.topicos(project_code, id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
      NOT VALID;
  END IF;
END
$$;

COMMIT;
