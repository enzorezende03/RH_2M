-- =========================================================
-- FASES 2-5: Todas as tabelas + RLS
-- =========================================================

-- Função auxiliar de "é dono" via colaborador_id ↔ user_id
CREATE OR REPLACE FUNCTION public.eu_sou_colaborador(_colaborador_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.colaboradores WHERE id = _colaborador_id AND user_id = auth.uid());
$$;
REVOKE EXECUTE ON FUNCTION public.eu_sou_colaborador(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.eu_sou_colaborador(uuid) TO authenticated;

-- =========================================================
-- PESSOAS
-- =========================================================

CREATE TABLE public.desligamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  data_desligamento date NOT NULL,
  motivo text,
  tipo text,
  status text NOT NULL DEFAULT 'em_andamento',
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ferias_solicitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  periodo_inicio date NOT NULL,
  periodo_fim date NOT NULL,
  dias integer,
  tipo text NOT NULL DEFAULT 'ferias',
  status text NOT NULL DEFAULT 'pendente',
  observacoes text,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.recrutamento_vagas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  departamento text,
  unidade text,
  tipo_vinculo text,
  descricao text,
  requisitos text,
  status text NOT NULL DEFAULT 'aberta',
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.recrutamento_candidatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vaga_id uuid REFERENCES public.recrutamento_vagas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text,
  telefone text,
  fase text NOT NULL DEFAULT 'inscrito',
  pontuacao integer,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- DESEMPENHO
-- =========================================================

CREATE TABLE public.feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  destinatario_id uuid REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'positivo',
  conteudo text NOT NULL,
  visibilidade text NOT NULL DEFAULT 'privado',
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reunioes_1a1 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lider_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  titulo text,
  data timestamptz NOT NULL,
  duracao integer,
  status text NOT NULL DEFAULT 'agendada',
  pauta text,
  notas text,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  responsavel_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  periodo_inicio date,
  periodo_fim date,
  status text NOT NULL DEFAULT 'em_andamento',
  progresso integer NOT NULL DEFAULT 0,
  privacidade text NOT NULL DEFAULT 'todos',
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.metas_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_id uuid NOT NULL REFERENCES public.metas(id) ON DELETE CASCADE,
  autor_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  valor integer,
  comentario text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo text NOT NULL,
  tipo text NOT NULL DEFAULT 'autoavaliacao',
  titulo text,
  status text NOT NULL DEFAULT 'aberta',
  data_inicio date,
  data_fim date,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.avaliacoes_respostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id uuid NOT NULL REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
  avaliador_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  avaliado_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  pontuacao numeric,
  status text NOT NULL DEFAULT 'rascunho',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pdi_objetivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  competencia text,
  prazo date,
  status text NOT NULL DEFAULT 'em_andamento',
  progresso integer NOT NULL DEFAULT 0,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pdi_acoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objetivo_id uuid NOT NULL REFERENCES public.pdi_objetivos(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  prazo date,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.treinamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  tipo text,
  data_inicio timestamptz,
  data_fim timestamptz,
  carga_horaria integer,
  instrutor text,
  local text,
  status text NOT NULL DEFAULT 'planejado',
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.treinamentos_participantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treinamento_id uuid NOT NULL REFERENCES public.treinamentos(id) ON DELETE CASCADE,
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'inscrito',
  feedback text,
  avaliacao integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (treinamento_id, colaborador_id)
);

-- =========================================================
-- PESQUISAS E INSIGHTS
-- =========================================================

CREATE TABLE public.pesquisas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  titulo text NOT NULL,
  descricao text,
  status text NOT NULL DEFAULT 'rascunho',
  data_inicio timestamptz,
  data_fim timestamptz,
  anonima boolean NOT NULL DEFAULT true,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pesquisas_perguntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pesquisa_id uuid NOT NULL REFERENCES public.pesquisas(id) ON DELETE CASCADE,
  ordem integer NOT NULL DEFAULT 0,
  texto text NOT NULL,
  tipo text NOT NULL DEFAULT 'texto',
  opcoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  obrigatoria boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pesquisas_respostas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pesquisa_id uuid NOT NULL REFERENCES public.pesquisas(id) ON DELETE CASCADE,
  respondente_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  respostas jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.planos_acao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  responsavel_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  pesquisa_id uuid REFERENCES public.pesquisas(id) ON DELETE SET NULL,
  prazo date,
  status text NOT NULL DEFAULT 'aberto',
  prioridade text DEFAULT 'media',
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ouvidoria_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  anonimo boolean NOT NULL DEFAULT false,
  assunto text NOT NULL,
  categoria text,
  conteudo text NOT NULL,
  status text NOT NULL DEFAULT 'aberta',
  resposta text,
  respondido_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  respondido_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- COMUNICAÇÃO E ÁREA DO COLABORADOR
-- =========================================================

CREATE TABLE public.comunicados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  conteudo text NOT NULL,
  etiquetas text[] DEFAULT ARRAY[]::text[],
  autor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  publicado boolean NOT NULL DEFAULT false,
  publicado_em timestamptz,
  expira_em timestamptz,
  destinatarios jsonb NOT NULL DEFAULT '{}'::jsonb,
  anexos jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.comunicados_leituras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comunicado_id uuid NOT NULL REFERENCES public.comunicados(id) ON DELETE CASCADE,
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  lido_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comunicado_id, colaborador_id)
);

CREATE TABLE public.holerites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  mes integer NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano integer NOT NULL,
  tipo text NOT NULL DEFAULT 'mensal',
  valor_liquido numeric,
  arquivo_path text,
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (colaborador_id, mes, ano, tipo)
);

CREATE TABLE public.atualizacoes_cadastro (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  campos jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pendente',
  motivo text,
  revisado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  revisado_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.recesso_solicitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  periodo_inicio date NOT NULL,
  periodo_fim date NOT NULL,
  motivo text,
  status text NOT NULL DEFAULT 'pendente',
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================================
-- TRIGGERS updated_at
-- =========================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'desligamentos','ferias_solicitacoes','recrutamento_vagas','recrutamento_candidatos',
    'feedbacks','reunioes_1a1','metas','avaliacoes','avaliacoes_respostas',
    'pdi_objetivos','pdi_acoes','treinamentos','treinamentos_participantes',
    'pesquisas','planos_acao','ouvidoria_mensagens',
    'comunicados','holerites','atualizacoes_cadastro','recesso_solicitacoes'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t);
  END LOOP;
END $$;

-- =========================================================
-- RLS: ENABLE em todas
-- =========================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'desligamentos','ferias_solicitacoes','recrutamento_vagas','recrutamento_candidatos',
    'feedbacks','reunioes_1a1','metas','metas_checkins','avaliacoes','avaliacoes_respostas',
    'pdi_objetivos','pdi_acoes','treinamentos','treinamentos_participantes',
    'pesquisas','pesquisas_perguntas','pesquisas_respostas','planos_acao','ouvidoria_mensagens',
    'comunicados','comunicados_leituras','holerites','atualizacoes_cadastro','recesso_solicitacoes'
  ]) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- =========================================================
-- POLÍTICAS
-- Padrão: admin = tudo; gestor = vê tudo do time; colaborador = vê seus dados
-- =========================================================

-- Desligamentos (RH): só admin/gestor; colaborador vê o próprio
CREATE POLICY "desl select" ON public.desligamentos FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(colaborador_id));
CREATE POLICY "desl insert" ON public.desligamentos FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "desl update" ON public.desligamentos FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "desl delete" ON public.desligamentos FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- Férias: colaborador solicita o próprio; admin/gestor aprova
CREATE POLICY "fer select" ON public.ferias_solicitacoes FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(colaborador_id));
CREATE POLICY "fer insert" ON public.ferias_solicitacoes FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(colaborador_id));
CREATE POLICY "fer update" ON public.ferias_solicitacoes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(colaborador_id));
CREATE POLICY "fer delete" ON public.ferias_solicitacoes FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- Recrutamento: admin/gestor gerenciam; todos autenticados podem ver vagas
CREATE POLICY "vagas select" ON public.recrutamento_vagas FOR SELECT TO authenticated USING (true);
CREATE POLICY "vagas insert" ON public.recrutamento_vagas FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "vagas update" ON public.recrutamento_vagas FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "vagas delete" ON public.recrutamento_vagas FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE POLICY "cand select" ON public.recrutamento_candidatos FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "cand insert" ON public.recrutamento_candidatos FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "cand update" ON public.recrutamento_candidatos FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "cand delete" ON public.recrutamento_candidatos FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- Feedbacks: autor e destinatário veem; admin tudo
CREATE POLICY "fb select" ON public.feedbacks FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(autor_id) OR eu_sou_colaborador(destinatario_id) OR is_gestor_de(destinatario_id));
CREATE POLICY "fb insert" ON public.feedbacks FOR INSERT TO authenticated WITH CHECK (autor_id IS NULL OR eu_sou_colaborador(autor_id) OR has_role(auth.uid(),'admin'));
CREATE POLICY "fb update" ON public.feedbacks FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(autor_id));
CREATE POLICY "fb delete" ON public.feedbacks FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(autor_id));

-- Reuniões 1:1: líder e colaborador veem
CREATE POLICY "r1a1 select" ON public.reunioes_1a1 FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(lider_id) OR eu_sou_colaborador(colaborador_id) OR is_gestor_de(colaborador_id));
CREATE POLICY "r1a1 insert" ON public.reunioes_1a1 FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR eu_sou_colaborador(lider_id) OR is_gestor_de(colaborador_id));
CREATE POLICY "r1a1 update" ON public.reunioes_1a1 FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(lider_id) OR eu_sou_colaborador(colaborador_id) OR is_gestor_de(colaborador_id));
CREATE POLICY "r1a1 delete" ON public.reunioes_1a1 FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(lider_id));

-- Metas: responsável vê a sua; admin/gestor veem tudo do time
CREATE POLICY "metas select" ON public.metas FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(responsavel_id) OR privacidade = 'todos');
CREATE POLICY "metas insert" ON public.metas FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(responsavel_id));
CREATE POLICY "metas update" ON public.metas FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(responsavel_id));
CREATE POLICY "metas delete" ON public.metas FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));

CREATE POLICY "metas_ck select" ON public.metas_checkins FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.metas m WHERE m.id = meta_id AND (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(m.responsavel_id) OR m.privacidade='todos')));
CREATE POLICY "metas_ck insert" ON public.metas_checkins FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.metas m WHERE m.id = meta_id AND (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(m.responsavel_id))));
CREATE POLICY "metas_ck delete" ON public.metas_checkins FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(autor_id));

-- Avaliações: admin gerencia; participantes veem
CREATE POLICY "av select" ON public.avaliacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "av insert" ON public.avaliacoes FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "av update" ON public.avaliacoes FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "av delete" ON public.avaliacoes FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE POLICY "avr select" ON public.avaliacoes_respostas FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(avaliador_id) OR eu_sou_colaborador(avaliado_id) OR is_gestor_de(avaliado_id));
CREATE POLICY "avr insert" ON public.avaliacoes_respostas FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR eu_sou_colaborador(avaliador_id));
CREATE POLICY "avr update" ON public.avaliacoes_respostas FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(avaliador_id));
CREATE POLICY "avr delete" ON public.avaliacoes_respostas FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- PDI
CREATE POLICY "pdi select" ON public.pdi_objetivos FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(colaborador_id) OR is_gestor_de(colaborador_id));
CREATE POLICY "pdi insert" ON public.pdi_objetivos FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR eu_sou_colaborador(colaborador_id) OR is_gestor_de(colaborador_id));
CREATE POLICY "pdi update" ON public.pdi_objetivos FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(colaborador_id) OR is_gestor_de(colaborador_id));
CREATE POLICY "pdi delete" ON public.pdi_objetivos FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(colaborador_id) OR is_gestor_de(colaborador_id));

CREATE POLICY "pdi_a select" ON public.pdi_acoes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pdi_objetivos o WHERE o.id = objetivo_id AND (
    has_role(auth.uid(),'admin') OR eu_sou_colaborador(o.colaborador_id) OR is_gestor_de(o.colaborador_id))));
CREATE POLICY "pdi_a write" ON public.pdi_acoes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pdi_objetivos o WHERE o.id = objetivo_id AND (
    has_role(auth.uid(),'admin') OR eu_sou_colaborador(o.colaborador_id) OR is_gestor_de(o.colaborador_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pdi_objetivos o WHERE o.id = objetivo_id AND (
    has_role(auth.uid(),'admin') OR eu_sou_colaborador(o.colaborador_id) OR is_gestor_de(o.colaborador_id))));

-- Treinamentos
CREATE POLICY "tr select" ON public.treinamentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "tr insert" ON public.treinamentos FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "tr update" ON public.treinamentos FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "tr delete" ON public.treinamentos FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE POLICY "trp select" ON public.treinamentos_participantes FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(colaborador_id));
CREATE POLICY "trp insert" ON public.treinamentos_participantes FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(colaborador_id));
CREATE POLICY "trp update" ON public.treinamentos_participantes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(colaborador_id));
CREATE POLICY "trp delete" ON public.treinamentos_participantes FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- Pesquisas
CREATE POLICY "pq select" ON public.pesquisas FOR SELECT TO authenticated USING (true);
CREATE POLICY "pq insert" ON public.pesquisas FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "pq update" ON public.pesquisas FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "pq delete" ON public.pesquisas FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE POLICY "pqp select" ON public.pesquisas_perguntas FOR SELECT TO authenticated USING (true);
CREATE POLICY "pqp write" ON public.pesquisas_perguntas FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'))
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));

CREATE POLICY "pqr select" ON public.pesquisas_respostas FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "pqr insert" ON public.pesquisas_respostas FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "pa select" ON public.planos_acao FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(responsavel_id));
CREATE POLICY "pa insert" ON public.planos_acao FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "pa update" ON public.planos_acao FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(responsavel_id));
CREATE POLICY "pa delete" ON public.planos_acao FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- Ouvidoria
CREATE POLICY "ouv select" ON public.ouvidoria_mensagens FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR (NOT anonimo AND eu_sou_colaborador(autor_id)));
CREATE POLICY "ouv insert" ON public.ouvidoria_mensagens FOR INSERT TO authenticated
  WITH CHECK (anonimo OR eu_sou_colaborador(autor_id));
CREATE POLICY "ouv update" ON public.ouvidoria_mensagens FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "ouv delete" ON public.ouvidoria_mensagens FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- Comunicados
CREATE POLICY "com select" ON public.comunicados FOR SELECT TO authenticated USING (publicado OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "com insert" ON public.comunicados FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "com update" ON public.comunicados FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "com delete" ON public.comunicados FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE POLICY "com_l select" ON public.comunicados_leituras FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(colaborador_id));
CREATE POLICY "com_l insert" ON public.comunicados_leituras FOR INSERT TO authenticated
  WITH CHECK (eu_sou_colaborador(colaborador_id));

-- Holerites
CREATE POLICY "hol select" ON public.holerites FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(colaborador_id));
CREATE POLICY "hol insert" ON public.holerites FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "hol update" ON public.holerites FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "hol delete" ON public.holerites FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- Atualizações de cadastro
CREATE POLICY "atc select" ON public.atualizacoes_cadastro FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR eu_sou_colaborador(colaborador_id));
CREATE POLICY "atc insert" ON public.atualizacoes_cadastro FOR INSERT TO authenticated
  WITH CHECK (eu_sou_colaborador(colaborador_id));
CREATE POLICY "atc update" ON public.atualizacoes_cadastro FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "atc delete" ON public.atualizacoes_cadastro FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- Recesso
CREATE POLICY "rec select" ON public.recesso_solicitacoes FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor') OR eu_sou_colaborador(colaborador_id));
CREATE POLICY "rec insert" ON public.recesso_solicitacoes FOR INSERT TO authenticated
  WITH CHECK (eu_sou_colaborador(colaborador_id));
CREATE POLICY "rec update" ON public.recesso_solicitacoes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'));
CREATE POLICY "rec delete" ON public.recesso_solicitacoes FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('holerites','holerites', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('comunicados-anexos','comunicados-anexos', false) ON CONFLICT (id) DO NOTHING;

-- Holerites: colaborador acessa apenas pasta com o id do seu colaborador
CREATE POLICY "hol storage select" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'holerites' AND (
    has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.colaboradores c WHERE c.user_id = auth.uid() AND (storage.foldername(name))[1] = c.id::text)
  )
);
CREATE POLICY "hol storage admin write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'holerites' AND has_role(auth.uid(),'admin')
);
CREATE POLICY "hol storage admin update" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'holerites' AND has_role(auth.uid(),'admin')
);
CREATE POLICY "hol storage admin delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'holerites' AND has_role(auth.uid(),'admin')
);

-- Comunicados anexos: leitura para todos autenticados; escrita admin/gestor
CREATE POLICY "com storage select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'comunicados-anexos');
CREATE POLICY "com storage write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'comunicados-anexos' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'))
);
CREATE POLICY "com storage delete" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'comunicados-anexos' AND (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'gestor'))
);