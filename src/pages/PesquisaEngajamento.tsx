import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Users, MoreVertical, ArrowLeft, Info, Plus, Pencil, Trash2, GripVertical, Search, Download, Copy, Link, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UNIDADE_OPTIONS, DEPARTAMENTO_OPTIONS } from "@/data/selectOptions";

const GRUPOS_USUARIOS = ["Todos", "Gestor", "Administrador", "Colaborador"];
const PERIODICIDADE_OPTIONS = ["1 mês", "2 meses", "3 meses", "6 meses", "1 ano"];
const DIAS_SEMANA = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
const QTD_PERGUNTAS_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const SUBDIMENSAO_OPTIONS = [
  "Trabalho Remoto", "Relacionamento com líder", "Saúde Mental", "Segurança", "Saúde",
  "Estresse", "Equilíbrio trabalho-vida", "Fidelidade", "Orgulho", "Representação",
  "Ética", "Valores", "Estratégia", "Visão e Missão", "Sugestões",
  "Qualidade do Reconhecimento", "Frequência de reconhecimento", "Qualidade do feedback",
  "Frequência de Feedback", "Suporte da Liderança", "Confiança pelos Líderes",
  "Confiança nos Líderes", "Amizade", "Confiança", "Colaboração", "Comunicação",
  "Propósito", "Mentoria", "Oportunidades de carreira", "Conhecimento",
  "Aprendizagem e Desenvolvimento", "Gestão de Performance", "Autonomia",
  "Equipamentos e ferramentas", "Rotina de Processos", "Função e Tarefas",
  "Ambiente de trabalho", "Segurança do Trabalho", "Benefícios", "Compensação"
];

const TIPO_RESPOSTA_OPTIONS = [
  "Escala (5 estrelas)", "NPS", "Múltipla Escolha",
  "Caixa de Seleção (Múltiplas respostas)", "Distribuição de Pontos (100 pontos)", "Texto Livre"
];

const BENCHMARK_DATA = [
  { nome: "Satisfação", media: 4.0, favorabilidade: "72%" },
  { nome: "Empoderamento", media: 4.2, favorabilidade: "79%" },
  { nome: "Crescimento pessoal", media: 4.2, favorabilidade: "80%" },
  { nome: "Conexão com colegas", media: 4.4, favorabilidade: "86%" },
  { nome: "Conexão com líder", media: 4.4, favorabilidade: "85%" },
  { nome: "Reconhecimento & Feedback", media: 4.0, favorabilidade: "73%" },
  { nome: "Cultura", media: 4.3, favorabilidade: "85%" },
  { nome: "Embaixador", media: 4.4, favorabilidade: "86%" },
  { nome: "Bem-estar", media: 4.1, favorabilidade: "75%" },
];

interface Pergunta {
  id: number;
  subdimensao: string;
  tipoResposta: string;
  pergunta: string;
  descricao: string;
  ativa: boolean;
  npsComentarioObrigatorio?: boolean;
  npsNotaMinima?: number;
  opcoes?: string[];
}

interface Dimensao {
  id: number;
  nome: string;
  descricao: string;
  perguntas: Pergunta[];
}

interface PesquisaCustomizada {
  id: number;
  nome: string;
  descricao: string;
  status: "Ativa" | "Inativa";
  participantes: {
    tempoAdmissao: boolean;
    tipoAdmissao: "periodicidade" | "dataCorte";
    periodicidade: string;
    dataCorte: string;
    unidades: string[];
    departamentos: string[];
    grupos: string[];
  };
  dimensoes: Dimensao[];
  disparo: {
    tipo: "pulsado" | "pulsoUnico";
    qtdPerguntas: string;
    diasSemana: string[];
    qtdRespondentes: number;
    permitirRemoverAnonimato: boolean;
  };
}

const PesquisaEngajamento = () => {
  const [view, setView] = useState<"list" | "create" | "resultado">("list");
  const [step, setStep] = useState(1);
  const [pesquisas, setPesquisas] = useState<PesquisaCustomizada[]>([]);
  const [searchPesquisa, setSearchPesquisa] = useState("");
  const [selectedPesquisa, setSelectedPesquisa] = useState<PesquisaCustomizada | null>(null);
  const [resultadoTab, setResultadoTab] = useState("dashboard");
  const [editingPesquisa, setEditingPesquisa] = useState<PesquisaCustomizada | null>(null);

  const [showDimensaoDialog, setShowDimensaoDialog] = useState(false);
  const [dimensaoNome, setDimensaoNome] = useState("");
  const [dimensaoDescricao, setDimensaoDescricao] = useState("");

  const [showEditDimensaoDialog, setShowEditDimensaoDialog] = useState(false);
  const [editDimensaoId, setEditDimensaoId] = useState<number | null>(null);
  const [editDimensaoNome, setEditDimensaoNome] = useState("");
  const [editDimensaoDescricao, setEditDimensaoDescricao] = useState("");

  const [showDeleteDimensaoDialog, setShowDeleteDimensaoDialog] = useState(false);
  const [deleteDimensaoId, setDeleteDimensaoId] = useState<number | null>(null);

  const [showPerguntaDialog, setShowPerguntaDialog] = useState(false);
  const [perguntaDimensaoId, setPerguntaDimensaoId] = useState<number | null>(null);
  const [perguntaSubdimensao, setPerguntaSubdimensao] = useState("");
  const [perguntaTipoResposta, setPerguntaTipoResposta] = useState("");
  const [perguntaTexto, setPerguntaTexto] = useState("");
  const [perguntaDescricao, setPerguntaDescricao] = useState("");
  const [perguntaNpsComentario, setPerguntaNpsComentario] = useState(false);
  const [perguntaNpsNota, setPerguntaNpsNota] = useState<number>(5);
  const [perguntaOpcoes, setPerguntaOpcoes] = useState<string[]>(["", ""]);

  const [showEditPerguntaDialog, setShowEditPerguntaDialog] = useState(false);
  const [editPerguntaId, setEditPerguntaId] = useState<number | null>(null);
  const [editPerguntaDimId, setEditPerguntaDimId] = useState<number | null>(null);
  const [editPerguntaSubdimensao, setEditPerguntaSubdimensao] = useState("");
  const [editPerguntaTexto, setEditPerguntaTexto] = useState("");
  const [editPerguntaDescricao, setEditPerguntaDescricao] = useState("");

  const [showDeletePerguntaDialog, setShowDeletePerguntaDialog] = useState(false);
  const [deletePerguntaId, setDeletePerguntaId] = useState<number | null>(null);
  const [deletePerguntaDimId, setDeletePerguntaDimId] = useState<number | null>(null);

  const [showDuplicarDialog, setShowDuplicarDialog] = useState(false);
  const [duplicarPesquisa, setDuplicarPesquisa] = useState<PesquisaCustomizada | null>(null);
  const [showExcluirDialog, setShowExcluirDialog] = useState(false);
  const [excluirPesquisa, setExcluirPesquisa] = useState<PesquisaCustomizada | null>(null);

  const [formData, setFormData] = useState<PesquisaCustomizada>({
    id: 0,
    nome: "",
    descricao: "",
    status: "Inativa",
    participantes: {
      tempoAdmissao: true,
      tipoAdmissao: "periodicidade",
      periodicidade: "",
      dataCorte: "",
      unidades: [],
      departamentos: ["Toda Empresa"],
      grupos: [],
    },
    dimensoes: [],
    disparo: {
      tipo: "pulsado",
      qtdPerguntas: "3",
      diasSemana: ["Segunda-feira"],
      qtdRespondentes: 3,
      permitirRemoverAnonimato: true,
    },
  });

  const handleCreatePesquisa = () => {
    setFormData({
      id: Date.now(),
      nome: "",
      descricao: "",
      status: "Inativa",
      participantes: {
        tempoAdmissao: true,
        tipoAdmissao: "periodicidade",
        periodicidade: "",
        dataCorte: "",
        unidades: [],
        departamentos: ["Toda Empresa"],
        grupos: [],
      },
      dimensoes: [],
      disparo: {
        tipo: "pulsado",
        qtdPerguntas: "3",
        diasSemana: ["Segunda-feira"],
        qtdRespondentes: 3,
        permitirRemoverAnonimato: true,
      },
    });
    setEditingPesquisa(null);
    setStep(1);
    setView("create");
  };

  const handleSavePesquisa = () => {
    if (editingPesquisa) {
      setPesquisas(pesquisas.map(p => p.id === formData.id ? formData : p));
    } else {
      setPesquisas([...pesquisas, formData]);
    }
    setView("list");
    setEditingPesquisa(null);
  };

  const handleVerResultado = (p: PesquisaCustomizada) => {
    setSelectedPesquisa(p);
    setResultadoTab("dashboard");
    setView("resultado");
  };

  const handleEditPesquisaFromConfig = (p: PesquisaCustomizada) => {
    setFormData({ ...p });
    setEditingPesquisa(p);
    setStep(1);
    setView("create");
  };

  const handleCopiarLink = (p: PesquisaCustomizada) => {
    const link = `${window.location.origin}/pesquisas/engajamento/${p.id}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copiado!", description: "O link da pesquisa foi copiado para a área de transferência." });
  };

  const handleDuplicarPesquisa = () => {
    if (!duplicarPesquisa) return;
    const novaPesquisa: PesquisaCustomizada = {
      ...duplicarPesquisa,
      id: Date.now(),
      nome: `${duplicarPesquisa.nome} (cópia)`,
      status: "Inativa",
    };
    setPesquisas([...pesquisas, novaPesquisa]);
    setShowDuplicarDialog(false);
    setDuplicarPesquisa(null);
    toast({ title: "Pesquisa duplicada!", description: "A pesquisa foi duplicada com sucesso." });
  };

  const handleExcluirPesquisa = () => {
    if (!excluirPesquisa) return;
    setPesquisas(pesquisas.filter(p => p.id !== excluirPesquisa.id));
    setShowExcluirDialog(false);
    setExcluirPesquisa(null);
    toast({ title: "Pesquisa excluída", description: "A pesquisa foi excluída com sucesso." });
  };

  const handleAddDimensao = () => {
    if (!dimensaoNome.trim()) return;
    const newDim: Dimensao = {
      id: Date.now(),
      nome: dimensaoNome,
      descricao: dimensaoDescricao,
      perguntas: [],
    };
    setFormData({
      ...formData,
      dimensoes: [...formData.dimensoes, newDim],
    });
    setDimensaoNome("");
    setDimensaoDescricao("");
    setShowDimensaoDialog(false);
  };

  const handleOpenEditDimensao = (dim: Dimensao) => {
    setEditDimensaoId(dim.id);
    setEditDimensaoNome(dim.nome);
    setEditDimensaoDescricao(dim.descricao);
    setShowEditDimensaoDialog(true);
  };

  const handleSaveEditDimensao = () => {
    setFormData({
      ...formData,
      dimensoes: formData.dimensoes.map((d) =>
        d.id === editDimensaoId ? { ...d, nome: editDimensaoNome, descricao: editDimensaoDescricao } : d
      ),
    });
    setShowEditDimensaoDialog(false);
  };

  const handleDeleteDimensaoConfirm = () => {
    setFormData({
      ...formData,
      dimensoes: formData.dimensoes.filter((d) => d.id !== deleteDimensaoId),
    });
    setShowDeleteDimensaoDialog(false);
    setShowEditDimensaoDialog(false);
  };

  const handleOpenAddPergunta = (dimId: number) => {
    setPerguntaDimensaoId(dimId);
    setPerguntaSubdimensao("");
    setPerguntaTipoResposta("");
    setPerguntaTexto("");
    setPerguntaDescricao("");
    setPerguntaNpsComentario(false);
    setPerguntaNpsNota(5);
    setPerguntaOpcoes(["", ""]);
    setShowPerguntaDialog(true);
  };

  const handleSavePergunta = () => {
    if (!perguntaTexto.trim() || !perguntaSubdimensao || !perguntaTipoResposta) return;
    const needsOpcoes = ["Múltipla Escolha", "Caixa de Seleção (Múltiplas respostas)", "Distribuição de Pontos (100 pontos)"].includes(perguntaTipoResposta);
    const newPergunta: Pergunta = {
      id: Date.now(),
      subdimensao: perguntaSubdimensao,
      tipoResposta: perguntaTipoResposta,
      pergunta: perguntaTexto,
      descricao: perguntaDescricao,
      ativa: true,
      ...(perguntaTipoResposta === "NPS" && { npsComentarioObrigatorio: perguntaNpsComentario, npsNotaMinima: perguntaNpsNota }),
      ...(needsOpcoes && { opcoes: perguntaOpcoes.filter(o => o.trim()) }),
    };
    setFormData({
      ...formData,
      dimensoes: formData.dimensoes.map((d) =>
        d.id === perguntaDimensaoId ? { ...d, perguntas: [...d.perguntas, newPergunta] } : d
      ),
    });
    setShowPerguntaDialog(false);
  };

  const handleOpenEditPergunta = (dimId: number, p: Pergunta) => {
    setEditPerguntaDimId(dimId);
    setEditPerguntaId(p.id);
    setEditPerguntaSubdimensao(p.subdimensao);
    setEditPerguntaTexto(p.pergunta);
    setEditPerguntaDescricao(p.descricao);
    setShowEditPerguntaDialog(true);
  };

  const handleSaveEditPergunta = () => {
    setFormData({
      ...formData,
      dimensoes: formData.dimensoes.map((d) =>
        d.id === editPerguntaDimId
          ? {
              ...d,
              perguntas: d.perguntas.map((p) =>
                p.id === editPerguntaId
                  ? { ...p, subdimensao: editPerguntaSubdimensao, pergunta: editPerguntaTexto, descricao: editPerguntaDescricao }
                  : p
              ),
            }
          : d
      ),
    });
    setShowEditPerguntaDialog(false);
  };

  const handleTogglePergunta = (dimId: number, perguntaId: number) => {
    setFormData({
      ...formData,
      dimensoes: formData.dimensoes.map((d) =>
        d.id === dimId
          ? { ...d, perguntas: d.perguntas.map((p) => p.id === perguntaId ? { ...p, ativa: !p.ativa } : p) }
          : d
      ),
    });
  };

  const handleDeletePerguntaConfirm = () => {
    setFormData({
      ...formData,
      dimensoes: formData.dimensoes.map((d) =>
        d.id === deletePerguntaDimId
          ? { ...d, perguntas: d.perguntas.filter((p) => p.id !== deletePerguntaId) }
          : d
      ),
    });
    setShowDeletePerguntaDialog(false);
    setShowEditPerguntaDialog(false);
  };

  const toggleArrayItem = (arr: string[], item: string) => {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  };

  const getFavorabilidadeColor = (val: string) => {
    const num = parseInt(val);
    if (num >= 80) return "bg-green-100 text-green-700";
    if (num >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  // =================== RESULTADO VIEW ===================
  if (view === "resultado" && selectedPesquisa) {
    const tabs = ["Dashboard", "Comentários", "Análise de comentários", "Mapa de calor", "Benchmark", "Configurações"];

    return (
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B2B5E] to-[#1B4F8A] text-white p-6 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setView("list")} className="p-1 hover:bg-white/10 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold">{selectedPesquisa.nome}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 bg-transparent">
                Enviar lembrete
              </Button>
              <Button className="bg-white text-[#0B2B5E] hover:bg-white/90">
                Criar Plano de Ação
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="flex gap-6 border-b">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setResultadoTab(tab.toLowerCase().replace(/ /g, "_").normalize("NFD").replace(/[\u0300-\u036f]/g, ""))}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  resultadoTab === tab.toLowerCase().replace(/ /g, "_").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* DASHBOARD TAB */}
          {resultadoTab === "dashboard" && (
            <div className="space-y-6">
              <div className="bg-background rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Dashboard</h2>
                    <p className="text-sm text-muted-foreground">Dashboard contém informações de comparativos e sobre a saúde da empresa</p>
                  </div>
                  <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium">Data Início</label>
                    <Input type="date" defaultValue="2026-01-15" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Data Final</label>
                    <Input type="date" defaultValue="2026-04-15" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium">Papel</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>{GRUPOS_USUARIOS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Unidades</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                      <SelectContent>{UNIDADE_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Departamentos</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o departamento" /></SelectTrigger>
                      <SelectContent>{DEPARTAMENTO_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Grupos</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o grupo" /></SelectTrigger>
                      <SelectContent>{GRUPOS_USUARIOS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1">Liderados de: <Info className="h-3 w-3" /></label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox /> Liderados diretos
                    </label>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox /> Liderados indiretos
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Limpar filtros</Button>
                  <Button className="bg-[#0B2B5E] hover:bg-[#0a2550]">Aplicar</Button>
                </div>
              </div>

              {/* Participação */}
              <div className="bg-background rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Participação</h2>
                    <p className="text-sm text-muted-foreground">Dados de participação dos pulsos do período filtrado.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-sm font-medium text-center mb-4">Histórico de participação por pulso</h3>
                    <div className="h-48 flex items-center justify-center border rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground">Sem dados de participação</p>
                    </div>
                    <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block rounded" /> Participação por pulso</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 inline-block rounded-sm" /> Respondidos</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-muted inline-block rounded-sm" /> Enviados</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-center mb-4 flex items-center justify-center gap-1">
                      Média de participação dos pulsos <Info className="h-3 w-3" />
                    </h3>
                    <div className="flex items-center justify-center">
                      <div className="relative w-40 h-40">
                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="251.2" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold">0%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-1">Participação geral detalhada</h3>
                  <p className="text-xs text-muted-foreground mb-4">Dados de participação geral dos pulsos do período filtrado.</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">0%</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">Participação <Info className="h-3 w-3" /></p>
                      </div>
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">Responderam ao menos uma vez <Info className="h-3 w-3" /></p>
                      </div>
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">Receberam ao menos uma vez <Info className="h-3 w-3" /></p>
                      </div>
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMENTÁRIOS TAB */}
          {resultadoTab === "comentarios" && (
            <div className="space-y-6">
              <div className="bg-background rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Comentários</h2>
                    <p className="text-sm text-muted-foreground">Listagem de comentários realizados pelas pessoas que responderam a Pesquisa de Engajamento</p>
                  </div>
                  <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium">Data Início</label>
                    <Input type="date" defaultValue="2026-01-15" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Data Final</label>
                    <Input type="date" defaultValue="2026-04-15" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1">Tipo de resposta <Info className="h-3 w-3" /></label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1">Nota <Info className="h-3 w-3" /></label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium">Dimensão</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Palavra chave</label>
                    <Input className="mt-1" placeholder="" />
                  </div>
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1">Interações <Info className="h-3 w-3" /></label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1">Resolução <Info className="h-3 w-3" /></label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium">Unidades</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{UNIDADE_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Departamentos</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{DEPARTAMENTO_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Grupos</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{GRUPOS_USUARIOS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Limpar filtros</Button>
                  <Button className="bg-[#0B2B5E] hover:bg-[#0a2550]">Filtrar</Button>
                </div>
              </div>

              <div className="bg-background rounded-xl shadow-sm border p-12 flex flex-col items-center justify-center text-center">
                <svg viewBox="0 0 300 250" className="w-64 h-56 mb-4 text-muted-foreground/30">
                  <rect x="60" y="80" width="180" height="120" rx="10" fill="currentColor" opacity="0.15" />
                  <circle cx="150" cy="60" r="25" fill="currentColor" opacity="0.2" />
                  <rect x="100" y="120" width="100" height="8" rx="4" fill="currentColor" opacity="0.2" />
                  <rect x="120" y="140" width="60" height="8" rx="4" fill="currentColor" opacity="0.15" />
                </svg>
                <p className="text-lg font-semibold text-green-600">Não encontramos resultados</p>
                <p className="text-sm text-muted-foreground">Talvez trocando de filtro, encontramos algo para você.</p>
              </div>
            </div>
          )}

          {/* ANÁLISE DE COMENTÁRIOS TAB */}
          {resultadoTab === "analise_de_comentarios" && (
            <div className="space-y-6">
              <div className="bg-background rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold">Análise de comentários</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">0 comentários analisados de toda a empresa. <Info className="h-3 w-3" /></p>

                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg viewBox="0 0 200 200" className="w-40 h-40 mb-4 text-muted-foreground/30">
                    <rect x="50" y="60" width="100" height="80" rx="8" fill="currentColor" opacity="0.2" />
                    <circle cx="100" cy="50" r="20" fill="currentColor" opacity="0.15" />
                    <line x1="80" y1="100" x2="120" y2="100" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                    <line x1="100" y1="80" x2="100" y2="120" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                  </svg>
                  <p className="font-semibold text-primary">Sem comentários analisados.</p>
                  <p className="text-sm text-muted-foreground">Os comentários analisados irão aparecer aqui.</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>Os resultados foram produzidos por IA e podem apresentar erros. Revise as informações e complemente com sua própria análise.</span>
                </div>
              </div>
            </div>
          )}

          {/* MAPA DE CALOR TAB */}
          {resultadoTab === "mapa_de_calor" && (
            <div className="space-y-6">
              <div className="bg-background rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Mapa de calor</h2>
                    <p className="text-sm text-muted-foreground">O mapa contém todas as informações cruzando as dimensões e as equipes em um único lugar</p>
                  </div>
                  <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium">Data Início</label>
                    <Input type="date" defaultValue="2026-01-15" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Data Final</label>
                    <Input type="date" defaultValue="2026-04-15" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium">Papel</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>{GRUPOS_USUARIOS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Unidades</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                      <SelectContent>{UNIDADE_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Departamentos</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o departamento" /></SelectTrigger>
                      <SelectContent>{DEPARTAMENTO_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Grupos</label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione o grupo" /></SelectTrigger>
                      <SelectContent>{GRUPOS_USUARIOS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium flex items-center gap-1">Liderados de: <Info className="h-3 w-3" /></label>
                    <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-4">
                    <label className="flex items-center gap-2 text-sm"><Checkbox /> Liderados diretos</label>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm"><Checkbox /> Liderados indiretos</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Limpar filtros</Button>
                  <Button className="bg-[#0B2B5E] hover:bg-[#0a2550]">Aplicar</Button>
                </div>
              </div>

              <div className="bg-background rounded-xl shadow-sm border p-12 flex flex-col items-center justify-center text-center">
                <svg viewBox="0 0 300 250" className="w-64 h-56 mb-4 text-muted-foreground/30">
                  <rect x="60" y="80" width="180" height="120" rx="10" fill="currentColor" opacity="0.15" />
                  <circle cx="150" cy="60" r="25" fill="currentColor" opacity="0.2" />
                  <rect x="100" y="120" width="100" height="8" rx="4" fill="currentColor" opacity="0.2" />
                  <rect x="120" y="140" width="60" height="8" rx="4" fill="currentColor" opacity="0.15" />
                </svg>
                <p className="text-lg font-semibold text-green-600">Não encontramos resultados</p>
                <p className="text-sm text-muted-foreground">Talvez trocando de filtro, encontramos algo para você.</p>
              </div>
            </div>
          )}

          {/* BENCHMARK TAB */}
          {resultadoTab === "benchmark" && (
            <div className="space-y-6">
              <div className="bg-background rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-bold">Benchmark</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Benchmark consiste no processo de busca das melhores práticas de gestão de entidade numa determinada indústria e que conduzem ao desempenho superior.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2 mb-6">
                  <Info className="h-4 w-4 flex-shrink-0" />
                  <span>Apenas respostas do tipo Escala são consideradas no Benchmark.</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium"></th>
                        <th colSpan={2} className="text-center py-3 px-4 font-bold text-primary">{selectedPesquisa.nome.toUpperCase()}</th>
                        <th colSpan={2} className="text-center py-3 px-4 font-bold">Mercado</th>
                      </tr>
                      <tr className="border-b bg-muted/30">
                        <th className="text-center py-2 px-4 font-medium">Indicadores</th>
                        <th className="text-center py-2 px-4 font-medium">Média</th>
                        <th className="text-center py-2 px-4 font-medium flex items-center justify-center gap-1">Favorabilidade <Info className="h-3 w-3" /></th>
                        <th className="text-center py-2 px-4 font-medium">Média</th>
                        <th className="text-center py-2 px-4 font-medium flex items-center justify-center gap-1">Favorabilidade <Info className="h-3 w-3" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {BENCHMARK_DATA.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-3 px-4 text-center font-medium">{item.nome}</td>
                          <td className="py-3 px-4 text-center">0.0</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-700">0%</span>
                          </td>
                          <td className="py-3 px-4 text-center">{item.media}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded ${getFavorabilidadeColor(item.favorabilidade)}`}>
                              {item.favorabilidade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center gap-6 mt-4 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 inline-block rounded-sm" /> Muito bom</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 inline-block rounded-sm" /> Bom</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 inline-block rounded-sm" /> Atenção</span>
                </div>
              </div>
            </div>
          )}

          {/* CONFIGURAÇÕES TAB */}
          {resultadoTab === "configuracoes" && (
            <div className="bg-background rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Configurações da Pesquisa</h2>
                <Button onClick={() => handleEditPesquisaFromConfig(selectedPesquisa)} className="bg-[#0B2B5E] hover:bg-[#0a2550]">
                  Editar Configurações
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome da pesquisa</p>
                    <p className="font-medium">{selectedPesquisa.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant="outline" className={selectedPesquisa.status === "Ativa" ? "text-green-600 border-green-300 bg-green-50" : "text-amber-600 border-amber-300 bg-amber-50"}>
                      {selectedPesquisa.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                  <p className="text-sm">{selectedPesquisa.descricao || "—"}</p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Participantes</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Unidades</p>
                      <p className="text-sm">{selectedPesquisa.participantes.unidades.length > 0 ? selectedPesquisa.participantes.unidades.join(", ") : "Todas"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Departamentos</p>
                      <p className="text-sm">{selectedPesquisa.participantes.departamentos.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Grupos</p>
                      <p className="text-sm">{selectedPesquisa.participantes.grupos.length > 0 ? selectedPesquisa.participantes.grupos.join(", ") : "Todos"}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Disparo</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                      <p className="text-sm">{selectedPesquisa.disparo.tipo === "pulsado" ? "Pulsado" : "Pulso único"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Qtd. perguntas por pulso</p>
                      <p className="text-sm">{selectedPesquisa.disparo.qtdPerguntas}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Dias da semana</p>
                      <p className="text-sm">{selectedPesquisa.disparo.diasSemana.join(", ")}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Dimensões ({selectedPesquisa.dimensoes.length})</h3>
                  {selectedPesquisa.dimensoes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma dimensão configurada.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedPesquisa.dimensoes.map(dim => (
                        <div key={dim.id} className="border rounded-lg p-3">
                          <p className="font-medium">{dim.nome}</p>
                          <p className="text-xs text-muted-foreground">{dim.perguntas.length} perguntas</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =================== CREATE VIEW ===================
  if (view === "create") {
    return (
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B2B5E] to-[#1B4F8A] text-white p-6 rounded-b-xl">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("list")} className="p-1 hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">
                  {editingPesquisa ? "Editar" : "Criar"} Pesquisa de Clima Customizada
                </h1>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Inativa</Badge>
              </div>
              <p className="text-white/80 text-sm mt-1">
                Analise de forma contínua diversas dimensões de clima e engajamento das suas equipes de forma rápida e fácil
              </p>
            </div>
            {step > 1 && (
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 bg-transparent">
                Enviar lembrete
              </Button>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-background rounded-xl shadow-sm border p-6">
            <div className="flex border-b mb-6">
              {[
                { num: 1, label: "Informações iniciais" },
                { num: 2, label: "Participantes" },
                { num: 3, label: "Dimensões e perguntas" },
                { num: 4, label: "Disparo" },
              ].map((s) => (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num)}
                  className={`flex-1 pb-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                    step === s.num
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step === s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.num}
                  </span>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Informações básicas</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome da pesquisa*</label>
                    <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">Descrição da pesquisa <Info className="h-3.5 w-3.5 text-muted-foreground" /></label>
                    <Textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="mt-1" rows={4} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Participantes</h2>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Switch checked={formData.participantes.tempoAdmissao} onCheckedChange={(v) => setFormData({ ...formData, participantes: { ...formData.participantes, tempoAdmissao: v } })} />
                    <span className="text-sm">Tempo de admissão do colaborador.</span>
                  </div>
                  {formData.participantes.tempoAdmissao && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.participantes.tipoAdmissao === "periodicidade" ? "border-primary bg-primary/5" : "border-border"}`}
                        onClick={() => setFormData({ ...formData, participantes: { ...formData.participantes, tipoAdmissao: "periodicidade" } })}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.participantes.tipoAdmissao === "periodicidade" ? "border-primary" : "border-muted-foreground"}`}>
                            {formData.participantes.tipoAdmissao === "periodicidade" && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                          <span className="font-medium text-sm">Periodicidade da admissão</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">Escolha o tempo mínimo dos colaboradores para responder a pesquisa.</p>
                        <div className="ml-6 mt-3 bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-2">Usuário admitidos há pelo menos:</p>
                          <Select value={formData.participantes.periodicidade} onValueChange={(v) => setFormData({ ...formData, participantes: { ...formData.participantes, periodicidade: v } })}>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>{PERIODICIDADE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.participantes.tipoAdmissao === "dataCorte" ? "border-primary bg-primary/5" : "border-border opacity-70"}`}
                        onClick={() => setFormData({ ...formData, participantes: { ...formData.participantes, tipoAdmissao: "dataCorte" } })}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.participantes.tipoAdmissao === "dataCorte" ? "border-primary" : "border-muted-foreground"}`}>
                            {formData.participantes.tipoAdmissao === "dataCorte" && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                          <span className="font-medium text-sm">Data de corte</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">Todos os usuários colaboradores admitidos antes desta data poderão responder.</p>
                        <div className="ml-6 mt-3 bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-2">Apenas participantes com data de admissão anterior à:</p>
                          <Input type="date" value={formData.participantes.dataCorte} onChange={(e) => setFormData({ ...formData, participantes: { ...formData.participantes, dataCorte: e.target.value } })} className="bg-background" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">Unidades participantes <Info className="h-3.5 w-3.5 text-muted-foreground" /></label>
                    <Select onValueChange={(v) => setFormData({ ...formData, participantes: { ...formData.participantes, unidades: toggleArrayItem(formData.participantes.unidades, v) } })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={formData.participantes.unidades.length > 0 ? formData.participantes.unidades.join(", ") : "Selecione"} /></SelectTrigger>
                      <SelectContent>{UNIDADE_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                    {formData.participantes.unidades.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.participantes.unidades.map((u) => (
                          <Badge key={u} variant="secondary" className="text-xs cursor-pointer" onClick={() => setFormData({ ...formData, participantes: { ...formData.participantes, unidades: formData.participantes.unidades.filter((i) => i !== u) } })}>× {u}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">Departamentos participantes * <Info className="h-3.5 w-3.5 text-muted-foreground" /></label>
                    <Select onValueChange={(v) => setFormData({ ...formData, participantes: { ...formData.participantes, departamentos: toggleArrayItem(formData.participantes.departamentos, v) } })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={formData.participantes.departamentos.length > 0 ? formData.participantes.departamentos.join(", ") : "Selecione"} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Toda Empresa">Toda Empresa</SelectItem>
                        {DEPARTAMENTO_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {formData.participantes.departamentos.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.participantes.departamentos.map((d) => (
                          <Badge key={d} variant="secondary" className="text-xs cursor-pointer" onClick={() => setFormData({ ...formData, participantes: { ...formData.participantes, departamentos: formData.participantes.departamentos.filter((i) => i !== d) } })}>× {d}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">Grupos de usuários <Info className="h-3.5 w-3.5 text-muted-foreground" /></label>
                    <Select onValueChange={(v) => setFormData({ ...formData, participantes: { ...formData.participantes, grupos: toggleArrayItem(formData.participantes.grupos, v) } })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder={formData.participantes.grupos.length > 0 ? formData.participantes.grupos.join(", ") : "Selecione"} /></SelectTrigger>
                      <SelectContent>{GRUPOS_USUARIOS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                    {formData.participantes.grupos.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.participantes.grupos.map((g) => (
                          <Badge key={g} variant="secondary" className="text-xs cursor-pointer" onClick={() => setFormData({ ...formData, participantes: { ...formData.participantes, grupos: formData.participantes.grupos.filter((i) => i !== g) } })}>× {g}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Dimensões e Perguntas</h2>
                  <Button onClick={() => setShowDimensaoDialog(true)} className="bg-[#0B2B5E] hover:bg-[#0a2550]">Adicionar Dimensão</Button>
                </div>
                {formData.dimensoes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Nenhuma dimensão adicionada ainda.</p>
                    <p className="text-sm">Clique em "Adicionar Dimensão" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.dimensoes.map((dim) => (
                      <div key={dim.id} className="border rounded-lg">
                        <div className="flex items-center justify-between p-4 border-b">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{dim.nome}</span>
                            <button className="text-muted-foreground hover:text-foreground" title="Info"><Info className="h-4 w-4" /></button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleOpenAddPergunta(dim.id)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground" title="Adicionar pergunta"><Plus className="h-4 w-4" /></button>
                            <button onClick={() => handleOpenEditDimensao(dim)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground" title="Editar dimensão"><Pencil className="h-4 w-4" /></button>
                          </div>
                        </div>
                        <div className="p-6">
                          {dim.perguntas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <svg viewBox="0 0 200 200" className="w-32 h-32 mb-3 text-muted-foreground/30">
                                <circle cx="100" cy="80" r="30" fill="currentColor" opacity="0.2" />
                                <rect x="50" y="120" width="100" height="50" rx="10" fill="currentColor" opacity="0.15" />
                                <rect x="70" y="130" width="60" height="6" rx="3" fill="currentColor" opacity="0.3" />
                                <rect x="80" y="145" width="40" height="6" rx="3" fill="currentColor" opacity="0.3" />
                              </svg>
                              <p className="text-sm text-muted-foreground">Não encontramos perguntas para essa dimensão</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {dim.perguntas.map((p) => (
                                <div key={p.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <Badge className="bg-[#4A7AB5] text-white text-xs hover:bg-[#4A7AB5]">{p.subdimensao}</Badge>
                                      <Badge className="bg-[#3D3D3D] text-white text-xs hover:bg-[#3D3D3D]">Tipo {p.tipoResposta}</Badge>
                                    </div>
                                    <p className="text-sm">{p.pergunta}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch checked={p.ativa} onCheckedChange={() => handleTogglePergunta(dim.id, p.id)} />
                                    <button onClick={() => handleOpenEditPergunta(dim.id, p)} className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="px-4 py-2 bg-green-50 rounded-b-lg text-xs text-green-700">
                          Quantidade de perguntas: {dim.perguntas.filter(p => p.ativa).length} (ativadas) / {dim.perguntas.filter(p => !p.ativa).length} (desativadas)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Detalhes do disparo</h2>
                <div>
                  <p className="text-sm font-medium">Tipo de disparo</p>
                  <p className="text-xs text-muted-foreground mb-3">Só será possível alterar o tipo de disparo com a pesquisa inativa</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.disparo.tipo === "pulsado" ? "border-primary bg-primary/5" : "border-border"}`}
                      onClick={() => setFormData({ ...formData, disparo: { ...formData.disparo, tipo: "pulsado" } })}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.disparo.tipo === "pulsado" ? "border-primary" : "border-muted-foreground"}`}>
                          {formData.disparo.tipo === "pulsado" && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="font-medium text-sm">Pulsado</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 ml-6">Conjunto de perguntas disparadas diariamente ou semanalmente em ordem aleatória.</p>
                    </div>
                    <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${formData.disparo.tipo === "pulsoUnico" ? "border-primary bg-primary/5" : "border-border"}`}
                      onClick={() => setFormData({ ...formData, disparo: { ...formData.disparo, tipo: "pulsoUnico" } })}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.disparo.tipo === "pulsoUnico" ? "border-primary" : "border-muted-foreground"}`}>
                          {formData.disparo.tipo === "pulsoUnico" && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="font-medium text-sm">Pulso único</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 ml-6">Todas as perguntas ativas são disparadas no mesmo envio em ordem de criação.</p>
                    </div>
                  </div>
                </div>

                {formData.disparo.tipo === "pulsado" && (
                  <div className="space-y-4">
                    <div className="max-w-md">
                      <label className="text-sm font-medium flex items-center gap-1">Quantidade de perguntas por pulso <Info className="h-3.5 w-3.5 text-muted-foreground" /></label>
                      <Select value={formData.disparo.qtdPerguntas} onValueChange={(v) => setFormData({ ...formData, disparo: { ...formData.disparo, qtdPerguntas: v } })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>{QTD_PERGUNTAS_OPTIONS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-1">Dias de envio do pulso <Info className="h-3.5 w-3.5 text-muted-foreground" /></label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {DIAS_SEMANA.map((dia) => (
                          <button key={dia} onClick={() => setFormData({ ...formData, disparo: { ...formData.disparo, diasSemana: toggleArrayItem(formData.disparo.diasSemana, dia) } })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${formData.disparo.diasSemana.includes(dia) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary"}`}>
                            {dia}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {formData.disparo.tipo === "pulsoUnico" && (
                  <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
                    <p className="text-sm font-medium">Configurações do Pulso Único</p>
                    <div className="max-w-md">
                      <label className="text-sm font-medium flex items-center gap-1">Quantidade mínima de respondentes <Info className="h-3.5 w-3.5 text-muted-foreground" /></label>
                      <Input type="number" value={formData.disparo.qtdRespondentes} onChange={(e) => setFormData({ ...formData, disparo: { ...formData.disparo, qtdRespondentes: Number(e.target.value) } })} className="mt-1" min={1} />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Permitir o respondente remover o anonimato?</p>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-sm">
                          <input type="radio" checked={formData.disparo.permitirRemoverAnonimato} onChange={() => setFormData({ ...formData, disparo: { ...formData.disparo, permitirRemoverAnonimato: true } })} /> Sim
                        </label>
                        <label className="flex items-center gap-1.5 text-sm">
                          <input type="radio" checked={!formData.disparo.permitirRemoverAnonimato} onChange={() => setFormData({ ...formData, disparo: { ...formData.disparo, permitirRemoverAnonimato: false } })} /> Não
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline">Pré-Visualizar</Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSavePesquisa}>Salvar Configuração</Button>
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} className="bg-[#0B2B5E] hover:bg-[#0a2550]">Próximo</Button>
              ) : (
                <Button onClick={handleSavePesquisa} className="bg-[#0B2B5E] hover:bg-[#0a2550]">Salvar</Button>
              )}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={showDimensaoDialog} onOpenChange={setShowDimensaoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Adicionar Dimensão</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome: *</label>
                <Input value={dimensaoNome} onChange={(e) => setDimensaoNome(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição: *</label>
                <Textarea value={dimensaoDescricao} onChange={(e) => setDimensaoDescricao(e.target.value)} className="mt-1" maxLength={250} rows={3} />
                <p className="text-xs text-muted-foreground text-right mt-1">{dimensaoDescricao.length}/250</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDimensaoDialog(false)}>Fechar</Button>
              <Button onClick={handleAddDimensao} className="bg-[#0B2B5E] hover:bg-[#0a2550]">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDimensaoDialog} onOpenChange={setShowEditDimensaoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Editar Dimensão</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome: *</label>
                <Input value={editDimensaoNome} onChange={(e) => setEditDimensaoNome(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição: *</label>
                <Textarea value={editDimensaoDescricao} onChange={(e) => setEditDimensaoDescricao(e.target.value)} className="mt-1" maxLength={250} rows={3} />
                <p className="text-xs text-muted-foreground text-right mt-1">{editDimensaoDescricao.length}/250</p>
              </div>
            </div>
            <DialogFooter className="flex !justify-between">
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => { setDeleteDimensaoId(editDimensaoId); setShowDeleteDimensaoDialog(true); }}>Deletar</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEditDimensaoDialog(false)}>Fechar</Button>
                <Button onClick={handleSaveEditDimensao} className="bg-[#0B2B5E] hover:bg-[#0a2550]">Salvar</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteDimensaoDialog} onOpenChange={setShowDeleteDimensaoDialog}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader><DialogTitle className="text-center text-xl">Deletar Dimensão</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Você deseja deletar essa dimensão? Atenção: Essa ação irá deletar todas as perguntas que estão ligadas a essa dimensão. Essa ação não poderá ser desfeita.</p>
            <DialogFooter className="flex !justify-center gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteDimensaoDialog(false)}>Cancelar</Button>
              <Button onClick={handleDeleteDimensaoConfirm} className="bg-[#0B2B5E] hover:bg-[#0a2550]">Deletar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPerguntaDialog} onOpenChange={setShowPerguntaDialog}>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Cadastrar Pergunta</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subdimensão* <span className="text-primary cursor-pointer">(adicionar nova)</span></label>
                <Select value={perguntaSubdimensao} onValueChange={setPerguntaSubdimensao}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="max-h-60">{SUBDIMENSAO_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-1">Tipo de resposta* <Info className="h-3.5 w-3.5 text-muted-foreground" /></label>
                <Select value={perguntaTipoResposta} onValueChange={(val) => { setPerguntaTipoResposta(val); setPerguntaOpcoes(["", ""]); setPerguntaNpsComentario(false); setPerguntaNpsNota(5); }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{TIPO_RESPOSTA_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Pergunta*</label>
                <Input value={perguntaTexto} onChange={(e) => setPerguntaTexto(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição*</label>
                <Textarea value={perguntaDescricao} onChange={(e) => setPerguntaDescricao(e.target.value)} className="mt-1" rows={3} />
              </div>
              {perguntaTipoResposta === "NPS" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={perguntaNpsComentario} onCheckedChange={(c) => setPerguntaNpsComentario(!!c)} />
                    <label className="text-sm">Habilitar comentário obrigatório para nota abaixo de:</label>
                  </div>
                  {perguntaNpsComentario && (
                    <RadioGroup value={String(perguntaNpsNota)} onValueChange={(v) => setPerguntaNpsNota(Number(v))} className="flex gap-3 flex-wrap">
                      {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                        <div key={n} className="flex items-center gap-1">
                          <RadioGroupItem value={String(n)} id={`nps-${n}`} />
                          <label htmlFor={`nps-${n}`} className="text-sm">{n}</label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              )}
              {["Múltipla Escolha", "Caixa de Seleção (Múltiplas respostas)", "Distribuição de Pontos (100 pontos)"].includes(perguntaTipoResposta) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Opções de resposta*</label>
                  {perguntaOpcoes.map((opcao, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-5">{idx + 1}º</span>
                      <div className="flex-1 relative">
                        <Input value={opcao} onChange={(e) => { const newOpcoes = [...perguntaOpcoes]; newOpcoes[idx] = e.target.value; setPerguntaOpcoes(newOpcoes); }} maxLength={250} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{opcao.length}/250</span>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => { if (perguntaOpcoes.length > 2) setPerguntaOpcoes(perguntaOpcoes.filter((_, i) => i !== idx)); }} disabled={perguntaOpcoes.length <= 2}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <button className="text-sm text-primary font-medium hover:underline" onClick={() => setPerguntaOpcoes([...perguntaOpcoes, ""])}>(Adicionar opção)</button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPerguntaDialog(false)}>Cancelar</Button>
              <Button onClick={handleSavePergunta} className="bg-[#0B2B5E] hover:bg-[#0a2550]">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditPerguntaDialog} onOpenChange={setShowEditPerguntaDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Editar Pergunta</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subdimensão* <span className="text-primary cursor-pointer">(adicionar nova)</span></label>
                <Select value={editPerguntaSubdimensao} onValueChange={setEditPerguntaSubdimensao}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="max-h-60">{SUBDIMENSAO_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Pergunta*</label>
                <Input value={editPerguntaTexto} onChange={(e) => setEditPerguntaTexto(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição*</label>
                <Textarea value={editPerguntaDescricao} onChange={(e) => setEditPerguntaDescricao(e.target.value)} className="mt-1" rows={3} />
              </div>
            </div>
            <DialogFooter className="flex !justify-between">
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => { setDeletePerguntaId(editPerguntaId); setDeletePerguntaDimId(editPerguntaDimId); setShowDeletePerguntaDialog(true); }}>Remover</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEditPerguntaDialog(false)}>Cancelar</Button>
                <Button onClick={handleSaveEditPergunta} className="bg-[#0B2B5E] hover:bg-[#0a2550]">Salvar</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeletePerguntaDialog} onOpenChange={setShowDeletePerguntaDialog}>
          <DialogContent className="sm:max-w-md text-center">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full border-4 border-amber-400 flex items-center justify-center">
                <Info className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <DialogHeader><DialogTitle className="text-center text-xl">Remover pergunta?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Isso resultará na remoção definitiva da pergunta da listagem e próximos disparos. No entanto, caso haja respostas, as mesmas continuarão sendo exibidas no dashboard.</p>
            <DialogFooter className="flex !justify-center gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowDeletePerguntaDialog(false)}>Cancelar</Button>
              <Button onClick={handleDeletePerguntaConfirm} className="bg-[#0B2B5E] hover:bg-[#0a2550]">Remover pergunta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // =================== LIST VIEW ===================
  const filteredPesquisas = pesquisas.filter(p => p.nome.toLowerCase().includes(searchPesquisa.toLowerCase()));

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Pesquisa de Engajamento</h1>
        <p className="text-muted-foreground">Analise de forma contínua diversas dimensões de clima e engajamento das suas equipes de forma rápida e fácil</p>
      </div>

      {/* Modelo Padrão */}
      <div>
        <h2 className="text-lg font-bold">Modelo Padrão - Clima e Engajamento</h2>
        <p className="text-sm text-muted-foreground">A pesquisa padrão foi criada baseada em diversos fatores para facilitar e melhorar o engajamento na sua empresa.</p>
        <div className="border rounded-lg p-4 mt-3 flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">Pesquisa de Engajamento</p>
            <p className="text-sm text-muted-foreground">A pesquisa de engajamento é para os colaboradores se expressarem de forma anônim...</p>
          </div>
          <div className="flex items-center gap-6">
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">Inativa</Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium text-foreground">Último pulso</p>
                <p>Não enviada</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <div>
                <p className="font-medium text-foreground flex items-center gap-1">Participação do pulso <Info className="h-3 w-3" /></p>
                <p>0%</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              setSelectedPesquisa({
                id: "padrao",
                nome: "Pesquisa de Engajamento",
                descricao: "A pesquisa de engajamento é para os colaboradores se expressarem de forma anônima...",
                status: "Inativa",
                anonima: true,
                tipo: "Pesquisa Padrão",
                frequencia: "Trimestral",
                departamentos: [],
                cargos: [],
                dimensoes: [],
              } as any);
              setResultadoTab("dashboard");
              setView("resultado");
            }}>Ver resultado</Button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 hover:bg-muted rounded"><MoreVertical className="h-4 w-4" /></button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-1">
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Configurar</button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/pesquisas/engajamento/padrao`);
                  toast({ title: "Link copiado!", description: "O link da pesquisa foi copiado para a área de transferência." });
                }}>Copiar link da pesquisa</button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Duplicar</button>
                <button className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted rounded">Excluir</button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Pesquisa Customizada */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Pesquisa customizada</h2>
            <p className="text-sm text-muted-foreground">Crie pesquisas personalizadas que melhor se encaixam com a sua empresa e cultura.</p>
          </div>
          <Button onClick={handleCreatePesquisa} className="bg-[#0B2B5E] hover:bg-[#0a2550]">Criar Pesquisa</Button>
        </div>

        {pesquisas.length > 0 && (
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquise pelo nome da pesquisa"
              value={searchPesquisa}
              onChange={(e) => setSearchPesquisa(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {pesquisas.length === 0 ? (
          <div className="border rounded-lg mt-3 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-48 h-48 mb-4 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full text-muted-foreground/30">
                <rect x="40" y="60" width="120" height="90" rx="8" fill="currentColor" opacity="0.3" />
                <circle cx="80" cy="140" r="6" fill="currentColor" opacity="0.5" />
                <circle cx="100" cy="140" r="6" fill="currentColor" opacity="0.5" />
                <circle cx="120" cy="140" r="6" fill="currentColor" opacity="0.5" />
                <rect x="60" y="80" width="80" height="8" rx="4" fill="currentColor" opacity="0.2" />
                <rect x="60" y="95" width="60" height="8" rx="4" fill="currentColor" opacity="0.2" />
              </svg>
            </div>
            <p className="font-semibold text-muted-foreground">Sem pesquisas customizadas</p>
            <p className="text-sm text-muted-foreground">Você ainda não criou pesquisas customizadas</p>
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {filteredPesquisas.map((p) => (
              <div key={p.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{p.nome}</p>
                  <p className="text-sm text-muted-foreground">{p.descricao}</p>
                </div>
                <div className="flex items-center gap-6">
                  <Badge variant="outline" className={p.status === "Ativa" ? "text-green-600 border-green-300 bg-green-50" : "text-amber-600 border-amber-300 bg-amber-50"}>
                    {p.status}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-foreground">Último pulso</p>
                      <p>Não enviada</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-foreground flex items-center gap-1">Participação do pulso <Info className="h-3 w-3" /></p>
                      <p>0%</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => handleVerResultado(p)}>Ver resultado</Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="p-1 hover:bg-muted rounded"><MoreVertical className="h-4 w-4" /></button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-1">
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" onClick={() => handleEditPesquisaFromConfig(p)}>Configurar</button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" onClick={() => handleCopiarLink(p)}>Copiar link da pesquisa</button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" onClick={() => { setDuplicarPesquisa(p); setShowDuplicarDialog(true); }}>Duplicar</button>
                      <button className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted rounded" onClick={() => { setExcluirPesquisa(p); setShowExcluirDialog(true); }}>Excluir</button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog Duplicar Pesquisa */}
      <Dialog open={showDuplicarDialog} onOpenChange={setShowDuplicarDialog}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center text-center pt-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Info className="h-6 w-6 text-amber-500" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Duplicar a pesquisa "{duplicarPesquisa?.nome}"?
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Após a duplicação, a pesquisa se tornará uma pesquisa customizada. Você poderá configurar a pesquisa e editar as perguntas conforme necessário.
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDuplicarDialog(false)}>Cancelar</Button>
            <Button className="bg-[#0B2B5E] hover:bg-[#0a2550]" onClick={handleDuplicarPesquisa}>Duplicar pesquisa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Excluir Pesquisa */}
      <Dialog open={showExcluirDialog} onOpenChange={setShowExcluirDialog}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center text-center pt-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Excluir a pesquisa "{excluirPesquisa?.nome}"?
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Esta ação não pode ser desfeita. Todos os dados, dimensões e perguntas associadas a esta pesquisa serão permanentemente removidos.
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowExcluirDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleExcluirPesquisa}>Excluir pesquisa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PesquisaEngajamento;
