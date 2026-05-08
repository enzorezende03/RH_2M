import { useMemo, useState } from "react";
import {
  Plus, Search, Briefcase, Users, CalendarDays, CheckCircle2, UserPlus,
  Filter, MoreHorizontal, Star, Clock, FileText, Mail, Phone, MapPin,
  TrendingUp, Award, AlertCircle, Eye, Edit, Copy, Archive, X,
  ChevronRight, Video, Upload, FileCheck, Building2, DollarSign,
} from "lucide-react";
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
type AdmissaoStatus = "Pendente" | "Em andamento" | "Aguardando documentos" | "Em conferência" | "Aprovada" | "Finalizada";

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
  cargo: string;
  departamento: string;
  inicio: string;
  responsavel: string;
  status: AdmissaoStatus;
  checklist: { item: string; ok: boolean }[];
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
  Pendente: "bg-muted text-muted-foreground",
  "Em andamento": "bg-blue-100 text-blue-700",
  "Aguardando documentos": "bg-amber-100 text-amber-700",
  "Em conferência": "bg-purple-100 text-purple-700",
  Aprovada: "bg-emerald-100 text-emerald-700",
  Finalizada: "bg-emerald-100 text-emerald-700",
}[s]);

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

  // Métricas
  const stats = useMemo(() => ({
    vagasAbertas: vagas.filter((v) => v.status === "Aberta" || v.status === "Em andamento").length,
    candidatosProc: candidatos.filter((c) => c.status !== "Aprovado" && c.status !== "Reprovado").length,
    entAgendadas: entrevistas.filter((e) => e.status === "Agendada" || e.status === "Confirmada").length,
    aprovados: candidatos.filter((c) => c.status === "Aprovado").length,
    admPend: admissoes.filter((a) => a.status !== "Finalizada").length,
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

  const aprovarCandidato = (c: Candidato) => {
    moverEtapa(c.id, "Aprovado");
    // cria pré-admissão
    if (!admissoes.some((a) => a.nome === c.nome)) {
      setAdmissoes((prev) => [{
        id: `a${Date.now()}`, nome: c.nome, cargo: c.vagaTitulo, departamento: "—",
        inicio: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), responsavel: "RH",
        status: "Pendente",
        checklist: [
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
        ],
      }, ...prev]);
      adicionarNotificacao({ titulo: "Pré-colaborador criado", descricao: `${c.nome} entrou na fila de admissão`, tipo: "criacao" });
    }
    toast.success(`${c.nome} aprovado e enviado para admissão`);
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
      if (done === cl.length) status = "Finalizada";
      else if (done === 0) status = "Pendente";
      else status = "Em andamento";
      return { ...a, checklist: cl, status };
    }));
  };

  // ============= RENDER =============
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Recrutamento e Seleção</h1>
          <p className="text-muted-foreground">Processos de recrutamento, seleção e admissão</p>
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
                            setAdmissoes((prev) => [{
                              id: `a${Date.now()}`, nome: p.candidatoNome, cargo: p.cargo, departamento: p.departamento,
                              inicio: p.inicio || "", responsavel: "RH", status: "Em andamento",
                              checklist: CHECKLIST_PADRAO.map((c) => ({ ...c })),
                            }, ...prev]);
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
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Pendências</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissoes.map((a) => {
                  const done = a.checklist.filter((c) => c.ok).length;
                  const pct = Math.round((done / a.checklist.length) * 100);
                  const pend = a.checklist.length - done;
                  return (
                    <TableRow key={a.id} className="cursor-pointer" onClick={() => { setAdmissaoSel(a); setOpenAdmissao(true); }}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8"><AvatarFallback>{initials(a.nome)}</AvatarFallback></Avatar>
                          {a.nome}
                        </div>
                      </TableCell>
                      <TableCell>{a.cargo}</TableCell>
                      <TableCell>{a.departamento}</TableCell>
                      <TableCell>{a.inicio}</TableCell>
                      <TableCell>{a.responsavel}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="text-xs font-medium w-8">{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{pend > 0 ? <Badge variant="outline" className="bg-amber-100 text-amber-700">{pend}</Badge> : <Badge className="bg-emerald-100 text-emerald-700">0</Badge>}</TableCell>
                      <TableCell><Badge className={admBadge(a.status)}>{a.status}</Badge></TableCell>
                    </TableRow>
                  );
                })}
                {admissoes.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma admissão em andamento</TableCell></TableRow>
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

      {/* ============= SHEET: DETALHES ADMISSÃO ============= */}
      <Sheet open={openAdmissao} onOpenChange={(o) => { if (!o) { setOpenAdmissao(false); setAdmissaoSel(null); } }}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          {admissaoSel && (() => {
            const adm = admissoes.find((a) => a.id === admissaoSel.id) || admissaoSel;
            const done = adm.checklist.filter((c) => c.ok).length;
            const pct = Math.round((done / adm.checklist.length) * 100);
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{adm.nome}</SheetTitle>
                  <SheetDescription>{adm.cargo} · {adm.departamento}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Progresso da admissão</h4>
                      <span className="text-2xl font-bold">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">{done} de {adm.checklist.length} itens concluídos</p>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 text-sm">Checklist de admissão</h4>
                    <div className="space-y-2">
                      {adm.checklist.map((ci, i) => (
                        <label key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                          <Checkbox checked={ci.ok} onCheckedChange={() => toggleChecklist(adm.id, i)} />
                          <span className={`text-sm flex-1 ${ci.ok ? "line-through text-muted-foreground" : ""}`}>{ci.item}</span>
                          {ci.ok && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                        </label>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 text-sm flex items-center gap-2"><Upload className="h-4 w-4" /> Documentos</h4>
                    <Button variant="outline" className="w-full"><Upload className="h-4 w-4" /> Enviar documento</Button>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 text-sm">Informações</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-muted-foreground text-xs">Início</p><p className="font-medium">{adm.inicio}</p></div>
                      <div><p className="text-muted-foreground text-xs">Responsável RH</p><p className="font-medium">{adm.responsavel}</p></div>
                      <div><p className="text-muted-foreground text-xs">Status</p><Badge className={admBadge(adm.status)}>{adm.status}</Badge></div>
                    </div>
                  </Card>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

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
    entrevistador: "", tipo: "RH", status: "Agendada", link: "", observacoes: "",
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
          <Field label="Entrevistador"><Input value={form.entrevistador} onChange={(e) => update("entrevistador", e.target.value)} /></Field>
          <Field label="Tipo">
            <Select value={form.tipo} onValueChange={(v) => update("tipo", v as EntrevistaTipo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{(["RH","Técnica","Gestor","Cultural"] as EntrevistaTipo[]).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Link da reunião" full><Input value={form.link} onChange={(e) => update("link", e.target.value)} placeholder="https://meet.google.com/..." /></Field>
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
