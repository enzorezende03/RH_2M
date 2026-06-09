
-- 1) Hide salary column from regular users
REVOKE SELECT (salario) ON public.cargos FROM authenticated;

CREATE OR REPLACE FUNCTION public.cargo_salarios()
RETURNS TABLE(id uuid, salario numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, salario FROM public.cargos
  WHERE has_role(auth.uid(), 'admin'::app_role)
     OR has_role(auth.uid(), 'gestor'::app_role);
$$;
REVOKE EXECUTE ON FUNCTION public.cargo_salarios() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cargo_salarios() TO authenticated;

-- 2) Add gestor_id FK and rewrite is_gestor_de to use it
ALTER TABLE public.colaboradores
  ADD COLUMN IF NOT EXISTS gestor_id uuid REFERENCES public.colaboradores(id) ON DELETE SET NULL;

UPDATE public.colaboradores alvo
SET gestor_id = g.id
FROM public.colaboradores g
WHERE g.nome_completo = alvo.gestor_direto
  AND alvo.gestor_id IS NULL
  AND alvo.gestor_direto IS NOT NULL;

CREATE OR REPLACE FUNCTION public.is_gestor_de(_colaborador_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.colaboradores alvo
    JOIN public.colaboradores gestor ON gestor.id = alvo.gestor_id
    WHERE alvo.id = _colaborador_id
      AND gestor.user_id = auth.uid()
  );
$$;

-- 3) Restrict gestor SELECT on colaboradores to their direct reports only
DROP POLICY IF EXISTS "Colab select por papel" ON public.colaboradores;
CREATE POLICY "Colab select por papel" ON public.colaboradores
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR user_id = auth.uid()
  OR public.is_gestor_de(id)
);

-- 4) pesquisas_respostas: only allow inserts as self (or anonymous)
DROP POLICY IF EXISTS "pqr insert" ON public.pesquisas_respostas;
CREATE POLICY "pqr insert" ON public.pesquisas_respostas
FOR INSERT WITH CHECK (
  respondente_id IS NULL OR public.eu_sou_colaborador(respondente_id)
);

-- 5) Avatars bucket: drop broad public SELECT (public URLs still work via bucket public flag)
DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;
CREATE POLICY "Avatars owner read" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 6) Revoke EXECUTE from anon on internal helper functions (keep authenticated for RLS)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_gestor_de(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.meu_colaborador_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.meus_papeis() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.eu_sou_colaborador(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_gestor_de(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.meu_colaborador_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.meus_papeis() TO authenticated;
GRANT EXECUTE ON FUNCTION public.eu_sou_colaborador(uuid) TO authenticated;
