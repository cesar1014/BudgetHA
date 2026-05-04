-- Site Relatorio - Schema completo para Supabase
-- Projeto padrao: PEOCON
-- Este arquivo ja consolida as migracoes 002 a 006 e corrige:
-- - FK composta de lancamentos -> topicos
-- - auth_sessions.allowed_projects como text[]
-- - colunas/status/departamentos/usuarios usados pelo backend

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_lancamentos_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.departments (
  id text PRIMARY KEY DEFAULT ('dept_' || substr(md5((random()::text || clock_timestamp()::text)), 1, 12)),
  name text NOT NULL,
  phone_extension text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT departments_name_len_chk CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  CONSTRAINT departments_phone_extension_len_chk CHECK (char_length(coalesce(phone_extension, '')) <= 20)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_departments_name_lower
  ON public.departments (lower(btrim(name)));

CREATE INDEX IF NOT EXISTS idx_departments_name
  ON public.departments (name);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_departments_updated_at') THEN
    CREATE TRIGGER trg_departments_updated_at
      BEFORE UPDATE ON public.departments
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.projects (
  code text PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  display_order integer NOT NULL DEFAULT 0,
  brand_name text,
  department text,
  department_id text,
  categories text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'ativo',
  CONSTRAINT projects_code_format_chk CHECK (code ~ '^[A-Z0-9_-]{1,64}$'),
  CONSTRAINT projects_status_chk CHECK (status IN ('ativo', 'inativo', 'concluido'))
);

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS brand_name text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS department_id text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}'::text[];
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS status text;

UPDATE public.projects
SET status = CASE
  WHEN status IS NULL OR btrim(status) = '' THEN CASE WHEN is_active = false THEN 'inativo' ELSE 'ativo' END
  WHEN lower(btrim(status)) IN ('ativo', 'inativo', 'concluido') THEN lower(btrim(status))
  WHEN is_active = false THEN 'inativo'
  ELSE 'ativo'
END;

ALTER TABLE public.projects ALTER COLUMN status SET DEFAULT 'ativo';
ALTER TABLE public.projects ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_status_chk') THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_status_chk CHECK (status IN ('ativo', 'inativo', 'concluido'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_department_id_fk') THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_department_id_fk
      FOREIGN KEY (department_id)
      REFERENCES public.departments(id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_projects_updated_at') THEN
    CREATE TRIGGER trg_projects_updated_at
      BEFORE UPDATE ON public.projects
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_projects_active_order
  ON public.projects (is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_projects_status
  ON public.projects (status);

CREATE INDEX IF NOT EXISTS idx_projects_department_id
  ON public.projects (department_id)
  WHERE department_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_categories_gin
  ON public.projects USING GIN (categories);

INSERT INTO public.projects (code, name, is_active, status)
VALUES ('PEOCON', 'Projeto PEOCON', true, 'ativo')
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  is_active = true,
  status = 'ativo',
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

CREATE INDEX IF NOT EXISTS idx_topicos_project_ordem
  ON public.topicos (project_code, ordem);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_topicos_updated_at') THEN
    CREATE TRIGGER trg_topicos_updated_at
      BEFORE UPDATE ON public.topicos
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.app_config (
  project_code text PRIMARY KEY REFERENCES public.projects(code) ON UPDATE CASCADE ON DELETE CASCADE,
  team_hires_unlocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_app_config_updated_at') THEN
    CREATE TRIGGER trg_app_config_updated_at
      BEFORE UPDATE ON public.app_config
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.app_users (
  id text PRIMARY KEY,
  username text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  is_active boolean NOT NULL DEFAULT true,
  is_super_admin boolean NOT NULL DEFAULT false,
  account_type text NOT NULL DEFAULT 'user',
  default_project_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_password_reset_at timestamptz,
  CONSTRAINT app_users_username_len_chk CHECK (char_length(btrim(username)) BETWEEN 1 AND 120),
  CONSTRAINT app_users_role_chk CHECK (role IN ('admin', 'editor', 'viewer')),
  CONSTRAINT app_users_account_type_chk CHECK (account_type IN ('user', 'project'))
);

ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS account_type text;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS default_project_code text;
ALTER TABLE public.app_users ADD COLUMN IF NOT EXISTS last_password_reset_at timestamptz;

UPDATE public.app_users
SET account_type = 'user'
WHERE account_type IS NULL OR btrim(account_type) = '';

ALTER TABLE public.app_users ALTER COLUMN account_type SET DEFAULT 'user';
ALTER TABLE public.app_users ALTER COLUMN account_type SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_users_account_type_chk') THEN
    ALTER TABLE public.app_users
      ADD CONSTRAINT app_users_account_type_chk CHECK (account_type IN ('user', 'project'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_users_default_project_code_fk') THEN
    ALTER TABLE public.app_users
      ADD CONSTRAINT app_users_default_project_code_fk
      FOREIGN KEY (default_project_code)
      REFERENCES public.projects(code)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_app_users_updated_at') THEN
    CREATE TRIGGER trg_app_users_updated_at
      BEFORE UPDATE ON public.app_users
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS ux_app_users_username_lower
  ON public.app_users (lower(btrim(username)));

CREATE INDEX IF NOT EXISTS idx_app_users_account_type
  ON public.app_users (account_type);

CREATE TABLE IF NOT EXISTS public.project_memberships (
  user_id text NOT NULL REFERENCES public.app_users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  project_code text NOT NULL REFERENCES public.projects(code) ON UPDATE CASCADE ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_memberships_pk PRIMARY KEY (user_id, project_code),
  CONSTRAINT project_memberships_role_chk CHECK (role IN ('admin', 'editor', 'viewer'))
);

CREATE INDEX IF NOT EXISTS idx_project_memberships_project
  ON public.project_memberships (project_code);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_project_memberships_updated_at') THEN
    CREATE TRIGGER trg_project_memberships_updated_at
      BEFORE UPDATE ON public.project_memberships
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

ALTER TABLE public.auth_sessions ADD COLUMN IF NOT EXISTS allowed_projects text[] NOT NULL DEFAULT '{}'::text[];
ALTER TABLE public.auth_sessions ADD COLUMN IF NOT EXISTS active_project_code text;
ALTER TABLE public.auth_sessions ADD COLUMN IF NOT EXISTS requires_project_selection boolean NOT NULL DEFAULT false;

UPDATE public.auth_sessions
SET allowed_projects = ARRAY[project_code]
WHERE coalesce(array_length(allowed_projects, 1), 0) = 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_sessions_active_project_code_fk') THEN
    ALTER TABLE public.auth_sessions
      ADD CONSTRAINT auth_sessions_active_project_code_fk
      FOREIGN KEY (active_project_code)
      REFERENCES public.projects(code)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_auth_sessions_project_expires
  ON public.auth_sessions (project_code, expires_at);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
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
  CONSTRAINT lancamentos_pk PRIMARY KEY (id),
  CONSTRAINT lancamentos_valor_pos_chk CHECK (valor > 0),
  CONSTRAINT lancamentos_semestre_chk CHECK (semestre IN ('S1', 'S2')),
  CONSTRAINT lancamentos_ano_chk CHECK (ano BETWEEN 2000 AND 2100),
  CONSTRAINT lancamentos_topico_len_chk CHECK (char_length(btrim(topico_id)) BETWEEN 1 AND 80),
  CONSTRAINT lancamentos_descricao_len_chk CHECK (char_length(btrim(descricao)) BETWEEN 1 AND 500),
  CONSTRAINT lancamentos_fornecedor_len_chk CHECK (char_length(fornecedor) <= 160),
  CONSTRAINT lancamentos_responsavel_len_chk CHECK (char_length(responsavel) <= 160),
  CONSTRAINT lancamentos_project_code_len_chk CHECK (char_length(btrim(project_code)) BETWEEN 1 AND 64)
);

ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS project_code text;
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS fornecedor text NOT NULL DEFAULT '';
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS responsavel text NOT NULL DEFAULT '';
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS criado_em timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.lancamentos ADD COLUMN IF NOT EXISTS atualizado_em timestamptz NOT NULL DEFAULT now();

UPDATE public.lancamentos
SET project_code = 'PEOCON'
WHERE project_code IS NULL OR btrim(project_code) = '';

ALTER TABLE public.lancamentos ALTER COLUMN project_code SET NOT NULL;

-- Garante cadastro de projetos ja referenciados em bases antigas.
INSERT INTO public.projects (code, name, is_active, status)
SELECT DISTINCT btrim(project_code), btrim(project_code), true, 'ativo'
FROM public.topicos
WHERE project_code IS NOT NULL
  AND btrim(project_code) <> ''
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.projects (code, name, is_active, status)
SELECT DISTINCT btrim(project_code), btrim(project_code), true, 'ativo'
FROM public.lancamentos
WHERE project_code IS NOT NULL
  AND btrim(project_code) <> ''
ON CONFLICT (code) DO NOTHING;

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

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lancamentos_project_fk') THEN
    ALTER TABLE public.lancamentos
      ADD CONSTRAINT lancamentos_project_fk
      FOREIGN KEY (project_code)
      REFERENCES public.projects(code)
      ON UPDATE CASCADE
      ON DELETE CASCADE;
  END IF;

  -- A FK correta precisa ser composta. O schema anexado tinha a FK quebrada/duplicada.
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lancamentos_topico_fk') THEN
    ALTER TABLE public.lancamentos DROP CONSTRAINT lancamentos_topico_fk;
  END IF;

  ALTER TABLE public.lancamentos
    ADD CONSTRAINT lancamentos_topico_fk
    FOREIGN KEY (project_code, topico_id)
    REFERENCES public.topicos(project_code, id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lancamentos_updated_at') THEN
    CREATE TRIGGER trg_lancamentos_updated_at
      BEFORE UPDATE ON public.lancamentos
      FOR EACH ROW
      EXECUTE FUNCTION public.set_lancamentos_updated_at();
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

COMMIT;
