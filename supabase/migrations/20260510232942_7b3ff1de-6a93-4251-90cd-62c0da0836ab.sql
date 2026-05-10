
CREATE TABLE public.colaboradores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo text NOT NULL,
  nome_visivel text,
  email text,
  cargo text,
  cargo_visivel text,
  gestor_direto text,
  gestor_cargo text,
  unidade text,
  departamento text,
  papel text DEFAULT 'Colaborador',
  status text DEFAULT 'Ativo',
  tag text,
  lider text,
  responsavel text,
  dados_completos jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX colaboradores_email_unique ON public.colaboradores (lower(email)) WHERE email IS NOT NULL;

ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can view colaboradores" ON public.colaboradores
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert colaboradores" ON public.colaboradores
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update colaboradores" ON public.colaboradores
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth users can delete colaboradores" ON public.colaboradores
  FOR DELETE TO authenticated USING (true);

-- Permissive for dev (DEV_BYPASS in ProtectedRoute, no auth session)
CREATE POLICY "Public read colaboradores" ON public.colaboradores
  FOR SELECT TO anon USING (true);

CREATE TRIGGER colaboradores_updated_at
  BEFORE UPDATE ON public.colaboradores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
