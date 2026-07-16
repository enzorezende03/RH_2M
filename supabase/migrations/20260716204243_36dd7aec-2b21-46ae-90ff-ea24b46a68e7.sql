
-- Drop existing pdi_acoes (will be recreated with new schema tied to new pdi table)
DROP TABLE IF EXISTS public.pdi_acoes CASCADE;

-- PDI
CREATE TABLE public.pdi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  ciclo_id uuid NOT NULL REFERENCES public.ciclos_avaliacao(id) ON DELETE CASCADE,
  pontos_fortes text,
  pontos_desenvolvimento text,
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','ativo','concluido')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (colaborador_id, ciclo_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdi TO authenticated;
GRANT ALL ON public.pdi TO service_role;
ALTER TABLE public.pdi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin tudo em pdi" ON public.pdi FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestor CRUD pdi do time" ON public.pdi FOR ALL
  USING (is_gestor_de(colaborador_id))
  WITH CHECK (is_gestor_de(colaborador_id));

CREATE POLICY "Colaborador ve o proprio pdi" ON public.pdi FOR SELECT
  USING (eu_sou_colaborador(colaborador_id));

CREATE TRIGGER update_pdi_updated_at BEFORE UPDATE ON public.pdi
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PDI Ações
CREATE TABLE public.pdi_acoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pdi_id uuid NOT NULL REFERENCES public.pdi(id) ON DELETE CASCADE,
  descricao text,
  quesito_codigo text,
  prazo_revisao date,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_andamento','concluida')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdi_acoes TO authenticated;
GRANT ALL ON public.pdi_acoes TO service_role;
ALTER TABLE public.pdi_acoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin tudo em pdi_acoes" ON public.pdi_acoes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestor CRUD pdi_acoes do time" ON public.pdi_acoes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.pdi p WHERE p.id = pdi_acoes.pdi_id AND is_gestor_de(p.colaborador_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pdi p WHERE p.id = pdi_acoes.pdi_id AND is_gestor_de(p.colaborador_id)));

CREATE POLICY "Colaborador ve proprias pdi_acoes" ON public.pdi_acoes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pdi p WHERE p.id = pdi_acoes.pdi_id AND eu_sou_colaborador(p.colaborador_id)));

CREATE POLICY "Colaborador atualiza status das proprias acoes" ON public.pdi_acoes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.pdi p WHERE p.id = pdi_acoes.pdi_id AND eu_sou_colaborador(p.colaborador_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pdi p WHERE p.id = pdi_acoes.pdi_id AND eu_sou_colaborador(p.colaborador_id)));

-- PDI Revisões
CREATE TABLE public.pdi_revisoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pdi_id uuid NOT NULL REFERENCES public.pdi(id) ON DELETE CASCADE,
  etapa_id uuid REFERENCES public.etapas_ciclo(id) ON DELETE SET NULL,
  tipo text CHECK (tipo IN ('ajuste_curso','encerramento')),
  evolucao text,
  ajustes text,
  novo_prazo date,
  data_revisao date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pdi_revisoes TO authenticated;
GRANT ALL ON public.pdi_revisoes TO service_role;
ALTER TABLE public.pdi_revisoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin tudo em pdi_revisoes" ON public.pdi_revisoes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Gestor CRUD pdi_revisoes do time" ON public.pdi_revisoes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.pdi p WHERE p.id = pdi_revisoes.pdi_id AND is_gestor_de(p.colaborador_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pdi p WHERE p.id = pdi_revisoes.pdi_id AND is_gestor_de(p.colaborador_id)));

CREATE POLICY "Colaborador ve proprias pdi_revisoes" ON public.pdi_revisoes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.pdi p WHERE p.id = pdi_revisoes.pdi_id AND eu_sou_colaborador(p.colaborador_id)));
