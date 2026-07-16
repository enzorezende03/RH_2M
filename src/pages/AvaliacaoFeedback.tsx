import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Etapa = { id: string; tipo: string; nome: string; ordem: number; janela_inicio: string; janela_fim: string };
type Quesito = {
  codigo: string; nome: string; descricao: string;
  desc_nota_1: string; desc_nota_2: string; desc_nota_3: string; desc_nota_4: string; ordem: number;
};
type Colab = { id: string; nome_completo: string };

const QUESITO_COL: Record<string, "q1_qualidade"|"q2_interesse"|"q3_relacionamento"|"q4_organizacao"|"q5_trabalho_equipe"> = {
  Q1: "q1_qualidade", Q2: "q2_interesse", Q3: "q3_relacionamento", Q4: "q4_organizacao", Q5: "q5_trabalho_equipe",
};

export default function AvaliacaoFeedback() {
  const { user } = useAuth();
  const { isAdmin, isGestor, loading: rolesLoading } = useUserRoles();

  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [quesitos, setQuesitos] = useState<Quesito[]>([]);
  const [time, setTime] = useState<Colab[]>([]);
  const [etapaId, setEtapaId] = useState<string>("");
  const [colabId, setColabId] = useState<string>("");
  const [notas, setNotas] = useState<Record<string, number | null>>({ Q1: null, Q2: null, Q3: null, Q4: null, Q5: null });
  const [avaliacaoId, setAvaliacaoId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [gestorColabId, setGestorColabId] = useState<string | null>(null);

  // Load ciclo ativo + etapas + quesitos + team
  useEffect(() => {
    (async () => {
      const { data: ciclo } = await supabase
        .from("ciclos_avaliacao").select("id").eq("ativo", true)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (ciclo?.id) {
        const { data: es } = await supabase
          .from("etapas_ciclo").select("*").eq("ciclo_id", ciclo.id).order("ordem");
        setEtapas((es as Etapa[]) ?? []);
      }
      const { data: qs } = await supabase.from("quesitos").select("*").order("ordem");
      setQuesitos((qs as Quesito[]) ?? []);

      if (user) {
        const { data: me } = await supabase
          .from("colaboradores").select("id").eq("user_id", user.id).maybeSingle();
        setGestorColabId(me?.id ?? null);

        let query = supabase.from("colaboradores").select("id, nome_completo").eq("status", "Ativo");
        if (!isAdmin && me?.id) query = query.eq("gestor_id", me.id);
        const { data: cs } = await query.order("nome_completo");
        setTime((cs as Colab[]) ?? []);
      }
    })();
  }, [user, isAdmin]);

  // Load existing avaliação when selection changes
  useEffect(() => {
    if (!etapaId || !colabId) {
      setAvaliacaoId(null);
      setNotas({ Q1: null, Q2: null, Q3: null, Q4: null, Q5: null });
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("avaliacoes").select("*")
        .eq("etapa_id", etapaId).eq("colaborador_id", colabId).maybeSingle();
      if (data) {
        setAvaliacaoId(data.id);
        setNotas({
          Q1: data.q1_qualidade, Q2: data.q2_interesse, Q3: data.q3_relacionamento,
          Q4: data.q4_organizacao, Q5: data.q5_trabalho_equipe,
        });
      } else {
        setAvaliacaoId(null);
        setNotas({ Q1: null, Q2: null, Q3: null, Q4: null, Q5: null });
      }
    })();
  }, [etapaId, colabId]);

  const etapa = useMemo(() => etapas.find((e) => e.id === etapaId), [etapas, etapaId]);

  const foraDaJanela = useMemo(() => {
    if (!etapa) return false;
    const hoje = new Date().toISOString().slice(0, 10);
    return hoje < etapa.janela_inicio || hoje > etapa.janela_fim;
  }, [etapa]);

  const { media, pct, situacao, completo } = useMemo(() => {
    const vals = Object.values(notas).filter((v): v is number => typeof v === "number");
    const completo = vals.length === 5;
    if (vals.length === 0) return { media: 0, pct: 0, situacao: "—" as const, completo };
    const m = vals.reduce((a, b) => a + b, 0) / vals.length;
    const p = m / 4;
    return { media: m, pct: p, situacao: p >= 0.7 ? "Apto" : "Inapto", completo };
  }, [notas]);

  async function salvar(status: "rascunho" | "enviada") {
    if (!etapaId || !colabId) {
      toast({ title: "Selecione etapa e colaborador", variant: "destructive" });
      return;
    }
    if (status === "enviada" && !completo) {
      toast({ title: "Preencha os 5 quesitos antes de enviar", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      colaborador_id: colabId,
      etapa_id: etapaId,
      avaliador_id: gestorColabId,
      data_avaliacao: new Date().toISOString().slice(0, 10),
      q1_qualidade: notas.Q1,
      q2_interesse: notas.Q2,
      q3_relacionamento: notas.Q3,
      q4_organizacao: notas.Q4,
      q5_trabalho_equipe: notas.Q5,
      status,
    };
    const { data, error } = await supabase
      .from("avaliacoes")
      .upsert(payload, { onConflict: "colaborador_id,etapa_id" })
      .select("id").maybeSingle();
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    if (data?.id) setAvaliacaoId(data.id);
    toast({ title: status === "rascunho" ? "Rascunho salvo" : "Avaliação enviada" });
  }

  if (rolesLoading) return <div className="p-6">Carregando...</div>;
  if (!isAdmin && !isGestor) {
    return <div className="p-6"><Card><CardContent className="py-8">Acesso restrito a gestores.</CardContent></Card></div>;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="p-6 space-y-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">Avaliação de Feedback</h1>

        <Card>
          <CardHeader><CardTitle>Seleção</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Etapa do ciclo ativo</Label>
              <Select value={etapaId} onValueChange={setEtapaId}>
                <SelectTrigger><SelectValue placeholder="Selecione a etapa" /></SelectTrigger>
                <SelectContent>
                  {etapas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.ordem}. {e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Colaborador do seu time</Label>
              <Select value={colabId} onValueChange={setColabId}>
                <SelectTrigger><SelectValue placeholder="Selecione o colaborador" /></SelectTrigger>
                <SelectContent>
                  {time.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {foraDaJanela && etapa && (
          <div className="flex items-center gap-2 rounded-md border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            Fora da janela oficial ({etapa.janela_inicio} a {etapa.janela_fim}). Você pode salvar mesmo assim.
          </div>
        )}

        <Card>
          <CardHeader><CardTitle>Quesitos</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {quesitos.map((q) => {
              const descPorNota = [q.desc_nota_1, q.desc_nota_2, q.desc_nota_3, q.desc_nota_4];
              return (
                <div key={q.codigo} className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="font-medium">{q.codigo} — {q.nome}</span>
                      <p className="text-xs text-muted-foreground">{q.descricao}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">Nota atual: {notas[q.codigo] ?? "—"}</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((n) => {
                      const selected = notas[q.codigo] === n;
                      return (
                        <Tooltip key={n}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setNotas((s) => ({ ...s, [q.codigo]: n }))}
                              className={cn(
                                "flex-1 rounded-md border px-3 py-2 text-sm transition-colors",
                                selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border hover:bg-accent"
                              )}
                            >
                              {n}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">{descPorNota[n - 1]}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid grid-cols-3 gap-4 py-6 text-center">
            <div>
              <div className="text-xs uppercase text-muted-foreground">Nota Média</div>
              <div className="text-2xl font-semibold">{media.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground">% Desempenho</div>
              <div className="text-2xl font-semibold">{(pct * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground">Situação</div>
              <div className="mt-1">
                {situacao === "Apto" && <Badge className="bg-green-600 hover:bg-green-600 text-white">Apto</Badge>}
                {situacao === "Inapto" && <Badge className="bg-red-600 hover:bg-red-600 text-white">Inapto</Badge>}
                {situacao === "—" && <Badge variant="secondary">—</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={saving} onClick={() => salvar("rascunho")}>
            Salvar rascunho
          </Button>
          <Button disabled={saving} onClick={() => salvar("enviada")}>
            Enviar avaliação
          </Button>
        </div>

        {avaliacaoId && (
          <p className="text-xs text-muted-foreground text-right">Editando avaliação existente.</p>
        )}
      </div>
    </TooltipProvider>
  );
}
