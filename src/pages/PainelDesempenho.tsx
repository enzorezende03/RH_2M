import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

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

const fmtPct = (v: number | null) =>
  v === null || v === undefined ? "—" : `${(Number(v) * 100).toFixed(1)}%`;

export default function PainelDesempenho() {
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("vw_consolidado")
        .select("*")
        .order("nome", { ascending: true });
      if (error) console.warn("Erro ao carregar painel:", error);
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, [isAdmin]);

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
