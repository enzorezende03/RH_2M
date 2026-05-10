
-- Table to manage public admission links sent to candidates
CREATE TABLE public.admissao_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  admissao_id text NOT NULL,
  nome text NOT NULL,
  email text NOT NULL,
  cargo text,
  departamento text,
  tipo_vinculo text,
  prazo_entrega date,
  status text NOT NULL DEFAULT 'nao_acessado', -- nao_acessado | em_preenchimento | concluido | expirado
  dados jsonb NOT NULL DEFAULT '{}'::jsonb,
  documentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  acessado_em timestamptz,
  concluido_em timestamptz,
  criado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admissao_links_token ON public.admissao_links(token);
CREATE INDEX idx_admissao_links_admissao_id ON public.admissao_links(admissao_id);

ALTER TABLE public.admissao_links ENABLE ROW LEVEL SECURITY;

-- Authenticated users (RH) can manage all links
CREATE POLICY "Auth users can view all admission links"
  ON public.admissao_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Auth users can insert admission links"
  ON public.admissao_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth users can update admission links"
  ON public.admissao_links FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Auth users can delete admission links"
  ON public.admissao_links FOR DELETE
  TO authenticated
  USING (true);

-- Public (candidate) access by token via SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.get_admissao_link_by_token(_token uuid)
RETURNS TABLE (
  id uuid,
  token uuid,
  admissao_id text,
  nome text,
  email text,
  cargo text,
  departamento text,
  tipo_vinculo text,
  prazo_entrega date,
  status text,
  dados jsonb,
  documentos jsonb,
  acessado_em timestamptz,
  concluido_em timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- mark as accessed if first access
  UPDATE public.admissao_links
    SET acessado_em = COALESCE(acessado_em, now()),
        status = CASE WHEN status = 'nao_acessado' THEN 'em_preenchimento' ELSE status END,
        updated_at = now()
    WHERE admissao_links.token = _token;

  RETURN QUERY
  SELECT al.id, al.token, al.admissao_id, al.nome, al.email, al.cargo,
         al.departamento, al.tipo_vinculo, al.prazo_entrega, al.status,
         al.dados, al.documentos, al.acessado_em, al.concluido_em, al.created_at
  FROM public.admissao_links al
  WHERE al.token = _token;
END;
$$;

CREATE OR REPLACE FUNCTION public.salvar_admissao_publica(
  _token uuid,
  _dados jsonb,
  _documentos jsonb,
  _concluir boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.admissao_links WHERE token = _token AND status <> 'expirado')
    INTO _exists;
  IF NOT _exists THEN
    RETURN false;
  END IF;

  UPDATE public.admissao_links
    SET dados = _dados,
        documentos = _documentos,
        status = CASE WHEN _concluir THEN 'concluido' ELSE 'em_preenchimento' END,
        concluido_em = CASE WHEN _concluir THEN now() ELSE concluido_em END,
        acessado_em = COALESCE(acessado_em, now()),
        updated_at = now()
    WHERE token = _token;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admissao_link_by_token(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.salvar_admissao_publica(uuid, jsonb, jsonb, boolean) TO anon, authenticated;

CREATE TRIGGER update_admissao_links_updated_at
  BEFORE UPDATE ON public.admissao_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
