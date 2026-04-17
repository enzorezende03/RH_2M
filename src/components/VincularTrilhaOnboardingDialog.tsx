import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Filter,
  GripVertical,
  Layers,
  ListChecks,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Variant = "trilha" | "onboarding";

interface TarefaV {
  id: string;
  titulo: string;
}
interface BlocoV {
  id: string;
  titulo: string;
  descricao?: string;
  tarefas: TarefaV[];
  expandido?: boolean;
}
interface ModeloV {
  id: string;
  nome: string;
  duracao: number;
  unidade: "Dias" | "Semanas" | "Meses";
  blocos: BlocoV[];
}

const colaboradoresMock = [
  { id: "c1", nome: "ANA CAROLINA BRAGA DE MOURA", cargo: "DIRETORA", departamento: "Diretoria", lider: null as string | null },
  { id: "c2", nome: "DANIELA NASCIMENTO COSTA BICALHO", cargo: "COORDENADORA", departamento: "Coordenação", lider: "ANA CAROLINA BRAGA DE MOURA" },
  { id: "c3", nome: "LIVIA GARCIA XAVIER", cargo: "ANALISTA III", departamento: "Pessoal", lider: "ANA CAROLINA BRAGA DE MOURA" },
  { id: "c4", nome: "MARTA TEODORO DE SOUZA CARDOSO", cargo: "SERVIÇOS GERAIS", departamento: "Geral", lider: "ANA CAROLINA BRAGA DE MOURA" },
  { id: "c5", nome: "DAIANE MATOS BRITO", cargo: "ANALISTA I", departamento: "Fiscal", lider: "DANIELA NASCIMENTO COSTA BICALHO" },
  { id: "c6", nome: "NAYARA ROCHA", cargo: "ANALISTA II", departamento: "Contábil", lider: "DANIELA NASCIMENTO COSTA BICALHO" },
];

const modelosOnboardingMock: ModeloV[] = [
  {
    id: "on1",
    nome: "Onboarding Padrão da Empresa",
    duracao: 30,
    unidade: "Dias",
    blocos: [
      {
        id: "onb1",
        titulo: "Conhecendo nossa cultura",
        descricao: "Explore nossa cultura para se integrar completamente à nossa equipe e compartilhar nossos valores.",
        tarefas: [
          { id: "ont1", titulo: "Ler material" },
          { id: "ont2", titulo: "Assistir vídeo institucional" },
        ],
      },
      {
        id: "onb2",
        titulo: "Sistemas básicos",
        descricao: "Aprenda a usar os principais sistemas internos.",
        tarefas: [
          { id: "ont3", titulo: "Criar acessos" },
          { id: "ont4", titulo: "Realizar primeiro login" },
        ],
      },
    ],
  },
  {
    id: "on2",
    nome: "Onboarding Operacional",
    duracao: 2,
    unidade: "Semanas",
    blocos: [
      {
        id: "onb3",
        titulo: "Boas-vindas",
        descricao: "Apresentação da equipe e ambiente.",
        tarefas: [{ id: "ont5", titulo: "Tour pela empresa" }],
      },
    ],
  },
];

const modelosTrilhaMock: ModeloV[] = [
  {
    id: "tr1",
    nome: "Trilha Padrão da Empresa",
    duracao: 3,
    unidade: "Meses",
    blocos: [
      {
        id: "trb1",
        titulo: "Fundamentos do Cargo",
        descricao: "Conteúdos base para o desempenho da função.",
        tarefas: [
          { id: "trt1", titulo: "Leitura do manual técnico" },
          { id: "trt2", titulo: "Realizar treinamento online" },
        ],
      },
      {
        id: "trb2",
        titulo: "Boas práticas",
        descricao: "Práticas recomendadas pela empresa.",
        tarefas: [{ id: "trt3", titulo: "Workshop interno" }],
      },
    ],
  },
  {
    id: "tr2",
    nome: "Trilha de Liderança",
    duracao: 6,
    unidade: "Meses",
    blocos: [
      {
        id: "trb3",
        titulo: "Gestão de Pessoas",
        descricao: "",
        tarefas: [{ id: "trt4", titulo: "Curso de feedback" }],
      },
    ],
  },
];

const COPY = {
  trilha: {
    dialogTitle: "Escolha qual colaborador irá realizar essa trilha",
    dialogDesc: "Aqui você escolhe quem irá realizar essa trilha",
    selectLabel: "Escolher a Trilha",
    selectField: "Modelo Padrão de Trilha",
    selectPlaceholder: "Escolha a Trilha modelo para o colaborador",
    actionLabel: "Criar Trilha",
    semLabel: "Sem trilha",
    headerEditor: "Vincular trilha",
    headerEditorSub: "Verifique e conclua o vínculo da(s) trilha(s) para o colaborador",
    contentTitle: "Conteúdo da trilha",
    saveLabel: "Vincular modelo",
  },
  onboarding: {
    dialogTitle: "Escolha qual colaborador irá realizar esse plano",
    dialogDesc: "Aqui você escolhe quem irá realizar esse onboarding",
    selectLabel: "Escolher o Onboarding",
    selectField: "Modelo Padrão de Onboarding",
    selectPlaceholder: "Escolha o Onboarding modelo para o colaborador",
    actionLabel: "Criar Onboarding",
    semLabel: "Sem onboarding",
    headerEditor: "Vincular onboarding",
    headerEditorSub: "Verifique e conclua o vínculo do(s) onboarding(s) para o colaborador",
    contentTitle: "Conteúdo do onboarding",
    saveLabel: "Vincular modelo",
  },
} as const;

interface FiltrosV {
  departamento: string;
  cargo: string;
  lider: string;
}
const FILTROS_DEFAULT: FiltrosV = { departamento: "todos", cargo: "todos", lider: "todos" };

function FiltrosPopover({
  filtros,
  onChange,
}: {
  filtros: FiltrosV;
  onChange: (f: FiltrosV) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FiltrosV>(filtros);
  const departamentos = Array.from(new Set(colaboradoresMock.map((c) => c.departamento)));
  const cargos = Array.from(new Set(colaboradoresMock.map((c) => c.cargo)));
  const lideres = Array.from(new Set(colaboradoresMock.map((c) => c.lider).filter(Boolean) as string[]));

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
              <span className="text-sm"><span className="font-semibold">Departamento:</span> <span className="text-muted-foreground">{draft.departamento === "todos" ? "Todos" : draft.departamento}</span></span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {departamentos.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={draft.cargo} onValueChange={(v) => setDraft({ ...draft, cargo: v })}>
            <SelectTrigger className="h-auto py-2">
              <span className="text-sm"><span className="font-semibold">Cargo:</span> <span className="text-muted-foreground">{draft.cargo === "todos" ? "Todos" : draft.cargo}</span></span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {cargos.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={draft.lider} onValueChange={(v) => setDraft({ ...draft, lider: v })}>
            <SelectTrigger className="h-auto py-2">
              <span className="text-sm"><span className="font-semibold">Líder:</span> <span className="text-muted-foreground">{draft.lider === "todos" ? "Todos" : draft.lider}</span></span>
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

function cloneModelo(m: ModeloV): ModeloV {
  return {
    ...m,
    id: `${m.id}-${Date.now()}`,
    blocos: m.blocos.map((b) => ({
      ...b,
      id: `b${Date.now()}${Math.random()}`,
      expandido: false,
      tarefas: b.tarefas.map((t) => ({ ...t, id: `t${Date.now()}${Math.random()}` })),
    })),
  };
}

/* ============== Editor (passo 2) ============== */
function EditorVinculo({
  variant,
  colaborador,
  modeloBase,
  onBack,
  onConfirm,
}: {
  variant: Variant;
  colaborador: { nome: string; cargo: string };
  modeloBase: ModeloV;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const C = COPY[variant];
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [duracao, setDuracao] = useState<number>(modeloBase.duracao);
  const [unidade, setUnidade] = useState<"Dias" | "Semanas" | "Meses">(modeloBase.unidade);
  const [blocos, setBlocos] = useState<BlocoV[]>(() => cloneModelo(modeloBase).blocos);
  const [busca, setBusca] = useState("");

  const totalTarefas = blocos.reduce((s, b) => s + b.tarefas.length, 0);

  const updateBloco = (id: string, patch: Partial<BlocoV>) =>
    setBlocos((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const removeBloco = (id: string) => setBlocos((bs) => bs.filter((b) => b.id !== id));
  const addBloco = () =>
    setBlocos([...blocos, { id: `b${Date.now()}`, titulo: "", descricao: "", tarefas: [], expandido: true }]);
  const addTarefa = (bid: string) =>
    setBlocos((bs) =>
      bs.map((b) => (b.id === bid ? { ...b, tarefas: [...b.tarefas, { id: `t${Date.now()}`, titulo: "Nova tarefa" }] } : b))
    );
  const removeTarefa = (bid: string, tid: string) =>
    setBlocos((bs) => bs.map((b) => (b.id === bid ? { ...b, tarefas: b.tarefas.filter((t) => t.id !== tid) } : b)));
  const updateTarefa = (bid: string, tid: string, titulo: string) =>
    setBlocos((bs) =>
      bs.map((b) => (b.id === bid ? { ...b, tarefas: b.tarefas.map((t) => (t.id === tid ? { ...t, titulo } : t)) } : b))
    );

  const blocosFiltrados = blocos.filter((b) => b.titulo.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="h-9 w-9 border border-border rounded-md flex items-center justify-center hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <DialogTitle>{C.headerEditor}</DialogTitle>
          <DialogDescription>{C.headerEditorSub}</DialogDescription>
        </div>
      </div>

      {/* Cabeçalho colaborador */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase">{colaborador.nome}</p>
            <p className="text-xs text-primary uppercase">{colaborador.cargo}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-xs font-semibold">Data de Início *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mt-1 w-full justify-start text-left font-normal">
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
            <label className="text-xs font-semibold">Tempo estimado de conclusão *</label>
            <div className="flex gap-1 mt-1">
              <Input type="number" value={duracao} onChange={(e) => setDuracao(Number(e.target.value))} className="w-20" />
              <div className="flex border rounded-md overflow-hidden flex-1">
                {(["Dias", "Semanas", "Meses"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnidade(u)}
                    className={cn(
                      "flex-1 px-3 text-xs",
                      unidade === u ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-semibold text-sm">{C.contentTitle}</p>
            <p className="text-xs text-primary">* Campos obrigatórios</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="border border-border rounded px-3 py-1.5 flex items-center gap-1">
              <Layers className="h-3 w-3" /><strong>{blocos.length}</strong> blocos
            </span>
            <span className="border border-border rounded px-3 py-1.5 flex items-center gap-1">
              <ListChecks className="h-3 w-3" /><strong>{totalTarefas}</strong> tarefas
            </span>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquise por um bloco" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        <div className="space-y-3">
          {blocosFiltrados.map((bloco) => (
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
                    <Input className="mt-1" value={bloco.titulo} onChange={(e) => updateBloco(bloco.id, { titulo: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Descrição do bloco <span className="text-primary font-medium">(opcional)</span></label>
                    <Input className="mt-1" value={bloco.descricao || ""} onChange={(e) => updateBloco(bloco.id, { descricao: e.target.value })} />
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
                            <Input className="flex-1 border-0 shadow-none focus-visible:ring-0 px-2 h-8 text-sm" value={t.titulo} onChange={(e) => updateTarefa(bloco.id, t.id, e.target.value)} />
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
          <button onClick={addBloco} className="w-full bg-muted/40 hover:bg-muted rounded-lg py-3 text-sm flex items-center justify-center gap-1">
            <Plus className="h-4 w-4" />Novo bloco
          </button>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={onConfirm} disabled={blocos.length === 0}>{C.saveLabel}</Button>
      </DialogFooter>
    </div>
  );
}

/* ============== Dialog principal ============== */
export function VincularTrilhaOnboardingDialog({
  open,
  onOpenChange,
  variant,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  variant: Variant;
}) {
  const C = COPY[variant];
  const modelos = variant === "onboarding" ? modelosOnboardingMock : modelosTrilhaMock;

  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<FiltrosV>(FILTROS_DEFAULT);
  const [modeloId, setModeloId] = useState<string>("");
  const [step, setStep] = useState<"selecionar" | "editor">("selecionar");
  const [colab, setColab] = useState<{ nome: string; cargo: string } | null>(null);

  const lista = useMemo(
    () =>
      colaboradoresMock
        .filter(
          (c) =>
            (filtros.departamento === "todos" || c.departamento === filtros.departamento) &&
            (filtros.cargo === "todos" || c.cargo === filtros.cargo) &&
            (filtros.lider === "todos" || c.lider === filtros.lider)
        )
        .filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase())),
    [busca, filtros]
  );

  const modeloSelecionado = modelos.find((m) => m.id === modeloId);

  const reset = () => {
    setBusca("");
    setFiltros(FILTROS_DEFAULT);
    setModeloId("");
    setStep("selecionar");
    setColab(null);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        {step === "selecionar" && (
          <>
            <DialogHeader>
              <DialogTitle>{C.dialogTitle}</DialogTitle>
              <DialogDescription>{C.dialogDesc}</DialogDescription>
            </DialogHeader>

            <div>
              <p className="text-sm font-semibold mb-1">{C.selectLabel}</p>
              <Select value={modeloId} onValueChange={setModeloId}>
                <SelectTrigger>
                  <SelectValue placeholder={C.selectPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {modelos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  <span className="text-xs text-muted-foreground">{C.semLabel}</span>
                  <Button
                    disabled={!modeloSelecionado}
                    onClick={() => {
                      if (!modeloSelecionado) return;
                      setColab({ nome: c.nome, cargo: c.cargo });
                      setStep("editor");
                    }}
                  >
                    {C.actionLabel}
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        {step === "editor" && colab && modeloSelecionado && (
          <EditorVinculo
            variant={variant}
            colaborador={colab}
            modeloBase={modeloSelecionado}
            onBack={() => setStep("selecionar")}
            onConfirm={() => handleClose(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
