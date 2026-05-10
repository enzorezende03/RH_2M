
CREATE TABLE public.cargos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  cargo_visivel text,
  unidade text,
  departamento text,
  sindicato text,
  cbo text,
  grupo_cargo text,
  missao text,
  modelo_cargo text DEFAULT 'sem_nivel',
  salario numeric DEFAULT 0,
  responsabilidades text,
  requisitos_academicos text,
  competencias_comportamentais text,
  competencias_organizacionais text,
  experiencia text,
  nivel_hierarquico text,
  nivel_salarial text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX cargos_nome_unique ON public.cargos (lower(nome));

ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth view cargos" ON public.cargos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert cargos" ON public.cargos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update cargos" ON public.cargos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete cargos" ON public.cargos FOR DELETE TO authenticated USING (true);
CREATE POLICY "Public read cargos" ON public.cargos FOR SELECT TO anon USING (true);

CREATE TRIGGER cargos_updated_at BEFORE UPDATE ON public.cargos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
