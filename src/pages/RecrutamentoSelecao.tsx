import { useMemo, useState } from "react";
import {
  Plus, Search, Briefcase, Users, CalendarDays, CheckCircle2, UserPlus,
  Filter, MoreHorizontal, Star, Clock, FileText, Mail, Phone, MapPin,
  TrendingUp, Award, AlertCircle, Eye, Edit, Copy, Archive, X,
  ChevronRight, Video, Upload, FileCheck, Building2, DollarSign, Link2, RefreshCw, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useNotificacoes } from "@/stores/notificacoesStore";
import { useCargos } from "@/stores/cargosStore";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { DEPARTAMENTO_OPTIONS } from "@/data/selectOptions";

// ============= TYPES =============
type VagaStatus = "Rascunho" | "Aberta" | "Em andamento" | "Pausada" | "Encerrada" | "Cancelada";
type CandStatus = "Novo" | "Em análise" | "Entrevista agendada" | "Em teste" | "Finalista" | "Aprovado" | "Reprovado";
type EtapaPipeline = "Inscrito" | "Triagem" | "Entrevista RH" | "Entrevista Gestor" | "Teste Técnico" | "Proposta" | "Aprovado" | "Reprovado";
type EntrevistaStatus = "Agendada" | "Confirmada" | "Realizada" | "Cancelada" | "Reagendada";
type EntrevistaTipo = "RH" | "Técnica" | "Gestor" | "Cultural";
type PropostaStatus = "Em elaboração" | "Enviada" | "Em negociação" | "Aceita" | "Recusada";
type AdmissaoStatus = "Convite Enviado" | "Em andamento" | "Concluída" | "Cancelada";
type TipoVinculo = "CLT" | "PJ" | "Estágio" | "Temporário" | "Aprendiz";
type IdiomaConvite = "Português - Brasil" | "Espanhol" | "Inglês";

interface AdmissaoDocumento {
  tipo: string;
  fileName?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

interface Vaga {
  id: string;
  titulo: string;
  area: string;
  departamento: string;
  gestor: string;
  tipoContratacao: string;
  modalidade: string;
  localidade: string;
  posicoes: number;
  candidatos: number;
  status: VagaStatus;
  abertura: string;
  senioridade?: string;
  faixaSalarial?: string;
  beneficios?: string;
  descricao?: string;
  requisitos?: string;
  diferenciais?: string;
  sla?: string;
  dataLimite?: string;
}

interface Candidato {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  vagaId: string;
  vagaTitulo: string;
  origem: string;
  candidatura: string;
  etapa: EtapaPipeline;
  avaliacao: number;
  status: CandStatus;
  favorito?: boolean;
  tags?: string[];
  curriculo?: string;
}

interface Entrevista {
  id: string;
  candidatoId: string;
  candidatoNome: string;
  vagaTitulo: string;
  data: string;
  horario: string;
  entrevistador: string;
  tipo: EntrevistaTipo;
  status: EntrevistaStatus;
  modalidade?: "Presencial" | "Virtual";
  local?: string;
  link?: string;
  observacoes?: string;
  nota?: number;
  feedback?: string;
}

interface Proposta {
  id: string;
  candidatoId: string;
  candidatoNome: string;
  cargo: string;
  departamento: string;
  salario: string;
  beneficios: string;
  envio: string;
  status: PropostaStatus;
  jornada?: string;
  inicio?: string;
  gestor?: string;
}

interface Admissao {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  tipoVinculo: TipoVinculo;
  idioma: IdiomaConvite;
  iniciadaEm: string;     // data de criação do convite
  prazoEntrega: string;   // data limite
  inicio: string;         // data prevista de início
  responsavel: string;
  status: AdmissaoStatus;
  checklist: { item: string; ok: boolean }[];
  // Identificação
  nomeCompleto?: string;
  nomeVisivel?: string;
  celular?: string;
  cpf?: string;
  nomeMae?: string;
  rg?: string;
  ufRg?: string;
  sexo?: string;
  genero?: string;
  etnia?: string;
  sexualidade?: string;
  grauInstrucao?: string;
  // Contato emergência
  emergTipo?: string;
  emergNome?: string;
  emergTelefone?: string;
  // Residência
  cep?: string;
  endereco?: string;
  numero?: string;
  semNumero?: boolean;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  // Contratação CLT
  ctps?: string;
  ctpsSerie?: string;
  primeiroEmprego?: "Sim" | "Não" | "";
  pisPasep?: string;
  // PJ
  razaoSocial?: string;
  cnpj?: string;
  nomeFantasia?: string;
  inscricaoMunicipal?: string;
  // Bancário
  banco?: string;
  tipoConta?: string;
  numeroConta?: string;
  digitoConta?: string;
  numeroAgencia?: string;
  digitoAgencia?: string;
  chavePix?: string;
  // Documentos
  documentos?: AdmissaoDocumento[];
  // Link público
  linkToken?: string;
  linkStatus?: "nao_acessado" | "em_preenchimento" | "concluido" | "expirado";
  linkAcessadoEm?: string;
  linkConcluidoEm?: string;
}

// ============= INITIAL DATA =============
const initVagas: Vaga[] = [];
const initCandidatos: Candidato[] = [];
const initEntrevistas: Entrevista[] = [];
const initPropostas: Proposta[] = [];
const CHECKLIST_PADRAO = [
  { item: "Dados pessoais", ok: false },
  { item: "Documentos obrigatórios", ok: false },
  { item: "Endereço", ok: false },
  { item: "Dados bancários", ok: false },
  { item: "Cargo e salário definidos", ok: false },
  { item: "Departamento e gestor", ok: false },
  { item: "Jornada e benefícios", ok: false },
  { item: "Contrato assinado", ok: false },
  { item: "Exame admissional", ok: false },
  { item: "Integração / Onboarding", ok: false },
];
const initAdmissoes: Admissao[] = [];

const ETAPAS: EtapaPipeline[] = ["Inscrito", "Triagem", "Entrevista RH", "Entrevista Gestor", "Teste Técnico", "Proposta", "Aprovado", "Reprovado"];

// ============= STATUS HELPERS =============
const vagaBadge = (s: VagaStatus) => {
  const map: Record<VagaStatus, string> = {
    Rascunho: "bg-muted text-muted-foreground border-muted",
    Aberta: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
    "Em andamento": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
    Pausada: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
    Encerrada: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
    Cancelada: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
  };
  return map[s];
};
const candBadge = (s: CandStatus) => {
  const map: Record<CandStatus, string> = {
    Novo: "bg-blue-100 text-blue-700 border-blue-200",
    "Em análise": "bg-amber-100 text-amber-700 border-amber-200",
    "Entrevista agendada": "bg-purple-100 text-purple-700 border-purple-200",
    "Em teste": "bg-cyan-100 text-cyan-700 border-cyan-200",
    Finalista: "bg-indigo-100 text-indigo-700 border-indigo-200",
    Aprovado: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Reprovado: "bg-red-100 text-red-700 border-red-200",
  };
  return map[s];
};
const entBadge = (s: EntrevistaStatus) => ({
  Agendada: "bg-blue-100 text-blue-700",
  Confirmada: "bg-emerald-100 text-emerald-700",
  Realizada: "bg-slate-200 text-slate-700",
  Cancelada: "bg-red-100 text-red-700",
  Reagendada: "bg-amber-100 text-amber-700",
}[s]);
const propBadge = (s: PropostaStatus) => ({
  "Em elaboração": "bg-muted text-muted-foreground",
  Enviada: "bg-blue-100 text-blue-700",
  "Em negociação": "bg-amber-100 text-amber-700",
  Aceita: "bg-emerald-100 text-emerald-700",
  Recusada: "bg-red-100 text-red-700",
}[s]);
const admBadge = (s: AdmissaoStatus) => ({
  "Convite Enviado": "bg-blue-100 text-blue-700 border-blue-200",
  "Em andamento": "bg-amber-100 text-amber-700 border-amber-200",
  Concluída: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cancelada: "bg-red-100 text-red-700 border-red-200",
}[s]);

const DOCUMENTOS_PADRAO: AdmissaoDocumento[] = [
  { tipo: "Documentos sem classificação" },
  { tipo: "Carteira de Trabalho" },
  { tipo: "Certificados (Diplomas)" },
  { tipo: "Comprovante de Residência" },
  { tipo: "CPF" },
  { tipo: "Exame Admissional" },
  { tipo: "RG" },
  { tipo: "Título de Eleitor" },
];

const initials = (name: string) => name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

// ============= MAIN COMPONENT =============
export default function RecrutamentoSelecao() {
  const { adicionarNotificacao } = useNotificacoes();
  const [tab, setTab] = useState("visao");

  const [vagas, setVagas] = useState<Vaga[]>(initVagas);
  const [candidatos, setCandidatos] = useState<Candidato[]>(initCandidatos);
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>(initEntrevistas);
  const [propostas, setPropostas] = useState<Proposta[]>(initPropostas);
  const [admissoes, setAdmissoes] = useState<Admissao[]>(initAdmissoes);

  // Dialogs
  const [openVaga, setOpenVaga] = useState(false);
  const [editingVaga, setEditingVaga] = useState<Vaga | null>(null);
  const [openCandidato, setOpenCandidato] = useState(false);
  const [openEntrevista, setOpenEntrevista] = useState(false);
  const [openAdmissao, setOpenAdmissao] = useState(false);
  const [candidatoSel, setCandidatoSel] = useState<Candidato | null>(null);
  const [admissaoSel, setAdmissaoSel] = useState<Admissao | null>(null);
  const [propostaSel, setPropostaSel] = useState<Proposta | null>(null);

  // Filters
  const [vagaBusca, setVagaBusca] = useState("");
  const [vagaStatusFiltro, setVagaStatusFiltro] = useState<string>("todos");
  const [candBusca, setCandBusca] = useState("");
  const [candStatusFiltro, setCandStatusFiltro] = useState<string>("todos");
  const [admBusca, setAdmBusca] = useState("");
  const [admStatusFiltro, setAdmStatusFiltro] = useState<string>("todos");
  const [admDeptFiltro, setAdmDeptFiltro] = useState<string>("todos");
  const [openNovaAdm, setOpenNovaAdm] = useState(false);
  const [novaAdmInitial, setNovaAdmInitial] = useState<{ nome?: string; email?: string; cargo?: string } | null>(null);

  // Métricas
  const stats = useMemo(() => ({
    vagasAbertas: vagas.filter((v) => v.status === "Aberta" || v.status === "Em andamento").length,
    candidatosProc: candidatos.filter((c) => c.status !== "Aprovado" && c.status !== "Reprovado").length,
    entAgendadas: entrevistas.filter((e) => e.status === "Agendada" || e.status === "Confirmada").length,
    aprovados: candidatos.filter((c) => c.status === "Aprovado").length,
    admPend: admissoes.filter((a) => a.status !== "Concluída" && a.status !== "Cancelada").length,
  }), [vagas, candidatos, entrevistas, admissoes]);

  const vagasFiltradas = vagas.filter((v) => {
    const okBusca = vagaBusca === "" || v.titulo.toLowerCase().includes(vagaBusca.toLowerCase()) || v.area.toLowerCase().includes(vagaBusca.toLowerCase());
    const okStatus = vagaStatusFiltro === "todos" || v.status === vagaStatusFiltro;
    return okBusca && okStatus;
  });
  const candFiltrados = candidatos.filter((c) => {
    const okBusca = candBusca === "" || c.nome.toLowerCase().includes(candBusca.toLowerCase()) || c.vagaTitulo.toLowerCase().includes(candBusca.toLowerCase());
    const okStatus = candStatusFiltro === "todos" || c.status === candStatusFiltro;
    return okBusca && okStatus;
  });

  // ============= HANDLERS =============
  const salvarVaga = (v: Vaga) => {
    if (editingVaga) {
      setVagas((prev) => prev.map((x) => (x.id === v.id ? v : x)));
      adicionarNotificacao({ titulo: "Vaga atualizada", descricao: `"${v.titulo}" foi atualizada`, tipo: "atualizacao" });
      toast.success("Vaga atualizada");
    } else {
      setVagas((prev) => [{ ...v, id: `v${Date.now()}`, candidatos: 0 }, ...prev]);
      adicionarNotificacao({ titulo: "Nova vaga", descricao: `"${v.titulo}" foi publicada`, tipo: "criacao" });
      toast.success("Vaga criada");
    }
    setOpenVaga(false);
    setEditingVaga(null);
  };

  const duplicarVaga = (v: Vaga) => {
    setVagas((prev) => [{ ...v, id: `v${Date.now()}`, titulo: v.titulo + " (Cópia)", status: "Rascunho", candidatos: 0 }, ...prev]);
    adicionarNotificacao({ titulo: "Vaga duplicada", descricao: `"${v.titulo}" foi duplicada`, tipo: "criacao" });
    toast.success("Vaga duplicada");
  };
  const encerrarVaga = (v: Vaga) => {
    setVagas((prev) => prev.map((x) => (x.id === v.id ? { ...x, status: "Encerrada" } : x)));
    toast.success("Vaga encerrada");
  };
  const arquivarVaga = (v: Vaga) => {
    setVagas((prev) => prev.map((x) => (x.id === v.id ? { ...x, status: "Cancelada" } : x)));
    toast.success("Vaga arquivada");
  };

  const moverEtapa = (cId: string, etapa: EtapaPipeline) => {
    setCandidatos((prev) => prev.map((c) => {
      if (c.id !== cId) return c;
      let status: CandStatus = c.status;
      if (etapa === "Aprovado") status = "Aprovado";
      else if (etapa === "Reprovado") status = "Reprovado";
      else if (etapa === "Teste Técnico") status = "Em teste";
      else if (etapa === "Proposta") status = "Finalista";
      else status = "Em análise";
      return { ...c, etapa, status };
    }));
    adicionarNotificacao({ titulo: "Candidato movido", descricao: `Etapa atualizada para "${etapa}"`, tipo: "atualizacao" });
  };

  const criarAdmissao = async (input: {
    nome: string; email: string; tipoVinculo: TipoVinculo; departamento: string;
    cargo: string; idioma: IdiomaConvite; prazoEntrega: string;
  }) => {
    const hoje = new Date().toISOString().slice(0, 10);
    const id = `a${Date.now()}`;
    const nova: Admissao = {
      id,
      nome: input.nome,
      email: input.email,
      cargo: input.cargo,
      departamento: input.departamento,
      tipoVinculo: input.tipoVinculo,
      idioma: input.idioma,
      iniciadaEm: hoje,
      prazoEntrega: input.prazoEntrega,
      inicio: input.prazoEntrega,
      responsavel: "RH",
      status: "Convite Enviado",
      nomeCompleto: input.nome,
      nomeVisivel: input.nome,
      checklist: [
        { item: "Dados pessoais", ok: false },
        { item: "Documentos obrigatórios", ok: false },
        { item: "Endereço", ok: false },
        { item: "Dados bancários", ok: false },
        { item: "Contrato assinado", ok: false },
      ],
      documentos: DOCUMENTOS_PADRAO.map((d) => ({ ...d })),
    };

    // Gera o link público automaticamente
    const { data, error } = await supabase
      .from("admissao_links")
      .insert({
        admissao_id: id,
        nome: input.nome,
        email: input.email,
        cargo: input.cargo,
        departamento: input.departamento,
        tipo_vinculo: input.tipoVinculo,
        prazo_entrega: input.prazoEntrega || null,
        documentos: DOCUMENTOS_PADRAO as any,
      })
      .select("token, status")
      .single();

    if (data && !error) {
      nova.linkToken = data.token;
      nova.linkStatus = data.status as any;
      const url = `${window.location.origin}/admissao/${data.token}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success(`Link gerado e copiado para ${input.nome}`);
      } catch {
        toast.success(`Link gerado para ${input.nome}`);
      }
    } else {
      toast.error("Admissão criada, mas falhou ao gerar o link");
    }

    setAdmissoes((prev) => [nova, ...prev]);
    adicionarNotificacao({ titulo: "Nova admissão", descricao: `Admissão criada para ${input.nome}`, tipo: "criacao" });
  };


  const aprovarCandidato = (c: Candidato) => {
    moverEtapa(c.id, "Aprovado");
    toast.success(`${c.nome} aprovado`);
  };

  const reprovarCandidato = (c: Candidato) => {
    moverEtapa(c.id, "Reprovado");
    toast.success("Candidato reprovado");
  };

  const toggleChecklist = (admId: string, idx: number) => {
    setAdmissoes((prev) => prev.map((a) => {
      if (a.id !== admId) return a;
      const cl = a.checklist.map((ci, i) => (i === idx ? { ...ci, ok: !ci.ok } : ci));
      const done = cl.filter((c) => c.ok).length;
      let status: AdmissaoStatus = a.status;
      if (done === cl.length) status = "Concluída";
      else if (done > 0 && a.status === "Convite Enviado") status = "Em andamento";
      return { ...a, checklist: cl, status };
    }));
  };

  const atualizarAdmissao = (id: string, patch: Partial<Admissao>) => {
    setAdmissoes((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    setAdmissaoSel((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };

  const cancelarAdmissao = (id: string) => {
    setAdmissoes((prev) => prev.map((a) => (a.id === id ? { ...a, status: "Cancelada" } : a)));
    toast.success("Admissão cancelada");
  };

  const reenviarConvite = (a: Admissao) => {
    toast.success(`Convite reenviado para ${a.email}`);
    adicionarNotificacao({ titulo: "Convite reenviado", descricao: `Para ${a.nome}`, tipo: "atualizacao" });
  };

  // ============= RENDER =============
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recrutamento e Seleção</h1>
          <p className="text-sm text-muted-foreground">Processos de recrutamento, seleção e admissão</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => { setEditingVaga(null); setOpenVaga(true); }}>
            <Plus className="h-4 w-4" /> Nova vaga
          </Button>
          <Button variant="outline" onClick={() => setOpenCandidato(true)}>
            <UserPlus className="h-4 w-4" /> Novo candidato
          </Button>
          <Button variant="outline" onClick={() => setOpenEntrevista(true)}>
            <CalendarDays className="h-4 w-4" /> Agendar entrevista
          </Button>
          <Button onClick={() => { setTab("admissoes"); toast.info("Selecione um candidato aprovado"); }}>
            <CheckCircle2 className="h-4 w-4" /> Iniciar admissão
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap">
          <TabsTrigger value="visao">Visão Geral</TabsTrigger>
          <TabsTrigger value="vagas">Vagas</TabsTrigger>
          <TabsTrigger value="candidatos">Candidatos</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="entrevistas">Entrevistas</TabsTrigger>
          <TabsTrigger value="propostas">Propostas</TabsTrigger>
          <TabsTrigger value="admissoes">Admissões</TabsTrigger>
        </TabsList>

        {/* ========== VISÃO GERAL ========== */}
        <TabsContent value="visao" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatBox icon={Briefcase} label="Vagas abertas" value={stats.vagasAbertas} color="blue" />
            <StatBox icon={Users} label="Em processo" value={stats.candidatosProc} color="amber" />
            <StatBox icon={CalendarDays} label="Entrevistas" value={stats.entAgendadas} color="purple" />
            <StatBox icon={Award} label="Aprovados" value={stats.aprovados} color="emerald" />
            <StatBox icon={UserPlus} label="Admissões pend." value={stats.admPend} color="orange" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Vagas por status</h3>
              <div className="space-y-3">
                {(["Aberta", "Em andamento", "Pausada", "Encerrada", "Rascunho"] as VagaStatus[]).map((s) => {
                  const qty = vagas.filter((v) => v.status === s).length;
                  const pct = vagas.length ? (qty / vagas.length) * 100 : 0;
                  return (
                    <div key={s}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{s}</span>
                        <span className="font-medium">{qty}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="h-4 w-4" /> Candidatos por etapa</h3>
              <div className="space-y-3">
                {ETAPAS.slice(0, 6).map((e) => {
                  const qty = candidatos.filter((c) => c.etapa === e).length;
                  const pct = candidatos.length ? (qty / candidatos.length) * 100 : 0;
                  return (
                    <div key={e}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{e}</span>
                        <span className="font-medium">{qty}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Processos seletivos recentes</h3>
              <div className="space-y-3">
                {vagas.slice(0, 5).map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/40">
                    <div>
                      <p className="font-medium text-sm">{v.titulo}</p>
                      <p className="text-xs text-muted-foreground">{v.area} · {v.candidatos} candidatos</p>
                    </div>
                    <Badge variant="outline" className={vagaBadge(v.status)}>{v.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Próximas entrevistas</h3>
              <div className="space-y-3">
                {entrevistas.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/40">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback>{initials(e.candidatoNome)}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium text-sm">{e.candidatoNome}</p>
                        <p className="text-xs text-muted-foreground">{e.vagaTitulo} · {e.tipo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{e.data}</p>
                      <p className="text-xs text-muted-foreground">{e.horario}</p>
                    </div>
                  </div>
                ))}
                {entrevistas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma entrevista agendada</p>}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ========== VAGAS ========== */}
        <TabsContent value="vagas" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar vaga ou área..." value={vagaBusca} onChange={(e) => setVagaBusca(e.target.value)} className="pl-9" />
              </div>
              <Select value={vagaStatusFiltro} onValueChange={setVagaStatusFiltro}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  {(["Rascunho","Aberta","Em andamento","Pausada","Encerrada","Cancelada"] as VagaStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => { setEditingVaga(null); setOpenVaga(true); }}>
                <Plus className="h-4 w-4" /> Nova vaga
              </Button>
            </div>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vaga</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Gestor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Localidade</TableHead>
                  <TableHead className="text-center">Posições</TableHead>
                  <TableHead className="text-center">Candidatos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Abertura</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vagasFiltradas.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.titulo}</TableCell>
                    <TableCell>{v.area}</TableCell>
                    <TableCell>{v.gestor}</TableCell>
                    <TableCell>{v.tipoContratacao}</TableCell>
                    <TableCell>{v.modalidade}</TableCell>
                    <TableCell>{v.localidade}</TableCell>
                    <TableCell className="text-center">{v.posicoes}</TableCell>
                    <TableCell className="text-center">{v.candidatos}</TableCell>
                    <TableCell><Badge variant="outline" className={vagaBadge(v.status)}>{v.status}</Badge></TableCell>
                    <TableCell>{v.abertura}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingVaga(v); setOpenVaga(true); }}><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicarVaga(v)}><Copy className="h-4 w-4 mr-2" />Duplicar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => encerrarVaga(v)}><CheckCircle2 className="h-4 w-4 mr-2" />Encerrar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => arquivarVaga(v)} className="text-red-600"><Archive className="h-4 w-4 mr-2" />Arquivar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {vagasFiltradas.length === 0 && (
                  <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Nenhuma vaga encontrada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ========== CANDIDATOS ========== */}
        <TabsContent value="candidatos" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar candidato ou vaga..." value={candBusca} onChange={(e) => setCandBusca(e.target.value)} className="pl-9" />
              </div>
              <Select value={candStatusFiltro} onValueChange={setCandStatusFiltro}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  {(["Novo","Em análise","Entrevista agendada","Em teste","Finalista","Aprovado","Reprovado"] as CandStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setOpenCandidato(true)}><Plus className="h-4 w-4" /> Novo candidato</Button>
            </div>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Vaga</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Candidatura</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candFiltrados.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => setCandidatoSel(c)}>
                    <TableCell><Star className={`h-4 w-4 ${c.favorito ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback>{initials(c.nome)}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-medium">{c.nome}</p>
                          <div className="flex gap-1 mt-0.5">{c.tags?.map((t) => <Badge key={t} variant="secondary" className="text-[10px] px-1.5">{t}</Badge>)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">{c.email}</p>
                      <p className="text-xs text-muted-foreground">{c.telefone}</p>
                    </TableCell>
                    <TableCell>{c.vagaTitulo}</TableCell>
                    <TableCell><Badge variant="outline">{c.origem}</Badge></TableCell>
                    <TableCell>{c.candidatura}</TableCell>
                    <TableCell><Badge variant="secondary">{c.etapa}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{c.avaliacao.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className={candBadge(c.status)}>{c.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {candFiltrados.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum candidato encontrado</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ========== PIPELINE ========== */}
        <TabsContent value="pipeline" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <CompactStat icon={Clock} label="Tempo médio" value="—" color="blue" />
            <CompactStat icon={CheckCircle2} label="Taxa de aprovação" value="0%" color="emerald" />
            <CompactStat icon={Users} label="Total no pipeline" value={candidatos.length} color="purple" />
            <CompactStat icon={AlertCircle} label="Aguardando ação" value={candidatos.filter((c) => c.status === "Novo").length} color="amber" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
              {ETAPAS.map((etapa) => {
                const cards = candidatos.filter((c) => c.etapa === etapa);
                return (
                  <div
                    key={etapa}
                    className="min-w-0"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const id = e.dataTransfer.getData("text/plain");
                      if (id) moverEtapa(id, etapa);
                    }}
                  >
                    <Card className="bg-muted/30 h-full">
                      <div className="px-2.5 py-2 border-b flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-xs leading-tight break-words whitespace-normal pr-1">{etapa}</h4>
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-4 shrink-0">{cards.length}</Badge>
                      </div>
                      <div className="p-2 space-y-2 min-h-[120px]">
                        {cards.map((c) => (
                          <div
                            key={c.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", c.id)}
                            onClick={() => setCandidatoSel(c)}
                            className="bg-background border rounded p-2 cursor-grab hover:shadow-sm transition-shadow active:cursor-grabbing"
                          >
                            <div className="flex items-center gap-2 mb-1.5 min-w-0">
                              <Avatar className="h-6 w-6 shrink-0"><AvatarFallback className="text-[9px]">{initials(c.nome)}</AvatarFallback></Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-[11px] leading-tight break-words whitespace-normal">{c.nome}</p>
                                <p className="text-[10px] text-muted-foreground leading-tight break-words whitespace-normal mt-0.5">{c.vagaTitulo}</p>
                              </div>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-0.5">
                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                <span className="text-[10px]">{c.avaliacao.toFixed(1)}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className={`max-w-[96px] text-[9px] px-1.5 py-0.5 h-auto text-right whitespace-normal break-words leading-tight ${candBadge(c.status)}`}
                              >
                                {c.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {cards.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4">Vazio</p>}
                      </div>
                    </Card>
                  </div>
                );
              })}
          </div>
        </TabsContent>

        {/* ========== ENTREVISTAS ========== */}
        <TabsContent value="entrevistas" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Agenda de entrevistas</h3>
            <Button onClick={() => setOpenEntrevista(true)}><Plus className="h-4 w-4" /> Agendar entrevista</Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Vaga</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Entrevistador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entrevistas.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8"><AvatarFallback>{initials(e.candidatoNome)}</AvatarFallback></Avatar>
                        {e.candidatoNome}
                      </div>
                    </TableCell>
                    <TableCell>{e.vagaTitulo}</TableCell>
                    <TableCell>{e.data}</TableCell>
                    <TableCell>{e.horario}</TableCell>
                    <TableCell>{e.entrevistador}</TableCell>
                    <TableCell><Badge variant="outline">{e.tipo}</Badge></TableCell>
                    <TableCell><Badge className={entBadge(e.status)}>{e.status}</Badge></TableCell>
                    <TableCell>
                      {e.link ? (
                        <a href={e.link} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                          <Video className="h-3 w-3" /> Acessar
                        </a>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
                {entrevistas.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma entrevista agendada</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ========== PROPOSTAS ========== */}
        <TabsContent value="propostas" className="space-y-4 mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead>Benefícios</TableHead>
                  <TableHead>Envio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propostas.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => setPropostaSel(p)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8"><AvatarFallback>{initials(p.candidatoNome)}</AvatarFallback></Avatar>
                        {p.candidatoNome}
                      </div>
                    </TableCell>
                    <TableCell>{p.cargo}</TableCell>
                    <TableCell className="font-medium">{p.salario}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{p.beneficios}</TableCell>
                    <TableCell>{p.envio}</TableCell>
                    <TableCell><Badge className={propBadge(p.status)}>{p.status}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(ev) => ev.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); setPropostas((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "Enviada" } : x)); toast.success("Proposta enviada"); }}>Enviar</DropdownMenuItem>
                          <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); setPropostas((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "Aceita" } : x)); toast.success("Proposta aprovada"); }}>Aprovar</DropdownMenuItem>
                          <DropdownMenuItem onClick={(ev) => { ev.stopPropagation(); toast.success("Proposta reenviada"); }}>Reenviar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(ev) => {
                            ev.stopPropagation();
                            criarAdmissao({
                              nome: p.candidatoNome, email: "", tipoVinculo: "CLT",
                              departamento: p.departamento, cargo: p.cargo,
                              idioma: "Português - Brasil",
                              prazoEntrega: p.inicio || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                            });
                            adicionarNotificacao({ titulo: "Admissão iniciada", descricao: `${p.candidatoNome} convertido em pré-colaborador`, tipo: "criacao" });
                            toast.success("Convertido em admissão");
                            setTab("admissoes");
                          }}>Converter em admissão</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={(ev) => { ev.stopPropagation(); setPropostas((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "Recusada" } : x)); }}>Cancelar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {propostas.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma proposta</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ========== ADMISSÕES ========== */}
        <TabsContent value="admissoes" className="space-y-4 mt-6">
          {/* Header — Admissão Digital */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-foreground">Admissão Digital</h2>
              <p className="text-sm text-muted-foreground">Inicie ou gerencie o processo de novas admissões de seus candidatos.</p>
            </div>
            <Button onClick={() => setOpenNovaAdm(true)}><Plus className="h-4 w-4" /> Nova Admissão</Button>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={admBusca}
                onChange={(e) => setAdmBusca(e.target.value)}
                placeholder="Pesquise candidato pelo nome"
                className="pl-9"
              />
            </div>
            <Select value={admStatusFiltro} onValueChange={setAdmStatusFiltro}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {(["Convite Enviado","Em andamento","Concluída","Cancelada"] as AdmissaoStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={admDeptFiltro} onValueChange={setAdmDeptFiltro}>
              <SelectTrigger><SelectValue placeholder="Departamento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os departamentos</SelectItem>
                {DEPARTAMENTO_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Iniciada em</TableHead>
                  <TableHead>Prazo de Entrega</TableHead>
                  <TableHead>Status da Admissão</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissoes
                  .filter((a) => {
                    const okBusca = !admBusca || a.nome.toLowerCase().includes(admBusca.toLowerCase());
                    const okStatus = admStatusFiltro === "todos" || a.status === admStatusFiltro;
                    const okDept = admDeptFiltro === "todos" || a.departamento === admDeptFiltro;
                    return okBusca && okStatus && okDept;
                  })
                  .map((a) => (
                    <TableRow key={a.id} className="cursor-pointer" onClick={() => { setAdmissaoSel(a); setOpenAdmissao(true); }}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8"><AvatarFallback>{initials(a.nome)}</AvatarFallback></Avatar>
                          <span className="font-medium">{a.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>{a.departamento}</TableCell>
                      <TableCell>{a.iniciadaEm ? new Date(a.iniciadaEm).toLocaleDateString("pt-BR") : "—"}</TableCell>
                      <TableCell>{a.prazoEntrega ? new Date(a.prazoEntrega).toLocaleDateString("pt-BR") : "—"}</TableCell>
                      <TableCell><Badge className={admBadge(a.status)}>{a.status}</Badge></TableCell>
                      <TableCell onClick={(ev) => ev.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setAdmissaoSel(a); setOpenAdmissao(true); }}>
                              <Eye className="h-4 w-4" /> Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => reenviarConvite(a)}>
                              <Mail className="h-4 w-4" /> Reenviar convite
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => cancelarAdmissao(a.id)}>
                              <X className="h-4 w-4" /> Cancelar admissão
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                {admissoes.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Nenhuma admissão iniciada. Clique em <strong>Nova Admissão</strong> para enviar um convite.
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============= DIALOG: NOVA/EDITAR VAGA ============= */}
      <VagaDialog
        open={openVaga}
        onClose={() => { setOpenVaga(false); setEditingVaga(null); }}
        onSave={salvarVaga}
        editing={editingVaga}
      />

      {/* ============= DIALOG: NOVO CANDIDATO ============= */}
      <CandidatoDialog
        open={openCandidato}
        onClose={() => setOpenCandidato(false)}
        vagas={vagas}
        onSave={(c) => {
          setCandidatos((prev) => [{ ...c, id: `c${Date.now()}` }, ...prev]);
          adicionarNotificacao({ titulo: "Novo candidato", descricao: `${c.nome} foi cadastrado`, tipo: "criacao" });
          toast.success("Candidato cadastrado");
          setOpenCandidato(false);
        }}
      />

      {/* ============= DIALOG: AGENDAR ENTREVISTA ============= */}
      <EntrevistaDialog
        open={openEntrevista}
        onClose={() => setOpenEntrevista(false)}
        candidatos={candidatos}
        onSave={(e) => {
          setEntrevistas((prev) => [{ ...e, id: `e${Date.now()}` }, ...prev]);
          adicionarNotificacao({ titulo: "Entrevista agendada", descricao: `Com ${e.candidatoNome} em ${e.data}`, tipo: "criacao" });
          toast.success("Entrevista agendada");
          setOpenEntrevista(false);
        }}
      />

      {/* ============= SHEET: DETALHES CANDIDATO ============= */}
      <Sheet open={!!candidatoSel} onOpenChange={(o) => !o && setCandidatoSel(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          {candidatoSel && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16"><AvatarFallback className="text-lg">{initials(candidatoSel.nome)}</AvatarFallback></Avatar>
                  <div>
                    <SheetTitle>{candidatoSel.nome}</SheetTitle>
                    <SheetDescription>{candidatoSel.vagaTitulo}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <Button size="sm" onClick={() => aprovarCandidato(candidatoSel)}><CheckCircle2 className="h-4 w-4" /> Aprovar</Button>
                  <Button size="sm" variant="destructive" onClick={() => reprovarCandidato(candidatoSel)}><X className="h-4 w-4" /> Reprovar</Button>
                  {candidatoSel.status === "Aprovado" && (
                    <Button
                      size="sm"
                      variant="default"
                      className="col-span-2"
                      onClick={() => {
                        setNovaAdmInitial({ nome: candidatoSel.nome, email: candidatoSel.email, cargo: candidatoSel.vagaTitulo });
                        setOpenNovaAdm(true);
                        setCandidatoSel(null);
                      }}
                    >
                      <UserPlus className="h-4 w-4" /> Iniciar admissão deste candidato
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setOpenEntrevista(true)}><CalendarDays className="h-4 w-4" /> Agendar entrevista</Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setPropostas((prev) => [{
                      id: `p${Date.now()}`, candidatoId: candidatoSel.id, candidatoNome: candidatoSel.nome,
                      cargo: candidatoSel.vagaTitulo, departamento: "—", salario: "R$ 0", beneficios: "—",
                      envio: new Date().toISOString().slice(0, 10), status: "Em elaboração",
                    }, ...prev]);
                    toast.success("Proposta criada");
                    setTab("propostas");
                    setCandidatoSel(null);
                  }}><FileText className="h-4 w-4" /> Gerar proposta</Button>
                </div>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-sm">Dados pessoais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {candidatoSel.email}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {candidatoSel.telefone}</div>
                    <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> Origem: {candidatoSel.origem}</div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-sm">Avaliação</h4>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} className={`h-5 w-5 ${n <= Math.round(candidatoSel.avaliacao) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    ))}
                    <span className="ml-2 font-semibold">{candidatoSel.avaliacao.toFixed(1)}</span>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-sm">Mover etapa</h4>
                  <Select value={candidatoSel.etapa} onValueChange={(v) => { moverEtapa(candidatoSel.id, v as EtapaPipeline); setCandidatoSel({ ...candidatoSel, etapa: v as EtapaPipeline }); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ETAPAS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-sm">Timeline</h4>
                  <div className="space-y-3">
                    <TimelineItem date={candidatoSel.candidatura} title="Candidatura recebida" desc={`Origem: ${candidatoSel.origem}`} />
                    <TimelineItem date="—" title={`Etapa atual: ${candidatoSel.etapa}`} desc={`Status: ${candidatoSel.status}`} />
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-sm">Anotações internas</h4>
                  <Textarea placeholder="Adicione observações sobre o candidato..." rows={3} />
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ============= DIALOG: NOVA ADMISSÃO ============= */}
      <NovaAdmissaoDialog
        open={openNovaAdm}
        initial={novaAdmInitial}
        onClose={() => { setOpenNovaAdm(false); setNovaAdmInitial(null); }}
        onSave={(input) => { criarAdmissao(input); setOpenNovaAdm(false); setNovaAdmInitial(null); }}
      />

      {/* ============= DIALOG: DETALHES ADMISSÃO (Identificação · Contratação · Documentos) ============= */}
      <AdmissaoDetailDialog
        open={openAdmissao}
        admissao={admissaoSel ? (admissoes.find((a) => a.id === admissaoSel.id) || admissaoSel) : null}
        onClose={() => { setOpenAdmissao(false); setAdmissaoSel(null); }}
        onUpdate={atualizarAdmissao}
        toggleChecklist={toggleChecklist}
      />
      {/* ============= DIALOG: PROPOSTA DETALHE ============= */}
      <Dialog open={!!propostaSel} onOpenChange={(o) => !o && setPropostaSel(null)}>
        <DialogContent className="max-w-2xl">
          {propostaSel && (
            <>
              <DialogHeader>
                <DialogTitle>Proposta · {propostaSel.candidatoNome}</DialogTitle>
                <DialogDescription>{propostaSel.cargo}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Info label="Cargo" value={propostaSel.cargo} icon={Briefcase} />
                <Info label="Departamento" value={propostaSel.departamento} icon={Building2} />
                <Info label="Salário" value={propostaSel.salario} icon={DollarSign} />
                <Info label="Jornada" value={propostaSel.jornada || "—"} icon={Clock} />
                <Info label="Início previsto" value={propostaSel.inicio || "—"} icon={CalendarDays} />
                <Info label="Gestor" value={propostaSel.gestor || "—"} icon={Users} />
                <div className="col-span-2"><Info label="Benefícios" value={propostaSel.beneficios} icon={FileCheck} /></div>
                <div className="col-span-2"><Info label="Status" value={propostaSel.status} icon={AlertCircle} badgeClass={propBadge(propostaSel.status)} /></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============= SUBCOMPONENTS =============
function CompactStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    purple: "bg-purple-100 text-purple-700",
    emerald: "bg-emerald-100 text-emerald-700",
    orange: "bg-orange-100 text-orange-700",
  };
  return (
    <Card className="p-2.5 flex items-center gap-2.5">
      <div className={`p-1.5 rounded-md ${colorMap[color]}`}><Icon className="h-3.5 w-3.5" /></div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight break-words whitespace-normal">{label}</p>
        <p className="text-base font-bold leading-tight mt-0.5">{value}</p>
      </div>
    </Card>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    purple: "bg-purple-100 text-purple-700",
    emerald: "bg-emerald-100 text-emerald-700",
    orange: "bg-orange-100 text-orange-700",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}><Icon className="h-5 w-5" /></div>
      </div>
    </Card>
  );
}

function TimelineItem({ date, title, desc }: { date: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="h-2 w-2 bg-primary rounded-full mt-1.5" />
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="flex-1 pb-3">
        <p className="text-xs text-muted-foreground">{date}</p>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Info({ label, value, icon: Icon, badgeClass }: { label: string; value: string; icon: any; badgeClass?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</p>
      {badgeClass ? <Badge className={`mt-1 ${badgeClass}`}>{value}</Badge> : <p className="font-medium text-sm mt-1">{value}</p>}
    </div>
  );
}

function VagaDialog({ open, onClose, onSave, editing }: { open: boolean; onClose: () => void; onSave: (v: Vaga) => void; editing: Vaga | null }) {
  const empty: Vaga = {
    id: "", titulo: "", area: "", departamento: "", gestor: "", tipoContratacao: "CLT",
    modalidade: "Presencial", localidade: "", posicoes: 1, candidatos: 0, status: "Rascunho",
    abertura: new Date().toISOString().slice(0, 10), senioridade: "Pleno", faixaSalarial: "",
    beneficios: "", descricao: "", requisitos: "", diferenciais: "", sla: "30 dias", dataLimite: "",
  };
  const [form, setForm] = useState<Vaga>(empty);
  // Reset when opening
  useMemo(() => {
    if (open) setForm(editing || empty);
  }, [open, editing]);

  const update = (k: keyof Vaga, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const { cargos } = useCargos();
  const { colaboradores } = useColaboradores();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar vaga" : "Nova vaga"}</DialogTitle>
          <DialogDescription>Preencha os dados do processo seletivo</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <Field label="Título da vaga" full>
            <Input value={form.titulo} onChange={(e) => update("titulo", e.target.value)} placeholder="Ex: Analista Contábil Pleno" />
          </Field>
          <Field label="Área (Cargo)">
            <Select value={form.area} onValueChange={(v) => update("area", v)}>
              <SelectTrigger><SelectValue placeholder={cargos.length ? "Selecione um cargo" : "Nenhum cargo cadastrado"} /></SelectTrigger>
              <SelectContent>
                {cargos.map((c) => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Departamento">
            <Select value={form.departamento} onValueChange={(v) => update("departamento", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione um departamento" /></SelectTrigger>
              <SelectContent>
                {DEPARTAMENTO_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Gestor responsável">
            <Select value={form.gestor} onValueChange={(v) => update("gestor", v)}>
              <SelectTrigger><SelectValue placeholder={colaboradores.length ? "Selecione um colaborador" : "Nenhum colaborador cadastrado"} /></SelectTrigger>
              <SelectContent>
                {colaboradores.map((c) => <SelectItem key={c.id} value={c.nomeCompleto}>{c.nomeCompleto}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Senioridade">
            <Select value={form.senioridade} onValueChange={(v) => update("senioridade", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Estágio","Júnior","Pleno","Sênior","Especialista","Coordenador","Gerente"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tipo de contratação">
            <Select value={form.tipoContratacao} onValueChange={(v) => update("tipoContratacao", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["CLT","PJ","Estágio","Temporário","Aprendiz"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Modalidade">
            <Select value={form.modalidade} onValueChange={(v) => update("modalidade", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Presencial","Remoto","Híbrido"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Localização"><Input value={form.localidade} onChange={(e) => update("localidade", e.target.value)} /></Field>
          <Field label="Faixa salarial"><Input value={form.faixaSalarial} onChange={(e) => update("faixaSalarial", e.target.value)} placeholder="R$ 4.000 - R$ 6.000" /></Field>
          <Field label="Quantidade de vagas"><Input type="number" min={1} value={form.posicoes} onChange={(e) => update("posicoes", Number(e.target.value))} /></Field>
          <Field label="SLA da vaga"><Input value={form.sla} onChange={(e) => update("sla", e.target.value)} placeholder="30 dias" /></Field>
          <Field label="Data limite"><Input type="date" value={form.dataLimite} onChange={(e) => update("dataLimite", e.target.value)} /></Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => update("status", v as VagaStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["Rascunho","Aberta","Em andamento","Pausada","Encerrada","Cancelada"] as VagaStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Benefícios" full><Textarea rows={2} value={form.beneficios} onChange={(e) => update("beneficios", e.target.value)} /></Field>
          <Field label="Descrição da vaga" full><Textarea rows={3} value={form.descricao} onChange={(e) => update("descricao", e.target.value)} /></Field>
          <Field label="Requisitos obrigatórios" full><Textarea rows={2} value={form.requisitos} onChange={(e) => update("requisitos", e.target.value)} /></Field>
          <Field label="Diferenciais" full><Textarea rows={2} value={form.diferenciais} onChange={(e) => update("diferenciais", e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { if (!form.titulo) { toast.error("Título obrigatório"); return; } onSave(form); }}>{editing ? "Salvar" : "Criar vaga"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CandidatoDialog({ open, onClose, vagas, onSave }: { open: boolean; onClose: () => void; vagas: Vaga[]; onSave: (c: Candidato) => void }) {
  const [form, setForm] = useState<Candidato>({
    id: "", nome: "", email: "", telefone: "", vagaId: "", vagaTitulo: "",
    origem: "Site", candidatura: new Date().toISOString().slice(0, 10),
    etapa: "Inscrito", avaliacao: 0, status: "Novo",
  });
  const update = (k: keyof Candidato, v: any) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Novo candidato</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <Field label="Nome completo" full><Input value={form.nome} onChange={(e) => update("nome", e.target.value)} /></Field>
          <Field label="E-mail"><Input value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
          <Field label="Telefone"><Input value={form.telefone} onChange={(e) => update("telefone", e.target.value)} /></Field>
          <Field label="Vaga" full>
            <Select value={form.vagaId} onValueChange={(v) => { const vaga = vagas.find((x) => x.id === v); update("vagaId", v); update("vagaTitulo", vaga?.titulo || ""); }}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{vagas.map((v) => <SelectItem key={v.id} value={v.id}>{v.titulo}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Origem">
            <Select value={form.origem} onValueChange={(v) => update("origem", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Site","LinkedIn","Indicação","Catho","Infojobs","GitHub Jobs","Outro"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Data candidatura"><Input type="date" value={form.candidatura} onChange={(e) => update("candidatura", e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { if (!form.nome || !form.vagaId) { toast.error("Nome e vaga obrigatórios"); return; } onSave(form); }}>Cadastrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EntrevistaDialog({ open, onClose, candidatos, onSave }: { open: boolean; onClose: () => void; candidatos: Candidato[]; onSave: (e: Entrevista) => void }) {
  const [form, setForm] = useState<Entrevista>({
    id: "", candidatoId: "", candidatoNome: "", vagaTitulo: "",
    data: new Date().toISOString().slice(0, 10), horario: "10:00",
    entrevistador: "", tipo: "RH", status: "Agendada",
    modalidade: "Presencial", local: "", link: "", observacoes: "",
  });
  const update = (k: keyof Entrevista, v: any) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Agendar entrevista</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <Field label="Candidato" full>
            <Select value={form.candidatoId} onValueChange={(v) => { const c = candidatos.find((x) => x.id === v); update("candidatoId", v); update("candidatoNome", c?.nome || ""); update("vagaTitulo", c?.vagaTitulo || ""); }}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{candidatos.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome} — {c.vagaTitulo}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Data"><Input type="date" value={form.data} onChange={(e) => update("data", e.target.value)} /></Field>
          <Field label="Horário"><Input type="time" value={form.horario} onChange={(e) => update("horario", e.target.value)} /></Field>
          <Field label="Entrevistador">
            <Select value={form.entrevistador} onValueChange={(v) => update("entrevistador", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {["Todos","Matheus Gabrich","Ana Carolina Braga","Gustavo Cavalcanti","Daniela Nascimento","Sulamita Brás"].map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tipo">
            <Select value={form.tipo} onValueChange={(v) => update("tipo", v as EntrevistaTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(["RH","Técnica","Gestor","Cultural"] as EntrevistaTipo[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Modalidade" full>
            <Select value={form.modalidade} onValueChange={(v) => update("modalidade", v as "Presencial" | "Virtual")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Presencial">Presencial</SelectItem>
                <SelectItem value="Virtual">Virtual</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {form.modalidade === "Presencial" ? (
            <Field label="Local da entrevista" full>
              <Input value={form.local} onChange={(e) => update("local", e.target.value)} placeholder="Ex: Sala 2 — Sede / Av. Paulista, 1000" />
            </Field>
          ) : (
            <Field label="Link da videochamada" full>
              <Input value={form.link} onChange={(e) => update("link", e.target.value)} placeholder="https://meet.google.com/..." />
            </Field>
          )}
          <Field label="Observações" full><Textarea rows={2} value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { if (!form.candidatoId) { toast.error("Selecione um candidato"); return; } onSave(form); }}>Agendar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

// ============= NOVA ADMISSÃO DIALOG =============
function NovaAdmissaoDialog({
  open, onClose, onSave,
}: {
  open: boolean; onClose: () => void;
  onSave: (i: { nome: string; email: string; tipoVinculo: TipoVinculo; departamento: string; cargo: string; idioma: IdiomaConvite; prazoEntrega: string; }) => void;
}) {
  const { cargos } = useCargos();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState<TipoVinculo>("CLT");
  const [departamento, setDepartamento] = useState("");
  const [cargo, setCargo] = useState("");
  const [idioma, setIdioma] = useState<IdiomaConvite>("Português - Brasil");
  const [prazoEntrega, setPrazoEntrega] = useState("");

  useMemo(() => {
    if (open) {
      setNome(""); setEmail(""); setTipoVinculo("CLT"); setDepartamento("");
      setCargo(""); setIdioma("Português - Brasil"); setPrazoEntrega("");
    }
  }, [open]);

  const enviar = () => {
    if (!nome || !email || !tipoVinculo || !departamento || !cargo || !idioma || !prazoEntrega) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    onSave({ nome, email, tipoVinculo, departamento, cargo, idioma, prazoEntrega });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Admissão</DialogTitle>
          <DialogDescription>
            Envie um convite para o candidato preencher seus dados e documentos pessoais.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <Field label="Nome*"><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" /></Field>
          <Field label="E-mail pessoal*"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@dominio.com" /></Field>
          <Field label="Tipo de vínculo*">
            <Select value={tipoVinculo} onValueChange={(v) => setTipoVinculo(v as TipoVinculo)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {(["CLT","PJ","Estágio","Temporário","Aprendiz"] as TipoVinculo[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Departamento*">
            <Select value={departamento} onValueChange={setDepartamento}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {DEPARTAMENTO_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cargo*">
            <Select value={cargo} onValueChange={setCargo}>
              <SelectTrigger><SelectValue placeholder={cargos.length ? "Selecione" : "Nenhum cargo cadastrado"} /></SelectTrigger>
              <SelectContent>
                {cargos.map((c) => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Idioma do Convite*">
            <Select value={idioma} onValueChange={(v) => setIdioma(v as IdiomaConvite)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Português - Brasil">Português - Brasil</SelectItem>
                <SelectItem value="Espanhol">Espanhol</SelectItem>
                <SelectItem value="Inglês">Inglês</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Prazo de Entrega*" full>
            <Input type="date" value={prazoEntrega} onChange={(e) => setPrazoEntrega(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={enviar}><Mail className="h-4 w-4" /> Enviar convite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= DETALHES ADMISSÃO DIALOG =============
function AdmissaoDetailDialog({
  open, admissao, onClose, onUpdate, toggleChecklist,
}: {
  open: boolean;
  admissao: Admissao | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Admissao>) => void;
  toggleChecklist: (id: string, idx: number) => void;
}) {
  const [activeTab, setActiveTab] = useState("identificacao");
  const [linkLoading, setLinkLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  if (!admissao) return null;
  const adm = admissao;
  const set = (patch: Partial<Admissao>) => onUpdate(adm.id, patch);
  const done = adm.checklist.filter((c) => c.ok).length;
  const pct = Math.round((done / adm.checklist.length) * 100);

  const linkUrl = adm.linkToken ? `${window.location.origin}/admissao/${adm.linkToken}` : "";

  const gerarLink = async () => {
    setLinkLoading(true);
    const { data, error } = await supabase
      .from("admissao_links")
      .insert({
        admissao_id: adm.id,
        nome: adm.nome,
        email: adm.email,
        cargo: adm.cargo,
        departamento: adm.departamento,
        tipo_vinculo: adm.tipoVinculo,
        prazo_entrega: adm.prazoEntrega || null,
        documentos: (adm.documentos || []) as any,
      })
      .select("token, status")
      .single();
    setLinkLoading(false);
    if (error || !data) {
      toast.error("Erro ao gerar link");
      return;
    }
    set({ linkToken: data.token, linkStatus: data.status as any });
    toast.success("Link gerado");
  };

  const sincronizar = async () => {
    if (!adm.linkToken) return;
    setSyncing(true);
    const { data, error } = await supabase
      .from("admissao_links")
      .select("status, dados, documentos, acessado_em, concluido_em")
      .eq("token", adm.linkToken)
      .maybeSingle();
    setSyncing(false);
    if (error || !data) {
      toast.error("Não foi possível sincronizar");
      return;
    }
    const dados = (data.dados as any) || {};
    const docs = (data.documentos as any) || [];
    set({
      linkStatus: data.status as any,
      linkAcessadoEm: data.acessado_em || undefined,
      linkConcluidoEm: data.concluido_em || undefined,
      ...dados,
      documentos: docs.length > 0 ? docs : adm.documentos,
    });
    toast.success("Dados sincronizados");
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkUrl);
    toast.success("Link copiado");
  };

  const linkStatusLabel: Record<string, { txt: string; cls: string }> = {
    nao_acessado: { txt: "Não acessado", cls: "bg-slate-100 text-slate-700" },
    em_preenchimento: { txt: "Em preenchimento", cls: "bg-amber-100 text-amber-700" },
    concluido: { txt: "Concluído pelo candidato", cls: "bg-emerald-100 text-emerald-700" },
    expirado: { txt: "Expirado", cls: "bg-red-100 text-red-700" },
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12"><AvatarFallback>{initials(adm.nome)}</AvatarFallback></Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl">{adm.nome}</DialogTitle>
              <DialogDescription>{adm.cargo} · {adm.departamento} · <Badge className={admBadge(adm.status)}>{adm.status}</Badge></DialogDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{pct}%</div>
              <p className="text-xs text-muted-foreground">{done}/{adm.checklist.length} concluídos</p>
            </div>
          </div>
          <Progress value={pct} className="h-2 mt-2" />
        </DialogHeader>

        {/* ===== LINK PÚBLICO PARA O CANDIDATO ===== */}
        <Card className="p-4 bg-muted/30 border-dashed">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Link de preenchimento do candidato</h3>
              {adm.linkStatus && (
                <Badge className={linkStatusLabel[adm.linkStatus]?.cls || ""}>
                  {linkStatusLabel[adm.linkStatus]?.txt || adm.linkStatus}
                </Badge>
              )}
            </div>
            {!adm.linkToken ? (
              <Button size="sm" onClick={gerarLink} disabled={linkLoading}>
                {linkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Link2 className="h-3.5 w-3.5 mr-1" />}
                Gerar link
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={sincronizar} disabled={syncing}>
                {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
                Atualizar
              </Button>
            )}
          </div>
          {adm.linkToken && (
            <div className="flex items-center gap-2 mt-3">
              <Input value={linkUrl} readOnly className="text-xs font-mono" />
              <Button size="sm" variant="outline" onClick={copiarLink}>
                <Copy className="h-3.5 w-3.5 mr-1" /> Copiar
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href={linkUrl} target="_blank" rel="noreferrer"><Eye className="h-3.5 w-3.5 mr-1" /> Abrir</a>
              </Button>
            </div>
          )}
          {adm.linkAcessadoEm && (
            <p className="text-xs text-muted-foreground mt-2">
              Acessado em {new Date(adm.linkAcessadoEm).toLocaleString("pt-BR")}
              {adm.linkConcluidoEm ? ` · Concluído em ${new Date(adm.linkConcluidoEm).toLocaleString("pt-BR")}` : ""}
            </p>
          )}
        </Card>


        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList>
            <TabsTrigger value="identificacao"><FileText className="h-4 w-4" /> Identificação</TabsTrigger>
            <TabsTrigger value="contratacao"><Briefcase className="h-4 w-4" /> Contratação</TabsTrigger>
            <TabsTrigger value="documentos"><FileCheck className="h-4 w-4" /> Documentos</TabsTrigger>
          </TabsList>

          {/* ===== IDENTIFICAÇÃO ===== */}
          <TabsContent value="identificacao" className="mt-4 space-y-6">
            <section>
              <h3 className="font-semibold mb-3">Dados pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Nome Completo *"><Input value={adm.nomeCompleto || ""} onChange={(e) => set({ nomeCompleto: e.target.value })} /></Field>
                <Field label="Nome visível *"><Input value={adm.nomeVisivel || ""} onChange={(e) => set({ nomeVisivel: e.target.value })} /></Field>
                <Field label="E-mail pessoal"><Input value={adm.email || ""} onChange={(e) => set({ email: e.target.value })} /></Field>
                <Field label="Celular"><Input value={adm.celular || ""} onChange={(e) => set({ celular: e.target.value })} placeholder="(99) 9 9999-9999" /></Field>
                <Field label="CPF"><Input value={adm.cpf || ""} onChange={(e) => set({ cpf: e.target.value })} /></Field>
                <Field label="Nome da Mãe"><Input value={adm.nomeMae || ""} onChange={(e) => set({ nomeMae: e.target.value })} /></Field>
                <Field label="RG"><Input value={adm.rg || ""} onChange={(e) => set({ rg: e.target.value })} /></Field>
                <Field label="UF do RG"><Input value={adm.ufRg || ""} onChange={(e) => set({ ufRg: e.target.value })} maxLength={2} /></Field>
                <Field label="Sexo">
                  <Select value={adm.sexo || ""} onValueChange={(v) => set({ sexo: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{["Masculino","Feminino"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Gênero">
                  <Select value={adm.genero || ""} onValueChange={(v) => set({ genero: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{["Homem cis","Mulher cis","Homem trans","Mulher trans","Não-binário","Outro","Prefiro não informar"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Etnia">
                  <Select value={adm.etnia || ""} onValueChange={(v) => set({ etnia: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{["Branca","Preta","Parda","Amarela","Indígena","Prefiro não informar"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Sexualidade">
                  <Select value={adm.sexualidade || ""} onValueChange={(v) => set({ sexualidade: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{["Heterossexual","Homossexual","Bissexual","Outra","Prefiro não informar"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Grau de Instrução">
                  <Select value={adm.grauInstrucao || ""} onValueChange={(v) => set({ grauInstrucao: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{["Fundamental incompleto","Fundamental completo","Médio incompleto","Médio completo","Superior incompleto","Superior completo","Pós-graduação","Mestrado","Doutorado"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">Contato de emergência</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Tipo do Contato">
                  <Select value={adm.emergTipo || ""} onValueChange={(v) => set({ emergTipo: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{["Cônjuge","Pai","Mãe","Filho(a)","Irmão(ã)","Amigo(a)","Outro"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Nome do Contato"><Input value={adm.emergNome || ""} onChange={(e) => set({ emergNome: e.target.value })} /></Field>
                <Field label="Telefone do Contato"><Input value={adm.emergTelefone || ""} onChange={(e) => set({ emergTelefone: e.target.value })} placeholder="(99) 9 9999-9999" /></Field>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">Residência</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="CEP"><Input value={adm.cep || ""} onChange={(e) => set({ cep: e.target.value })} placeholder="99999-999" /></Field>
                <Field label="Endereço"><Input value={adm.endereco || ""} onChange={(e) => set({ endereco: e.target.value })} /></Field>
                <Field label="Número"><Input value={adm.numero || ""} onChange={(e) => set({ numero: e.target.value })} /></Field>
                <Field label="Complemento"><Input value={adm.complemento || ""} onChange={(e) => set({ complemento: e.target.value })} /></Field>
                <Field label="Bairro"><Input value={adm.bairro || ""} onChange={(e) => set({ bairro: e.target.value })} /></Field>
                <Field label="Município"><Input value={adm.municipio || ""} onChange={(e) => set({ municipio: e.target.value })} /></Field>
                <Field label="UF"><Input value={adm.uf || ""} onChange={(e) => set({ uf: e.target.value })} maxLength={2} /></Field>
              </div>
            </section>
          </TabsContent>

          {/* ===== CONTRATAÇÃO ===== */}
          <TabsContent value="contratacao" className="mt-4 space-y-6">
            <section>
              <h3 className="font-semibold mb-3">CLT - Celetista</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Field label="Número da CTPS"><Input value={adm.ctps || ""} onChange={(e) => set({ ctps: e.target.value })} /></Field>
                <Field label="Série da CTPS"><Input value={adm.ctpsSerie || ""} onChange={(e) => set({ ctpsSerie: e.target.value })} /></Field>
                <Field label="Primeiro emprego?">
                  <Select value={adm.primeiroEmprego || ""} onValueChange={(v) => set({ primeiroEmprego: v as "Sim" | "Não" })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Não">Não</SelectItem></SelectContent>
                  </Select>
                </Field>
                <Field label="PIS/PASEP"><Input value={adm.pisPasep || ""} onChange={(e) => set({ pisPasep: e.target.value })} /></Field>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">PJ - Pessoa Jurídica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Razão social"><Input value={adm.razaoSocial || ""} onChange={(e) => set({ razaoSocial: e.target.value })} /></Field>
                <Field label="CNPJ"><Input value={adm.cnpj || ""} onChange={(e) => set({ cnpj: e.target.value })} /></Field>
                <Field label="Nome fantasia"><Input value={adm.nomeFantasia || ""} onChange={(e) => set({ nomeFantasia: e.target.value })} /></Field>
                <Field label="Inscrição Municipal"><Input value={adm.inscricaoMunicipal || ""} onChange={(e) => set({ inscricaoMunicipal: e.target.value })} /></Field>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-3">Dados Bancários</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Banco"><Input value={adm.banco || ""} onChange={(e) => set({ banco: e.target.value })} /></Field>
                <Field label="Tipo de Conta">
                  <Select value={adm.tipoConta || ""} onValueChange={(v) => set({ tipoConta: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{["Conta Corrente","Conta Poupança","Conta Salário"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <div />
                <Field label="Número da Conta"><Input value={adm.numeroConta || ""} onChange={(e) => set({ numeroConta: e.target.value })} /></Field>
                <Field label="Dígito (Conta)"><Input value={adm.digitoConta || ""} onChange={(e) => set({ digitoConta: e.target.value })} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nº da Agência"><Input value={adm.numeroAgencia || ""} onChange={(e) => set({ numeroAgencia: e.target.value })} /></Field>
                  <Field label="Dígito"><Input value={adm.digitoAgencia || ""} onChange={(e) => set({ digitoAgencia: e.target.value })} /></Field>
                </div>
                <div className="md:col-span-3">
                  <Field label="Chave Pix" full><Input value={adm.chavePix || ""} onChange={(e) => set({ chavePix: e.target.value })} placeholder="Nº da chave pix de qualquer banco" /></Field>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* ===== DOCUMENTOS ===== */}
          <TabsContent value="documentos" className="mt-4 space-y-4">
            <div>
              <h3 className="font-semibold">Documentos Pessoais</h3>
              <p className="text-sm text-muted-foreground">Documentos anexados ao cadastro do colaborador.</p>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Documento</TableHead>
                    <TableHead>Última Alteração</TableHead>
                    <TableHead>Enviado por</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(adm.documentos || []).map((d, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="font-medium text-sm">{d.tipo}</div>
                            {!d.fileName && <Badge variant="outline" className="bg-red-50 text-red-700 mt-1">Nenhum Arquivo</Badge>}
                            {d.fileName && <span className="text-xs text-muted-foreground">{d.fileName}</span>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{d.uploadedAt || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{d.uploadedBy || "—"}</TableCell>
                      <TableCell className="text-right">
                        <label className="inline-flex">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const docs = [...(adm.documentos || [])];
                              docs[i] = { ...docs[i], fileName: f.name, uploadedAt: new Date().toLocaleDateString("pt-BR"), uploadedBy: "RH" };
                              set({ documentos: docs });
                              toast.success(`Arquivo "${f.name}" enviado`);
                            }}
                          />
                          <Button size="sm" variant="outline" asChild>
                            <span className="cursor-pointer"><Upload className="h-3.5 w-3.5" /> Enviar</span>
                          </Button>
                        </label>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <section className="pt-4">
              <h3 className="font-semibold mb-3">Checklist de admissão</h3>
              <div className="space-y-2">
                {adm.checklist.map((ci, i) => (
                  <label key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                    <Checkbox checked={ci.ok} onCheckedChange={() => toggleChecklist(adm.id, i)} />
                    <span className={`text-sm flex-1 ${ci.ok ? "line-through text-muted-foreground" : ""}`}>{ci.item}</span>
                    {ci.ok && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </label>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={() => { toast.success("Admissão salva"); onClose(); }}>Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
