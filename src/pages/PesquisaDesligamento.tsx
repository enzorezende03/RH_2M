import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";
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
  const [view, setView] = useState<"list" | "create">("list");
  const [step, setStep] = useState(1);
  const [pesquisas, setPesquisas] = useState<PesquisaDeslig[]>([]);

  // Form state
  const [formNome, setFormNome] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);

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

    const nova: PesquisaDeslig = {
      id: Date.now(),
      nome: formNome,
      descricao: formDescricao,
      perguntas: [...perguntas],
    };
    setPesquisas(prev => [...prev, nova]);
    toast({ title: "Pesquisa criada!", description: "A pesquisa de desligamento foi criada com sucesso." });
    setView("list");
    setStep(1);
    setFormNome("");
    setFormDescricao("");
    setPerguntas([]);
  };

  const handleBack = () => {
    setView("list");
    setStep(1);
    setFormNome("");
    setFormDescricao("");
    setPerguntas([]);
  };

  // ========== LIST VIEW ==========
  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="bg-background rounded-2xl border p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground">Pesquisa de desligamento</h1>
            <Button
              onClick={() => { setView("create"); setStep(1); }}
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
                    <p className="text-sm text-muted-foreground">{p.perguntas.length} pergunta(s)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setFormNome(p.nome);
                      setFormDescricao(p.descricao);
                      setPerguntas([...p.perguntas]);
                      setView("create");
                      setStep(1);
                    }}>
                      Configurar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== CREATE VIEW ==========
  const steps = [
    { num: 1, label: "Informações básicas" },
    { num: 2, label: "Perguntas" },
    { num: 3, label: "Link de participação" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-2xl border p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleBack} className="p-2 rounded-full border hover:bg-muted transition">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Criar Pesquisa de Desligamento</h1>
        </div>

        {/* Steps */}
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

        {/* Step 1 - Informações básicas */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Informações básicas</h2>
              <p className="text-sm text-muted-foreground">* Indica campos obrigatórios</p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">Título da pesquisa *</Label>
              <Input
                placeholder="Nome da pesquisa"
                value={formNome}
                onChange={e => setFormNome(e.target.value)}
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground text-right">{formNome.length}/255</p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">
                Descrição da pesquisa <span className="text-primary font-normal">(opcional)</span>
              </Label>
              <Textarea
                placeholder="Descreva qual o objetivo da pesquisa"
                value={formDescricao}
                onChange={e => setFormDescricao(e.target.value)}
                maxLength={1000}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground text-right">{formDescricao.length}/1000</p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} className="rounded-full px-8">
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 - Perguntas */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Perguntas</h2>
              <Button variant="outline" onClick={handleOpenAddPergunta} className="rounded-full">
                Adicionar pergunta
              </Button>
            </div>

            {perguntas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <img
                  src="https://illustrations.popsy.co/gray/question-mark.svg"
                  alt="Sem perguntas"
                  className="w-48 h-48 mb-6 opacity-80"
                />
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                        setPerguntaToDelete(p);
                        setShowDeletePergunta(true);
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-full px-8">
                Anterior
              </Button>
              <Button onClick={() => setStep(3)} className="rounded-full px-8">
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 - Link de participação */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Link de participação</h2>
              <p className="text-sm text-muted-foreground">
                O compartilhamento da pesquisa pode ser realizado nesta aba ou diretamente pela listagem de pesquisas, após a criação.
              </p>
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

            <Button variant="outline" disabled className="rounded-full opacity-50">
              Gerar link de participação
            </Button>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="rounded-full px-8">
                Anterior
              </Button>
              <Button onClick={handleCriarPesquisa} className="rounded-full px-8">
                Criar Pesquisa
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
              <Input
                placeholder="Título da pergunta"
                value={perguntaTitulo}
                onChange={e => setPerguntaTitulo(e.target.value)}
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground text-right">{perguntaTitulo.length}/255</p>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold">
                Descrição <span className="text-primary font-normal">(opcional)</span>
              </Label>
              <Textarea
                placeholder="Descrição da pergunta"
                value={perguntaDescricao}
                onChange={e => setPerguntaDescricao(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {needsOpcoes(perguntaTipo) && (
              <div className="space-y-3">
                <Label className="font-semibold">Opções de Resposta *</Label>
                {perguntaOpcoes.map((op, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-6">{idx + 1}º</span>
                    <Input
                      placeholder="Digite a opção"
                      value={op}
                      onChange={e => {
                        const newOps = [...perguntaOpcoes];
                        newOps[idx] = e.target.value;
                        setPerguntaOpcoes(newOps);
                      }}
                      maxLength={255}
                    />
                    {perguntaOpcoes.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => setPerguntaOpcoes(prev => prev.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{op.length}/255</p>
                  </div>
                ))}
                <button
                  className="text-sm text-primary hover:underline font-medium"
                  onClick={() => setPerguntaOpcoes(prev => [...prev, ""])}
                >
                  (Adicionar Opção)
                </button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetPerguntaForm(); setShowPerguntaDialog(false); }}>
              Cancelar
            </Button>
            <Button onClick={handleSavePergunta}>
              {editingPergunta ? "Salvar alterações" : "Adicionar pergunta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Pergunta Dialog */}
      <Dialog open={showDeletePergunta} onOpenChange={setShowDeletePergunta}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover pergunta</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover esta pergunta? Esta ação não pode ser desfeita.
          </p>
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
