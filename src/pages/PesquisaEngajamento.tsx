import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Users, MoreVertical, ArrowLeft, Info, Plus, Pencil } from "lucide-react";
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

interface Pergunta {
  id: number;
  subdimensao: string;
  tipoResposta: string;
  pergunta: string;
  descricao: string;
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
  const [view, setView] = useState<"list" | "create">("list");
  const [step, setStep] = useState(1);
  const [pesquisas, setPesquisas] = useState<PesquisaCustomizada[]>([]);
  const [showDimensaoDialog, setShowDimensaoDialog] = useState(false);
  const [dimensaoNome, setDimensaoNome] = useState("");
  const [dimensaoDescricao, setDimensaoDescricao] = useState("");

  // Form state
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
      ...formData,
      id: Date.now(),
    });
    setStep(1);
    setView("create");
  };

  const handleSavePesquisa = () => {
    setPesquisas([...pesquisas, formData]);
    setView("list");
  };

  const handleAddDimensao = () => {
    if (!dimensaoNome.trim()) return;
    const newDim: Dimensao = {
      id: Date.now(),
      nome: dimensaoNome,
      descricao: dimensaoDescricao,
    };
    setFormData({
      ...formData,
      dimensoes: [...formData.dimensoes, newDim],
    });
    setDimensaoNome("");
    setDimensaoDescricao("");
    setShowDimensaoDialog(false);
  };

  const toggleArrayItem = (arr: string[], item: string) => {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  };

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
                  {step === 1 ? "Criar" : "Configurar"} Pesquisa de Clima Customizada
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

            {/* Step 1 - Informações iniciais */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Informações básicas</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome da pesquisa*</label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      Descrição da pesquisa <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </label>
                    <Textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 - Participantes */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Participantes</h2>

                {/* Tempo de admissão */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.participantes.tempoAdmissao}
                      onCheckedChange={(v) =>
                        setFormData({
                          ...formData,
                          participantes: { ...formData.participantes, tempoAdmissao: v },
                        })
                      }
                    />
                    <span className="text-sm">Tempo de admissão do colaborador.</span>
                  </div>

                  {formData.participantes.tempoAdmissao && (
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formData.participantes.tipoAdmissao === "periodicidade"
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            participantes: { ...formData.participantes, tipoAdmissao: "periodicidade" },
                          })
                        }
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData.participantes.tipoAdmissao === "periodicidade"
                                ? "border-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {formData.participantes.tipoAdmissao === "periodicidade" && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <span className="font-medium text-sm">Periodicidade da admissão</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Escolha o tempo mínimo dos colaboradores para responder a pesquisa.
                        </p>
                        <div className="ml-6 mt-3 bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-2">Usuário admitidos há pelo menos:</p>
                          <Select
                            value={formData.participantes.periodicidade}
                            onValueChange={(v) =>
                              setFormData({
                                ...formData,
                                participantes: { ...formData.participantes, periodicidade: v },
                              })
                            }
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {PERIODICIDADE_OPTIONS.map((o) => (
                                <SelectItem key={o} value={o}>{o}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          formData.participantes.tipoAdmissao === "dataCorte"
                            ? "border-primary bg-primary/5"
                            : "border-border opacity-70"
                        }`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            participantes: { ...formData.participantes, tipoAdmissao: "dataCorte" },
                          })
                        }
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData.participantes.tipoAdmissao === "dataCorte"
                                ? "border-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {formData.participantes.tipoAdmissao === "dataCorte" && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <span className="font-medium text-sm">Data de corte</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Todos os usuários colaboradores admitidos antes desta data poderão responder.
                        </p>
                        <div className="ml-6 mt-3 bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-2">Apenas participantes com data de admissão anterior à:</p>
                          <Input
                            type="date"
                            value={formData.participantes.dataCorte}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                participantes: { ...formData.participantes, dataCorte: e.target.value },
                              })
                            }
                            className="bg-background"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      Unidades participantes <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </label>
                    <Select
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          participantes: {
                            ...formData.participantes,
                            unidades: toggleArrayItem(formData.participantes.unidades, v),
                          },
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={formData.participantes.unidades.length > 0 ? formData.participantes.unidades.join(", ") : "Selecione"} />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIDADE_OPTIONS.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.participantes.unidades.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.participantes.unidades.map((u) => (
                          <Badge key={u} variant="secondary" className="text-xs cursor-pointer" onClick={() =>
                            setFormData({
                              ...formData,
                              participantes: {
                                ...formData.participantes,
                                unidades: formData.participantes.unidades.filter((i) => i !== u),
                              },
                            })
                          }>
                            × {u}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      Departamentos participantes * <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </label>
                    <Select
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          participantes: {
                            ...formData.participantes,
                            departamentos: toggleArrayItem(formData.participantes.departamentos, v),
                          },
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={formData.participantes.departamentos.length > 0 ? formData.participantes.departamentos.join(", ") : "Selecione"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Toda Empresa">Toda Empresa</SelectItem>
                        {DEPARTAMENTO_OPTIONS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.participantes.departamentos.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.participantes.departamentos.map((d) => (
                          <Badge key={d} variant="secondary" className="text-xs cursor-pointer" onClick={() =>
                            setFormData({
                              ...formData,
                              participantes: {
                                ...formData.participantes,
                                departamentos: formData.participantes.departamentos.filter((i) => i !== d),
                              },
                            })
                          }>
                            × {d}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      Grupos de usuários <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </label>
                    <Select
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          participantes: {
                            ...formData.participantes,
                            grupos: toggleArrayItem(formData.participantes.grupos, v),
                          },
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={formData.participantes.grupos.length > 0 ? formData.participantes.grupos.join(", ") : "Selecione"} />
                      </SelectTrigger>
                      <SelectContent>
                        {GRUPOS_USUARIOS.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.participantes.grupos.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.participantes.grupos.map((g) => (
                          <Badge key={g} variant="secondary" className="text-xs cursor-pointer" onClick={() =>
                            setFormData({
                              ...formData,
                              participantes: {
                                ...formData.participantes,
                                grupos: formData.participantes.grupos.filter((i) => i !== g),
                              },
                            })
                          }>
                            × {g}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 - Dimensões e perguntas */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Dimensões e Perguntas</h2>
                  <Button onClick={() => setShowDimensaoDialog(true)} className="bg-[#0B2B5E] hover:bg-[#0a2550]">
                    Adicionar Dimensão
                  </Button>
                </div>

                {formData.dimensoes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Nenhuma dimensão adicionada ainda.</p>
                    <p className="text-sm">Clique em "Adicionar Dimensão" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.dimensoes.map((dim) => (
                      <div key={dim.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">{dim.nome}</h3>
                        <p className="text-sm text-muted-foreground">{dim.descricao}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4 - Disparo */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Detalhes do disparo</h2>

                <div>
                  <p className="text-sm font-medium">Tipo de disparo</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Só será possível alterar o tipo de disparo com a pesquisa inativa
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.disparo.tipo === "pulsado" ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => setFormData({ ...formData, disparo: { ...formData.disparo, tipo: "pulsado" } })}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          formData.disparo.tipo === "pulsado" ? "border-primary" : "border-muted-foreground"
                        }`}>
                          {formData.disparo.tipo === "pulsado" && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="font-medium text-sm">Pulsado</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 ml-6">
                        Conjunto de perguntas disparadas diariamente ou semanalmente em ordem aleatória.
                      </p>
                    </div>

                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.disparo.tipo === "pulsoUnico" ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => setFormData({ ...formData, disparo: { ...formData.disparo, tipo: "pulsoUnico" } })}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          formData.disparo.tipo === "pulsoUnico" ? "border-primary" : "border-muted-foreground"
                        }`}>
                          {formData.disparo.tipo === "pulsoUnico" && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="font-medium text-sm">Pulso único</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 ml-6">
                        Todas as perguntas ativas são disparadas no mesmo envio em ordem de criação.
                      </p>
                    </div>
                  </div>
                </div>

                {formData.disparo.tipo === "pulsado" && (
                  <div className="space-y-4">
                    <div className="max-w-md">
                      <label className="text-sm font-medium">Quantidade de perguntas enviadas por disparo*</label>
                      <Select
                        value={formData.disparo.qtdPerguntas}
                        onValueChange={(v) =>
                          setFormData({ ...formData, disparo: { ...formData.disparo, qtdPerguntas: v } })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QTD_PERGUNTAS_OPTIONS.map((q) => (
                            <SelectItem key={q} value={q}>{q}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="max-w-md">
                      <label className="text-sm font-medium">Dia(s) da semana que a pesquisa será disparada*</label>
                      <Select
                        onValueChange={(v) =>
                          setFormData({
                            ...formData,
                            disparo: {
                              ...formData.disparo,
                              diasSemana: toggleArrayItem(formData.disparo.diasSemana, v),
                            },
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={formData.disparo.diasSemana.join(", ") || "Selecione"} />
                        </SelectTrigger>
                        <SelectContent>
                          {DIAS_SEMANA.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.disparo.diasSemana.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {formData.disparo.diasSemana.map((d) => (
                            <Badge key={d} variant="secondary" className="text-xs cursor-pointer" onClick={() =>
                              setFormData({
                                ...formData,
                                disparo: {
                                  ...formData.disparo,
                                  diasSemana: formData.disparo.diasSemana.filter((i) => i !== d),
                                },
                              })
                            }>
                              × {d}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.disparo.tipo === "pulsoUnico" && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Quando o pulso único estiver ativado, as seguintes ações irão acontecer:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>A pesquisa será disparada para todos os participantes a partir do momento da ativação.</li>
                      <li>Todas as perguntas ativadas da pesquisa serão enviadas, seguindo a ordem de criação que aparece na aba de Dimensões e perguntas.</li>
                      <li>Para visualizar as perguntas em ordem na pré-visualização é preciso salvar as configuração antes de pré-visualizar o fluxo.</li>
                      <li>Após ativa, para parar um disparo único, basta clicar no botão "Parar pesquisa".</li>
                    </ul>
                  </div>
                )}

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Anonimato</h3>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      Quantidade de respondentes necessários para exibir resultados <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </label>
                    <Input
                      type="number"
                      value={formData.disparo.qtdRespondentes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          disparo: { ...formData.disparo, qtdRespondentes: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-20 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      Permitir remover anonimato? <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </label>
                    <div className="flex items-center gap-4 mt-1">
                      <label className="flex items-center gap-1.5 text-sm">
                        <input
                          type="radio"
                          checked={formData.disparo.permitirRemoverAnonimato}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              disparo: { ...formData.disparo, permitirRemoverAnonimato: true },
                            })
                          }
                        />
                        Sim
                      </label>
                      <label className="flex items-center gap-1.5 text-sm">
                        <input
                          type="radio"
                          checked={!formData.disparo.permitirRemoverAnonimato}
                          onChange={() =>
                            setFormData({
                              ...formData,
                              disparo: { ...formData.disparo, permitirRemoverAnonimato: false },
                            })
                          }
                        />
                        Não
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6">
            <Button variant="outline">Pré-Visualizar</Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSavePesquisa}>Salvar Configuração</Button>
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} className="bg-[#0B2B5E] hover:bg-[#0a2550]">
                  Próximo
                </Button>
              ) : (
                <Button onClick={handleSavePesquisa} className="bg-[#0B2B5E] hover:bg-[#0a2550]">
                  Salvar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Dialog Adicionar Dimensão */}
        <Dialog open={showDimensaoDialog} onOpenChange={setShowDimensaoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Dimensão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome: *</label>
                <Input
                  value={dimensaoNome}
                  onChange={(e) => setDimensaoNome(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição: *</label>
                <Textarea
                  value={dimensaoDescricao}
                  onChange={(e) => setDimensaoDescricao(e.target.value)}
                  className="mt-1"
                  maxLength={250}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{dimensaoDescricao.length}/250</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDimensaoDialog(false)}>Fechar</Button>
              <Button onClick={handleAddDimensao} className="bg-[#0B2B5E] hover:bg-[#0a2550]">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // List view
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Pesquisa de Engajamento</h1>
        <p className="text-muted-foreground">
          Analise de forma contínua diversas dimensões de clima e engajamento das suas equipes de forma rápida e fácil
        </p>
      </div>

      {/* Modelo Padrão */}
      <div>
        <h2 className="text-lg font-bold">Modelo Padrão - Clima e Engajamento</h2>
        <p className="text-sm text-muted-foreground">
          A pesquisa padrão foi criada baseada em diversos fatores para facilitar e melhorar o engajamento na sua empresa.
        </p>
        <div className="border rounded-lg p-4 mt-3 flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium">Pesquisa de Engajamento</p>
            <p className="text-sm text-muted-foreground">
              A pesquisa de engajamento é para os colaboradores se expressarem de forma anônim...
            </p>
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
                <p className="font-medium text-foreground flex items-center gap-1">
                  Participação do pulso <Info className="h-3 w-3" />
                </p>
                <p>0%</p>
              </div>
            </div>
            <Button variant="outline">Ver resultado</Button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-1 hover:bg-muted rounded">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1">
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Editar</button>
                <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Ativar</button>
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
            <p className="text-sm text-muted-foreground">
              Crie pesquisas personalizadas que melhor se encaixam com a sua empresa e cultura.
            </p>
          </div>
          <Button onClick={handleCreatePesquisa} className="bg-[#0B2B5E] hover:bg-[#0a2550]">
            Criar Pesquisa
          </Button>
        </div>

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
            {pesquisas.map((p) => (
              <div key={p.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.nome}</p>
                  <p className="text-sm text-muted-foreground">{p.descricao}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={p.status === "Ativa" ? "text-green-600 border-green-300 bg-green-50" : "text-amber-600 border-amber-300 bg-amber-50"}>
                    {p.status}
                  </Badge>
                  <Button variant="outline" size="sm">Ver resultado</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PesquisaEngajamento;
