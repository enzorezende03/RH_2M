
-- Restrict gestor SELECT to direct reports only
DROP POLICY IF EXISTS "desl select" ON public.desligamentos;
CREATE POLICY "desl select" ON public.desligamentos FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'gestor'::app_role) AND is_gestor_de(colaborador_id))
  OR eu_sou_colaborador(colaborador_id)
);

DROP POLICY IF EXISTS "fer select" ON public.ferias_solicitacoes;
CREATE POLICY "fer select" ON public.ferias_solicitacoes FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'gestor'::app_role) AND is_gestor_de(colaborador_id))
  OR eu_sou_colaborador(colaborador_id)
);

DROP POLICY IF EXISTS "rec select" ON public.recesso_solicitacoes;
CREATE POLICY "rec select" ON public.recesso_solicitacoes FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'gestor'::app_role) AND is_gestor_de(colaborador_id))
  OR eu_sou_colaborador(colaborador_id)
);

-- Revoke column-level SELECT on cargos.salario from regular authenticated users.
-- Salary access flows only through public.cargo_salarios() SECURITY DEFINER RPC.
REVOKE SELECT (salario) ON public.cargos FROM authenticated;
REVOKE SELECT (salario) ON public.cargos FROM anon;
