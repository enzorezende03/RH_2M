
-- Tighten ouvidoria insert: require requester to be a legit colaborador even for anonymous
DROP POLICY IF EXISTS "ouv insert" ON public.ouvidoria_mensagens;
CREATE POLICY "ouv insert" ON public.ouvidoria_mensagens
FOR INSERT
WITH CHECK (eu_sou_colaborador(autor_id));

-- Remove broad SELECT on avatars bucket to prevent listing.
-- Public bucket reads via getPublicUrl still work (CDN), no listing exposed.
DROP POLICY IF EXISTS "Avatars authenticated read" ON storage.objects;
