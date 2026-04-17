import { useState } from "react";
import {
  ArrowLeft,
  Download,
  Plus,
  Search,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Layers,
  ListChecks,
  AlertCircle,
  MoreVertical,
  Network,
  ClipboardList,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TarefaM {
  id: string;
  titulo: string;
}
interface BlocoM {
  id: string;
  titulo: string;
  descricao?: string;
  publicoAlvo?: "todos" | "unidades" | "departamentos" | "cargos";
  tarefas: TarefaM[];
  expandido?: boolean;
}
export interface ModeloTrilha {
  id: string;
  numero: string; // ID exibido (ex.: 10051)
  nome: string;
  descricao?: string;
  duracao: number;
  unidade: "Dias" | "Semanas" | "Meses";
  blocos: BlocoM[];
}

type TituloVariant = "trilha" | "onboarding";

const labels = {
  trilha: {
    tituloLista: "Modelos de Trilhas",
    subtituloLista: "Realize a gestão dos modelos de Trilhas de desenvolvimento",
    vazioTitulo: "Nenhum modelo criado",
    vazioSub: "Você ainda não criou modelos de Trilhas",
    tituloCriar: "Criar modelo de trilha",
    subCriar: "Crie um modelo de trilha que pode ser vinculado a colaboradores",
    tituloEditar: "Editar modelo de trilha",
    subEditar: "Edite as informações desse modelo de trilha",
    badgePadrao: "Trilha Padrão da Empresa",
    confirmTitulo: "Excluir o modelo da trilha?",
  },
  onboarding: {
    tituloLista: "Modelos de Onboarding",
    subtituloLista: "Realize a gestão dos modelos de Onboarding",
    vazioTitulo: "Nenhum modelo criado",
    vazioSub: "Você ainda não criou modelos de Onboarding",
    tituloCriar: "Criar modelo de onboarding",
    subCriar: "Crie um modelo de onboarding que pode ser vinculado a colaboradores",
    tituloEditar: "Editar modelo de onboarding",
    subEditar: "Edite as informações desse modelo de onboarding",
    badgePadrao: "Onboarding Padrão da Empresa",
    confirmTitulo: "Excluir o modelo do onboarding?",
  },
} as const;

function nextNumero() {
  return String(10050 + Math.floor(Math.random() * 9000));
}

/* ============== Editor (criar/editar) ============== */
function EditorModelo({
  inicial,
  variant,
  onCancel,
  onSave,
}: {
  inicial?: ModeloTrilha;
  variant: TituloVariant;
  onCancel: () => void;
  onSave: (m: ModeloTrilha) => void;
}) {
  const L = labels[variant];
  const [nome, setNome] = useState(inicial?.nome || "");
  const [descricao, setDescricao] = useState(inicial?.descricao || "");
  const [duracao, setDuracao] = useState<number>(inicial?.duracao || 30);
  const [unidade, setUnidade] = useState<"Dias" | "Semanas" | "Meses">(inicial?.unidade || "Dias");
  const [blocos, setBlocos] = useState<BlocoM[]>(inicial?.blocos || []);

  const totalTarefas = blocos.reduce((s, b) => s + b.tarefas.length, 0);

  const addBloco = () =>
    setBlocos([...blocos, { id: `b${Date.now()}`, titulo: "", descricao: "", tarefas: [], expandido: true }]);
  const updateBloco = (id: string, patch: Partial<BlocoM>) =>
    setBlocos((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const removeBloco = (id: string) => setBlocos((bs) => bs.filter((b) => b.id !== id));
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

  const podeSalvar = nome.trim().length > 0 && blocos.length > 0;

  const handleSalvar = () => {
    if (!podeSalvar) return;
    onSave({
      id: inicial?.id || `m${Date.now()}`,
      numero: inicial?.numero || nextNumero(),
      nome: nome.trim(),
      descricao,
      duracao,
      unidade,
      blocos,
    });
  };

  return (
    <div className="bg-card rounded-xl p-6 card-shadow space-y-6">
      {/* header */}
      <div className="flex items-start gap-3">
        <button onClick={onCancel} className="h-9 w-9 border border-border rounded-md flex items-center justify-center hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">
            {inicial ? L.tituloEditar : L.tituloCriar}
          </h2>
          <p className="text-xs text-muted-foreground">{inicial ? L.subEditar : L.subCriar}</p>
        </div>
      </div>

      {/* informações básicas */}
      <div>
        <h3 className="font-semibold text-card-foreground">Informações básicas</h3>
        <p className="text-xs text-primary mb-3">* Campos obrigatórios</p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-4">
          <div>
            <label className="text-xs font-semibold">Nome do modelo *</label>
            <Input className="mt-1" placeholder="Nome do modelo" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold">Tempo estimado de conclusão *</label>
            <div className="flex gap-1 mt-1">
              <Input
                type="number"
                value={duracao}
                onChange={(e) => setDuracao(Number(e.target.value))}
                className="w-20"
              />
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

        <div className="mt-3">
          <label className="text-xs font-semibold">
            Descreva o plano <span className="text-primary font-medium">(opcional)</span>
          </label>
          <Textarea
            className="mt-1 min-h-[110px]"
            placeholder="Descreva o plano"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
      </div>

      {/* conteúdo */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-card-foreground">Conteúdo</h3>
            <p className="text-xs text-primary mb-3">* Campos obrigatórios</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="border border-border rounded px-3 py-1.5 flex items-center gap-1">
              <Layers className="h-3 w-3" />
              <strong>{blocos.length}</strong> blocos
            </span>
            <span className="border border-border rounded px-3 py-1.5 flex items-center gap-1">
              <ListChecks className="h-3 w-3" />
              <strong>{totalTarefas}</strong> tarefas
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {blocos.length === 0 && (
            <div className="border border-dashed border-border rounded-lg py-6 text-center text-sm text-muted-foreground">
              Nenhum bloco criado
            </div>
          )}
          {blocos.map((bloco) => (
            <div key={bloco.id} className="border border-border rounded-lg">
              <div className="flex items-center gap-2 p-3 border-b">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold flex-1">{bloco.titulo || "Título do bloco"}</p>
                <button
                  onClick={() => removeBloco(bloco.id)}
                  className="p-1.5 rounded text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => updateBloco(bloco.id, { expandido: !bloco.expandido })}
                  className="p-1.5 rounded hover:bg-muted"
                >
                  {bloco.expandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
              {bloco.expandido && (
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold">Título do bloco *</label>
                    <Input
                      className="mt-1"
                      placeholder="Ex.: Envio de Feedback"
                      value={bloco.titulo}
                      onChange={(e) => updateBloco(bloco.id, { titulo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">
                      Descrição do bloco <span className="text-primary font-medium">(opcional)</span>
                    </label>
                    <Input
                      className="mt-1"
                      placeholder="Descrição"
                      value={bloco.descricao || ""}
                      onChange={(e) => updateBloco(bloco.id, { descricao: e.target.value })}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Tarefas</p>
                    <p className="text-xs text-muted-foreground">Adicione tarefas para serem realizadas no bloco</p>
                    <div className="mt-2 space-y-2">
                      {bloco.tarefas.length === 0 ? (
                        <div className="border border-dashed rounded-lg py-4 text-center text-xs text-primary">
                          Nenhuma tarefa criada
                        </div>
                      ) : (
                        bloco.tarefas.map((t, idx) => (
                          <div key={t.id} className="flex items-center gap-2 border border-border rounded-lg p-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground w-6">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <Input
                              className="flex-1 border-0 shadow-none focus-visible:ring-0 px-2 h-8 text-sm"
                              value={t.titulo}
                              onChange={(e) => updateTarefa(bloco.id, t.id, e.target.value)}
                            />
                            <button
                              onClick={() => removeTarefa(bloco.id, t.id)}
                              className="p-1 rounded text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                      <button
                        onClick={() => addTarefa(bloco.id)}
                        className="w-full border border-border rounded-lg py-2 text-sm text-primary hover:bg-primary/5 flex items-center justify-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar tarefa
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addBloco}
            className="w-full bg-muted/40 hover:bg-muted rounded-lg py-3 text-sm flex items-center justify-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Novo bloco
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSalvar} disabled={!podeSalvar}>
          {inicial ? "Salvar alterações" : "Salvar modelo"}
        </Button>
      </div>
    </div>
  );
}

/* ============== Manager (lista + criar + editar) ============== */
export function ModelosTrilhasManager({
  open,
  onOpenChange,
  variant = "trilha",
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  variant?: TituloVariant;
}) {
  const L = labels[variant];
  const [modelos, setModelos] = useState<ModeloTrilha[]>([]);
  const [view, setView] = useState<"lista" | "criar" | "editar">("lista");
  const [editId, setEditId] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const editando = modelos.find((m) => m.id === editId) || undefined;
  const listaFiltrada = modelos.filter((m) => m.nome.toLowerCase().includes(busca.toLowerCase()));

  const handleClose = () => {
    setView("lista");
    setEditId(null);
    setBusca("");
    onOpenChange(false);
  };

  const handleSave = (m: ModeloTrilha) => {
    setModelos((prev) => {
      const exist = prev.some((p) => p.id === m.id);
      return exist ? prev.map((p) => (p.id === m.id ? m : p)) : [...prev, m];
    });
    setView("lista");
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    setModelos((prev) => prev.filter((p) => p.id !== id));
    setConfirmId(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : onOpenChange(v))}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto p-0 bg-transparent border-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>{L.tituloLista}</DialogTitle>
        </DialogHeader>

        {view === "lista" && (
          <div className="bg-card rounded-xl p-6 card-shadow space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={handleClose}
                  className="h-9 w-9 border border-border rounded-md flex items-center justify-center hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">{L.tituloLista}</h2>
                  <p className="text-xs text-muted-foreground">{L.subtituloLista}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar modelos
                </Button>
                <Button className="gap-2" onClick={() => setView("criar")}>
                  <Plus className="h-4 w-4" />
                  Criar modelo
                </Button>
              </div>
            </div>

            {modelos.length === 0 ? (
              <div className="border border-border rounded-xl py-12 flex flex-col items-center justify-center gap-3">
                <div className="h-32 w-40 rounded-lg bg-muted/40 flex items-center justify-center">
                  <ClipboardList className="h-16 w-16 text-muted-foreground/50" />
                </div>
                <p className="font-semibold text-card-foreground">{L.vazioTitulo}</p>
                <p className="text-xs text-muted-foreground">{L.vazioSub}</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquise pelo nome do modelo"
                    className="pl-9"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  {listaFiltrada.map((m) => {
                    const totalTarefas = m.blocos.reduce((s, b) => s + b.tarefas.length, 0);
                    return (
                      <div key={m.id} className="border border-border rounded-lg p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-card-foreground">{m.nome}</p>
                          <p className="text-xs text-primary">{L.badgePadrao}</p>
                          <p className="text-xs text-muted-foreground">
                            <strong>ID:</strong> {m.numero}
                          </p>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Network className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <p className="font-semibold text-card-foreground">Blocos</p>
                              <p className="text-primary">{m.blocos.length}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <p className="font-semibold text-card-foreground">Tarefas</p>
                              <p className="text-primary">{totalTarefas}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <div>
                              <p className="font-semibold text-card-foreground">Tempo de conclusão</p>
                              <p className="text-muted-foreground">
                                {m.duracao} {m.unidade.toLowerCase()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditId(m.id);
                            setView("editar");
                          }}
                        >
                          Editar modelo
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setConfirmId(m.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir modelo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {view === "criar" && (
          <EditorModelo
            variant={variant}
            onCancel={() => setView("lista")}
            onSave={handleSave}
          />
        )}

        {view === "editar" && editando && (
          <EditorModelo
            variant={variant}
            inicial={editando}
            onCancel={() => {
              setView("lista");
              setEditId(null);
            }}
            onSave={handleSave}
          />
        )}

        {/* Confirmação de exclusão */}
        <Dialog open={!!confirmId} onOpenChange={(v) => !v && setConfirmId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                {L.confirmTitulo}
              </DialogTitle>
              <DialogDescription className="text-card-foreground">
                <span className="font-semibold">Atenção!</span>
                <br />
                Ao confirmar, o modelo, juntamente com seus blocos e tarefas vinculadas, será permanentemente excluído.
                Essa ação não poderá ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmId(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => confirmId && handleDelete(confirmId)}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
