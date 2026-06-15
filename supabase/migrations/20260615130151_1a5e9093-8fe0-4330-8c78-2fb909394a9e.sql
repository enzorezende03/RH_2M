
-- 1. Cargos: restringir SELECT a admin/gestor
DROP POLICY IF EXISTS "Cargos select autenticados" ON public.cargos;
CREATE POLICY "Cargos select admin gestor"
ON public.cargos FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'gestor'::app_role)
);

-- 2. Storage comunicados-anexos: restringir SELECT a admin/gestor
DROP POLICY IF EXISTS "com storage select" ON storage.objects;
CREATE POLICY "com storage select"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'comunicados-anexos'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'gestor'::app_role)
  )
);

-- 3. Desligamentos INSERT: gestor só para subordinados
DROP POLICY IF EXISTS "desl insert" ON public.desligamentos;
CREATE POLICY "desl insert"
ON public.desligamentos FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'gestor'::app_role) AND is_gestor_de(colaborador_id))
);

-- 4. Desligamentos UPDATE: gestor só para subordinados
DROP POLICY IF EXISTS "desl update" ON public.desligamentos;
CREATE POLICY "desl update"
ON public.desligamentos FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'gestor'::app_role) AND is_gestor_de(colaborador_id))
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'gestor'::app_role) AND is_gestor_de(colaborador_id))
);

-- 5. Ferias UPDATE: gestor só para subordinados
DROP POLICY IF EXISTS "fer update" ON public.ferias_solicitacoes;
CREATE POLICY "fer update"
ON public.ferias_solicitacoes FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'gestor'::app_role) AND is_gestor_de(colaborador_id))
  OR eu_sou_colaborador(colaborador_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'gestor'::app_role) AND is_gestor_de(colaborador_id))
  OR eu_sou_colaborador(colaborador_id)
);

-- 6. Recesso UPDATE: gestor só para subordinados
DROP POLICY IF EXISTS "rec update" ON public.recesso_solicitacoes;
CREATE POLICY "rec update"
ON public.recesso_solicitacoes FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'gestor'::app_role) AND is_gestor_de(colaborador_id))
  OR eu_sou_colaborador(colaborador_id)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'gestor'::app_role) AND is_gestor_de(colaborador_id))
  OR eu_sou_colaborador(colaborador_id)
);
