import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

type Ciclo = { id: string; nome: string; ativo: boolean };
type PDI = {
  id: string; colaborador_id: string; ciclo_id: string;
  pontos_fortes: string | null; pontos_desenvolvimento: string | null; status: string;
};
type Acao = {
  id: string; pdi_id: string; descricao: string | null;
  quesito_codigo: string | null; prazo_revisao: string | null; status: string;
};
type Etapa = { id: string; nome: string; tipo: string };
type Revisao = {
  id: string; pdi_id: string; etapa_id: string | null; tipo: string;
  evolucao: string | null; ajustes: string | null; novo_prazo: string | null; data_revisao: string;
};

const statusBadge = (s: string) => {
  if (s === "concluida") return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-3 h-3 mr-1"/>Concluída</Badge>;
  if (s === "em_andamento") return <Badge className="bg-blue-600 hover:bg-blue-700"><Clock className="w-3 h-3 mr-1"/>Em andamento</Badge>;
  return <Badge variant="secondary">Pendente</Badge>;
};

export default function MeuPDI() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ciclo, setCiclo] = useState<Ciclo | null>(null);
  const [pdi, setPdi] = useState<PDI | null>(null);
  const [acoes, setAcoes] = useState<Acao[]>([]);
  const [revisoes, setRevisoes] = useState<Revisao[]>([]);
  const [etapas, setEtapas] = useState<Etapa[]>([]);

  const carregar = async () => {
    if (!user) return;
    setLoading(true);
    const { data: colab } = await (supabase as any)
      .from("colaboradores").select("id").eq("user_id", user.id).maybeSingle();
    if (!colab) { setLoading(false); return; }

    const { data: c } = await (supabase as any)
      .from("ciclos_avaliacao").select("*").eq("ativo", true).limit(1).maybeSingle();
    setCiclo((c as Ciclo) ?? null);
    if (!c) { setPdi(null); setAcoes([]); setRevisoes([]); setLoading(false); return; }

    const { data: p } = await (supabase as any)
      .from("pdi").select("*").eq("colaborador_id", colab.id).eq("ciclo_id", c.id).maybeSingle();
    setPdi((p as PDI) ?? null);

    if (p) {
      const { data: a } = await (supabase as any)
        .from("pdi_acoes").select("*").eq("pdi_id", p.id).order("prazo_revisao", { ascending: true });
      setAcoes((a as Acao[]) ?? []);
      const { data: r } = await (supabase as any)
        .from("pdi_revisoes").select("*").eq("pdi_id", p.id).order("data_revisao", { ascending: true });
      setRevisoes((r as Revisao[]) ?? []);
    } else {
      setAcoes([]); setRevisoes([]);
    }

    const { data: et } = await (supabase as any)
      .from("etapas_ciclo").select("id, nome, tipo").eq("ciclo_id", c.id);
    setEtapas((et as Etapa[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, [user]);

  const atualizarStatus = async (acaoId: string, novoStatus: string) => {
    const { error } = await (supabase as any)
      .from("pdi_acoes").update({ status: novoStatus }).eq("id", acaoId);
    if (error) { toast.error("Erro ao atualizar ação"); return; }
    toast.success("Status atualizado");
    setAcoes(prev => prev.map(a => a.id === acaoId ? { ...a, status: novoStatus } : a));
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu PDI</h1>
        <p className="text-sm text-muted-foreground">
          Plano de Desenvolvimento Individual {ciclo ? `— ${ciclo.nome}` : ""}
        </p>
      </div>

      {!ciclo && (
        <Card><CardContent className="flex items-center gap-3 py-8">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <span>Não há ciclo de avaliação ativo no momento.</span>
        </CardContent></Card>
      )}

      {ciclo && !pdi && (
        <Card><CardContent className="flex items-center gap-3 py-8">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <span>Nenhum PDI foi cadastrado para você neste ciclo ainda.</span>
        </CardContent></Card>
      )}

      {pdi && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Pontos fortes</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {pdi.pontos_fortes || <span className="text-muted-foreground">—</span>}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Pontos de desenvolvimento</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {pdi.pontos_desenvolvimento || <span className="text-muted-foreground">—</span>}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Ações do PDI</CardTitle></CardHeader>
            <CardContent>
              {acoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma ação cadastrada.</p>
              ) : (
                <div className="space-y-3">
                  {acoes.map(a => (
                    <div key={a.id} className="border rounded-md p-3 flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.descricao || "—"}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          {a.quesito_codigo && <span>Quesito: {a.quesito_codigo}</span>}
                          {a.prazo_revisao && <span>Prazo: {new Date(a.prazo_revisao).toLocaleDateString("pt-BR")}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge(a.status)}
                        <Select value={a.status} onValueChange={(v) => atualizarStatus(a.id, v)}>
                          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_andamento">Em andamento</SelectItem>
                            <SelectItem value="concluida">Concluída</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Revisões da liderança</CardTitle></CardHeader>
            <CardContent>
              {revisoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma revisão registrada.</p>
              ) : (
                <div className="space-y-4">
                  {revisoes.map(r => {
                    const et = etapas.find(e => e.id === r.etapa_id);
                    return (
                      <div key={r.id} className="border-l-4 border-primary pl-3 py-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <span>{et?.nome || (r.tipo === "encerramento" ? "Encerramento" : "Ajuste de curso")}</span>
                          <Badge variant="outline">{new Date(r.data_revisao).toLocaleDateString("pt-BR")}</Badge>
                        </div>
                        {r.evolucao && (
                          <p className="text-sm mt-2"><span className="font-medium">Evolução:</span> {r.evolucao}</p>
                        )}
                        {r.ajustes && (
                          <p className="text-sm mt-1"><span className="font-medium">Ajustes:</span> {r.ajustes}</p>
                        )}
                        {r.novo_prazo && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Novo prazo: {new Date(r.novo_prazo).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
