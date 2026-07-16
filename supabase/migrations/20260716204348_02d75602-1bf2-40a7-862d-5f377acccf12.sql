
CREATE OR REPLACE VIEW public.vw_consolidado
WITH (security_invoker = true) AS
WITH ciclo AS (
  SELECT * FROM public.ciclos_avaliacao WHERE ativo = true ORDER BY created_at DESC LIMIT 1
),
etapas AS (
  SELECT e.* FROM public.etapas_ciclo e JOIN ciclo c ON c.id = e.ciclo_id
),
av AS (
  SELECT a.colaborador_id, e.tipo, a.pct_desempenho, a.avaliador_id
  FROM public.avaliacoes a
  JOIN etapas e ON e.id = a.etapa_id
),
pivot AS (
  SELECT
    colaborador_id,
    MAX(pct_desempenho) FILTER (WHERE tipo = 'inicial_pdi')  AS pct_etapa1,
    MAX(pct_desempenho) FILTER (WHERE tipo = 'ajuste_curso') AS pct_etapa2,
    MAX(pct_desempenho) FILTER (WHERE tipo = 'encerramento') AS pct_etapa3,
    (ARRAY_AGG(avaliador_id) FILTER (WHERE avaliador_id IS NOT NULL))[1] AS avaliador_id
  FROM av GROUP BY colaborador_id
),
oc AS (
  SELECT o.colaborador_id,
         COUNT(*) FILTER (WHERE o.tipo = 'Positiva') AS ocorrencias_positivas,
         COUNT(*) FILTER (WHERE o.tipo = 'Negativa') AS ocorrencias_negativas
  FROM public.ocorrencias o, ciclo c
  WHERE o.data_ocorrencia BETWEEN c.periodo_apuracao_inicio AND c.periodo_apuracao_fim
  GROUP BY o.colaborador_id
)
SELECT
  col.id AS colaborador_id,
  col.nome_completo AS nome,
  col.unidade AS empresa,
  col.cargo AS nivel,
  av_col.nome_completo AS avaliador,
  p.pct_etapa1,
  p.pct_etapa2,
  p.pct_etapa3,
  ROUND(((COALESCE(p.pct_etapa1,0) + COALESCE(p.pct_etapa2,0) + COALESCE(p.pct_etapa3,0))
    / NULLIF(( (CASE WHEN p.pct_etapa1 IS NULL THEN 0 ELSE 1 END)
             + (CASE WHEN p.pct_etapa2 IS NULL THEN 0 ELSE 1 END)
             + (CASE WHEN p.pct_etapa3 IS NULL THEN 0 ELSE 1 END) ),0))::numeric, 4) AS media_pct,
  CASE WHEN ((COALESCE(p.pct_etapa1,0) + COALESCE(p.pct_etapa2,0) + COALESCE(p.pct_etapa3,0))
     / NULLIF(( (CASE WHEN p.pct_etapa1 IS NULL THEN 0 ELSE 1 END)
              + (CASE WHEN p.pct_etapa2 IS NULL THEN 0 ELSE 1 END)
              + (CASE WHEN p.pct_etapa3 IS NULL THEN 0 ELSE 1 END) ),0)) >= 0.70
       THEN 'Apto' ELSE 'Inapto' END AS situacao_final,
  COALESCE(oc.ocorrencias_positivas, 0) AS ocorrencias_positivas,
  COALESCE(oc.ocorrencias_negativas, 0) AS ocorrencias_negativas
FROM pivot p
JOIN public.colaboradores col ON col.id = p.colaborador_id
LEFT JOIN public.colaboradores av_col ON av_col.id = p.avaliador_id
LEFT JOIN oc ON oc.colaborador_id = col.id;

GRANT SELECT ON public.vw_consolidado TO authenticated;
