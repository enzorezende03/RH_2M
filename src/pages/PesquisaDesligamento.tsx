import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Pencil, Trash2, Plus, MoreVertical, Users, User, UsersRound, Info, FileDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TIPO_RESPOSTA_OPTIONS = [
  "Texto Livre",
  "Múltipla Escolha",
  "Caixa de Seleção (Múltiplas respostas)",
  "Escala (5 estrelas)",
  "NPS",
  "Distribuição de Pontos (100 pontos)",
];

interface Pergunta {
  id: number;
  tipoResposta: string;
  titulo: string;
  descricao: string;
  opcoes?: string[];
}

interface PesquisaDeslig {
  id: number;
  nome: string;
  descricao: string;
  perguntas: Pergunta[];
}

const PesquisaDesligamento = () => {
  const [view, setView] = useState<"list" | "create" | "resultado" | "configurar">("list");
  const [step, setStep] = useState(1);
  const [pesquisas, setPesquisas] = useState<PesquisaDeslig[]>([]);
  const [selectedPesquisa, setSelectedPesquisa] = useState<PesquisaDeslig | null>(null);
  const [resultadoTab, setResultadoTab] = useState<"dashboard" | "configuracoes">("dashboard");

  // Form state
  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);

  // Editing existing pesquisa
  const [editingPesquisaId, setEditingPesquisaId] = useState<number | null>(null);

  // Add/Edit question dialog
  const [showPerguntaDialog, setShowPerguntaDialog] = useState(false);
  const [editingPergunta, setEditingPergunta] = useState<Pergunta | null>(null);
  const [perguntaTipo, setPerguntaTipo] = useState("Texto Livre");
  const [perguntaTitulo, setPerguntaTitulo] = useState("");
  const [perguntaDescricao, setPerguntaDescricao] = useState("");
  const [perguntaOpcoes, setPerguntaOpcoes] = useState<string[]>(["", ""]);

  // Delete question dialog
  const [showDeletePergunta, setShowDeletePergunta] = useState(false);
  const [perguntaToDelete, setPerguntaToDelete] = useState<Pergunta | null>(null);

  // Delete pesquisa dialog
  const [showDeletePesquisa, setShowDeletePesquisa] = useState(false);
  const [pesquisaToDelete, setPesquisaToDelete] = useState<PesquisaDeslig | null>(null);

  // Three-dot menu
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const needsOpcoes = (tipo: string) =>
    tipo === "Múltipla Escolha" || tipo === "Caixa de Seleção (Múltiplas respostas)" || tipo === "Distribuição de Pontos (100 pontos)";

  const resetPerguntaForm = () => {
    setPerguntaTipo("Texto Livre");
    setPerguntaTitulo("");
    setPerguntaDescricao("");
    setPerguntaOpcoes(["", ""]);
    setEditingPergunta(null);
  };

  const handleOpenAddPergunta = () => {
    resetPerguntaForm();
    setShowPerguntaDialog(true);
  };

  const handleOpenEditPergunta = (p: Pergunta) => {
    setEditingPergunta(p);
    setPerguntaTipo(p.tipoResposta);
    setPerguntaTitulo(p.titulo);
    setPerguntaDescricao(p.descricao);
    setPerguntaOpcoes(p.opcoes && p.opcoes.length > 0 ? [...p.opcoes] : ["", ""]);
    setShowPerguntaDialog(true);
  };

  const handleSavePergunta = () => {
    if (!perguntaTitulo.trim()) {
      toast({ title: "Título obrigatório", description: "Informe o título da pergunta.", variant: "destructive" });
      return;
    }
    if (needsOpcoes(perguntaTipo) && perguntaOpcoes.filter(o => o.trim()).length < 2) {
      toast({ title: "Opções obrigatórias", description: "Informe pelo menos 2 opções.", variant: "destructive" });
      return;
    }

    const novaPergunta: Pergunta = {
      id: editingPergunta ? editingPergunta.id : Date.now(),
      tipoResposta: perguntaTipo,
      titulo: perguntaTitulo,
      descricao: perguntaDescricao,
      opcoes: needsOpcoes(perguntaTipo) ? perguntaOpcoes.filter(o => o.trim()) : undefined,
    };

    if (editingPergunta) {
      setPerguntas(prev => prev.map(p => p.id === editingPergunta.id ? novaPergunta : p));
    } else {
      setPerguntas(prev => [...prev, novaPergunta]);
    }
    setShowPerguntaDialog(false);
    resetPerguntaForm();
  };

  const handleConfirmDeletePergunta = () => {
    if (perguntaToDelete) {
      setPerguntas(prev => prev.filter(p => p.id !== perguntaToDelete.id));
    }
    setShowDeletePergunta(false);
    setPerguntaToDelete(null);
  };

  const handleCriarPesquisa = () => {
    if (!formNome.trim()) {
      toast({ title: "Título obrigatório", description: "Informe o título da pesquisa.", variant: "destructive" });
      setStep(1);
      return;
    }

    if (editingPesquisaId) {
      setPesquisas(prev => prev.map(p => p.id === editingPesquisaId ? { ...p, nome: formNome, descricao: formDescricao, perguntas: [...perguntas] } : p));
      // Update selectedPesquisa if viewing
      if (selectedPesquisa?.id === editingPesquisaId) {
        setSelectedPesquisa({ ...selectedPesquisa, nome: formNome, descricao: formDescricao, perguntas: [...perguntas] });
      }
      toast({ title: "Pesquisa atualizada!", description: "As alterações foram salvas." });
    } else {
      const nova: PesquisaDeslig = {
        id: Date.now(),
        nome: formNome,
        descricao: formDescricao,
        perguntas: [...perguntas],
      };
      setPesquisas(prev => [...prev, nova]);
      toast({ title: "Pesquisa criada!", description: "A pesquisa de desligamento foi criada com sucesso." });
    }
    setView("list");
    setStep(1);
    setFormNome("");
    setFormDescricao("");
    setPerguntas([]);
    setEditingPesquisaId(null);
  };

  const handleBack = () => {
    setView("list");
    setStep(1);
    setFormNome("");
    setFormDescricao("");
    setPerguntas([]);
    setEditingPesquisaId(null);
  };

  const handleConfigurar = (p: PesquisaDeslig) => {
    setEditingPesquisaId(p.id);
    setFormNome(p.nome);
    setFormDescricao(p.descricao);
    setPerguntas([...p.perguntas]);
    setView("create");
    setStep(1);
    setOpenMenuId(null);
  };

  const handleVerResultado = (p: PesquisaDeslig) => {
    setSelectedPesquisa(p);
    setResultadoTab("dashboard");
    setView("resultado");
  };

  const handleGerarLink = (p: PesquisaDeslig) => {
    const link = `${window.location.origin}/pesquisa-desligamento/${p.id}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copiado!", description: "O link de participação foi copiado para a área de transferência." });
    setOpenMenuId(null);
  };

  const handleConfirmDeletePesquisa = () => {
    if (pesquisaToDelete) {
      setPesquisas(prev => prev.filter(p => p.id !== pesquisaToDelete.id));
      toast({ title: "Pesquisa excluída", description: "A pesquisa foi removida com sucesso." });
    }
    setShowDeletePesquisa(false);
    setPesquisaToDelete(null);
  };

  // ========== RESULTADO VIEW ==========
  if (view === "resultado" && selectedPesquisa) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-background rounded-2xl border p-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => setView("list")} className="p-2 rounded-full border hover:bg-muted transition">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">{selectedPesquisa.nome}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setResultadoTab("dashboard")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                resultadoTab === "dashboard"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setResultadoTab("configuracoes")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                resultadoTab === "configuracoes"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Configurações
            </button>
          </div>
        </div>

        {resultadoTab === "dashboard" && (
          <>
            {/* Participação */}
            <div className="bg-background rounded-2xl border p-6">
              <h2 className="text-lg font-bold mb-1">Participação</h2>
              <p className="text-sm text-muted-foreground mb-4">Dados gerais de participação na pesquisa</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">0%</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Participação <Info className="h-3 w-3" />
                    </p>
                  </div>
                  <UsersRound className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Responderam <Info className="h-3 w-3" />
                    </p>
                  </div>
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Participantes <Info className="h-3 w-3" />
                    </p>
                  </div>
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Respostas */}
            <div className="bg-background rounded-2xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Respostas</h2>
                <Button variant="outline" className="rounded-full gap-2" disabled>
                  <FileDown className="h-4 w-4" />
                  Exportar relatório
                </Button>
              </div>

              {selectedPesquisa.perguntas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <img
                    src="https://illustrations.popsy.co/gray/question-mark.svg"
                    alt="Sem perguntas"
                    className="w-32 h-32 mb-4 opacity-60"
                  />
                  <p className="font-semibold text-foreground">Nenhuma pergunta encontrada</p>
                  <p className="text-sm text-muted-foreground">Adicione perguntas à pesquisa para visualizar as respostas aqui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPesquisa.perguntas.map((p, idx) => (
                    <div key={p.id} className="border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">Pergunta {idx + 1} • {p.tipoResposta}</p>
                      <p className="font-medium">{p.titulo}</p>
                      <p className="text-sm text-muted-foreground mt-2">Nenhuma resposta ainda.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {resultadoTab === "configuracoes" && (
          <div className="bg-background rounded-2xl border p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Informações básicas</h2>
                <p className="text-sm text-muted-foreground">* Indica campos obrigatórios</p>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Título da pesquisa *</Label>
                <Input value={selectedPesquisa.nome} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Descrição da pesquisa</Label>
                <Textarea value={selectedPesquisa.descricao || "—"} readOnly className="bg-muted min-h-[80px]" />
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Perguntas ({selectedPesquisa.perguntas.length})</h2>
                {selectedPesquisa.perguntas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma pergunta cadastrada.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPesquisa.perguntas.map((p, idx) => (
                      <div key={p.id} className="border rounded-xl p-4">
                        <p className="text-xs text-muted-foreground mb-1">Pergunta {idx + 1} • {p.tipoResposta}</p>
                        <p className="font-medium">{p.titulo}</p>
                        {p.descricao && <p className="text-sm text-muted-foreground mt-1">{p.descricao}</p>}
                        {p.opcoes && p.opcoes.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {p.opcoes.map((op, i) => (
                              <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{op}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== LIST VIEW ==========
  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="bg-background rounded-2xl border p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground">Pesquisa de desligamento</h1>
            <Button
              onClick={() => { setEditingPesquisaId(null); setView("create"); setStep(1); }}
              className="rounded-full px-6"
            >
              Criar Pesquisa
            </Button>
          </div>

          {pesquisas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <img
                src="https://illustrations.popsy.co/gray/surreal-hourglass.svg"
                alt="Sem pesquisas"
                className="w-64 h-64 mb-6 opacity-80"
              />
              <p className="font-semibold text-foreground text-lg">Sem pesquisas de desligamento</p>
              <p className="text-muted-foreground text-sm">Nenhuma pesquisa foi criada. Assim que houver pesquisas, elas aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pesquisas.map(p => (
                <div key={p.id} className="border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{p.nome}</p>
                    <p className="text-sm text-muted-foreground">{p.descricao || "Descrição"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UsersRound className="h-4 w-4" />
                      <span>Participação <Info className="h-3 w-3 inline" /></span>
                    </div>
                    <span className="text-sm text-muted-foreground">0%</span>
                    <Button variant="outline" size="sm" className="rounded-lg" onClick={() => handleVerResultado(p)}>
                      Ver resultado
                    </Button>
                    <div className="relative" ref={openMenuId === p.id ? menuRef : undefined}>
                      <button
                        className="p-2 rounded-full hover:bg-muted transition"
                        onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                      >
                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                      </button>
                      {openMenuId === p.id && (
                        <div className="absolute right-0 top-10 bg-background border rounded-xl shadow-lg z-50 py-2 min-w-[200px]">
                          <button
                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition"
                            onClick={() => handleConfigurar(p)}
                          >
                            Configurar
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition"
                            onClick={() => handleGerarLink(p)}
                          >
                            Gerar link de participação
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition"
                            onClick={() => {
                              setPesquisaToDelete(p);
                              setShowDeletePesquisa(true);
                              setOpenMenuId(null);
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Pesquisa Dialog */}
        <Dialog open={showDeletePesquisa} onOpenChange={setShowDeletePesquisa}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-destructive">⚠</span> Excluir Pesquisa?
              </DialogTitle>
            </DialogHeader>
            <div>
              <p className="font-semibold text-foreground">Isso resultará na remoção definitiva da Pesquisa.</p>
              <p className="text-sm text-muted-foreground mt-1">Essa ação é irreversível.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeletePesquisa(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleConfirmDeletePesquisa}>Excluir Pesquisa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ========== CREATE / CONFIGURAR VIEW ==========
  const steps = [
    { num: 1, label: "Informações básicas" },
    { num: 2, label: "Perguntas" },
    { num: 3, label: "Link de participação" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-2xl border p-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleBack} className="p-2 rounded-full border hover:bg-muted transition">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {editingPesquisaId ? "Configurar Pesquisa" : "Criar Pesquisa de Desligamento"}
          </h1>
        </div>

        <div className="flex items-center mb-8 border-b">
          {steps.map(s => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex-1 flex items-center justify-center gap-2 pb-3 text-sm font-medium border-b-2 transition ${
                step === s.num
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {s.num}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Informações básicas</h2>
              <p className="text-sm text-muted-foreground">* Indica campos obrigatórios</p>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Título da pesquisa *</Label>
              <Input placeholder="Nome da pesquisa" value={formNome} onChange={e => setFormNome(e.target.value)} maxLength={255} />
              <p className="text-xs text-muted-foreground text-right">{formNome.length}/255</p>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Descrição da pesquisa <span className="text-primary font-normal">(opcional)</span></Label>
              <Textarea placeholder="Descreva qual o objetivo da pesquisa" value={formDescricao} onChange={e => setFormDescricao(e.target.value)} maxLength={1000} className="min-h-[120px]" />
              <p className="text-xs text-muted-foreground text-right">{formDescricao.length}/1000</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} className="rounded-full px-8">Próximo</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Perguntas</h2>
              <Button variant="outline" onClick={handleOpenAddPergunta} className="rounded-full">Adicionar pergunta</Button>
            </div>
            {perguntas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <img src="https://illustrations.popsy.co/gray/question-mark.svg" alt="Sem perguntas" className="w-48 h-48 mb-6 opacity-80" />
                <p className="font-semibold text-foreground text-lg">Sem perguntas criadas</p>
                <p className="text-muted-foreground text-sm">As perguntas irão aparecer aqui.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {perguntas.map((p, idx) => (
                  <div key={p.id} className="border rounded-xl p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Pergunta {idx + 1} • {p.tipoResposta}</p>
                      <p className="font-medium">{p.titulo}</p>
                      {p.descricao && <p className="text-sm text-muted-foreground mt-1">{p.descricao}</p>}
                      {p.opcoes && p.opcoes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.opcoes.map((op, i) => (
                            <span key={i} className="text-xs bg-muted px-2 py-1 rounded">{op}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditPergunta(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setPerguntaToDelete(p); setShowDeletePergunta(true); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-full px-8">Anterior</Button>
              <Button onClick={() => setStep(3)} className="rounded-full px-8">Próximo</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Link de participação</h2>
              <p className="text-sm text-muted-foreground">O compartilhamento da pesquisa pode ser realizado nesta aba ou diretamente pela listagem de pesquisas, após a criação.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Como compartilhar</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Nesta aba: Clique em "Gerar link de participação", selecione o participante e copie o link.</li>
                <li>Pela listagem de pesquisas: Clique no menu de três pontinhos (•••) e depois em "Gerar link de participação".</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Detalhes do compartilhamento</h3>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>É possível adicionar colaboradores ativos ou desligados.</li>
                <li>Um link único de participação será gerado para cada pessoa adicionada.</li>
                <li>O colaborador verá apenas o fluxo da pesquisa — sem acesso a outras partes da plataforma.</li>
                <li>Cada link permite somente uma resposta, garantindo segurança e integridade.</li>
                <li>Você pode compartilhar os links por email ou WhatsApp.</li>
                <li>O sistema não envia notificações automaticamente. Envie manualmente para cada participante.</li>
              </ul>
            </div>
            <Button variant="outline" disabled className="rounded-full opacity-50">Gerar link de participação</Button>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="rounded-full px-8">Anterior</Button>
              <Button onClick={handleCriarPesquisa} className="rounded-full px-8">
                {editingPesquisaId ? "Salvar alterações" : "Criar Pesquisa"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Pergunta Dialog */}
      <Dialog open={showPerguntaDialog} onOpenChange={(open) => { if (!open) resetPerguntaForm(); setShowPerguntaDialog(open); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPergunta ? "Editar Pergunta" : "Adicionar Pergunta"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-primary">* Indica campos obrigatórios</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold">Tipo de resposta *</Label>
              <Select value={perguntaTipo} onValueChange={v => { setPerguntaTipo(v); setPerguntaOpcoes(["", ""]); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPO_RESPOSTA_OPTIONS.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Título *</Label>
              <Input placeholder="Título da pergunta" value={perguntaTitulo} onChange={e => setPerguntaTitulo(e.target.value)} maxLength={255} />
              <p className="text-xs text-muted-foreground text-right">{perguntaTitulo.length}/255</p>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Descrição <span className="text-primary font-normal">(opcional)</span></Label>
              <Textarea placeholder="Descrição da pergunta" value={perguntaDescricao} onChange={e => setPerguntaDescricao(e.target.value)} className="min-h-[80px]" />
            </div>
            {needsOpcoes(perguntaTipo) && (
              <div className="space-y-3">
                <Label className="font-semibold">Opções de Resposta *</Label>
                {perguntaOpcoes.map((op, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-6">{idx + 1}º</span>
                    <Input placeholder="Digite a opção" value={op} onChange={e => { const newOps = [...perguntaOpcoes]; newOps[idx] = e.target.value; setPerguntaOpcoes(newOps); }} maxLength={255} />
                    {perguntaOpcoes.length > 2 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setPerguntaOpcoes(prev => prev.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{op.length}/255</p>
                  </div>
                ))}
                <button className="text-sm text-primary hover:underline font-medium" onClick={() => setPerguntaOpcoes(prev => [...prev, ""])}>(Adicionar Opção)</button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetPerguntaForm(); setShowPerguntaDialog(false); }}>Cancelar</Button>
            <Button onClick={handleSavePergunta}>{editingPergunta ? "Salvar alterações" : "Adicionar pergunta"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Pergunta Dialog */}
      <Dialog open={showDeletePergunta} onOpenChange={setShowDeletePergunta}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover pergunta</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja remover esta pergunta? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePergunta(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDeletePergunta}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PesquisaDesligamento;
