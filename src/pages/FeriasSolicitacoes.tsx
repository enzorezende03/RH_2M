import { useMemo, useRef, useState } from "react";
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

type Status = "Análise Gestor" | "Análise RH" | "Documentação" | "Concluída";

interface RecessoItem {
  colaboradorId: string;
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

const COLABS: ColabRow[] = [
  { id: "1", nome: "ANA", cargo: "Analista II", departamento: "RH", papel: "Colaborador" },
  { id: "2", nome: "ANDREZA", cargo: "Analista I", departamento: "RH", papel: "Colaborador" },
  { id: "3", nome: "CAMILA", cargo: "Analista I", departamento: "RH", papel: "Colaborador" },
  { id: "4", nome: "DANIELLE", cargo: "ANALISTA III - Step 2", departamento: "Financeiro", papel: "Gestor" },
  { id: "5", nome: "DÉBORA", cargo: "Analista III", departamento: "Financeiro", papel: "Colaborador" },
  { id: "6", nome: "GABRIELA", cargo: "Assistente", departamento: "Operações", papel: "Colaborador" },
  { id: "7", nome: "JANAINA", cargo: "Analista III", departamento: "Operações", papel: "Administrador" },
  { id: "8", nome: "JESSYCA", cargo: "Analista III", departamento: "TI", papel: "Colaborador" },
];

const DEPARTAMENTOS = ["RH", "Financeiro", "Operações", "TI"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
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

const DAYS_VISIBLE = 35;
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

  // navegação calendário
  const [startDate, setStartDate] = useState<Date>(() => startOfDay(addDays(new Date(), -5)));

  // dados
  const [recessos, setRecessos] = useState<RecessoItem[]>(() => {
    const today = startOfDay(new Date());
    return [
      { colaboradorId: "5", inicio: addDays(today, 13), fim: addDays(today, 18), status: "Documentação" },
      { colaboradorId: "8", inicio: addDays(today, 14), fim: addDays(today, 17), status: "Análise Gestor" },
      { colaboradorId: "3", inicio: addDays(today, 3), fim: addDays(today, 8), status: "Documentação" },
    ];
  });

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

  const days = useMemo(() => Array.from({ length: DAYS_VISIBLE }, (_, i) => addDays(startDate, i)), [startDate]);

  const monthLabel = useMemo(() => {
    const first = days[0];
    const last = days[days.length - 1];
    if (first.getMonth() === last.getMonth()) return `${MONTHS[first.getMonth()]}/${first.getFullYear()}`;
    return `${MONTHS[first.getMonth()]}/${MONTHS[last.getMonth()]} ${last.getFullYear()}`;
  }, [days]);

  const colabsFiltrados = useMemo(() => {
    let arr = COLABS;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      arr = arr.filter((c) => c.nome.toLowerCase().includes(q) || c.cargo.toLowerCase().includes(q));
    }
    if (deptosSel.length > 0) arr = arr.filter((c) => deptosSel.includes(c.departamento));
    const papeisAtivos = (Object.keys(papeisSel) as Array<keyof typeof papeisSel>).filter((k) => papeisSel[k]);
    if (papeisAtivos.length > 0) arr = arr.filter((c) => papeisAtivos.includes(c.papel));
    const statusAtivos = (Object.keys(statusSel) as Status[]).filter((k) => statusSel[k]);
    if (statusAtivos.length > 0) {
      const idsComStatus = new Set(recessos.filter((r) => statusAtivos.includes(r.status)).map((r) => r.colaboradorId));
      arr = arr.filter((c) => idsComStatus.has(c.id));
    }
    return arr;
  }, [busca, deptosSel, papeisSel, statusSel, recessos]);

  function irHoje() {
    setStartDate(startOfDay(addDays(new Date(), -5)));
  }
  function navegar(dir: -1 | 1) {
    setStartDate((d) => addDays(d, dir * 7));
  }

  function limparFiltros() {
    setStatusSel({ "Análise Gestor": false, "Análise RH": false, Documentação: false, Concluída: false });
    setDeptosSel([]);
    setPapeisSel({ Gestor: false, Administrador: false, Colaborador: false });
  }

  function solicitar() {
    if (reqDias < 1) return;
    toast({ title: "Solicitação enviada", description: `Recesso de ${reqDias} dia(s) solicitado.` });
    setSolicitarOpen(false);
    setReqInicio("");
    setReqFim("");
    setReqObs("");
  }

  const statusBarColor: Record<Status, string> = {
    "Análise Gestor": "bg-orange-400",
    "Análise RH": "bg-blue-400",
    Documentação: "bg-violet-400",
    Concluída: "bg-emerald-400",
  };

  // posiciona barras por colaborador no intervalo visível
  function barrasDe(colabId: string) {
    const first = days[0];
    const last = days[days.length - 1];
    return recessos
      .filter((r) => r.colaboradorId === colabId)
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
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Calendário de férias & Recesso</h1>
              <p className="text-sm text-muted-foreground">Fique por dentro das ausências programadas da sua organização.</p>
            </div>
            <Button onClick={() => setSolicitarOpen(true)}>Solicitar recesso</Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar colaboradores"
                className="pl-9 pr-9"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button variant="outline" onClick={() => setFiltrosOpen(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Toolbar do calendário */}
          <div className="grid grid-cols-[220px_1fr] gap-0 border rounded-md overflow-hidden">
            <div className="bg-muted/30 border-r p-2 flex items-center">
              <Button variant="outline" size="sm" onClick={irHoje}>Hoje</Button>
            </div>
            <div className="bg-muted/30 p-2 flex items-center justify-center gap-3">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navegar(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{monthLabel}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => navegar(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Header dias */}
            <div className="border-r border-t bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
              Colaborador
            </div>
            <div className="border-t overflow-x-auto">
              <div className="flex" style={{ width: COL_W * DAYS_VISIBLE }}>
                {days.map((d, i) => {
                  const wk = d.getDay();
                  const isWeekend = wk === 0 || wk === 6;
                  const isToday = startOfDay(new Date()).getTime() === d.getTime();
                  return (
                    <div
                      key={i}
                      className={`flex flex-col items-center justify-center border-r text-[10px] py-1 ${isWeekend ? "bg-muted/40" : ""} ${isToday ? "border-l-2 border-l-primary" : ""}`}
                      style={{ width: COL_W }}
                    >
                      <span className="text-muted-foreground">{WEEKDAYS[wk]}</span>
                      <span className="font-medium text-foreground">{String(d.getDate()).padStart(2, "0")}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Linhas */}
            {colabsFiltrados.map((c, rowIdx) => {
              const barras = barrasDe(c.id);
              const stripe = rowIdx % 2 === 0 ? "" : "bg-muted/20";
              return (
                <div key={c.id} className="contents">
                  <div className={`border-r border-t px-3 py-2 flex items-center gap-2 ${stripe}`}>
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
                  <div className={`border-t relative overflow-hidden ${stripe}`} style={{ height: 48 }}>
                    {/* grid de fundo */}
                    <div className="absolute inset-0 flex" style={{ width: COL_W * DAYS_VISIBLE }}>
                      {days.map((d, i) => {
                        const wk = d.getDay();
                        const isWeekend = wk === 0 || wk === 6;
                        return (
                          <div
                            key={i}
                            className={`border-r ${isWeekend ? "bg-muted/30" : ""}`}
                            style={{ width: COL_W }}
                          />
                        );
                      })}
                    </div>
                    {/* barras */}
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
                </div>
              );
            })}

            {colabsFiltrados.length === 0 && (
              <div className="col-span-2 border-t py-10 text-center text-sm text-muted-foreground">
                Nenhum colaborador encontrado.
              </div>
            )}
          </div>
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
