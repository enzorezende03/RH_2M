import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Etapa = { id: string; ciclo_id: string; tipo: string; ordem: number; nome: string };
type Ciclo = { id: string; nome: string; ativo: boolean; periodo_apuracao_inicio: string; periodo_apuracao_fim: string };
type Avaliacao = {
  id: string; etapa_id: string; nota_media: number | null;
  pct_desempenho: number | null; situacao: string | null; status: string | null;
};

type Linha = {
  ciclo: string;
  etapa: string;
  ordem: number;
  nota: number | null;
  pct: number | null;
  situacao: string | null;
};

const fmtPct = (v: number | null) =>
  v === null || v === undefined ? "—" : `${(Number(v) * 100).toFixed(1)}%`;

export default function MeuDesempenho() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [chart, setChart] = useState<{ label: string; pct: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data: colab } = await (supabase as any)
        .from("colaboradores").select("id").eq("user_id", user.id).maybeSingle();
      if (!colab) { setLinhas([]); setLoading(false); return; }

      const { data: avals } = await (supabase as any)
        .from("avaliacoes")
        .select("id, etapa_id, nota_media, pct_desempenho, situacao, status")
        .eq("colaborador_id", colab.id)
        .eq("status", "enviada");
      const avaliacoes = (avals as Avaliacao[]) ?? [];

      const etapaIds = Array.from(new Set(avaliacoes.map(a => a.etapa_id)));
      let etapas: Etapa[] = [];
      let ciclos: Ciclo[] = [];
      if (etapaIds.length) {
        const { data: et } = await (supabase as any)
          .from("etapas_ciclo").select("*").in("id", etapaIds);
        etapas = (et as Etapa[]) ?? [];
        const cicloIds = Array.from(new Set(etapas.map(e => e.ciclo_id)));
        const { data: cs } = await (supabase as any)
          .from("ciclos_avaliacao").select("*").in("id", cicloIds);
        ciclos = (cs as Ciclo[]) ?? [];
      }

      const rows: Linha[] = avaliacoes.map(a => {
        const et = etapas.find(e => e.id === a.etapa_id);
        const ci = ciclos.find(c => c.id === et?.ciclo_id);
        return {
          ciclo: ci?.nome ?? "—",
          etapa: et?.nome ?? "—",
          ordem: et?.ordem ?? 0,
          nota: a.nota_media,
          pct: a.pct_desempenho,
          situacao: a.situacao,
        };
      }).sort((a, b) => a.ciclo.localeCompare(b.ciclo) || a.ordem - b.ordem);

      setLinhas(rows);
      setChart(rows
        .filter(r => r.pct !== null)
        .map(r => ({ label: `${r.ciclo} · ${r.etapa}`, pct: Number((Number(r.pct) * 100).toFixed(1)) })));
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Desempenho</h1>
        <p className="text-sm text-muted-foreground">Suas avaliações enviadas e evolução por etapa.</p>
      </div>

      {linhas.length === 0 ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-8">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <span>Nenhuma avaliação enviada até o momento.</span>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle>Avaliações por etapa</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Nota média</TableHead>
                    <TableHead>% Desempenho</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell>{l.ciclo}</TableCell>
                      <TableCell>{l.etapa}</TableCell>
                      <TableCell>{l.nota === null ? "—" : Number(l.nota).toFixed(2)}</TableCell>
                      <TableCell>{fmtPct(l.pct)}</TableCell>
                      <TableCell>
                        {l.situacao === "Apto" && (
                          <Badge className="bg-green-600 hover:bg-green-700">Apto</Badge>
                        )}
                        {l.situacao === "Inapto" && (
                          <Badge className="bg-red-600 hover:bg-red-700">Inapto</Badge>
                        )}
                        {!l.situacao && <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Evolução do % ao longo das etapas</CardTitle></CardHeader>
            <CardContent style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Line type="monotone" dataKey="pct" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
