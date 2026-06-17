
-- AVALIACOES: restrict SELECT
DROP POLICY IF EXISTS "av select" ON public.avaliacoes;
CREATE POLICY "avaliacoes select scoped" ON public.avaliacoes
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'gestor')
  OR EXISTS (
    SELECT 1 FROM public.avaliacoes_respostas r
    WHERE r.avaliacao_id = avaliacoes.id
      AND (
        r.avaliado_id = public.meu_colaborador_id()
        OR r.avaliador_id = public.meu_colaborador_id()
      )
  )
);

-- PESQUISAS: hide drafts from regular collaborators
DROP POLICY IF EXISTS "pq select" ON public.pesquisas;
CREATE POLICY "pesquisas select scoped" ON public.pesquisas
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'gestor')
  OR status IN ('publicada', 'ativa', 'aberta', 'encerrada')
);

-- TREINAMENTOS: only enrolled or published for collaborators
DROP POLICY IF EXISTS "tr select" ON public.treinamentos;
CREATE POLICY "treinamentos select scoped" ON public.treinamentos
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'gestor')
  OR status IN ('publicado', 'ativo', 'aberto', 'concluido')
  OR EXISTS (
    SELECT 1 FROM public.treinamentos_participantes p
    WHERE p.treinamento_id = treinamentos.id
      AND p.colaborador_id = public.meu_colaborador_id()
  )
);

-- AVATARS bucket: allow any authenticated user to read avatars
DROP POLICY IF EXISTS "Avatars owner read" ON storage.objects;
CREATE POLICY "Avatars authenticated read" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'avatars');
