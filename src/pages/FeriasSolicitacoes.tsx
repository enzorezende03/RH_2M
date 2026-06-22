import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Filter, ChevronLeft, ChevronRight, ChevronDown, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DEPARTAMENTO_OPTIONS } from "@/data/selectOptions";
import { useEntityCreate } from "@/hooks/useEntity";
import { supabase } from "@/integrations/supabase/client";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { useFeriasRecesso } from "@/stores/feriasRecessoStore";

type Status = "Análise Gestor" | "Análise RH" | "Documentação" | "Concluída";

interface RecessoItem {
  colaboradorId: string;
  colaboradorNome: string;
  inicio: Date;
  fim: Date;
  status: Status;
}

interface ColabRow {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  papel: "Gestor" | "Administrador" | "Colaborador";
}

const DEPARTAMENTOS = DEPARTAMENTO_OPTIONS;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}


function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function fmtDDMMYYYY(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function diffDias(a: Date, b: Date) {
  return Math.floor((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000) + 1;
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const COL_W = 36; // px width per day cell

export default function FeriasSolicitacoes() {
  const [busca, setBusca] = useState("");
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [solicitarOpen, setSolicitarOpen] = useState(false);

  // filtros
  const [statusSel, setStatusSel] = useState<Record<Status, boolean>>({
    "Análise Gestor": false,
    "Análise RH": false,
    "Documentação": false,
    "Concluída": false,
  });
  const [deptosSel, setDeptosSel] = useState<string[]>([]);
  const [papeisSel, setPapeisSel] = useState<Record<"Gestor" | "Administrador" | "Colaborador", boolean>>({
    Gestor: false,
    Administrador: false,
    Colaborador: false,
  });

  // navegação calendário (mês atual)
  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // dados (vêm da store unificada)
  const { solicitacoes, criarSolicitacao } = useFeriasRecesso();
  const recessos = useMemo<RecessoItem[]>(() => {
    const mapStatus = (s: string): Status => {
      if (s === "Análise Gestor") return "Análise Gestor";
      if (s === "Análise RH") return "Análise RH";
      if (s === "Documentação") return "Documentação";
      return "Concluída";
    };
    return solicitacoes
      .filter((s) => s.status !== "Reprovada" && s.status !== "Cancelada")
      .map((s) => ({
        colaboradorId: s.colaboradorId,
        colaboradorNome: s.colaboradorNome,
        inicio: new Date(s.inicio + "T00:00:00"),
        fim: new Date(s.fim + "T00:00:00"),
        status: mapStatus(s.status),
      }))
      .filter((r) => !isNaN(r.inicio.getTime()) && !isNaN(r.fim.getTime()));
  }, [solicitacoes]);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  // solicitar form
  const [reqInicio, setReqInicio] = useState("");
  const [reqFim, setReqFim] = useState("");
  const [reqObs, setReqObs] = useState("");

  const reqDias = useMemo(() => {
    if (!reqInicio || !reqFim) return 0;
    const a = new Date(reqInicio);
    const b = new Date(reqFim);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
    const d = diffDias(a, b);
    return d < 0 ? 0 : d;
  }, [reqInicio, reqFim]);

  const days = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => startOfDay(new Date(year, month, i + 1)));
  }, [monthCursor]);

  const daysVisible = days.length;

  const monthLabel = useMemo(() => {
    return `${MONTHS[monthCursor.getMonth()]} ${monthCursor.getFullYear()}`;
  }, [monthCursor]);

  const { colaboradores } = useColaboradores();

  const COLABS: ColabRow[] = useMemo(() => colaboradores.map((c) => ({
    id: c.id,
    nome: c.nomeVisivel || c.nomeCompleto,
    cargo: c.cargoVisivel || c.cargo,
    departamento: c.departamento,
    papel: (c.papel === "Gestor" || c.papel === "Administrador" ? c.papel : "Colaborador") as "Gestor" | "Administrador" | "Colaborador",
  })), [colaboradores]);

  const colabsFiltrados = COLABS;


  function irHoje() {
    const d = new Date();
    setMonthCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  }
  function navegar(dir: -1 | 1) {
    setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + dir, 1));
  }

  function limparFiltros() {
    setStatusSel({ "Análise Gestor": false, "Análise RH": false, Documentação: false, Concluída: false });
    setDeptosSel([]);
    setPapeisSel({ Gestor: false, Administrador: false, Colaborador: false });
  }

  const createFerias = useEntityCreate("ferias_solicitacoes");
  async function solicitar() {
    if (reqDias < 1) return;
    const { data: { user } } = await supabase.auth.getUser();
    let colabId = "";
    let colabNome = "";
    let cargo = "";
    let gestor = "";
    if (user) {
      const { data: colab } = await supabase.from("colaboradores").select("id, nome_completo, cargo, gestor_direto").eq("user_id", user.id).maybeSingle();
      if (colab) {
        colabId = colab.id;
        colabNome = (colab as any).nome_completo || "";
        cargo = (colab as any).cargo || "";
        gestor = (colab as any).gestor_direto || "";
        try {
          await createFerias.mutateAsync({
            colaborador_id: colab.id,
            periodo_inicio: reqInicio,
            periodo_fim: reqFim,
            dias: reqDias,
            observacoes: reqObs || null,
            status: "pendente",
            tipo: "recesso",
          } as any);
        } catch { /* segue mesmo se Supabase falhar */ }
      }
    }
    // Reflete em todas as páginas via store unificada
    criarSolicitacao({
      colaboradorId: colabId,
      colaboradorNome: colabNome || "Você",
      cargo,
      gestor,
      inicio: reqInicio,
      fim: reqFim,
      observacoes: reqObs || undefined,
      status: "Análise Gestor",
      tipo: "recesso",
      origem: "colaborador",
    });
    toast({ title: "Solicitação enviada" });
    setSolicitarOpen(false);
    setReqInicio("");
    setReqFim("");
    setReqObs("");
  }

  const statusBarColor: Record<Status, string> = {
    "Análise Gestor": "bg-orange-400",
    "Análise RH": "bg-yellow-400",
    Documentação: "bg-violet-400",
    Concluída: "bg-emerald-400",
  };


  // posiciona barras por colaborador no intervalo visível
  function barrasDe(colabId: string, colabNome: string) {
    const first = days[0];
    const last = days[days.length - 1];
    const nomeLower = (colabNome || "").trim().toLowerCase();
    return recessos
      .filter((r) => r.colaboradorId === colabId || (nomeLower && r.colaboradorNome?.trim().toLowerCase() === nomeLower))
      .map((r) => {
        const ini = r.inicio < first ? first : r.inicio;
        const fim = r.fim > last ? last : r.fim;
        if (fim < first || ini > last) return null;
        const startIdx = Math.floor((startOfDay(ini).getTime() - first.getTime()) / 86400000);
        const len = diffDias(ini, fim);
        return { ...r, startIdx, len };
      })
      .filter(Boolean) as Array<RecessoItem & { startIdx: number; len: number }>;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6 w-0 min-w-full">
        <Card className="p-6 overflow-hidden">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Calendário de férias & Recesso</h1>
              <p className="text-sm text-muted-foreground">Visualize suas ausências programadas.</p>
            </div>
            <Button onClick={() => setSolicitarOpen(true)}>Solicitar recesso</Button>
          </div>


          {/* Toolbar do calendário */}
          <div className="flex border rounded-md overflow-hidden">
            {/* Coluna fixa: colaboradores */}
            <div className="w-[220px] flex-shrink-0 border-r">
              <div className="bg-muted/30 p-2 flex items-center h-[42px]">
                <Button variant="outline" size="sm" onClick={irHoje}>Hoje</Button>
              </div>
              <div className="h-5 bg-muted/30" />
              <div className="bg-background px-3 py-2 text-xs font-medium text-muted-foreground border-t h-[37px] flex items-center">
                Colaborador
              </div>
              {colabsFiltrados.map((c, rowIdx) => {
                const stripe = rowIdx % 2 === 0 ? "" : "bg-muted/20";
                return (
                  <div key={c.id} className={`border-t px-3 py-2 flex items-center gap-2 ${stripe}`} style={{ height: 48 }}>
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        <User className="h-3.5 w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{c.nome}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{c.cargo}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coluna scrollável: calendário */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Toolbar mês */}
              <div className="bg-muted/30 p-2 flex items-center justify-center gap-3 h-[42px]">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navegar(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{monthLabel}</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navegar(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Barra de rolagem superior */}
              <div
                className="h-5 overflow-x-auto overflow-y-hidden bg-muted/30"
                ref={topScrollRef}
                onScroll={() => {
                  if (bottomScrollRef.current && topScrollRef.current) {
                    bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
                  }
                }}
              >
                <div style={{ width: COL_W * daysVisible, height: 1 }} />
              </div>

              {/* Conteúdo scrollável (barra inferior oculta) */}
              <div
                className="flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                ref={bottomScrollRef}
                onScroll={() => {
                  if (topScrollRef.current && bottomScrollRef.current) {
                    topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
                  }
                }}
              >
                <div style={{ width: COL_W * daysVisible }}>
                  {/* Header dias */}
                  <div className="flex border-t h-[37px]">
                    {days.map((d, i) => {
                      const wk = d.getDay();
                      const isWeekend = wk === 0 || wk === 6;
                      const isToday = isSameDay(new Date(), d);
                      return (
                        <div
                          key={i}
                          className={`flex flex-col items-center justify-center border-r box-border text-[10px] py-1 ${isWeekend ? "bg-muted/40" : ""} ${isToday ? "bg-primary/15" : ""}`}
                          style={{ width: COL_W }}
                        >
                          <span className={isToday ? "text-primary font-semibold" : "text-muted-foreground"}>{WEEKDAYS[wk]}</span>
                          <span className={`font-medium ${isToday ? "text-primary font-bold" : "text-foreground"}`}>{String(d.getDate()).padStart(2, "0")}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Linhas */}
                  {colabsFiltrados.map((c, rowIdx) => {
                    const barras = barrasDe(c.id, c.nome);
                    const stripe = rowIdx % 2 === 0 ? "" : "bg-muted/20";
                    return (
                      <div key={c.id} className={`border-t relative overflow-hidden ${stripe}`} style={{ height: 48 }}>
                        <div className="absolute inset-0 flex">
                          {days.map((d, i) => {
                            const wk = d.getDay();
                            const isWeekend = wk === 0 || wk === 6;
                            const isToday = isSameDay(new Date(), d);
                            return (
                              <div
                                key={i}
                                className={`border-r box-border ${isToday ? "bg-primary/10" : isWeekend ? "bg-muted/30" : ""}`}
                                style={{ width: COL_W }}
                              />
                            );
                          })}
                        </div>
                        {barras.map((b, i) => (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-sm cursor-pointer ${statusBarColor[b.status]} hover:brightness-110 transition`}
                                style={{
                                  left: b.startIdx * COL_W + 2,
                                  width: b.len * COL_W - 4,
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <div className="font-semibold">{c.nome} {c.cargo ? `· ${c.cargo}` : ""}</div>
                              <div>Período: {fmtDDMMYYYY(b.inicio)} - {fmtDDMMYYYY(b.fim)}</div>
                              <div>Qtd dias: {diffDias(b.inicio, b.fim)}</div>
                              <div>Status: {b.status}</div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {colabsFiltrados.length === 0 && (
            <div className="border border-t-0 rounded-b-md py-10 text-center text-sm text-muted-foreground">
              Nenhum recesso registrado para você.
            </div>
          )}


        </Card>

        {/* Filtros lateral */}
        <Sheet open={filtrosOpen} onOpenChange={setFiltrosOpen}>
          <SheetContent side="right" className="w-[420px] sm:max-w-md flex flex-col">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto space-y-6 mt-2">
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex w-full items-center justify-between border-b pb-2">
                  <span className="text-sm font-semibold text-primary">Status da Solicitação</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="grid grid-cols-2 gap-3 pt-3">
                  {(Object.keys(statusSel) as Status[]).map((s) => (
                    <label key={s} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={statusSel[s]}
                        onCheckedChange={(v) => setStatusSel((p) => ({ ...p, [s]: !!v }))}
                      />
                      {s}
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex w-full items-center justify-between border-b pb-2">
                  <span className="text-sm font-semibold text-primary">Departamento</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <Select
                    value={deptosSel[0] ?? ""}
                    onValueChange={(v) => setDeptosSel(v ? [v] : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione os departamentos desejados" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTAMENTOS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex w-full items-center justify-between border-b pb-2">
                  <span className="text-sm font-semibold text-primary">Papel</span>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="grid grid-cols-2 gap-3 pt-3">
                  {(Object.keys(papeisSel) as Array<keyof typeof papeisSel>).map((p) => (
                    <label key={p} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={papeisSel[p]}
                        onCheckedChange={(v) => setPapeisSel((prev) => ({ ...prev, [p]: !!v }))}
                      />
                      {p}
                    </label>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>

            <SheetFooter className="border-t pt-4">
              <Button variant="outline" onClick={limparFiltros}>Limpar filtros</Button>
              <Button onClick={() => setFiltrosOpen(false)}>Aplicar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Solicitar recesso (mesmo do Meu Recesso) */}
        <Dialog open={solicitarOpen} onOpenChange={setSolicitarOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar solicitação</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold">Colaborador</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-muted text-muted-foreground"><User className="h-5 w-5" /></AvatarFallback></Avatar>
                    <div>
                      <div className="text-sm font-semibold">NOME DO COLABORADOR</div>
                      <div className="text-xs text-muted-foreground">Cargo</div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold">Gestor</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-muted text-muted-foreground"><User className="h-5 w-5" /></AvatarFallback></Avatar>
                    <div>
                      <div className="text-sm font-semibold">NOME DO GESTOR</div>
                      <div className="text-xs text-muted-foreground">Gestor / Líder</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Período de recesso *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Defina o período para o seu descanso planejado.{" "}
                  <button type="button" className="text-primary underline">Ver regras de solicitação</button>
                </p>
                <div className="flex items-center gap-3">
                  <Input type="date" value={reqInicio} onChange={(e) => setReqInicio(e.target.value)} />
                  <span className="text-sm text-muted-foreground">até</span>
                  <Input type="date" value={reqFim} onChange={(e) => setReqFim(e.target.value)} />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">
                  Observações <span className="text-primary text-xs">(opcional)</span>
                </Label>
                <Textarea
                  value={reqObs}
                  onChange={(e) => setReqObs(e.target.value.slice(0, 250))}
                  placeholder="Insira uma descrição para a ação"
                  className="mt-1"
                  rows={4}
                />
                <div className="text-right text-xs text-muted-foreground">{reqObs.length}/250</div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSolicitarOpen(false)}>Cancelar</Button>
              <Button onClick={solicitar} disabled={reqDias < 1}>
                {reqDias >= 1 ? `Solicitar ${reqDias} dia${reqDias > 1 ? "s" : ""}` : "Solicitar recesso"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
