import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DEPARTAMENTO_OPTIONS } from "@/data/selectOptions";
import { FileSpreadsheet, AlertTriangle, ChevronDown, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

interface Pesquisa {
  id: number;
  pergunta: string;
  criadoEm: string;
  finalizaEm: string;
  departamentos: string[];
  grupos: string[];
  detratores: number;
  neutros: number;
  promotores: number;
  enps: number;
  status: "Ativo" | "Inativo";
  comentarioObrigatorio: boolean;
  notaMinComentario: number;
  dataAdmissaoInferior: string;
  respostas: RespostaENPS[];
}

interface RespostaENPS {
  nota: number;
  comentario: string;
  data: string;
}

const INITIAL_PESQUISAS: Pesquisa[] = [
  {
    id: 1,
    pergunta: "Qual a probabilidade de você recomendar a nossa empresa como um bom lugar para trabalhar?",
    criadoEm: "23/05/24",
    finalizaEm: "31/07/2024",
    departamentos: ["Toda Empresa"],
    grupos: [],
    detratores: 3,
    neutros: 9,
    promotores: 23,
    enps: 57,
    status: "Inativo",
    comentarioObrigatorio: true,
    notaMinComentario: 6,
    dataAdmissaoInferior: "",
    respostas: [
      { nota: 10, comentario: "sem comentários", data: "01/06/2024" },
      { nota: 10, comentario: "Ótima estrutura, organização e agilidade nos processos organizacionais e operacionais.", data: "02/06/2024" },
      { nota: 9, comentario: "Recomendaria a empresa como bom lugar para trabalhar, pois creio que é um ambiente agradável pela parte ética e também pela equipe, pela oportunidade de aprendizado e crescimento que o escritório oferece aos colaboradores.", data: "03/06/2024" },
      { nota: 9, comentario: "sem comentários", data: "04/06/2024" },
      { nota: 9, comentario: "Inclusive uma conhecida tem muita vontade de trabalhar aqui, um lugar tranquilo e fácil de dialogar e ouvir detalhes.", data: "05/06/2024" },
      { nota: 9, comentario: "sem comentários", data: "06/06/2024" },
      { nota: 4, comentario: "No cenário atual hoje da empresa, eu não recomendaria tanto qual antes. Acredito que precisa mais de uma visão humana mesmo, em reconhecer o quanto precisamos de mais pessoas ajudando no setor para evitar burla e desgaste de apenas um profissional.", data: "07/06/2024" },
      { nota: 8, comentario: "Um ótimo lugar para se trabalhar! Ambiente agradável, boas condições de trabalho, ótima equipe. Porém deixa um pouco a desejar nos benefícios, como o vale alimentação ser bem baixo. Além disso, às vezes o apoio da diretoria e coordenação é um pouco distante, falta um alinhamento melhor. Mas de modo geral, recomendo e gosto muito de trabalhar aqui.", data: "08/06/2024" },
      { nota: 8, comentario: "Acredito que o ambiente de trabalho é bom confortável e agradável, porém gostaria da diretoria mais ativa e ouvindo mais.", data: "09/06/2024" },
      { nota: 7, comentario: "sem comentários", data: "10/06/2024" },
    ],
  },
];

const GRUPO_OPTIONS = ["Grupo A", "Grupo B", "Grupo C", "Sem grupo"];
const CORES_GRAFICO = ["#2E7D32", "#4CAF50", "#8BC34A", "#CDDC39", "#FDD835", "#FFB300", "#FB8C00", "#F4511E", "#E53935", "#B71C1C", "#880E4F"];

type View = "list" | "create" | "edit" | "results";

export default function PesquisaSatisfacao() {
  const [pesquisas, setPesquisas] = useState<Pesquisa[]>(INITIAL_PESQUISAS);
  const [view, setView] = useState<View>("list");
  const [selectedPesquisa, setSelectedPesquisa] = useState<Pesquisa | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pesquisaToDelete, setPesquisaToDelete] = useState<Pesquisa | null>(null);
  const [pageSize, setPageSize] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formPergunta, setFormPergunta] = useState("Qual a probabilidade de você recomendar a nossa empresa como um bom lugar para trabalhar?");
  const [formDepartamentos, setFormDepartamentos] = useState<string[]>([]);
  const [formGrupos, setFormGrupos] = useState<string[]>([]);
  const [formDataEncerramento, setFormDataEncerramento] = useState("");
  const [formComentarioObrigatorio, setFormComentarioObrigatorio] = useState(true);
  const [formNotaMin, setFormNotaMin] = useState<number | null>(null);
  const [formDataAdmissao, setFormDataAdmissao] = useState("");

  // Results filter
  const [filtroTab, setFiltroTab] = useState<"todos" | "detratores" | "neutros" | "promotores">("todos");

  const resetForm = () => {
    setFormPergunta("Qual a probabilidade de você recomendar a nossa empresa como um bom lugar para trabalhar?");
    setFormDepartamentos([]);
    setFormGrupos([]);
    setFormDataEncerramento("");
    setFormComentarioObrigatorio(true);
    setFormNotaMin(null);
    setFormDataAdmissao("");
  };

  const handleCreate = () => {
    resetForm();
    setView("create");
  };

  const handleEdit = (p: Pesquisa) => {
    setSelectedPesquisa(p);
    setFormPergunta(p.pergunta);
    setFormDepartamentos(p.departamentos);
    setFormGrupos(p.grupos);
    setFormDataEncerramento(p.finalizaEm);
    setFormComentarioObrigatorio(p.comentarioObrigatorio);
    setFormNotaMin(p.notaMinComentario);
    setFormDataAdmissao(p.dataAdmissaoInferior);
    setView("edit");
  };

  const handleResults = (p: Pesquisa) => {
    setSelectedPesquisa(p);
    setFiltroTab("todos");
    setView("results");
  };

  const handleToggleStatus = (p: Pesquisa) => {
    setPesquisas(prev => prev.map(item =>
      item.id === p.id ? { ...item, status: item.status === "Ativo" ? "Inativo" : "Ativo" } : item
    ));
    toast.success(`Pesquisa ${p.status === "Ativo" ? "desativada" : "ativada"} com sucesso!`);
  };

  const handleDelete = () => {
    if (pesquisaToDelete) {
      setPesquisas(prev => prev.filter(p => p.id !== pesquisaToDelete.id));
      toast.success("Pesquisa excluída com sucesso!");
    }
    setDeleteDialogOpen(false);
    setPesquisaToDelete(null);
  };

  const handleSaveCreate = () => {
    const nova: Pesquisa = {
      id: Date.now(),
      pergunta: formPergunta,
      criadoEm: new Date().toLocaleDateString("pt-BR"),
      finalizaEm: formDataEncerramento,
      departamentos: formDepartamentos.length > 0 ? formDepartamentos : ["Toda Empresa"],
      grupos: formGrupos,
      detratores: 0,
      neutros: 0,
      promotores: 0,
      enps: 0,
      status: "Ativo",
      comentarioObrigatorio: formComentarioObrigatorio,
      notaMinComentario: formNotaMin ?? 0,
      dataAdmissaoInferior: formDataAdmissao,
      respostas: [],
    };
    setPesquisas(prev => [...prev, nova]);
    toast.success("Pesquisa criada com sucesso!");
    setView("list");
  };

  const handleSaveEdit = () => {
    if (!selectedPesquisa) return;
    setPesquisas(prev => prev.map(p =>
      p.id === selectedPesquisa.id
        ? {
            ...p,
            pergunta: formPergunta,
            departamentos: formDepartamentos.length > 0 ? formDepartamentos : p.departamentos,
            grupos: formGrupos,
            finalizaEm: formDataEncerramento || p.finalizaEm,
            comentarioObrigatorio: formComentarioObrigatorio,
            notaMinComentario: formNotaMin ?? p.notaMinComentario,
            dataAdmissaoInferior: formDataAdmissao,
          }
        : p
    ));
    toast.success("Pesquisa editada com sucesso!");
    setView("list");
  };

  const removeDepartamento = (dep: string) => {
    setFormDepartamentos(prev => prev.filter(d => d !== dep));
  };

  // Results calculations
  const getDistribuicaoNotas = (p: Pesquisa) => {
    const dist = Array.from({ length: 11 }, (_, i) => ({
      nota: i.toString(),
      count: p.respostas.filter(r => r.nota === i).length,
    }));
    return dist;
  };

  const getDistribuicaoDepartamento = (p: Pesquisa) => {
    return DEPARTAMENTO_OPTIONS.map(dep => ({
      name: dep,
      positivo: Math.floor(Math.random() * 100),
      negativo: -Math.floor(Math.random() * 50),
    }));
  };

  const getSentimentoData = (p: Pesquisa) => {
    const total = p.respostas.length || 1;
    const neg = p.respostas.filter(r => r.nota <= 6).length;
    const pos = p.respostas.filter(r => r.nota >= 9).length;
    const neu = p.respostas.filter(r => r.nota === 7 || r.nota === 8).length;
    return [
      { name: "Negativo", value: Math.round((neg / total) * 100), color: "#E53935" },
      { name: "Positivo", value: Math.round((pos / total) * 100), color: "#4CAF50" },
      { name: "Neutro", value: Math.round((neu / total) * 100), color: "#FFB300" },
    ];
  };

  const getFilteredRespostas = (p: Pesquisa) => {
    if (filtroTab === "detratores") return p.respostas.filter(r => r.nota <= 6);
    if (filtroTab === "neutros") return p.respostas.filter(r => r.nota === 7 || r.nota === 8);
    if (filtroTab === "promotores") return p.respostas.filter(r => r.nota >= 9);
    return p.respostas;
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 9) return "bg-green-500";
    if (nota >= 7) return "bg-yellow-500";
    return "bg-red-500";
  };

  // ====== VIEWS ======

  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-6">
        <Card className="bg-[#2b7fb5] text-white p-6 rounded-xl border-0">
          <h1 className="text-2xl font-bold">E-NPS | Employee Net Promoter Score</h1>
          <p className="text-sm opacity-90">Avalie os principais problemas em sua equipe e empresa de forma rápida e simples</p>
        </Card>

        <Card className="p-6 rounded-xl border-2 border-[#2b7fb5]/20">
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold text-foreground">
                Pergunta da pesquisa E-NPS <span className="text-primary text-xs italic">(Para alterar clique aqui)</span>
              </Label>
              <Input
                value={formPergunta}
                onChange={e => setFormPergunta(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-semibold text-foreground">Selecione os departamentos desejados</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between mt-1 h-auto min-h-[40px] flex-wrap">
                      <div className="flex flex-wrap gap-1">
                        {formDepartamentos.length === 0 && <span className="text-muted-foreground">Selecionar...</span>}
                        {formDepartamentos.map(dep => (
                          <Badge key={dep} variant="secondary" className="flex items-center gap-1">
                            {dep}
                            <X className="h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); removeDepartamento(dep); }} />
                          </Badge>
                        ))}
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-2 max-h-60 overflow-y-auto">
                    <div
                      className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                      onClick={() => {
                        if (formDepartamentos.includes("Toda Empresa")) {
                          removeDepartamento("Toda Empresa");
                        } else {
                          setFormDepartamentos(["Toda Empresa"]);
                        }
                      }}
                    >
                      <Checkbox checked={formDepartamentos.includes("Toda Empresa")} />
                      <span className="text-sm">Toda Empresa</span>
                    </div>
                    {DEPARTAMENTO_OPTIONS.map(dep => (
                      <div
                        key={dep}
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                        onClick={() => {
                          if (formDepartamentos.includes(dep)) {
                            removeDepartamento(dep);
                          } else {
                            setFormDepartamentos(prev => prev.filter(d => d !== "Toda Empresa").concat(dep));
                          }
                        }}
                      >
                        <Checkbox checked={formDepartamentos.includes(dep)} />
                        <span className="text-sm">{dep}</span>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm font-semibold text-foreground">Selecione os grupos desejados</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between mt-1 h-auto min-h-[40px]">
                      <span className="text-muted-foreground">
                        {formGrupos.length === 0 ? "Selecionar..." : formGrupos.join(", ")}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-2">
                    {GRUPO_OPTIONS.map(g => (
                      <div
                        key={g}
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
                        onClick={() => setFormGrupos(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                      >
                        <Checkbox checked={formGrupos.includes(g)} />
                        <span className="text-sm">{g}</span>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="max-w-xs">
              <Label className="text-sm font-semibold text-foreground">Data de Encerramento</Label>
              <Input
                type="date"
                value={formDataEncerramento}
                onChange={e => setFormDataEncerramento(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-foreground">Comentário obrigatório para nota abaixo de:</Label>
              <div className="flex items-center gap-2 mt-1">
                <Checkbox
                  checked={formComentarioObrigatorio}
                  onCheckedChange={(c) => setFormComentarioObrigatorio(!!c)}
                />
                <span className="text-sm">Habilitar / Desabilitar</span>
              </div>
              {formComentarioObrigatorio && (
                <RadioGroup
                  value={formNotaMin?.toString() ?? ""}
                  onValueChange={v => setFormNotaMin(parseInt(v))}
                  className="flex flex-wrap gap-3 mt-2"
                >
                  {Array.from({ length: 11 }, (_, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <RadioGroupItem value={i.toString()} id={`nota-${i}`} />
                      <Label htmlFor={`nota-${i}`} className="text-sm cursor-pointer">{i}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>

            <div className="max-w-md">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-1">
                Apenas participantes com data de admissão inferiores à
                <span className="text-muted-foreground text-xs rounded-full border w-4 h-4 flex items-center justify-center">i</span>
              </Label>
              <Input
                type="date"
                value={formDataAdmissao}
                onChange={e => setFormDataAdmissao(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setView("list")}>Cancelar</Button>
                <Button
                  onClick={view === "create" ? handleSaveCreate : handleSaveEdit}
                  className="bg-[#1a5276] hover:bg-[#154360] text-white"
                >
                  {view === "create" ? "Criar Pesquisa" : "Editar Pesquisa"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (view === "results" && selectedPesquisa) {
    const p = selectedPesquisa;
    const totalRespondentes = p.respostas.length;
    const totalEnviados = totalRespondentes + 6;
    const distNotas = getDistribuicaoNotas(p);
    const distDept = getDistribuicaoDepartamento(p);
    const sentimento = getSentimentoData(p);
    const filteredRespostas = getFilteredRespostas(p);

    const topicos = [
      { name: "Ambiente de trabalho", positivo: 52, negativo: 6 },
      { name: "Relacionamento", positivo: 4, negativo: 3 },
      { name: "Liderança da empresa", positivo: 1, negativo: 3 },
      { name: "Benefícios / trabalho / vale / alimentação / boas", positivo: 1, negativo: 3 },
      { name: "Oportunidades de crescimento", positivo: 0, negativo: 1 },
    ];

    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setView("list")} className="mb-2">← Voltar</Button>

        {/* Detalhamento */}
        <Card className="p-6 rounded-xl border-2 border-[#2b7fb5]/20">
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-sm">
              <h2 className="text-xl font-bold text-foreground">Detalhamento da pesquisa E-NPS</h2>
              <p><span className="font-semibold">Criado por:</span> <span className="text-primary">ANA CAROLINA BRAGA DE MEIRA</span></p>
              <p><span className="font-semibold">Data de Início:</span> {p.criadoEm}</p>
              <p><span className="font-semibold">Data de Término:</span> {p.finalizaEm}</p>
              <p><span className="font-semibold">Enviado para departamentos:</span> {p.departamentos.join(", ")}</p>
              <p><span className="font-semibold">Enviado para grupos:</span> {p.grupos.length > 0 ? p.grupos.join(", ") : "Nenhum grupo selecionado"}</p>
              <p><span className="font-semibold">Pergunta realizada:</span> "{p.pergunta}"</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold text-foreground">{totalRespondentes}/{totalEnviados}</span>
              <p className="text-sm text-muted-foreground">Respondentes</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Label className="font-semibold text-sm">Filtrar por papel</Label>
            <Select defaultValue="todos">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="gestores">Gestores</SelectItem>
                <SelectItem value="colaboradores">Colaboradores</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#2b7fb5] text-white hover:bg-[#236a99]" size="sm">Filtrar</Button>
          </div>
        </Card>

        {/* E-NPS Score + Distribuição por nota */}
        <Card className="p-6 rounded-xl border-2 border-[#2b7fb5]/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#4CAF50" strokeWidth="12"
                    strokeDasharray={`${(p.enps / 100) * 251} 251`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-muted-foreground">eNPS</span>
                  <span className="text-3xl font-bold text-foreground">{p.enps}</span>
                </div>
              </div>
              <div className="flex gap-6 mt-4 text-center text-xs">
                <div>
                  <p className="font-bold text-lg">{p.enps}</p>
                  <p className="text-muted-foreground">eNPS médio<br />da empresa</p>
                  <div className="w-3 h-3 rounded-full bg-foreground mx-auto mt-1" />
                </div>
                <div>
                  <p className="font-bold text-lg">{p.enps}</p>
                  <p className="text-muted-foreground">eNPS médio<br />de todas as<br />pesquisas</p>
                  <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mt-1" />
                </div>
                <div>
                  <p className="font-bold text-lg">65</p>
                  <p className="text-muted-foreground">eNPS médio<br />das empresas<br />na Feedz</p>
                  <div className="w-3 h-3 rounded-full bg-foreground mx-auto mt-1" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  <span className="text-sm"><strong>{p.detratores}</strong> Detratores &nbsp; {((p.detratores / (totalRespondentes || 1)) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                  <span className="text-sm"><strong>{p.neutros}</strong> Neutros &nbsp; {((p.neutros / (totalRespondentes || 1)) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                  <span className="text-sm"><strong>{p.promotores}</strong> Promotores &nbsp; {((p.promotores / (totalRespondentes || 1)) * 100).toFixed(2)}%</span>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-2">Distribuição por nota</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distNotas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nota" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#4CAF50">
                    {distNotas.map((_, i) => (
                      <Cell key={i} fill={i <= 6 ? "#E53935" : i <= 8 ? "#FFB300" : "#4CAF50"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Distribuição por Departamento */}
        <Card className="p-6 rounded-xl border-2 border-[#2b7fb5]/20">
          <h3 className="font-semibold mb-4">Distribuição por Departamento</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={distDept}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="positivo" fill="#4CAF50" />
              <Bar dataKey="negativo" fill="#9E9E9E" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição por Grupos */}
        <Card className="p-6 rounded-xl border-2 border-[#2b7fb5]/20">
          <h3 className="font-semibold mb-4">Distribuição por Grupos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{ name: "Sem grupo", positivo: 30, negativo: -10 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="positivo" fill="#4CAF50" />
              <Bar dataKey="negativo" fill="#9E9E9E" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Análise de Sentimentos */}
        <Card className="p-6 rounded-xl border-2 border-[#2b7fb5]/20">
          <h3 className="font-semibold mb-1">Análise de Sentimentos</h3>
          <p className="text-xs text-muted-foreground mb-4">Identifique o sentimento geral da pesquisa e os tópicos mais mencionados.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-2">Sentimento geral</h4>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sentimento} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                        {sentimento.map((s, i) => (
                          <Cell key={i} fill={s.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-sm space-y-1">
                  {sentimento.map(s => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span>{s.name} ({s.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Tópicos mais mencionados</h4>
              <div className="space-y-2">
                {topicos.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-40 truncate">{i + 1}. {t.name}</span>
                    <div className="flex-1 flex h-4">
                      <div className="bg-red-400 h-full" style={{ width: `${t.negativo * 5}%` }} />
                      <div className="bg-blue-400 h-full" style={{ width: `${t.positivo * 2}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Comentários */}
        <Card className="p-6 rounded-xl border-2 border-[#2b7fb5]/20">
          <div className="flex justify-center gap-2 mb-4">
            {(["detratores", "neutros", "promotores"] as const).map(tab => (
              <Button
                key={tab}
                variant={filtroTab === tab ? "default" : "outline"}
                size="sm"
                className={filtroTab === tab ? "bg-[#2b7fb5] text-white" : ""}
                onClick={() => setFiltroTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>
          <Input placeholder="Filtrar por Tag" className="mb-4 max-w-xs mx-auto" />

          <div className="space-y-4">
            {filteredRespostas.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Nenhum comentário encontrado para este filtro.</p>
            ) : (
              filteredRespostas.map((r, i) => (
                <div key={i} className="flex items-start gap-4 border-l-4 border-muted pl-4 py-3">
                  <div className={`w-10 h-10 rounded-full ${getNotaColor(r.nota)} flex items-center justify-center text-white font-bold shrink-0`}>
                    {r.nota}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{r.comentario}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.data}</p>
                    <Input placeholder="Adicionar Tag" className="mt-2 max-w-[200px] h-7 text-xs" />
                  </div>
                  <MessageSquare className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ====== LIST VIEW ======
  return (
    <div className="space-y-6">
      <Card className="bg-[#2b7fb5] text-white p-6 rounded-xl border-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Pesquisa de Satisfação</h1>
            <p className="text-sm opacity-90 mt-1">
              Para a pesquisa de satisfação utilizamos o Employee Net Promoter Score (eNPS) que ajuda as equipes e líderes a reconhecer e priorizar as questões referentes aos colaboradores da sua empresa.
            </p>
            <p className="text-sm mt-2 underline cursor-pointer opacity-90">Para saber mais sobre E-NPS clique aqui</p>
          </div>
          <FileSpreadsheet className="h-12 w-12 text-yellow-300 shrink-0" />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleCreate} className="bg-[#1a5276] hover:bg-[#154360] text-white">
          Novo E-NPS
        </Button>
      </div>

      <Card className="p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span>Exibindo</span>
            <Select value={pageSize} onValueChange={setPageSize}>
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>resultados por página</span>
          </div>
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-[200px] h-8"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-3 px-2 font-semibold">Criado em</th>
                <th className="text-left py-3 px-2 font-semibold">Finaliza em</th>
                <th className="text-left py-3 px-2 font-semibold">Departamento(s)</th>
                <th className="text-center py-3 px-2 font-semibold">Detratores</th>
                <th className="text-center py-3 px-2 font-semibold">Neutros</th>
                <th className="text-center py-3 px-2 font-semibold">Promotores</th>
                <th className="text-center py-3 px-2 font-semibold">E-NPS</th>
                <th className="text-center py-3 px-2 font-semibold">Status</th>
                <th className="text-center py-3 px-2 font-semibold">Opções</th>
              </tr>
            </thead>
            <tbody>
              {pesquisas.filter(p =>
                searchTerm === "" || p.departamentos.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map(p => (
                <tr key={p.id} className="border-b hover:bg-accent/50">
                  <td className="py-3 px-2">{p.criadoEm}</td>
                  <td className="py-3 px-2">{p.finalizaEm}</td>
                  <td className="py-3 px-2">
                    <div className="flex flex-wrap gap-1">
                      {p.departamentos.map(d => (
                        <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">{p.detratores}</td>
                  <td className="py-3 px-2 text-center">{p.neutros}</td>
                  <td className="py-3 px-2 text-center">{p.promotores}</td>
                  <td className="py-3 px-2 text-center font-bold">{p.enps}</td>
                  <td className="py-3 px-2 text-center">{p.status}</td>
                  <td className="py-3 px-2 text-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">Detalhes <ChevronDown className="h-3 w-3 ml-1" /></Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 p-1" align="end">
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded" onClick={() => handleEdit(p)}>Editar</button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded" onClick={() => handleResults(p)}>Ver resultados</button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded" onClick={() => handleToggleStatus(p)}>
                          {p.status === "Ativo" ? "Desativar" : "Ativar"}
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded text-red-500" onClick={() => { setPesquisaToDelete(p); setDeleteDialogOpen(true); }}>
                          Excluir
                        </button>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <span>Mostrando de 1 até {pesquisas.length} de {pesquisas.length} registros</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled>Primeiro</Button>
            <Button variant="ghost" size="sm" disabled>Anterior</Button>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0">1</Button>
            <Button variant="ghost" size="sm" disabled>Próximo</Button>
            <Button variant="ghost" size="sm" disabled>Último</Button>
          </div>
        </div>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-orange-400 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-orange-500">Atenção!</DialogTitle>
          </DialogHeader>
          <p className="text-foreground">Essa pesquisa não poderá ser revertida após a exclusão.</p>
          <p className="text-foreground font-medium">Você deseja realmente excluir?</p>
          <DialogFooter className="flex justify-center gap-3 mt-4 sm:justify-center">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleDelete} className="bg-[#1a5276] hover:bg-[#154360] text-white">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
