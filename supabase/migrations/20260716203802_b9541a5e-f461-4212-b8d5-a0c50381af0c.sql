
DROP TABLE IF EXISTS public.avaliacoes_respostas CASCADE;
DROP TABLE IF EXISTS public.avaliacoes CASCADE;

CREATE TABLE public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  etapa_id uuid NOT NULL REFERENCES public.etapas_ciclo(id) ON DELETE CASCADE,
  avaliador_id uuid,
  data_avaliacao date NOT NULL DEFAULT current_date,
  q1_qualidade int NOT NULL CHECK (q1_qualidade BETWEEN 1 AND 4),
  q2_interesse int NOT NULL CHECK (q2_interesse BETWEEN 1 AND 4),
  q3_relacionamento int NOT NULL CHECK (q3_relacionamento BETWEEN 1 AND 4),
  q4_organizacao int NOT NULL CHECK (q4_organizacao BETWEEN 1 AND 4),
  q5_trabalho_equipe int NOT NULL CHECK (q5_trabalho_equipe BETWEEN 1 AND 4),
  nota_media numeric GENERATED ALWAYS AS
    ((q1_qualidade+q2_interesse+q3_relacionamento+q4_organizacao+q5_trabalho_equipe)/5.0) STORED,
  pct_desempenho numeric GENERATED ALWAYS AS
    ((q1_qualidade+q2_interesse+q3_relacionamento+q4_organizacao+q5_trabalho_equipe)/20.0) STORED,
  situacao text GENERATED ALWAYS AS
    (CASE WHEN (q1_qualidade+q2_interesse+q3_relacionamento+q4_organizacao+q5_trabalho_equipe) >= 14
      THEN 'Apto' ELSE 'Inapto' END) STORED,
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','enviada')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (colaborador_id, etapa_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.avaliacoes TO authenticated;
GRANT ALL ON public.avaliacoes TO service_role;

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin all avaliacoes" ON public.avaliacoes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Gestor CRUD avaliacoes do time" ON public.avaliacoes FOR ALL TO authenticated
  USING (public.is_gestor_de(colaborador_id))
  WITH CHECK (public.is_gestor_de(colaborador_id));

CREATE POLICY "Colaborador ve as proprias" ON public.avaliacoes FOR SELECT TO authenticated
  USING (colaborador_id = public.meu_colaborador_id());

CREATE TRIGGER update_avaliacoes_updated_at
  BEFORE UPDATE ON public.avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
