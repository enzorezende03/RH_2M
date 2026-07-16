
CREATE TABLE public.ocorrencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  data_ocorrencia date NOT NULL DEFAULT current_date,
  tipo text NOT NULL CHECK (tipo IN ('Positiva','Negativa')),
  quesito_codigo text NOT NULL CHECK (quesito_codigo IN ('Q1','Q2','Q3','Q4','Q5')),
  etapa_referencia text,
  descricao text,
  registrado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ocorrencias TO authenticated;
GRANT ALL ON public.ocorrencias TO service_role;
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin all ocorrencias" ON public.ocorrencias FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Gestor CRUD ocorrencias do time" ON public.ocorrencias FOR ALL TO authenticated
  USING (public.is_gestor_de(colaborador_id))
  WITH CHECK (public.is_gestor_de(colaborador_id));
