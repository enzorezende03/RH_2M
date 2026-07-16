
CREATE TABLE public.quesitos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  descricao text,
  desc_nota_1 text,
  desc_nota_2 text,
  desc_nota_3 text,
  desc_nota_4 text,
  ordem int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quesitos TO authenticated;
GRANT ALL ON public.quesitos TO service_role;
ALTER TABLE public.quesitos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read quesitos" ON public.quesitos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage quesitos" ON public.quesitos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.quesitos (codigo, nome, descricao, desc_nota_1, desc_nota_2, desc_nota_3, desc_nota_4, ordem) VALUES
('Q1','Qualidade','Grau de perfeição com que executa suas funções.',
 'Falhas recorrentes, precisa melhorar muito.','Qualidade regular, atende parcialmente.','Bem executado, boa qualidade e raras falhas.','Excelente, alto padrão e sem erros.',1),
('Q2','Interesse pelo Trabalho','Dedicação e busca por desenvolvimento.',
 'Indiferente, sem interesse em progredir.','Interesse ocasional.','Interesse constante e busca por desenvolvimento.','Interesse elevado e empenho contínuo.',2),
('Q3','Relacionamento com a Equipe','Capacidade de se relacionar e colaborar.',
 'Relacionamento insatisfatório.','Aceitável, pouca integração.','Bom relacionamento.','Excelente, promove integração e cooperação.',3),
('Q4','Organização e Método','Capacidade de planejar e organizar de forma eficiente.',
 'Desorganizado, prejudica os serviços.','Organização mínima.','Boa organização e planejamento.','Altamente organizado, planejamento exemplar.',4),
('Q5','Trabalho em Equipe','Disposição para contribuir com o sucesso coletivo.',
 'Não coopera, individualista.','Coopera de forma limitada.','Coopera ativamente.','Cooperação plena e proativa.',5);
