import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  FileText,
  Calculator,
  Upload,
  FileSpreadsheet,
  ClipboardEdit,
  CalendarDays,
  ArrowUpDown,
  Info,
} from "lucide-react";
import { useColaboradores } from "@/stores/colaboradoresStore";
import ImportadorPage from "@/components/ImportadorPage";
import templateSaldo from "@/assets/importador_config_saldo_ferias.xlsx.asset.json";
import templateSolicitacoes from "@/assets/importador_ferias_e_recesso.xlsx.asset.json";

type Etapa = "Análise Gestor" | "Análise RH" | "Documentação" | "Reprovada" | "Concluída" | "Cancelada";

interface Solicitacao {
  id: string;
  colaborador: string;
  cargo: string;
  gestor: string;
  dataSolicitacao: string;
  inicio: string;
  fim: string;
  etapa: Etapa;
}

const MOCK: Solicitacao[] = [
  { id: "1", colaborador: "ERICK VINICIOS BORGES PIRES", cargo: "Auxiliar", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "04/10/2023", fim: "13/10/2023", etapa: "Concluída" },
  { id: "2", colaborador: "JAMILA SILVEIRA COSTA", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "3", colaborador: "JESSYCA LOPES", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "4", colaborador: "DANIELLE CAMPOS MILLIOR", cargo: "ANALISTA III - Step 2", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "5", colaborador: "LIVIA GARCIA XAVIER", cargo: "Analista III", gestor: "ANA CAROLINA BRAGA DE MOURA", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
];

const etapaCor: Record<Etapa, string> = {
  "Análise Gestor": "bg-orange-100 text-orange-700 hover:bg-orange-100",
  "Análise RH": "bg-blue-100 text-blue-700 hover:bg-blue-100",
  Documentação: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Reprovada: "bg-red-100 text-red-700 hover:bg-red-100",
  Concluída: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Cancelada: "bg-gray-200 text-gray-700 hover:bg-gray-200",
};

const DICAS_SALDO = [
  { titulo: "A. E-mail (Obrigatório)", conteudo: "Nesta coluna, coloca-se o e-mail do colaborador." },
  { titulo: "B. Início do primeiro período aquisitivo (Obrigatório)", conteudo: "A data de início do primeiro período aquisitivo do colaborador.\nExemplo: 19/08/2024" },
  { titulo: "C. Tipo de vínculo", conteudo: "Nesta coluna, os itens possíveis são:\n• CLT\n• PJ\n• Estágio\n• Sócio\n• Cooperado\n• Jovem Aprendiz\n• Freelancer" },
];

const DICAS_SOLICITACOES = [
  { titulo: "A. Identificador (Obrigatório)", conteudo: "Nessa coluna, coloca-se o identificador do colaborador cadastrado na plataforma (E-mail ou CPF)." },
  { titulo: "B. Data de início das férias/recesso/descanso (Obrigatório)", conteudo: "Data de início das férias/recesso/descanso.\nExemplo: 19/08/2024" },
  { titulo: "C. Data fim das férias/recesso/descanso (Obrigatório)", conteudo: "Data fim das férias/recesso/descanso.\nExemplo: 19/08/2024" },
  { titulo: "D. Dias vendidos", conteudo: "Número de dias vendidos.\nCampo opcional." },
  { titulo: "E. Adiantamento 13º", conteudo: "Se na solicitação foi feito adiantamento do 13º salário.\nCampo opcional.\nPor padrão receberá o valor 'Não'." },
];

type ImportView = "none" | "saldo" | "solicitacoes";

export default function FeriasRecessoRH() {
  const { colaboradores } = useColaboradores();
  const [tab, setTab] = useState("solicitacoes");
  const [etapaFiltro, setEtapaFiltro] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [gestorFiltro, setGestorFiltro] = useState("todos");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  // Importação
  const [importView, setImportView] = useState<ImportView>("none");

  // Criar solicitação - dialog em 3 etapas
  const [criarOpen, setCriarOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [colabSel, setColabSel] = useState<string>("");
  const [periodoVinc, setPeriodoVinc] = useState<string>("28/01/2026 - 27/01/2027 (30 dias disponíveis)");
  const [criarComoConcluida, setCriarComoConcluida] = useState(false);
  const [recessoInicio, setRecessoInicio] = useState("");
  const [recessoFim, setRecessoFim] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const gestores = useMemo(() => {
    const set = new Set<string>();
    colaboradores.forEach((c) => {
      if (c.gestorDireto) set.add(c.gestorDireto);
    });
    MOCK.forEach((s) => {
      if (s.gestor) set.add(s.gestor);
    });
    return Array.from(set).sort();
  }, [colaboradores]);

  const [verItem, setVerItem] = useState<Solicitacao | null>(null);
  const [verVende, setVerVende] = useState<"nao" | "sim">("nao");
  const [verAdianta, setVerAdianta] = useState<"nao" | "sim">("nao");
  const [verObs, setVerObs] = useState("ajuste");

  // Saldos
  const [saldoSub, setSaldoSub] = useState<"todos" | "dobro" | "v1" | "v30" | "v60">("todos");
  const [saldoBusca, setSaldoBusca] = useState("");
  const [saldoGestor, setSaldoGestor] = useState("todos");
  const [saldoStatus, setSaldoStatus] = useState<"tudo" | "incompleto">("tudo");
  const [saldoPage, setSaldoPage] = useState(1);
  const saldoPerPage = 10;
  const [saldoDetalhes, setSaldoDetalhes] = useState<any | null>(null);
  const [saldoDetTab, setSaldoDetTab] = useState<"aberto" | "concluidos">("aberto");
  const [visualizacaoSaldo, setVisualizacaoSaldo] = useState(true);

  const saldos = useMemo(() => {
    return colaboradores.map((c, i) => {
      const saldo = [16, 5, 11, 16, 16, 10, 15, 11, 16, 11, 30, 22, 18][i % 13];
      const aVencer = 15 + (i * 11) % 120;
      const incompleto = i % 7 === 0;
      return {
        id: c.id,
        nome: c.nomeCompleto,
        cargo: c.cargo,
        gestor: c.gestorDireto || "—",
        gestorCargo: c.gestorCargo || "",
        vinculo: "CLT",
        periodo: "2024/2025",
        saldo,
        dataLimite: "15/10/2026",
        aVencer,
        admissao: "01/11/2010",
        inicio1Periodo: "01/11/2022",
        incompleto,
      };
    });
  }, [colaboradores]);

  const saldosIncompletos = saldos.filter((s) => s.incompleto).length;

  const saldosFiltrados = useMemo(() => {
    return saldos.filter((s) => {
      if (saldoBusca && !s.nome.toLowerCase().includes(saldoBusca.toLowerCase())) return false;
      if (saldoGestor !== "todos" && s.gestor !== saldoGestor) return false;
      if (saldoStatus === "incompleto" && !s.incompleto) return false;
      if (saldoSub === "dobro" && s.saldo < 30) return false;
      if (saldoSub === "v1" && (s.aVencer < 1 || s.aVencer > 29)) return false;
      if (saldoSub === "v30" && (s.aVencer < 30 || s.aVencer > 59)) return false;
      if (saldoSub === "v60" && (s.aVencer < 60 || s.aVencer > 90)) return false;
      return true;
    });
  }, [saldos, saldoBusca, saldoGestor, saldoStatus, saldoSub]);

  const saldoTotalPages = Math.max(1, Math.ceil(saldosFiltrados.length / saldoPerPage));
  const saldoPageItems = saldosFiltrados.slice((saldoPage - 1) * saldoPerPage, saldoPage * saldoPerPage);

  const saldoSubs = [
    { key: "todos", label: "Todos" },
    { key: "dobro", label: "Em dobro" },
    { key: "v1", label: "A vencer 1 a 29 dias" },
    { key: "v30", label: "A vencer 30 a 59 dias" },
    { key: "v60", label: "A vencer 60 a 90 dias" },
  ] as const;

  const counts = useMemo(() => {
    return { todas: MOCK.length, "Análise Gestor": 3, "Análise RH": 13, Documentação: 1, Reprovada: 24, Concluída: 156, Cancelada: 56 } as Record<string, number>;
  }, []);

  const filtrada = useMemo(() => {
    return MOCK.filter((s) => {
      if (etapaFiltro !== "todas" && s.etapa !== etapaFiltro) return false;
      if (busca && !s.colaborador.toLowerCase().includes(busca.toLowerCase())) return false;
      if (gestorFiltro && gestorFiltro !== "todos" && s.gestor !== gestorFiltro) return false;
      return true;
    });
  }, [etapaFiltro, busca, gestorFiltro]);

  const totalPages = Math.max(1, Math.ceil(filtrada.length / perPage));
  const pageItems = filtrada.slice((page - 1) * perPage, page * perPage);

  const etapas: { key: string; label: string }[] = [
    { key: "todas", label: `Todas (${counts.todas})` },
    { key: "Análise Gestor", label: `Análise Gestor (${counts["Análise Gestor"]})` },
    { key: "Análise RH", label: `Análise RH (${counts["Análise RH"]})` },
    { key: "Documentação", label: `Documentação (${counts.Documentação})` },
    { key: "Reprovada", label: `Reprovada (${counts.Reprovada})` },
    { key: "Concluída", label: `Concluída (${counts.Concluída})` },
    { key: "Cancelada", label: `Cancelada (${counts.Cancelada})` },
  ];

  const colabSelObj = colaboradores.find((c) => c.id === colabSel);
  const gestorDoColab = colabSelObj?.gestorDireto;

  function resetCriar() {
    setStep(1);
    setColabSel("");
    setCriarComoConcluida(false);
    setRecessoInicio("");
    setRecessoFim("");
    setObservacoes("");
  }

  function fecharCriar() {
    setCriarOpen(false);
    setTimeout(resetCriar, 200);
  }

  const podeSolicitar = recessoInicio && recessoFim;

  if (importView === "saldo") {
    return (
      <ImportadorPage
        titulo="Importar dados em massa para cálculo de saldo de Férias/Recesso"
        descricao="Este importador faz o cadastro das datas do 1° período aquisitivo para calcular saldo de Férias/Recesso."
        dicas={DICAS_SALDO}
        onBack={() => setImportView("none")}
        templateUrl={templateSaldo.url}
      />
    );
  }

  if (importView === "solicitacoes") {
    return (
      <ImportadorPage
        titulo="Importador de solicitações de Férias & Recesso"
        descricao="Ao importar as solicitações de períodos históricos, vigentes ou agendamentos futuros, serão considerados tipo de vínculo e gestor atuais do colaborador."
        dicas={DICAS_SOLICITACOES}
        onBack={() => setImportView("none")}
        templateUrl={templateSolicitacoes.url}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Férias & Recesso</h1>
            <p className="text-sm text-muted-foreground">Gerencie as solicitações de férias dos colaboradores.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => { resetCriar(); setCriarOpen(true); }}>Criar solicitação</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Importar <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setImportView("saldo")}>
                  Importar dados em massa para cálculo de saldo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setImportView("solicitacoes")}>
                  Importar solicitações de férias e recesso
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="solicitacoes" className="gap-2">
              <FileText className="h-4 w-4" /> Solicitações
            </TabsTrigger>
            <TabsTrigger value="saldos" className="gap-2">
              <Calculator className="h-4 w-4" /> Saldos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solicitacoes" className="mt-4 space-y-4">
            <div className="flex items-center gap-3 border-b pb-2 overflow-x-auto">
              {etapas.map((e) => (
                <button
                  key={e.key}
                  onClick={() => { setEtapaFiltro(e.key); setPage(1); }}
                  className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors ${
                    etapaFiltro === e.key ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquise colaboradores pelo nome" className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              <Select value={gestorFiltro} onValueChange={setGestorFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o gestor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os gestores</SelectItem>
                  {gestores.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Gestor Direto</TableHead>
                  <TableHead>Data da Solicitação</TableHead>
                  <TableHead>Período Solicitado</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-muted-foreground"><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-semibold">{s.colaborador}</div>
                          <div className="text-xs text-muted-foreground">{s.cargo}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{s.gestor}</TableCell>
                    <TableCell className="text-sm">{s.dataSolicitacao}</TableCell>
                    <TableCell className="text-sm">
                      <div><span className="font-semibold">De:</span> {s.inicio}</div>
                      <div><span className="font-semibold">Até:</span> {s.fim}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={etapaCor[s.etapa]} variant="secondary">{s.etapa}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setVerItem(s); setVerVende("nao"); setVerAdianta("nao"); setVerObs("ajuste"); }}>
                        {(s.etapa === "Análise Gestor" || s.etapa === "Análise RH" || s.etapa === "Documentação")
                          ? <ClipboardEdit className="h-4 w-4 text-primary" />
                          : <Eye className="h-4 w-4 text-primary" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Itens por página:</span>
                <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50].map((n) => (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>{filtrada.length === 0 ? 0 : (page - 1) * perPage + 1} - {Math.min(page * perPage, filtrada.length)} de {filtrada.length} itens</div>
              <div className="flex items-center gap-2">
                <span>{page} de {totalPages} páginas</span>
                <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saldos" className="mt-4 space-y-4">
            {saldosIncompletos > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                <div className="flex items-center gap-2 text-amber-900">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Você possui <strong>{saldosIncompletos} colaboradores</strong> com cadastro incompleto para cálculo de saldos.
                </div>
                <button
                  className="text-primary text-sm font-medium hover:underline"
                  onClick={() => { setSaldoStatus("incompleto"); setSaldoPage(1); }}
                >
                  Filtrar lista
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 border-b pb-2 overflow-x-auto">
              {saldoSubs.map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setSaldoSub(s.key); setSaldoPage(1); }}
                  className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors ${
                    saldoSub === s.key ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquise colaboradores pelo nome" className="pl-9" value={saldoBusca} onChange={(e) => setSaldoBusca(e.target.value)} />
              </div>
              <Select value={saldoGestor} onValueChange={setSaldoGestor}>
                <SelectTrigger><SelectValue placeholder="Selecione o gestor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os gestores</SelectItem>
                  {gestores.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={saldoStatus} onValueChange={(v) => setSaldoStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tudo">Tudo</SelectItem>
                  <SelectItem value="incompleto">Cadastro incompleto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Gestor direto</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead>Período aquisitivo</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Data limite</TableHead>
                  <TableHead>A vencer</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saldoPageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      Tudo certo por aqui! Nenhum registro nesta situação.
                    </TableCell>
                  </TableRow>
                ) : saldoPageItems.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-muted text-muted-foreground"><User className="h-4 w-4" /></AvatarFallback></Avatar>
                        <div>
                          <div className="text-sm font-semibold">{s.nome}</div>
                          <div className="text-xs text-muted-foreground">{s.cargo}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{s.gestor}</TableCell>
                    <TableCell className="text-sm">{s.vinculo}</TableCell>
                    <TableCell className="text-sm">{s.periodo}</TableCell>
                    <TableCell className="text-sm font-semibold">{s.saldo}</TableCell>
                    <TableCell className="text-sm">{s.dataLimite}</TableCell>
                    <TableCell className="text-sm">{s.aVencer} dias</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => { setSaldoDetalhes(s); setSaldoDetTab("aberto"); }}>Detalhes</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <div>Itens por página: {saldoPerPage}</div>
              <div>{saldosFiltrados.length === 0 ? 0 : (saldoPage - 1) * saldoPerPage + 1} - {Math.min(saldoPage * saldoPerPage, saldosFiltrados.length)} de {saldosFiltrados.length} itens</div>
              <div className="flex items-center gap-2">
                <span>{saldoPage} de {saldoTotalPages} páginas</span>
                <Button variant="ghost" size="icon" disabled={saldoPage <= 1} onClick={() => setSaldoPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" disabled={saldoPage >= saldoTotalPages} onClick={() => setSaldoPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Dialog Criar Solicitação - multi step */}
      <Dialog open={criarOpen} onOpenChange={(o) => { if (!o) fecharCriar(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar solicitação para um colaborador</DialogTitle>
            <DialogDescription>Crie como RH, uma solicitação de férias para seu colaborador.</DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Colaborador *</Label>
                <Select value={colabSel} onValueChange={setColabSel}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {colaboradores.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nomeCompleto}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {colabSel && (
                <div className="space-y-2">
                  <Label>Período de vínculo para esta solicitação *</Label>
                  <Select value={periodoVinc} onValueChange={setPeriodoVinc}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="28/01/2026 - 27/01/2027 (30 dias disponíveis)">
                        28/01/2026 - 27/01/2027 (30 dias disponíveis)
                      </SelectItem>
                      <SelectItem value="28/01/2025 - 27/01/2026 (0 dias disponíveis)">
                        28/01/2025 - 27/01/2026 (0 dias disponíveis)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {step === 2 && colabSelObj && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Colaborador</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                    <div>
                      <div className="text-sm font-semibold">{colabSelObj.nomeCompleto}</div>
                      <div className="text-xs text-muted-foreground">{colabSelObj.cargo}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Gestor</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                    <div>
                      <div className="text-sm font-semibold">{gestorDoColab || "-"}</div>
                      <div className="text-xs text-muted-foreground">{colabSelObj.gestorCargo || ""}</div>
                    </div>
                  </div>
                </div>
              </div>

              <button className="text-sm text-primary underline">Detalhes de saldo do colaborador</button>

              <div className="border rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Solicitação referente ao período aquisitivo</div>
                  <div className="font-semibold">2026 - 2027</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Saldo</div>
                  <div className="font-semibold">30 dias</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Direito de férias a partir de</div>
                  <div className="font-semibold">28/01/2027</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Data limite para início</div>
                  <div className="font-semibold">29/12/2027</div>
                </div>
              </div>

              <div>
                <Label>Período de Recesso *</Label>
                <p className="text-xs text-muted-foreground mb-2">Defina o período de descanso. <span className="text-primary underline cursor-pointer">Ver regras de solicitação</span></p>
                <div className="flex items-center gap-2">
                  <Input type="date" value={recessoInicio} onChange={(e) => setRecessoInicio(e.target.value)} />
                  <span className="text-sm text-muted-foreground">até</span>
                  <Input type="date" value={recessoFim} onChange={(e) => setRecessoFim(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Observações <span className="text-xs text-primary">(opcional)</span></Label>
                <Textarea
                  placeholder="Insira uma descrição para a ação"
                  value={observacoes}
                  maxLength={250}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
                <div className="text-right text-xs text-muted-foreground">{observacoes.length}/250</div>
              </div>

              <div>
                <Label>Documento de Recesso <span className="text-xs text-primary">(opcional)</span></Label>
                <p className="text-xs text-muted-foreground mb-2">Os documentos inseridos aqui também serão visíveis no cadastro do colaborador</p>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-sm text-primary font-medium">Clique aqui ou arraste e solte o arquivo nesta área para realizar o upload</p>
                  <p className="text-xs text-muted-foreground mt-1">Aceitamos arquivo em formato .PDF, .PNG e .JPEG de no máximo 50MB.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t mt-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={criarComoConcluida} onCheckedChange={(v) => setCriarComoConcluida(!!v)} />
              <span>Criar solicitação como</span>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100" variant="secondary">Concluída</Badge>
            </label>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => step === 2 ? setStep(1) : fecharCriar()}>
                {step === 2 ? "Voltar" : "Cancelar"}
              </Button>
              {step === 1 ? (
                <Button disabled={!colabSel} onClick={() => setStep(2)}>Avançar</Button>
              ) : (
                <Button disabled={!podeSolicitar} onClick={fecharCriar}>Solicitar Recesso</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes da solicitação */}
      <Dialog open={!!verItem} onOpenChange={(o) => { if (!o) setVerItem(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da solicitação</DialogTitle>
          </DialogHeader>
          {verItem && (
            <div className="space-y-5 py-2">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold">Status da Solicitação</span>
                  <Badge className={etapaCor[verItem.etapa]} variant="secondary">{verItem.etapa}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  {(() => {
                    const steps = ["Em Análise do Gestor", "Em Análise do RH", "Aguardando documentação", "Concluída"];
                    const stageIndex = verItem.etapa === "Análise Gestor" ? 0
                      : verItem.etapa === "Análise RH" ? 1
                      : verItem.etapa === "Documentação" ? 2
                      : verItem.etapa === "Concluída" ? 3
                      : verItem.etapa === "Reprovada" ? 1
                      : verItem.etapa === "Cancelada" ? 0 : 3;
                    return steps.map((s, i, arr) => {
                      const done = i < stageIndex;
                      const current = i === stageIndex;
                      return (
                        <div key={s} className="flex-1 flex items-center">
                          <div className="flex flex-col items-center">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${done ? "bg-primary text-primary-foreground" : current ? "bg-primary/30 text-primary border-2 border-primary" : "bg-muted text-muted-foreground"}`}>
                              {done ? "✓" : i + 1}
                            </div>
                            <div className="text-[10px] text-center mt-1 max-w-[80px]">{s}</div>
                          </div>
                          {i < arr.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-primary" : "bg-muted"}`} />}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Informações da Solicitação</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Colaborador</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-semibold">{verItem.colaborador}</div>
                        <div className="text-xs text-muted-foreground">{verItem.cargo}</div>
                        <button className="text-xs text-primary underline">Detalhes de saldo do colaborador</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Gestor</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-semibold">{verItem.gestor}</div>
                        <div className="text-xs text-muted-foreground">Coordenadora</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Solicitação referente ao período aquisitivo</div>
                  <div className="font-semibold">2022 - 2023</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total de dias solicitados</div>
                  <div className="font-semibold">10</div>
                </div>
              </div>

              <div>
                <Label>Período de Recesso *</Label>
                <p className="text-xs text-muted-foreground mb-2">Defina o período de descanso.</p>
                <div className="flex items-center gap-2">
                  <Input type="text" value={verItem.inicio} readOnly />
                  <span className="text-sm text-muted-foreground">até</span>
                  <Input type="text" value={verItem.fim} readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vender Recesso?</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="vende" checked={verVende === "nao"} onChange={() => setVerVende("nao")} /> Não
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="vende" checked={verVende === "sim"} onChange={() => setVerVende("sim")} /> Sim
                    </label>
                    {verVende === "sim" && <Input className="w-16 h-8" defaultValue="0" />}
                  </div>
                </div>
                <div>
                  <Label>Adiantar 1ª Parcela do 13º?</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="adianta" checked={verAdianta === "nao"} onChange={() => setVerAdianta("nao")} /> Não
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="adianta" checked={verAdianta === "sim"} onChange={() => setVerAdianta("sim")} /> Sim
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label>Observações <span className="text-xs text-primary">(opcional)</span></Label>
                <Textarea value={verObs} maxLength={250} onChange={(e) => setVerObs(e.target.value)} />
                <div className="text-right text-xs text-muted-foreground">{verObs.length}/250</div>
              </div>

              <div>
                <Label>Documento de Recesso <span className="text-xs text-primary">(opcional)</span></Label>
                <p className="text-xs text-muted-foreground mb-2">Os documentos inseridos aqui também serão visíveis no cadastro do colaborador</p>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-sm text-primary font-medium">Clique aqui ou arraste e solte o arquivo nesta área para realizar o upload</p>
                  <p className="text-xs text-muted-foreground mt-1">Aceitamos arquivo em formato .PDF, .PNG e .JPEG de no máximo 50MB.</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 mr-auto" onClick={() => setVerItem(null)}>Cancelar Solicitação</Button>
            <Button variant="outline" onClick={() => setVerItem(null)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes de Saldo - Gestão de saldos e períodos */}
      <Dialog open={!!saldoDetalhes} onOpenChange={(o) => { if (!o) setSaldoDetalhes(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestão de saldos e períodos</DialogTitle>
            <DialogDescription>Gerencie os períodos aquisitivos e saldos.</DialogDescription>
          </DialogHeader>
          {saldoDetalhes && (
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                    <div>
                      <div className="text-sm font-semibold">{saldoDetalhes.nome}</div>
                      <div className="text-xs text-muted-foreground">{saldoDetalhes.cargo}</div>
                      <div className="text-xs text-muted-foreground">{saldoDetalhes.vinculo}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Gestor direto</p>
                  <div className="text-sm font-semibold">{saldoDetalhes.gestor}</div>
                  <div className="text-xs text-muted-foreground">{saldoDetalhes.gestorCargo}</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Data de admissão</p>
                  <div className="text-sm font-semibold">{saldoDetalhes.admissao}</div>
                  <p className="text-xs text-muted-foreground mt-2 mb-1">Início do 1º período aquisitivo</p>
                  <div className="text-sm font-semibold">{saldoDetalhes.inicio1Periodo}</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Visualização de Saldo</p>
                  <label className="flex items-start gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={visualizacaoSaldo}
                      onChange={(e) => setVisualizacaoSaldo(e.target.checked)}
                    />
                    <span className="text-muted-foreground">Exibir para o colaborador seu saldo de férias e usá-lo como limite para solicitações de férias.</span>
                  </label>
                </div>
              </div>

              <Tabs value={saldoDetTab} onValueChange={(v) => setSaldoDetTab(v as any)}>
                <TabsList>
                  <TabsTrigger value="aberto">Períodos em aberto (2)</TabsTrigger>
                  <TabsTrigger value="concluidos">Períodos concluídos (2)</TabsTrigger>
                </TabsList>

                <TabsContent value="aberto" className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Períodos em aberto</h3>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Saldo adquirido total</div>
                      <div className="text-sm font-semibold">{saldoDetalhes.saldo} dias</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Em período vigente</div>
                    <p className="text-xs text-muted-foreground mb-2">Férias que estão dentro do período disponível para gozo.</p>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-4 gap-2 bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
                        <div><div>Período aquisitivo</div><div className="text-foreground font-medium">01/11/2024 - 30/10/2025</div></div>
                        <div><div>Dias para planejamento</div><div className="text-foreground font-medium">{saldoDetalhes.saldo} dias</div></div>
                        <div><div>Direito a férias a partir de</div><div className="text-foreground font-medium">31/10/2025</div></div>
                        <div><div>Data limite de férias</div><div className="text-foreground font-medium">{saldoDetalhes.dataLimite}</div></div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground border-b pb-2">
                          <div>Período Solicitado</div>
                          <div>Dias solicitados</div>
                          <div>Abono Pecuniário</div>
                          <div>Adiantamento 13º</div>
                          <div>Status</div>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-sm pt-2 items-center">
                          <div>22/12/2025 - 04/01/2026</div>
                          <div>14 dias</div>
                          <div>0 dias</div>
                          <div>Não</div>
                          <div><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100" variant="secondary">Concluída</Badge></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Em período proporcional</div>
                    <p className="text-xs text-muted-foreground mb-2">Período ainda em fase de aquisição e com saldo visível integralmente para planejamento.</p>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-4 gap-2 bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
                        <div><div>Período aquisitivo</div><div className="text-foreground font-medium">31/10/2025 - 30/10/2026</div></div>
                        <div><div>Dias para planejamento</div><div className="text-foreground font-medium">30 dias</div></div>
                        <div><div>Direito a férias a partir de</div><div className="text-foreground font-medium">31/10/2026</div></div>
                        <div><div>Data limite de férias</div><div className="text-foreground font-medium">01/10/2027</div></div>
                      </div>
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Nenhuma solicitação realizada nesse período.
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="concluidos" className="mt-4 space-y-4">
                  <h3 className="text-sm font-semibold">Períodos concluídos</h3>
                  {[
                    { aq: "01/11/2023 - 30/10/2024", dl: "30/10/2025", solic: [{ p: "19/12/2024 - 01/01/2025", d: "14 dias", a: "0 dias", ad: "Não", st: "Concluída" }, { p: "15/09/2024 - 25/09/2024", d: "11 dias", a: "5 dias", ad: "Não", st: "Concluída" }] },
                    { aq: "01/11/2022 - 31/10/2023", dl: "01/11/2024", solic: [{ p: "30/09/2024 - 29/10/2024", d: "30 dias", a: "0 dias", ad: "Não", st: "Concluída" }] },
                  ].map((p, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-4 gap-2 bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
                        <div><div>Período aquisitivo</div><div className="text-foreground font-medium">{p.aq}</div></div>
                        <div><div>Dias para planejamento</div><div className="text-foreground font-medium">0 dias</div></div>
                        <div><div>Direito a férias a partir de</div><div className="text-foreground font-medium">{p.dl}</div></div>
                        <div><div>Data limite de férias</div><div className="text-foreground font-medium">-</div></div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground border-b pb-2">
                          <div>Período Solicitado</div>
                          <div>Dias solicitados</div>
                          <div>Abono Pecuniário</div>
                          <div>Adiantamento 13º</div>
                          <div>Status</div>
                        </div>
                        {p.solic.map((sl, k) => (
                          <div key={k} className="grid grid-cols-5 gap-2 text-sm pt-2 items-center">
                            <div>{sl.p}</div>
                            <div>{sl.d}</div>
                            <div>{sl.a}</div>
                            <div>{sl.ad}</div>
                            <div><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100" variant="secondary">{sl.st}</Badge></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter className="border-t pt-4">
            <Button onClick={() => { setSaldoDetalhes(null); setCriarOpen(true); resetCriar(); }}>Criar solicitação</Button>
            <Button variant="outline" onClick={() => setSaldoDetalhes(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
