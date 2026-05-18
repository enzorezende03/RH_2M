-- =========================================
-- FASE 1: Fundação de segurança e papéis
-- =========================================

-- 1) Enum de papéis
CREATE TYPE public.app_role AS ENUM ('admin', 'gestor', 'colaborador');

-- 2) Tabela user_roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3) Vincular colaborador <-> auth user (campo já existia como user_id, garantir índice)
CREATE INDEX IF NOT EXISTS idx_colaboradores_user_id ON public.colaboradores(user_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_gestor_direto ON public.colaboradores(gestor_direto);

-- 4) Função has_role (SECURITY DEFINER, evita recursão em RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 5) Função is_gestor_de: o usuário logado é gestor direto do colaborador alvo?
CREATE OR REPLACE FUNCTION public.is_gestor_de(_colaborador_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.colaboradores alvo
    JOIN public.colaboradores gestor
      ON gestor.nome_completo = alvo.gestor_direto
    WHERE alvo.id = _colaborador_id
      AND gestor.user_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_gestor_de(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_gestor_de(uuid) TO authenticated;

-- 6) Função: id do colaborador do usuário logado
CREATE OR REPLACE FUNCTION public.meu_colaborador_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.colaboradores WHERE user_id = auth.uid() LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.meu_colaborador_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.meu_colaborador_id() TO authenticated;

-- 7) Bootstrap: primeiro usuário vira admin; demais viram colaborador
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total integer;
BEGIN
  SELECT COUNT(*) INTO total FROM public.user_roles WHERE role = 'admin';
  IF total = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'colaborador');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Trigger de profiles também deve continuar disparando
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8) RLS de user_roles
CREATE POLICY "Users view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles - insert"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles - update"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles - delete"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 9) RLS colaboradores - reescrever
DROP POLICY IF EXISTS "Auth users can delete colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Auth users can insert colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Auth users can update colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Auth users can view colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Public read colaboradores" ON public.colaboradores;

CREATE POLICY "Colab select por papel"
  ON public.colaboradores FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'gestor')
    OR user_id = auth.uid()
  );

CREATE POLICY "Colab insert admin"
  ON public.colaboradores FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Colab update admin ou dono"
  ON public.colaboradores FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR user_id = auth.uid()
    OR public.is_gestor_de(id)
  );

CREATE POLICY "Colab delete admin"
  ON public.colaboradores FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 10) RLS cargos - reescrever
DROP POLICY IF EXISTS "Auth delete cargos" ON public.cargos;
DROP POLICY IF EXISTS "Auth insert cargos" ON public.cargos;
DROP POLICY IF EXISTS "Auth update cargos" ON public.cargos;
DROP POLICY IF EXISTS "Auth view cargos" ON public.cargos;
DROP POLICY IF EXISTS "Public read cargos" ON public.cargos;

CREATE POLICY "Cargos select autenticados"
  ON public.cargos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Cargos insert admin"
  ON public.cargos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Cargos update admin"
  ON public.cargos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Cargos delete admin"
  ON public.cargos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 11) RLS admissao_links - reescrever (acesso via token continua via RPC SECURITY DEFINER)
DROP POLICY IF EXISTS "Auth users can delete admission links" ON public.admissao_links;
DROP POLICY IF EXISTS "Auth users can insert admission links" ON public.admissao_links;
DROP POLICY IF EXISTS "Auth users can update admission links" ON public.admissao_links;
DROP POLICY IF EXISTS "Auth users can view all admission links" ON public.admissao_links;

CREATE POLICY "Admissao select admin"
  ON public.admissao_links FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admissao insert admin"
  ON public.admissao_links FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admissao update admin"
  ON public.admissao_links FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admissao delete admin"
  ON public.admissao_links FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 12) Restringir execução pública das funções SECURITY DEFINER existentes
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- get_admissao_link_by_token e salvar_admissao_publica DEVEM continuar públicas (link do candidato)
GRANT EXECUTE ON FUNCTION public.get_admissao_link_by_token(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.salvar_admissao_publica(uuid, jsonb, jsonb, boolean) TO anon, authenticated;

-- 13) Helper para usar no frontend: lista papéis do usuário logado
CREATE OR REPLACE FUNCTION public.meus_papeis()
RETURNS SETOF public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.meus_papeis() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.meus_papeis() TO authenticated;