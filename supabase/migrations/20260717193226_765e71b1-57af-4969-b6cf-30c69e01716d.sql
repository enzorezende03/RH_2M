
-- Extend colaboradores column protection to more sensitive fields for non-admins
CREATE OR REPLACE FUNCTION public.colaboradores_bloquear_campos_sensiveis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.gestor_id IS DISTINCT FROM OLD.gestor_id
     OR NEW.gestor_direto IS DISTINCT FROM OLD.gestor_direto
     OR NEW.gestor_cargo IS DISTINCT FROM OLD.gestor_cargo
     OR NEW.papel IS DISTINCT FROM OLD.papel
     OR NEW.cargo IS DISTINCT FROM OLD.cargo
     OR NEW.cargo_visivel IS DISTINCT FROM OLD.cargo_visivel
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.tag IS DISTINCT FROM OLD.tag
     OR NEW.responsavel IS DISTINCT FROM OLD.responsavel
     OR NEW.lider IS DISTINCT FROM OLD.lider
     OR NEW.unidade IS DISTINCT FROM OLD.unidade
     OR NEW.departamento IS DISTINCT FROM OLD.departamento
     OR NEW.dados_completos IS DISTINCT FROM OLD.dados_completos THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar campos organizacionais/sensíveis do colaborador.';
  END IF;

  RETURN NEW;
END;
$function$;

-- pdi_acoes: restrict self-service updates to status column only
CREATE OR REPLACE FUNCTION public.pdi_acoes_restringir_colaborador()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _colab_id uuid;
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  SELECT p.colaborador_id INTO _colab_id FROM public.pdi p WHERE p.id = NEW.pdi_id;

  -- if manager of that pdi's colaborador, allow all
  IF _colab_id IS NOT NULL AND public.is_gestor_de(_colab_id) THEN
    RETURN NEW;
  END IF;

  -- otherwise (owner colaborador), only status may change
  IF NEW.pdi_id IS DISTINCT FROM OLD.pdi_id
     OR NEW.descricao IS DISTINCT FROM OLD.descricao
     OR NEW.quesito_codigo IS DISTINCT FROM OLD.quesito_codigo
     OR NEW.prazo_revisao IS DISTINCT FROM OLD.prazo_revisao THEN
    RAISE EXCEPTION 'Colaboradores só podem alterar o status das próprias ações do PDI.';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_pdi_acoes_restringir_colaborador ON public.pdi_acoes;
CREATE TRIGGER trg_pdi_acoes_restringir_colaborador
BEFORE UPDATE ON public.pdi_acoes
FOR EACH ROW EXECUTE FUNCTION public.pdi_acoes_restringir_colaborador();
