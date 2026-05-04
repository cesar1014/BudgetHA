-- Site Relatorio - Migração: Super Admin + Gestão de Projetos/Usuários
-- Execute este arquivo no SQL Editor do Supabase APÓS o schema principal.

BEGIN;

-- 1) Colunas de organização em projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS brand_name text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS department text;

CREATE INDEX IF NOT EXISTS idx_projects_active_order
  ON public.projects (is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_projects_department
  ON public.projects (department) WHERE department IS NOT NULL;

-- 2) Tabela app_users (persistência de usuários no Supabase)
CREATE TABLE IF NOT EXISTS public.app_users (
  id text PRIMARY KEY,
  username text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  is_active boolean NOT NULL DEFAULT true,
  is_super_admin boolean NOT NULL DEFAULT false,
  default_project_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_password_reset_at timestamptz,
  CONSTRAINT app_users_username_len_chk CHECK (char_length(btrim(username)) BETWEEN 1 AND 120),
  CONSTRAINT app_users_role_chk CHECK (role IN ('admin', 'editor', 'viewer'))
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'ux_app_users_username_lower'
  ) THEN
    CREATE UNIQUE INDEX ux_app_users_username_lower
      ON public.app_users (lower(btrim(username)));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_app_users_updated_at'
  ) THEN
    CREATE TRIGGER trg_app_users_updated_at
    BEFORE UPDATE ON public.app_users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END
$$;

-- 3) Tabela project_memberships (acesso por projeto por usuário)
CREATE TABLE IF NOT EXISTS public.project_memberships (
  user_id text NOT NULL REFERENCES public.app_users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  project_code text NOT NULL REFERENCES public.projects(code) ON UPDATE CASCADE ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_memberships_pk PRIMARY KEY (user_id, project_code),
  CONSTRAINT project_memberships_role_chk CHECK (role IN ('admin', 'editor', 'viewer'))
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_project_memberships_updated_at'
  ) THEN
    CREATE TRIGGER trg_project_memberships_updated_at
    BEFORE UPDATE ON public.project_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_timestamp();
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_project_memberships_project
  ON public.project_memberships (project_code);

COMMIT;
