import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, AlertTriangle, UserX, MessageSquareOff, XCircle, Clock } from "lucide-react";

type Row = {
  colaborador_id: string;
  nome: string | null;
  empresa: string | null;
  nivel: string | null;
  avaliador: string | null;
  pct_etapa1: number | null;
  pct_etapa2: number | null;
  pct_etapa3: number | null;
  media_pct: number | null;
  situacao_final: "Apto" | "Inapto" | null;
  ocorrencias_positivas: number;
  ocorrencias_negativas: number;
};

type Ciclo = { id: string; nome: string; periodo_apuracao_inicio: string; periodo_apuracao_fim: string; ativo: boolean };
type Etapa = { id: string; ciclo_id: string; tipo: string; ordem: number; nome: string; janela_inicio: string; janela_fim: string };
type Colab = { id: string; nome_completo: string | null; nome_visivel: string | null; status: string | null; gestor_id: string | null };
type Avaliacao = { colaborador_id: string; etapa_id: string; status: string; situacao: string | null; pct_desempenho: number | null; avaliador_id: string | null };
type Ocorrencia = { colaborador_id: string; data_ocorrencia: string };

const fmtPct = (v: number | null) =>
  v === null || v === undefined ? "—" : `${(Number(v) * 100).toFixed(1)}%`;

const hojeISO = () => new Date().toISOString().slice(0, 10);

export default function PainelDesempenho() {
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // alerts data
  const [ciclo, setCiclo] = useState<Ciclo | null>(null);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [colabs, setColabs] = useState<Colab[]>([]);
  const [avals, setAvals] = useState<Avaliacao[]>([]);
  const [ocorrs, setOcorrs] = useState<Ocorrencia[]>([]);

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    (async () => {
      setLoading(true);

      const { data: viewData } = await (supabase as any)
        .from("vw_consolidado").select("*").order("nome", { ascending: true });
      setRows((viewData as Row[]) ?? []);

      const { data: c } = await (supabase as any)
        .from("ciclos_avaliacao").select("*").eq("ativo", true).limit(1).maybeSingle();
      const cic = (c as Ciclo) ?? null;
      setCiclo(cic);

      if (cic) {
        const { data: et } = await (supabase as any)
          .from("etapas_ciclo").select("*").eq("ciclo_id", cic.id).order("ordem");
        const eArr = (et as Etapa[]) ?? [];
        setEtapas(eArr);

        const { data: cols } = await (supabase as any)
          .from("colaboradores").select("id, nome_completo, nome_visivel, status, gestor_id");
        setColabs((cols as Colab[]) ?? []);

        const etapaIds = eArr.map(e => e.id);
        if (etapaIds.length) {
          const { data: av } = await (supabase as any)
            .from("avaliacoes")
            .select("colaborador_id, etapa_id, status, situacao, pct_desempenho, avaliador_id")
            .in("etapa_id", etapaIds);
          setAvals((av as Avaliacao[]) ?? []);
        } else {
          setAvals([]);
        }

        const { data: oc } = await (supabase as any)
          .from("ocorrencias")
          .select("colaborador_id, data_ocorrencia")
          .gte("data_ocorrencia", cic.periodo_apuracao_inicio)
          .lte("data_ocorrencia", cic.periodo_apuracao_fim);
        setOcorrs((oc as Ocorrencia[]) ?? []);
      }
      setLoading(false);
    })();
  }, [isAdmin]);

  const nomeColab = (id: string) => {
    const c = colabs.find(x => x.id === id);
    return c?.nome_visivel || c?.nome_completo || "—";
  };

  const alertas = useMemo(() => {
    const hoje = hojeISO();
    const ativos = colabs.filter(c => (c.status || "Ativo") === "Ativo");

    // 1) sem avaliação lançada na etapa vigente
    const etapaVigente = etapas.find(e => e.janela_inicio <= hoje && hoje <= e.janela_fim) || null;
    const semAvalVigente: { id: string; nome: string }[] = etapaVigente
      ? ativos
          .filter(c => !avals.some(a => a.etapa_id === etapaVigente.id && a.colaborador_id === c.id))
          .map(c => ({ id: c.id, nome: c.nome_visivel || c.nome_completo || "—" }))
          .sort((a, b) => a.nome.localeCompare(b.nome))
      : [];

    // 2) avaliação enviada mas sem nenhuma ocorrência no período
    const enviadosIds = Array.from(new Set(avals.filter(a => a.status === "enviada").map(a => a.colaborador_id)));
    const comOcorrencia = new Set(ocorrs.map(o => o.colaborador_id));
    const semOcorrencia = enviadosIds
      .filter(id => !comOcorrencia.has(id))
      .map(id => ({ id, nome: nomeColab(id) }))
      .sort((a, b) => a.nome.localeCompare(b.nome));

    // 3) avaliações Inapto (enviadas)
    const inaptos = avals
      .filter(a => a.status === "enviada" && a.situacao === "Inapto")
      .map(a => {
        const et = etapas.find(e => e.id === a.etapa_id);
        return { colab: nomeColab(a.colaborador_id), etapa: et?.nome ?? "—", pct: a.pct_desempenho };
      })
      .sort((a, b) => a.colab.localeCompare(b.colab));

    // 4) líderes com avaliações pendentes de etapa com janela encerrada
    const etapasEncerradas = etapas.filter(e => e.janela_fim < hoje);
    const pendentesPorLider = new Map<string, { lider: string; itens: { colab: string; etapa: string }[] }>();
    for (const et of etapasEncerradas) {
      for (const c of ativos) {
        const temEnviada = avals.some(a => a.etapa_id === et.id && a.colaborador_id === c.id && a.status === "enviada");
        if (temEnviada) continue;
        const gestorId = c.gestor_id || "sem_gestor";
        const gestorNome = c.gestor_id ? nomeColab(c.gestor_id) : "Sem gestor definido";
        const bucket = pendentesPorLider.get(gestorId) || { lider: gestorNome, itens: [] };
        bucket.itens.push({ colab: c.nome_visivel || c.nome_completo || "—", etapa: et.nome });
        pendentesPorLider.set(gestorId, bucket);
      }
    }
    const lideresPendentes = Array.from(pendentesPorLider.values())
      .map(b => ({ ...b, itens: b.itens.sort((a, b) => a.colab.localeCompare(b.colab)) }))
      .sort((a, b) => a.lider.localeCompare(b.lider));

    return { etapaVigente, semAvalVigente, semOcorrencia, inaptos, lideresPendentes };
  }, [colabs, etapas, avals, ocorrs]);

  if (rolesLoading) return <div className="p-6">Carregando...</div>;

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center gap-3 py-8">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span>Acesso restrito. Apenas administradores podem visualizar o Painel de Desempenho.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      r.nome?.toLowerCase().includes(s) ||
      r.empresa?.toLowerCase().includes(s) ||
      r.nivel?.toLowerCase().includes(s) ||
      r.avaliador?.toLowerCase().includes(s)
    );
  });

  const totalAlertas =
    alertas.semAvalVigente.length +
    alertas.semOcorrencia.length +
    alertas.inaptos.length +
    alertas.lideresPendentes.reduce((s, l) => s + l.itens.length, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Painel de Desempenho</h1>
        <Input
          placeholder="Filtrar por nome, empresa, nível ou avaliador"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Alertas */}
      <Card className="border-amber-300">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle>Alertas</CardTitle>
          <Badge variant="secondary" className="ml-2">{totalAlertas}</Badge>
          {ciclo && <span className="ml-auto text-xs text-muted-foreground">Ciclo: {ciclo.nome}</span>}
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="py-4 text-center text-muted-foreground">Carregando alertas...</div>
          ) : !ciclo ? (
            <div className="py-4 text-center text-muted-foreground">Nenhum ciclo ativo.</div>
          ) : totalAlertas === 0 ? (
            <div className="py-4 text-center text-muted-foreground">Sem alertas no momento. 🎉</div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* 1 */}
              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <UserX className="h-4 w-4 text-amber-600" />
                  <h3 className="font-medium">Sem avaliação na etapa vigente</h3>
                  <Badge variant="outline">{alertas.semAvalVigente.length}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {alertas.etapaVigente
                    ? <>Etapa <strong>{alertas.etapaVigente.nome}</strong> (janela {alertas.etapaVigente.janela_inicio} → {alertas.etapaVigente.janela_fim}).</>
                    : "Nenhuma etapa com janela aberta hoje."}
                </p>
                {alertas.semAvalVigente.length > 0 && (
                  <ul className="text-sm max-h-40 overflow-auto space-y-1">
                    {alertas.semAvalVigente.map(x => <li key={x.id}>• {x.nome}</li>)}
                  </ul>
                )}
              </div>

              {/* 2 */}
              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareOff className="h-4 w-4 text-amber-600" />
                  <h3 className="font-medium">Avaliação enviada sem ocorrências no período</h3>
                  <Badge variant="outline">{alertas.semOcorrencia.length}</Badge>
                </div>
                {alertas.semOcorrencia.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Todos os avaliados possuem ao menos 1 ocorrência.</p>
                ) : (
                  <ul className="text-sm max-h-40 overflow-auto space-y-1">
                    {alertas.semOcorrencia.map(x => <li key={x.id}>• {x.nome}</li>)}
                  </ul>
                )}
              </div>

              {/* 3 */}
              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <h3 className="font-medium">Avaliações Inapto (&lt; 70%)</h3>
                  <Badge variant="outline">{alertas.inaptos.length}</Badge>
                </div>
                {alertas.inaptos.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma avaliação Inapto.</p>
                ) : (
                  <ul className="text-sm max-h-40 overflow-auto space-y-1">
                    {alertas.inaptos.map((x, i) => (
                      <li key={i}>• <strong>{x.colab}</strong> — {x.etapa} ({fmtPct(x.pct)})</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 4 */}
              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <h3 className="font-medium">Líderes com avaliações pendentes (janela encerrada)</h3>
                  <Badge variant="outline">
                    {alertas.lideresPendentes.reduce((s, l) => s + l.itens.length, 0)}
                  </Badge>
                </div>
                {alertas.lideresPendentes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma pendência com janela encerrada.</p>
                ) : (
                  <ul className="text-sm max-h-40 overflow-auto space-y-2">
                    {alertas.lideresPendentes.map((l, i) => (
                      <li key={i}>
                        <div className="font-medium">{l.lider} <span className="text-xs text-muted-foreground">({l.itens.length})</span></div>
                        <ul className="ml-4 text-xs text-muted-foreground">
                          {l.itens.map((it, j) => <li key={j}>– {it.colab} · {it.etapa}</li>)}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ciclo ativo — consolidado</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Carregando dados...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">Nenhum colaborador com avaliação no ciclo ativo.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Avaliador</TableHead>
                  <TableHead className="text-right">Etapa 1<br/><span className="text-xs font-normal text-muted-foreground">Inicial/PDI</span></TableHead>
                  <TableHead className="text-right">Etapa 2<br/><span className="text-xs font-normal text-muted-foreground">Ajuste</span></TableHead>
                  <TableHead className="text-right">Etapa 3<br/><span className="text-xs font-normal text-muted-foreground">Encerramento</span></TableHead>
                  <TableHead className="text-right">Média</TableHead>
                  <TableHead className="text-center">Ocor. +</TableHead>
                  <TableHead className="text-center">Ocor. −</TableHead>
                  <TableHead className="text-center">Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.colaborador_id}>
                    <TableCell className="font-medium">{r.nome ?? "—"}</TableCell>
                    <TableCell>{r.empresa ?? "—"}</TableCell>
                    <TableCell>{r.nivel ?? "—"}</TableCell>
                    <TableCell>{r.avaliador ?? "—"}</TableCell>
                    <TableCell className="text-right">{fmtPct(r.pct_etapa1)}</TableCell>
                    <TableCell className="text-right">{fmtPct(r.pct_etapa2)}</TableCell>
                    <TableCell className="text-right">{fmtPct(r.pct_etapa3)}</TableCell>
                    <TableCell className="text-right font-medium">{fmtPct(r.media_pct)}</TableCell>
                    <TableCell className="text-center">{r.ocorrencias_positivas}</TableCell>
                    <TableCell className="text-center">{r.ocorrencias_negativas}</TableCell>
                    <TableCell className="text-center">
                      {r.situacao_final === "Apto" ? (
                        <Badge className="bg-green-600 hover:bg-green-600 text-white">Apto</Badge>
                      ) : r.situacao_final === "Inapto" ? (
                        <Badge className="bg-red-600 hover:bg-red-600 text-white">Inapto</Badge>
                      ) : (
                        <Badge variant="secondary">—</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
