
CREATE TABLE public.ciclos_avaliacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  periodo_apuracao_inicio date NOT NULL,
  periodo_apuracao_fim date NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ciclos_avaliacao TO authenticated;
GRANT ALL ON public.ciclos_avaliacao TO service_role;
ALTER TABLE public.ciclos_avaliacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage ciclos" ON public.ciclos_avaliacao FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Auth read ciclos" ON public.ciclos_avaliacao FOR SELECT TO authenticated USING (true);

CREATE TABLE public.etapas_ciclo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo_id uuid NOT NULL REFERENCES public.ciclos_avaliacao(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('inicial_pdi','ajuste_curso','encerramento')),
  ordem int NOT NULL,
  nome text NOT NULL,
  janela_inicio date NOT NULL,
  janela_fim date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.etapas_ciclo TO authenticated;
GRANT ALL ON public.etapas_ciclo TO service_role;
ALTER TABLE public.etapas_ciclo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage etapas" ON public.etapas_ciclo FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Auth read etapas" ON public.etapas_ciclo FOR SELECT TO authenticated USING (true);

WITH novo AS (
  INSERT INTO public.ciclos_avaliacao (nome, periodo_apuracao_inicio, periodo_apuracao_fim, ativo)
  VALUES ('Ciclo 2026/2027', '2026-04-01', '2027-03-31', true)
  RETURNING id
)
INSERT INTO public.etapas_ciclo (ciclo_id, tipo, ordem, nome, janela_inicio, janela_fim)
SELECT novo.id, v.tipo, v.ordem, v.nome, v.ji::date, v.jf::date
FROM novo, (VALUES
  ('inicial_pdi', 1, 'Feedback Inicial e PDI', '2026-07-20', '2026-08-07'),
  ('ajuste_curso', 2, 'Feedback de Ajuste de Curso', '2026-11-02', '2026-11-30'),
  ('encerramento', 3, 'Feedback de Encerramento', '2027-04-01', '2027-04-30')
) AS v(tipo, ordem, nome, ji, jf);
