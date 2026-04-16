import { useState, useMemo } from "react";
import { Search, Filter, Plus, Download, User, CheckCircle2, Link, CalendarIcon } from "lucide-react";
import {
  SelecionarColaboradorDialog,
  EscolherMetodoDialog,
  EditorPlanoDialog,
  PlanoDetalhes,
  type Plano,
  type Tarefa,
} from "@/components/PlanoDesenvolvimentoDialogs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlanoDesenvolvimento {
  id: string;
  colaborador: string;
  cargo: string;
  departamento: string;
  gestor: string;
  status: "em_dia" | "atrasado";
  progresso: number;
  tipo: "individual" | "trilha" | "onboarding";
  finalizado: boolean;
  diasAtraso?: number;
}

const mockPlanos: PlanoDesenvolvimento[] = [
  // Individuais ativos
  { id: "1", colaborador: "Daniela Nascimento Costa Bicalho", cargo: "COORDENADORA", departamento: "Diretoria", gestor: "Ana Carolina Braga de Moura", status: "em_dia", progresso: 80, tipo: "individual", finalizado: false },
  { id: "2", colaborador: "Daiane Matos Brito", cargo: "ANALISTA I - Step 1", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 66, tipo: "individual", finalizado: false },
  { id: "3", colaborador: "Nayara Rocha", cargo: "ANALISTA II", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 50, tipo: "individual", finalizado: false },
  { id: "4", colaborador: "Thalita Araujo de Oliveira", cargo: "ANALISTA III", departamento: "Fiscal", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", progresso: 50, tipo: "individual", finalizado: false, diasAtraso: 45 },
  { id: "5", colaborador: "Ana Cláudia Rossi", cargo: "ANALISTA CONTÁBIL III", departamento: "Contábil", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", progresso: 66, tipo: "individual", finalizado: false, diasAtraso: 30 },
  { id: "6", colaborador: "Carlos Henrique Silva", cargo: "ANALISTA III", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", progresso: 80, tipo: "individual", finalizado: false, diasAtraso: 12 },
  { id: "7", colaborador: "Mariana Ferreira", cargo: "ANALISTA III", departamento: "Fiscal", gestor: "Ana Carolina Braga de Moura", status: "atrasado", progresso: 90, tipo: "individual", finalizado: false, diasAtraso: 5 },
  // Individuais finalizados
  { id: "8", colaborador: "Pedro Henrique", cargo: "ANALISTA III", departamento: "Fiscal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 100, tipo: "individual", finalizado: true },
  { id: "9", colaborador: "Maria Clara", cargo: "COORDENADORA", departamento: "Contábil", gestor: "Ana Carolina Braga de Moura", status: "em_dia", progresso: 100, tipo: "individual", finalizado: true },
  { id: "10", colaborador: "João Pedro", cargo: "ANALISTA II", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 100, tipo: "individual", finalizado: true },
  // Onboardings ativos
  { id: "11", colaborador: "Jordana Cristina de Paula Carvalho", cargo: "ESTAGIÁRIO (a)", departamento: "Contábil", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", progresso: 20, tipo: "onboarding", finalizado: false, diasAtraso: 224 },
  { id: "12", colaborador: "Dalila Costa Santos", cargo: "AUXILIAR", departamento: "Fiscal", gestor: "Lívia Garcia Xavier", status: "atrasado", progresso: 30, tipo: "onboarding", finalizado: false, diasAtraso: 135 },
  { id: "13", colaborador: "Esther Vitória Oliveira Silva", cargo: "AUXILIAR", departamento: "Administrativo", gestor: "Ana Carolina Braga de Moura", status: "atrasado", progresso: 10, tipo: "onboarding", finalizado: false, diasAtraso: 96 },
  { id: "14", colaborador: "Juliana Santos", cargo: "ASSISTENTE", departamento: "Pessoal", gestor: "Ana Carolina Braga de Moura", status: "atrasado", progresso: 40, tipo: "onboarding", finalizado: false, diasAtraso: 78 },
  { id: "15", colaborador: "Bruno Oliveira", cargo: "ESTAGIÁRIO", departamento: "Diretoria", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", progresso: 15, tipo: "onboarding", finalizado: false, diasAtraso: 60 },
  { id: "16", colaborador: "Camila Rocha", cargo: "ANALISTA I", departamento: "Contábil", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", progresso: 25, tipo: "onboarding", finalizado: false, diasAtraso: 42 },
  { id: "17", colaborador: "Diego Ferreira", cargo: "ASSISTENTE", departamento: "Fiscal", gestor: "Ana Carolina Braga de Moura", status: "atrasado", progresso: 35, tipo: "onboarding", finalizado: false, diasAtraso: 28 },
  // Onboardings finalizados
  { id: "18", colaborador: "Larissa Mendes", cargo: "ASSISTENTE", departamento: "Contábil", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 100, tipo: "onboarding", finalizado: true },
  { id: "19", colaborador: "Felipe Souza", cargo: "ANALISTA I", departamento: "Fiscal", gestor: "Ana Carolina Braga de Moura", status: "em_dia", progresso: 100, tipo: "onboarding", finalizado: true },
  // Trilhas finalizados
  { id: "20", colaborador: "Renata Alves", cargo: "ANALISTA II", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 100, tipo: "trilha", finalizado: true },
];

const COLORS = ["#3B82F6", "#EF4444", "#F59E0B", "#22C55E", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const tipoLabels = { individual: "Individuais", trilha: "Trilhas", onboarding: "Onboardings" } as const;

export default function PDI() {
  const [busca, setBusca] = useState("");
  const [tipoTab, setTipoTab] = useState<"individual" | "trilha" | "onboarding">("individual");
  const [abaAtivos, setAbaAtivos] = useState<"ativos" | "finalizados">("ativos");
  const [chartTab, setChartTab] = useState<"departamentos" | "gestores" | "cargos">("departamentos");
  const [statusFilter, setStatusFilter] = useState<"todos" | "em_dia" | "atrasados">("todos");

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterProgresso, setFilterProgresso] = useState("todos");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterDataInicio, setFilterDataInicio] = useState<Date | undefined>();
  const [filterDataFim, setFilterDataFim] = useState<Date | undefined>();
  const [filterLider, setFilterLider] = useState("todos");
  const [filterDepartamento, setFilterDepartamento] = useState("todos");
  const [filterGrupo, setFilterGrupo] = useState("todos");
  const [filterCargo, setFilterCargo] = useState("todos");

  const allByTipo = mockPlanos.filter((p) => p.tipo === tipoTab);
  const planosAtivos = allByTipo.filter((p) => !p.finalizado);
  const planosFinalizados = allByTipo.filter((p) => p.finalizado);

  const listaExibida = abaAtivos === "ativos" ? planosAtivos : planosFinalizados;

  const listaFiltrada = useMemo(() => {
    let lista = listaExibida.filter((p) =>
      p.colaborador.toLowerCase().includes(busca.toLowerCase())
    );
    if (filterStatus === "atrasados") lista = lista.filter((p) => p.status === "atrasado");
    if (filterStatus === "em_dia") lista = lista.filter((p) => p.status === "em_dia");
    if (filterStatus === "expirados") lista = lista.filter((p) => p.status === "atrasado" && (p.diasAtraso || 0) > 180);
    if (filterProgresso !== "todos") {
      const [min, max] = filterProgresso.split("-").map(Number);
      lista = lista.filter((p) => p.progresso >= min && p.progresso <= max);
    }
    if (filterDepartamento !== "todos") lista = lista.filter((p) => p.departamento === filterDepartamento);
    if (filterLider !== "todos") lista = lista.filter((p) => p.gestor === filterLider);
    if (filterCargo !== "todos") lista = lista.filter((p) => p.cargo === filterCargo);
    return lista;
  }, [listaExibida, busca, filterStatus, filterProgresso, filterDepartamento, filterLider, filterCargo]);

  const clearFilters = () => {
    setFilterStatus("todos");
    setFilterProgresso("todos");
    setFilterTipo("todos");
    setFilterDataInicio(undefined);
    setFilterDataFim(undefined);
    setFilterLider("todos");
    setFilterDepartamento("todos");
    setFilterGrupo("todos");
    setFilterCargo("todos");
  };

  const uniqueDepartamentos = [...new Set(mockPlanos.map((p) => p.departamento))];
  const uniqueGestores = [...new Set(mockPlanos.map((p) => p.gestor))];
  const uniqueCargos = [...new Set(mockPlanos.map((p) => p.cargo))];

  const chartSource = useMemo(() => {
    const base = abaAtivos === "ativos" ? planosAtivos : planosFinalizados;
    let filtered = base;
    if (statusFilter === "em_dia") filtered = base.filter((p) => p.status === "em_dia");
    if (statusFilter === "atrasados") filtered = base.filter((p) => p.status === "atrasado");

    const groupBy = (key: keyof PlanoDesenvolvimento) => {
      const map: Record<string, number> = {};
      filtered.forEach((p) => { map[p[key] as string] = (map[p[key] as string] || 0) + 1; });
      return Object.entries(map).map(([name, value]) => ({ name, value }));
    };

    if (chartTab === "departamentos") return groupBy("departamento");
    if (chartTab === "gestores") return groupBy("gestor");
    return groupBy("cargo");
  }, [chartTab, statusFilter, planosAtivos, planosFinalizados, abaAtivos]);

  const chartTitle = useMemo(() => {
    const prefix = statusFilter === "em_dia" ? "Planos em andamento" : statusFilter === "atrasados" ? "Planos atrasados" : "Todas os planos";
    const suffix = chartTab === "departamentos" ? "por departamento" : chartTab === "gestores" ? "por gestor" : "por cargo";
    return `${prefix} ${suffix}`;
  }, [chartTab, statusFilter]);

  const tipoStats = useMemo(() => {
    const tipos = ["individual", "trilha", "onboarding"] as const;
    return tipos.map((t) => {
      const all = mockPlanos.filter((p) => p.tipo === t && !p.finalizado);
      const emDia = all.filter((p) => p.status === "em_dia").length;
      const atrasados = all.filter((p) => p.status === "atrasado").length;
      const total = all.length;
      const emDiaPercent = total > 0 ? Math.round((emDia / total) * 100) : 0;
      const atrasadosPercent = total > 0 ? Math.round((atrasados / total) * 100) : 0;
      return { tipo: t, label: tipoLabels[t], total, emDia, atrasados, emDiaPercent, atrasadosPercent };
    });
  }, []);

  const actionButtons = useMemo(() => {
    if (tipoTab === "individual") {
      return (
        <>
          <Button className="gap-2"><Plus className="h-4 w-4" />Criar um novo plano de desenvolvimento</Button>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exportar</Button>
        </>
      );
    }
    if (tipoTab === "trilha") {
      return (
        <>
          <Button variant="outline" className="gap-2"><Link className="h-4 w-4" />Vincular trilha a uma pessoa</Button>
          <Button variant="outline" className="gap-2">Gerenciar modelos de trilhas</Button>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exportar</Button>
        </>
      );
    }
    return (
      <>
        <Button variant="outline" className="gap-2"><Link className="h-4 w-4" />Vincular onboarding a uma pessoa</Button>
        <Button variant="outline" className="gap-2">Gerenciar modelos de onboarding</Button>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exportar</Button>
      </>
    );
  }, [tipoTab]);

  const handleTipoClick = (tipo: "individual" | "trilha" | "onboarding") => {
    setTipoTab(tipo);
    setAbaAtivos("ativos");
    setBusca("");
    setChartTab("departamentos");
    setStatusFilter("todos");
  };

  return (
    <div className="space-y-6">
      {/* Header cards */}
      <div className="bg-card rounded-xl p-6 card-shadow">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">Planos de Desenvolvimento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tipoStats.map((s) => (
            <div
              key={s.tipo}
              onClick={() => handleTipoClick(s.tipo)}
              className={`rounded-lg border p-4 cursor-pointer transition-colors ${tipoTab === s.tipo ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
            >
              <p className="font-semibold text-sm text-card-foreground mb-1">{s.label}</p>
              <div className="flex items-center justify-end mb-2">
                <span className="text-xs text-muted-foreground">
                  {s.total > 0 ? `${s.total} ativos` : "Nenhum ativo"}
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full mb-3">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${s.total > 0 ? ((s.emDia / s.total) * 100) : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative h-10 w-10">
                    <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                        strokeDasharray={`${s.emDiaPercent * 0.975} 100`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-card-foreground">{s.emDiaPercent}%</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-card-foreground">Em dia</p>
                    <p className="text-xs text-muted-foreground">{s.emDia} Planos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative h-10 w-10">
                    <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                        strokeDasharray={`${s.atrasadosPercent * 0.975} 100`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-card-foreground">{s.atrasadosPercent}%</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-card-foreground">Atrasados</p>
                    <p className="text-xs text-muted-foreground">{s.atrasados} Planos</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 card-shadow">
        {/* Tabs + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setAbaAtivos("ativos")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border ${abaAtivos === "ativos" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Ativos ({planosAtivos.length})
            </button>
            <button
              onClick={() => setAbaAtivos("finalizados")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border ${abaAtivos === "finalizados" ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Finalizados ({planosFinalizados.length})
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {actionButtons}
          </div>
        </div>

        {/* Search + chart tabs + status filter */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Busque por uma pessoa" className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setShowFilters(true)}>
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            {(["departamentos", "gestores", "cargos"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setChartTab(tab)}
                className={`px-3 py-1.5 text-sm ${chartTab === tab ? "text-primary bg-primary/5 font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded-md px-3 py-1.5 text-sm bg-card text-foreground ml-auto"
          >
            <option value="todos">Todos os status</option>
            <option value="em_dia">Em dia</option>
            <option value="atrasados">Atrasados</option>
          </select>
        </div>

        {/* List + Chart */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* People list */}
          <div className="flex-1 min-w-0 space-y-0 max-h-[500px] overflow-y-auto">
            {listaFiltrada.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground text-sm font-medium">
                  <span className="font-bold">Nenhum</span> plano de {tipoTab === "individual" ? "desenvolvimento individual" : tipoTab === "trilha" ? "trilha de desenvolvimento" : "onboarding"} no momento
                </p>
                <button className="text-primary text-sm mt-2 hover:underline">
                  {tipoTab === "individual" ? "Criar um novo plano" : tipoTab === "trilha" ? "Vincular trilha a uma pessoa" : "Vincular onboarding a uma pessoa"}
                </button>
              </div>
            )}
            {listaFiltrada.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  <User className="h-7 w-7 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-card-foreground">{p.colaborador}</p>
                  <p className="text-xs text-muted-foreground uppercase">{p.cargo}</p>
                  <p className="text-xs text-muted-foreground">{p.departamento}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="text-[11px] text-muted-foreground uppercase">{p.gestor}</span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {p.status === "atrasado" && p.diasAtraso && !p.finalizado ? (
                    <>
                      <span className="text-xs text-destructive font-medium">Atrasada {p.diasAtraso} dias</span>
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
                        {p.progresso}%
                      </span>
                    </>
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pie chart */}
          <div className="lg:w-[480px] shrink-0">
            <p className="font-semibold text-sm text-card-foreground mb-2">{chartTitle}</p>
            {chartSource.length === 0 ? (
              <div className="flex items-center justify-center h-[340px]">
                <p className="text-muted-foreground text-sm">Nenhum dado</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={chartSource}
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {chartSource.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} plano(s)`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {chartSource.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {chartSource.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-card-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                <Filter className="h-4 w-4" />Filtros
              </span>
              <div className="flex border rounded-md overflow-hidden">
                {(["departamentos", "gestores", "cargos"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartTab(tab)}
                    className={`px-3 py-1.5 text-sm ${chartTab === tab ? "text-primary bg-primary/5 font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <p className="text-sm font-medium text-muted-foreground">Status do plano</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Status:</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="atrasados">Atrasados</SelectItem>
                    <SelectItem value="em_dia">Em dia</SelectItem>
                    <SelectItem value="expirados">Expirados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Progresso:</label>
                <Select value={filterProgresso} onValueChange={setFilterProgresso}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="0-25">0% - 25%</SelectItem>
                    <SelectItem value="26-50">26% - 50%</SelectItem>
                    <SelectItem value="51-75">51% - 75%</SelectItem>
                    <SelectItem value="76-100">76% - 100%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tipo:</label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="habilidades_tecnicas">Habilidades Técnicas</SelectItem>
                  <SelectItem value="lideranca">Liderança</SelectItem>
                  <SelectItem value="comunicacao">Comunicação</SelectItem>
                  <SelectItem value="gestao">Gestão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Data de início:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filterDataInicio && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDataInicio ? format(filterDataInicio, "dd/MM/yyyy", { locale: ptBR }) : "Todos"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={filterDataInicio} onSelect={setFilterDataInicio} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Data final prevista:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filterDataFim && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDataFim ? format(filterDataFim, "dd/MM/yyyy", { locale: ptBR }) : "Todos"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={filterDataFim} onSelect={setFilterDataFim} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <p className="text-sm font-medium text-muted-foreground mt-4">Grupo de participantes</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Líder:</label>
                <Select value={filterLider} onValueChange={setFilterLider}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {uniqueGestores.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Departamento:</label>
                <Select value={filterDepartamento} onValueChange={setFilterDepartamento}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {uniqueDepartamentos.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Grupo:</label>
                <Select value={filterGrupo} onValueChange={setFilterGrupo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Cargo:</label>
                <Select value={filterCargo} onValueChange={setFilterCargo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {uniqueCargos.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" className="text-primary border-primary" onClick={clearFilters}>
              Limpar filtros
            </Button>
            <Button onClick={() => setShowFilters(false)}>
              Aplicar filtros
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
