
-- 1) Trigger para bloquear alteração de campos sensíveis em colaboradores por não-admin
CREATE OR REPLACE FUNCTION public.colaboradores_bloquear_campos_sensiveis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.gestor_id IS DISTINCT FROM OLD.gestor_id
     OR NEW.papel IS DISTINCT FROM OLD.papel
     OR NEW.cargo IS DISTINCT FROM OLD.cargo
     OR NEW.cargo_visivel IS DISTINCT FROM OLD.cargo_visivel
     OR NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar user_id, gestor_id, papel, cargo, cargo_visivel ou status.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_colaboradores_bloquear_campos_sensiveis ON public.colaboradores;
CREATE TRIGGER trg_colaboradores_bloquear_campos_sensiveis
BEFORE UPDATE ON public.colaboradores
FOR EACH ROW EXECUTE FUNCTION public.colaboradores_bloquear_campos_sensiveis();

-- 2) Restringir inserção de respostas apenas para pesquisas abertas/ativas/publicadas
DROP POLICY IF EXISTS "pqr insert" ON public.pesquisas_respostas;

CREATE POLICY "pqr insert"
ON public.pesquisas_respostas
FOR INSERT
WITH CHECK (
  ((respondente_id IS NULL) OR public.eu_sou_colaborador(respondente_id))
  AND EXISTS (
    SELECT 1 FROM public.pesquisas p
    WHERE p.id = pesquisas_respostas.pesquisa_id
      AND p.status = ANY (ARRAY['publicada'::text, 'ativa'::text, 'aberta'::text])
  )
);
