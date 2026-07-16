
-- Permitir que qualquer usuário autenticado registre ocorrências (as suas)
CREATE POLICY "Autenticado registra ocorrencia"
ON public.ocorrencias
FOR INSERT
TO authenticated
WITH CHECK (registrado_por = auth.uid());

-- Autor pode ver e editar as próprias ocorrências
CREATE POLICY "Autor le ocorrencia"
ON public.ocorrencias
FOR SELECT
TO authenticated
USING (registrado_por = auth.uid());

CREATE POLICY "Autor edita ocorrencia"
ON public.ocorrencias
FOR UPDATE
TO authenticated
USING (registrado_por = auth.uid())
WITH CHECK (registrado_por = auth.uid());
