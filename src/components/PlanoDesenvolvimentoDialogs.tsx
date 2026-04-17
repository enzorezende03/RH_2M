import { useState } from "react";
import { Search, Filter, User, Plus, Trash2, ChevronDown, ChevronUp, GripVertical, FileText, Pencil, X, AlertCircle, CalendarIcon, Edit3, Layers, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useColaboradores } from "@/stores/colaboradoresStore";

type ColabItem = { id: string; nome: string; cargo: string; departamento: string; lider: string | null };
function useColabList(): ColabItem[] {
  const { colaboradores } = useColaboradores();
  return colaboradores.map((c) => ({
    id: c.id,
    nome: c.nomeCompleto,
    cargo: c.cargo || "",
    departamento: c.departamento || "",
    lider: c.lider ?? null,
  }));
}

export interface Tarefa {
  id: string;
  titulo: string;
  progresso: number; // 0-100
  concluida: boolean;
  aprendizados?: string;
}

export interface Bloco {
  id: string;
  titulo: string;
  descricao?: string;
  tarefas: Tarefa[];
  expandido?: boolean;
}

export interface Plano {
  id: string;
  nome: string;
  colaborador: string;
  cargo: string;
  tipo: string;
  dataInicio: Date;
  duracao: number;
  unidade: "Dias" | "Semanas" | "Meses";
  blocos: Bloco[];
}

// colaboradores agora vêm do store global (useColabList)

/* ============== Filtros Popover (Departamento / Cargo / Líder) ============== */
interface FiltrosPDI {
  departamento: string;
  cargo: string;
  lider: string;
}
const FILTROS_DEFAULT: FiltrosPDI = { departamento: "todos", cargo: "todos", lider: "todos" };

function FiltrosPopover({
  filtros, onChange,
}: { filtros: FiltrosPDI; onChange: (f: FiltrosPDI) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FiltrosPDI>(filtros);
  const departamentos = Array.from(new Set(colaboradoresMock.map((c) => c.departamento)));
  const cargos = Array.from(new Set(colaboradoresMock.map((c) => c.cargo)));
  const lideres = Array.from(new Set(colaboradoresMock.map((c) => c.lider).filter(Boolean) as string[]));

  const label = (k: keyof FiltrosPDI) => (draft[k] === "todos" ? "Todos" : draft[k]);

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) setDraft(filtros); }}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary text-primary">
          <Filter className="h-4 w-4" />Filtros
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[520px] p-4">
        <div className="grid grid-cols-2 gap-3">
          <Select value={draft.departamento} onValueChange={(v) => setDraft({ ...draft, departamento: v })}>
            <SelectTrigger className="h-auto py-2">
              <span className="text-sm"><span className="font-semibold">Departamento:</span> <span className="text-muted-foreground">{label("departamento")}</span></span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {departamentos.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={draft.cargo} onValueChange={(v) => setDraft({ ...draft, cargo: v })}>
            <SelectTrigger className="h-auto py-2">
              <span className="text-sm"><span className="font-semibold">Cargo:</span> <span className="text-muted-foreground">{label("cargo")}</span></span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {cargos.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={draft.lider} onValueChange={(v) => setDraft({ ...draft, lider: v })}>
            <SelectTrigger className="h-auto py-2">
              <span className="text-sm"><span className="font-semibold">Líder:</span> <span className="text-muted-foreground">{label("lider")}</span></span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {lideres.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" className="border-primary text-primary" onClick={() => { setDraft(FILTROS_DEFAULT); onChange(FILTROS_DEFAULT); }}>
            Limpar filtros
          </Button>
          <Button onClick={() => { onChange(draft); setOpen(false); }}>Aplicar filtros</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function aplicaFiltrosColab<T extends { cargo: string; departamento?: string; lider?: string | null }>(
  lista: T[], f: FiltrosPDI,
): T[] {
  return lista.filter((c) =>
    (f.departamento === "todos" || c.departamento === f.departamento) &&
    (f.cargo === "todos" || c.cargo === f.cargo) &&
    (f.lider === "todos" || c.lider === f.lider)
  );
}

/* ============== 1. Selecionar colaborador ============== */
export function SelecionarColaboradorDialog({
  open, onOpenChange, onSelect,
}: { open: boolean; onOpenChange: (b: boolean) => void; onSelect: (nome: string, cargo: string) => void }) {
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<FiltrosPDI>(FILTROS_DEFAULT);
  const lista = aplicaFiltrosColab(colaboradoresMock, filtros).filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Escolha qual colaborador irá realizar esse plano</DialogTitle>
          <DialogDescription>Aqui você escolhe quem irá realizar esse desenvolvimento individual</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Busque por uma pessoa" className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <FiltrosPopover filtros={filtros} onChange={setFiltros} />
        </div>
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {lista.map((c) => (
            <div key={c.id} className="flex items-center gap-3 border border-border rounded-lg p-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold uppercase">{c.nome}</p>
                <p className="text-xs text-primary uppercase">{c.cargo}</p>
                {c.lider && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-2.5 w-2.5 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase">{c.lider}</span>
                  </div>
                )}
              </div>
              <Button onClick={() => onSelect(c.nome, c.cargo)}>Criar plano de desenvolvimento</Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============== 2. Escolher modo de criação ============== */
export function EscolherMetodoDialog({
  open, onOpenChange, onSelect,
}: { open: boolean; onOpenChange: (b: boolean) => void; onSelect: (modo: "zero" | "modelo") => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Como você gostaria de criar esse plano?</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <button
            onClick={() => onSelect("zero")}
            className="border-2 border-primary rounded-xl p-6 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center gap-4"
          >
            <div className="h-32 w-full rounded-lg bg-card flex items-center justify-center">
              <FileText className="h-16 w-16 text-primary" />
            </div>
            <p className="font-semibold text-card-foreground">Criar do Zero</p>
          </button>
          <button
            onClick={() => onSelect("modelo")}
            className="border border-border rounded-xl p-6 hover:border-primary/50 transition-colors flex flex-col items-center gap-4"
          >
            <div className="h-32 w-full rounded-lg bg-muted/40 flex items-center justify-center">
              <Layers className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="font-semibold text-card-foreground">Criar a partir de um modelo</p>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============== 2.5. Selecionar plano modelo ============== */
const planosModeloMock: Array<{
  id: string;
  nome: string;
  colaborador: string;
  cargo: string;
  area: string;
  lider: string;
  blocos: Bloco[];
  tipo: string;
  duracao: number;
  unidade: "Dias" | "Semanas" | "Meses";
}> = [
  {
    id: "m1",
    nome: "Treinamento Equipe",
    colaborador: "DANIELA NASCIMENTO COSTA BICALHO",
    cargo: "COORDENADORA",
    area: "Diretoria",
    lider: "ANA CAROLINA BRAGA DE MOURA",
    tipo: "habilidades_tecnicas",
    duracao: 12,
    unidade: "Meses",
    blocos: [
      {
        id: "mb1",
        titulo: "Treinamento Legalização",
        descricao: "Treinamento Legalização",
        expandido: false,
        tarefas: [{ id: "mt1", titulo: "Treinamento Holding", progresso: 0, concluida: false }],
      },
    ],
  },
  {
    id: "m2",
    nome: "Treinamento Fiscal",
    colaborador: "THALITA ARAUJO DE OLIVEIRA",
    cargo: "ANALISTA III",
    area: "Fiscal",
    lider: "DANIELA NASCIMENTO COSTA BICALHO",
    tipo: "habilidades_tecnicas",
    duracao: 6,
    unidade: "Meses",
    blocos: [
      {
        id: "mb2",
        titulo: "Apuração de Impostos",
        descricao: "",
        expandido: false,
        tarefas: [{ id: "mt2", titulo: "Curso de ICMS", progresso: 0, concluida: false }],
      },
    ],
  },
  {
    id: "m3",
    nome: "Onboarding Contábil",
    colaborador: "ANA CLÁUDIA ROSSI",
    cargo: "ANALISTA CONTÁBIL III - Step 1",
    area: "Contábil",
    lider: "DANIELA NASCIMENTO COSTA BICALHO",
    tipo: "habilidades_tecnicas",
    duracao: 3,
    unidade: "Meses",
    blocos: [
      {
        id: "mb3",
        titulo: "Conciliações",
        descricao: "",
        expandido: false,
        tarefas: [{ id: "mt3", titulo: "Conciliação bancária", progresso: 0, concluida: false }],
      },
    ],
  },
];

export function SelecionarModeloDialog({
  open, onOpenChange, onUseModelo,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onUseModelo: (modelo: Partial<Plano>) => void;
}) {
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<FiltrosPDI>(FILTROS_DEFAULT);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(planosModeloMock[0]?.id || null);
  const [blocosExpandidos, setBlocosExpandidos] = useState<Record<string, boolean>>({});

  const lista = planosModeloMock
    .filter((p) =>
      (filtros.departamento === "todos" || p.area === filtros.departamento) &&
      (filtros.cargo === "todos" || p.cargo === filtros.cargo) &&
      (filtros.lider === "todos" || p.lider === filtros.lider)
    )
    .filter((p) => p.colaborador.toLowerCase().includes(busca.toLowerCase()));
  const selecionado = planosModeloMock.find((p) => p.id === selecionadoId) || null;

  const handleUsar = () => {
    if (!selecionado) return;
    onUseModelo({
      nome: `${selecionado.nome} (CLONE)`,
      tipo: selecionado.tipo,
      duracao: selecionado.duracao,
      unidade: selecionado.unidade,
      blocos: selecionado.blocos.map((b) => ({
        ...b,
        id: `b${Date.now()}${Math.random()}`,
        tarefas: b.tarefas.map((t) => ({ ...t, id: `t${Date.now()}${Math.random()}` })),
      })),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolha um plano para usar como modelo</DialogTitle>
          <DialogDescription>Aqui você escolhe qual plano deseja utilizar como modelo</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Busque por uma pessoa" className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <FiltrosPopover filtros={filtros} onChange={setFiltros} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Lista de modelos */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {lista.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelecionadoId(p.id)}
                className={cn(
                  "w-full flex items-center gap-3 border rounded-lg p-3 text-left transition-colors",
                  selecionadoId === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase">{p.colaborador}</p>
                  <p className="text-[11px] text-primary uppercase">{p.cargo}</p>
                  <p className="text-[11px] text-muted-foreground">{p.area}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-2.5 w-2.5 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase">{p.lider}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Preview do modelo selecionado */}
          <div className="space-y-3">
            <Button className="w-full" onClick={handleUsar} disabled={!selecionado}>
              Criar um plano a partir deste
            </Button>
            {selecionado && (
              <>
                <div className="border border-border rounded-lg p-3 flex items-center gap-3">
                  <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{selecionado.nome}</p>
                    <p className="text-[11px] uppercase font-semibold mt-1">{selecionado.colaborador}</p>
                    <p className="text-[11px] text-primary uppercase">{selecionado.cargo}</p>
                    <p className="text-[11px] text-muted-foreground">{selecionado.area}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase">{selecionado.lider}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {selecionado.blocos.map((b) => {
                    const exp = blocosExpandidos[b.id];
                    return (
                      <div key={b.id} className="border border-border rounded-lg">
                        <button
                          onClick={() => setBlocosExpandidos((s) => ({ ...s, [b.id]: !exp }))}
                          className="w-full flex items-center justify-between p-3"
                        >
                          <span className="text-sm font-medium">{b.titulo}</span>
                          {exp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {exp && (
                          <div className="px-3 pb-3 space-y-1">
                            {b.tarefas.map((t, idx) => (
                              <div key={t.id} className="text-xs text-muted-foreground border-t pt-2">
                                {String(idx + 1).padStart(2, "0")} — {t.titulo}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============== 3. Editor do plano ============== */
export function EditorPlanoDialog({
  open, onOpenChange, plano, onSave, onDelete,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  plano: Partial<Plano> & { colaborador: string; cargo: string };
  onSave: (p: Plano) => void;
  onDelete?: () => void;
}) {
  const [nome, setNome] = useState(plano.nome || "");
  const [tipo, setTipo] = useState(plano.tipo || "habilidades_tecnicas");
  const [dataInicio, setDataInicio] = useState<Date>(plano.dataInicio || new Date());
  const [duracao, setDuracao] = useState(plano.duracao || 30);
  const [unidade, setUnidade] = useState<"Dias" | "Semanas" | "Meses">(plano.unidade || "Dias");
  const [blocos, setBlocos] = useState<Bloco[]>(plano.blocos || []);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalTarefas = blocos.reduce((s, b) => s + b.tarefas.length, 0);

  const addBloco = () => {
    setBlocos([...blocos, { id: `b${Date.now()}`, titulo: "", descricao: "", tarefas: [], expandido: true }]);
  };

  const updateBloco = (id: string, patch: Partial<Bloco>) => {
    setBlocos((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const removeBloco = (id: string) => {
    setBlocos((bs) => bs.filter((b) => b.id !== id));
  };

  const addTarefa = (blocoId: string) => {
    setBlocos((bs) =>
      bs.map((b) =>
        b.id === blocoId
          ? { ...b, tarefas: [...b.tarefas, { id: `t${Date.now()}`, titulo: "Nova tarefa", progresso: 0, concluida: false }] }
          : b,
      ),
    );
  };

  const removeTarefa = (blocoId: string, tarefaId: string) => {
    setBlocos((bs) =>
      bs.map((b) => (b.id === blocoId ? { ...b, tarefas: b.tarefas.filter((t) => t.id !== tarefaId) } : b)),
    );
  };

  const updateTarefa = (blocoId: string, tarefaId: string, patch: Partial<Tarefa>) => {
    setBlocos((bs) =>
      bs.map((b) =>
        b.id === blocoId ? { ...b, tarefas: b.tarefas.map((t) => (t.id === tarefaId ? { ...t, ...patch } : t)) } : b,
      ),
    );
  };

  const handleSalvar = () => {
    if (!nome.trim() || blocos.length === 0) return;
    onSave({
      id: plano.id || `p${Date.now()}`,
      nome,
      colaborador: plano.colaborador,
      cargo: plano.cargo,
      tipo,
      dataInicio,
      duracao,
      unidade,
      blocos,
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-muted rounded">
                    <X className="h-4 w-4" />
                  </button>
                  Desenvolvimento do Colaborador
                </DialogTitle>
                <DialogDescription>
                  Acompanhe a evolução do PDI do seu colaborador(a). Reforce conquistas, atualize objetivos e mantenha o foco no crescimento e desenvolvimento contínuo.
                </DialogDescription>
              </div>
              {onDelete && (
                <Button variant="outline" className="gap-2 text-destructive border-destructive/30" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" />Excluir plano
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Nome do plano */}
            <div className="border border-border rounded-lg p-4">
              <label className="text-sm font-semibold text-card-foreground">Nome do plano *</label>
              <Input className="mt-2" placeholder="Ex.: Desenvolvimento de liderança" value={nome} onChange={(e) => setNome(e.target.value)} />

              <div className="flex items-center gap-3 mt-4">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase">{plano.colaborador}</p>
                  <p className="text-xs text-primary uppercase">{plano.cargo}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div>
                  <label className="text-xs font-medium text-card-foreground">Tipo *</label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="habilidades_tecnicas">Habilidades Técnicas</SelectItem>
                      <SelectItem value="lideranca">Liderança</SelectItem>
                      <SelectItem value="comunicacao">Comunicação</SelectItem>
                      <SelectItem value="gestao">Gestão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-card-foreground">Data de Início *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("mt-1 w-full justify-start text-left font-normal")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dataInicio} onSelect={(d) => d && setDataInicio(d)} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-xs font-medium text-card-foreground">Tempo estimado de conclusão *</label>
                  <div className="flex gap-1 mt-1">
                    <Input type="number" value={duracao} onChange={(e) => setDuracao(Number(e.target.value))} className="w-20" />
                    <div className="flex border rounded-md overflow-hidden">
                      {(["Dias", "Semanas", "Meses"] as const).map((u) => (
                        <button
                          key={u}
                          onClick={() => setUnidade(u)}
                          className={cn("px-3 text-xs", unidade === u ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo: blocos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">Conteúdo do plano de desenvolvimento individual</p>
                  <p className="text-xs text-muted-foreground">* Campos obrigatórios</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="border border-border rounded px-3 py-1.5 flex items-center gap-1"><Layers className="h-3 w-3" />{blocos.length} blocos</span>
                  <span className="border border-border rounded px-3 py-1.5 flex items-center gap-1"><ListChecks className="h-3 w-3" />{totalTarefas} tarefas</span>
                </div>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Pesquise por um bloco" />
              </div>

              <div className="space-y-3">
                {blocos.map((bloco) => (
                  <div key={bloco.id} className="border border-border rounded-lg">
                    <div className="flex items-center gap-2 p-3 border-b">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-semibold flex-1">{bloco.titulo || "Título do bloco"}</p>
                      <button onClick={() => removeBloco(bloco.id)} className="p-1.5 rounded text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => updateBloco(bloco.id, { expandido: !bloco.expandido })} className="p-1.5 rounded hover:bg-muted">
                        {bloco.expandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                    {bloco.expandido && (
                      <div className="p-4 space-y-3">
                        <div>
                          <label className="text-xs font-semibold">Título do bloco *</label>
                          <Input className="mt-1" placeholder="Ex.: Envio de Feedback" value={bloco.titulo} onChange={(e) => updateBloco(bloco.id, { titulo: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold">Descrição do bloco <span className="text-primary font-medium">(opcional)</span></label>
                          <Input className="mt-1" placeholder="Ex.: Envio de Feedback" value={bloco.descricao || ""} onChange={(e) => updateBloco(bloco.id, { descricao: e.target.value })} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">Tarefas</p>
                          <p className="text-xs text-muted-foreground">Adicione tarefas para serem realizadas no bloco</p>
                          <div className="mt-2 space-y-2">
                            {bloco.tarefas.length === 0 ? (
                              <div className="border border-dashed rounded-lg py-4 text-center text-xs text-primary">Nenhuma tarefa criada</div>
                            ) : (
                              bloco.tarefas.map((t, idx) => (
                                <div key={t.id} className="flex items-center gap-2 border border-border rounded-lg p-2">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground w-6">{String(idx + 1).padStart(2, "0")}</span>
                                  <Input className="flex-1 border-0 shadow-none focus-visible:ring-0 px-2 h-8 text-sm" value={t.titulo} onChange={(e) => updateTarefa(bloco.id, t.id, { titulo: e.target.value })} />
                                  <span className="text-[10px] bg-primary/10 text-primary rounded px-2 py-1">Atingido/Não atingido</span>
                                  <button onClick={() => removeTarefa(bloco.id, t.id)} className="p-1 rounded text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                            <button onClick={() => addTarefa(bloco.id)} className="w-full border border-border rounded-lg py-2 text-sm text-primary hover:bg-primary/5 flex items-center justify-center gap-1">
                              <Plus className="h-4 w-4" />Adicionar tarefa
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={addBloco} className="w-full border border-dashed border-border rounded-lg py-3 text-sm text-card-foreground hover:bg-muted/50 flex items-center justify-center gap-1">
                  <Plus className="h-4 w-4" />Novo bloco
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSalvar} disabled={!nome.trim() || blocos.length === 0}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />Excluir o vínculo da trilha?
            </DialogTitle>
            <DialogDescription className="text-card-foreground">
              <span className="font-semibold">Atenção!</span><br />
              Ao confirmar, o plano associado, juntamente com seus grupos e tarefas vinculadas, será permanentemente excluído. Essa ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { onDelete?.(); setConfirmDelete(false); onOpenChange(false); }}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ============== 4. Detalhes do plano (painel lateral) ============== */
export function PlanoDetalhes({
  plano, onEdit, onFinalizar, onUpdateTarefa,
}: {
  plano: Plano;
  onEdit: () => void;
  onFinalizar: () => void;
  onUpdateTarefa: (blocoId: string, tarefaId: string, patch: Partial<Tarefa>) => void;
}) {
  const [blocosExpandidos, setBlocosExpandidos] = useState<Record<string, boolean>>({});
  const [confirmFinalizar, setConfirmFinalizar] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<{ blocoId: string; tarefa: Tarefa } | null>(null);

  const totalTarefas = plano.blocos.reduce((s, b) => s + b.tarefas.length, 0);
  const concluidas = plano.blocos.reduce((s, b) => s + b.tarefas.filter((t) => t.concluida).length, 0);
  const progresso = totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0;

  const previsto = new Date(plano.dataInicio);
  if (plano.unidade === "Dias") previsto.setDate(previsto.getDate() + plano.duracao);
  if (plano.unidade === "Semanas") previsto.setDate(previsto.getDate() + plano.duracao * 7);
  if (plano.unidade === "Meses") previsto.setMonth(previsto.getMonth() + plano.duracao);

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <User className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-card-foreground">{plano.nome}</p>
          <p className="text-xs uppercase font-semibold mt-1">{plano.colaborador}</p>
          <p className="text-xs text-primary uppercase">{plano.cargo}</p>
        </div>
        <Button size="icon" variant="outline" onClick={onEdit}>
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Início em {format(plano.dataInicio, "dd/MM/yy")}</span>
          <span className="text-muted-foreground">Previsto {format(previsto, "dd/MM/yy")}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full">
          <div className="h-full bg-primary rounded-full" style={{ width: `${progresso}%` }} />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className={progresso === 0 ? "text-destructive" : "text-primary"}>{progresso}%</span>
          <span className={progresso === 0 ? "text-destructive" : "text-muted-foreground"}>{concluidas} de {totalTarefas} tarefas</span>
        </div>
      </div>

      {plano.blocos.map((bloco) => {
        const blocoConcluidas = bloco.tarefas.filter((t) => t.concluida).length;
        const blocoProgresso = bloco.tarefas.length > 0 ? Math.round((blocoConcluidas / bloco.tarefas.length) * 100) : 0;
        const expandido = blocosExpandidos[bloco.id];

        return (
          <div key={bloco.id} className="border border-border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-sm font-semibold">{bloco.titulo}</p>
                <div className="h-1 bg-muted rounded-full mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${blocoProgresso}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                  <span>{blocoProgresso}%</span>
                  <span>{blocoConcluidas} de {bloco.tarefas.length} tarefas</span>
                </div>
              </div>
              <button onClick={() => setBlocosExpandidos((s) => ({ ...s, [bloco.id]: !expandido }))} className="p-1.5 rounded hover:bg-muted">
                {expandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
            {expandido && (
              <div className="mt-3 space-y-2">
                {bloco.tarefas.map((t, idx) => (
                  <button key={t.id} onClick={() => setTarefaSelecionada({ blocoId: bloco.id, tarefa: t })} className="w-full flex items-center gap-3 border border-border rounded-lg p-2 hover:bg-muted/40">
                    <span className="text-xs text-muted-foreground w-6">{String(idx + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-left text-xs">{t.titulo}</span>
                    <span className={cn("inline-flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold", t.concluida ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                      {t.progresso}%
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <Button variant="outline" className="w-full text-primary border-primary" onClick={() => setConfirmFinalizar(true)}>
        Finalizar
      </Button>

      {/* Tarefa dialog */}
      {tarefaSelecionada && (
        <TarefaDialog
          tarefa={tarefaSelecionada.tarefa}
          onClose={() => setTarefaSelecionada(null)}
          onSave={(patch) => {
            onUpdateTarefa(tarefaSelecionada.blocoId, tarefaSelecionada.tarefa.id, patch);
            setTarefaSelecionada(null);
          }}
        />
      )}

      {/* Finalizar plano */}
      <Dialog open={confirmFinalizar} onOpenChange={setConfirmFinalizar}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center text-center pt-2">
            <div className="h-14 w-14 rounded-full border-2 border-amber-500 flex items-center justify-center mb-3">
              <AlertCircle className="h-7 w-7 text-amber-500" />
            </div>
            <DialogTitle>Finalizar</DialogTitle>
            <DialogDescription>Você tem certeza disso?</DialogDescription>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setConfirmFinalizar(false)}>Cancelar</Button>
            <Button onClick={() => { onFinalizar(); setConfirmFinalizar(false); }}>Finalizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============== 5. Dialog de tarefa ============== */
function TarefaDialog({
  tarefa, onClose, onSave,
}: { tarefa: Tarefa; onClose: () => void; onSave: (patch: Partial<Tarefa>) => void }) {
  const [progresso, setProgresso] = useState<string>(tarefa.concluida ? "concluido" : "nao_concluido");
  const [aprendizados, setAprendizados] = useState(tarefa.aprendizados || "");

  const handleConcluir = () => {
    const concluida = progresso === "concluido";
    onSave({ concluida, progresso: concluida ? 100 : 0, aprendizados });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xs bg-primary/10 text-primary rounded px-2 py-0.5">01</span>
            {tarefa.titulo}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium">Progresso</label>
            <Select value={progresso} onValueChange={setProgresso}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nao_concluido">Não concluído</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Conte seus maiores aprendizados</label>
            <Textarea className="mt-1 min-h-[100px]" value={aprendizados} onChange={(e) => setAprendizados(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button onClick={handleConcluir}>Concluir Tarefa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
