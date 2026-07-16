
-- Soft delete columns
ALTER TABLE public.ocorrencias
  ADD COLUMN IF NOT EXISTS excluida_em timestamptz,
  ADD COLUMN IF NOT EXISTS excluida_por uuid;

-- Remove hard-delete policies (only admins delete, and via soft delete RPC)
DROP POLICY IF EXISTS "Autor exclui ocorrencia" ON public.ocorrencias;

-- Prevent non-admin from directly toggling exclusion columns
CREATE OR REPLACE FUNCTION public.ocorrencias_bloquear_exclusao_direta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF NEW.excluida_em IS DISTINCT FROM OLD.excluida_em
     OR NEW.excluida_por IS DISTINCT FROM OLD.excluida_por THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir ou restaurar ocorrências.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ocorrencias_bloquear_exclusao_direta ON public.ocorrencias;
CREATE TRIGGER trg_ocorrencias_bloquear_exclusao_direta
BEFORE UPDATE ON public.ocorrencias
FOR EACH ROW EXECUTE FUNCTION public.ocorrencias_bloquear_exclusao_direta();

-- RPCs para exclusão / restauração (somente admin)
CREATE OR REPLACE FUNCTION public.excluir_ocorrencia(_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir ocorrências.';
  END IF;
  UPDATE public.ocorrencias
     SET excluida_em = now(), excluida_por = auth.uid(), updated_at = now()
   WHERE id = _id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.restaurar_ocorrencia(_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Apenas administradores podem restaurar ocorrências.';
  END IF;
  UPDATE public.ocorrencias
     SET excluida_em = NULL, excluida_por = NULL, updated_at = now()
   WHERE id = _id;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.excluir_ocorrencia(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restaurar_ocorrencia(uuid) TO authenticated;
