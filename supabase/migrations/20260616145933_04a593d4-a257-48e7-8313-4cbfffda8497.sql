
-- Fix 1: feedbacks insert no longer allows null autor_id (prevent unattributed feedback injection)
DROP POLICY IF EXISTS "fb insert" ON public.feedbacks;
CREATE POLICY "fb insert" ON public.feedbacks
  FOR INSERT TO authenticated
  WITH CHECK (eu_sou_colaborador(autor_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: allow colaboradores to read comunicados-anexos files
CREATE POLICY "com storage select colaborador" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'comunicados-anexos'
    AND EXISTS (SELECT 1 FROM public.colaboradores c WHERE c.user_id = auth.uid())
  );
