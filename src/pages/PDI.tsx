import { useState, useMemo } from "react";
import { Search, Filter, Plus, Download, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// --- Types ---
interface PlanoDesenvolvimento {
  id: string;
  colaborador: string;
  cargo: string;
  departamento: string;
  gestor: string;
  status: "em_dia" | "atrasado";
  diasAtraso: number;
  progresso: number;
  tipo: "individual" | "trilha" | "onboarding";
  finalizado: boolean;
}

// --- Mock Data ---
const mockPlanos: PlanoDesenvolvimento[] = [
  { id: "1", colaborador: "Thalita Araujo de Oliveira", cargo: "Analista III", departamento: "Fiscal", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", diasAtraso: 166, progresso: 50, tipo: "individual", finalizado: false },
  { id: "2", colaborador: "Ana Cláudia Rossi", cargo: "Analista Contábil III - Step 1", departamento: "Contábil", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", diasAtraso: 406, progresso: 66, tipo: "individual", finalizado: false },
  { id: "3", colaborador: "Danielle Campos Millior", cargo: "Analista Contábil III - Step 2", departamento: "Contábil", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", diasAtraso: 406, progresso: 66, tipo: "individual", finalizado: false },
  { id: "4", colaborador: "Jessyca Lopes", cargo: "Analista I - Step 1", departamento: "Legalização de Empresas", gestor: "Livia Garcia Xavier", status: "atrasado", diasAtraso: 120, progresso: 30, tipo: "individual", finalizado: false },
  { id: "5", colaborador: "Carlos Henrique Silva", cargo: "Analista III", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", diasAtraso: 0, progresso: 80, tipo: "individual", finalizado: false },
  { id: "6", colaborador: "Mariana Ferreira", cargo: "Analista III", departamento: "Fiscal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", diasAtraso: 0, progresso: 90, tipo: "individual", finalizado: false },
  { id: "7", colaborador: "Roberto Santos", cargo: "Analista III", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", diasAtraso: 0, progresso: 45, tipo: "individual", finalizado: false },
  { id: "8", colaborador: "Fernanda Lima", cargo: "Analista III", departamento: "Fiscal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", diasAtraso: 0, progresso: 100, tipo: "onboarding", finalizado: false },
  { id: "9", colaborador: "Lucas Oliveira", cargo: "Analista III", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", diasAtraso: 50, progresso: 20, tipo: "onboarding", finalizado: false },
  { id: "10", colaborador: "Paula Mendes", cargo: "Analista III", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", diasAtraso: 80, progresso: 10, tipo: "onboarding", finalizado: false },
  { id: "11", colaborador: "André Costa", cargo: "Analista III", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", diasAtraso: 30, progresso: 60, tipo: "onboarding", finalizado: false },
  { id: "12", colaborador: "Juliana Martins", cargo: "Analista III", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", diasAtraso: 15, progresso: 70, tipo: "onboarding", finalizado: false },
  { id: "13", colaborador: "Ricardo Alves", cargo: "Analista III", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", diasAtraso: 90, progresso: 40, tipo: "onboarding", finalizado: false },
  { id: "14", colaborador: "Beatriz Souza", cargo: "Analista III", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "atrasado", diasAtraso: 200, progresso: 25, tipo: "onboarding", finalizado: false },
  // Finalizados
  { id: "15", colaborador: "Pedro Henrique", cargo: "Analista III", departamento: "Fiscal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", diasAtraso: 0, progresso: 100, tipo: "individual", finalizado: true },
  { id: "16", colaborador: "Maria Clara", cargo: "Analista III", departamento: "Contábil", gestor: "Livia Garcia Xavier", status: "em_dia", diasAtraso: 0, progresso: 100, tipo: "individual", finalizado: true },
  { id: "17", colaborador: "João Pedro", cargo: "Analista III", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", diasAtraso: 0, progresso: 100, tipo: "individual", finalizado: true },
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

export default function PDI() {
  const [busca, setBusca] = useState("");
  const [abaAtivos, setAbaAtivos] = useState<"ativos" | "finalizados">("ativos");
  const [chartTab, setChartTab] = useState<"departamentos" | "gestores" | "cargos">("departamentos");
  const [statusFilter, setStatusFilter] = useState<"todos" | "em_dia" | "atrasados">("todos");

  const planosAtivos = mockPlanos.filter((p) => !p.finalizado);
  const planosFinalizados = mockPlanos.filter((p) => p.finalizado);

  const individuais = planosAtivos.filter((p) => p.tipo === "individual");
  const trilhas = planosAtivos.filter((p) => p.tipo === "trilha");
  const onboardings = planosAtivos.filter((p) => p.tipo === "onboarding");

  const summaryCard = (label: string, items: PlanoDesenvolvimento[]) => {
    const emDia = items.filter((i) => i.status === "em_dia").length;
    const atrasados = items.filter((i) => i.status === "atrasado").length;
    const total = items.length;
    const pctEmDia = total ? Math.round((emDia / total) * 100) : 0;
    const pctAtrasados = total ? Math.round((atrasados / total) * 100) : 0;
    return (
      <div className="border rounded-lg p-4 flex-1 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-card-foreground">{label}</span>
          <span className="text-sm text-muted-foreground">{total > 0 ? `${total} ativos` : "Nenhum ativo"}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-3">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${total ? ((emDia + atrasados) / total) * 100 : 0}%` }} />
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary text-primary font-bold text-[11px]">{pctEmDia}%</span>
            <span className="text-muted-foreground">Em dia<br />{emDia} Planos</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary font-bold text-[11px]" style={{ borderColor: "#1e40af", color: "#1e40af" }}>{pctAtrasados}%</span>
            <span className="text-muted-foreground">Atrasados<br />{atrasados} Planos</span>
          </div>
        </div>
      </div>
    );
  };

  const listaExibida = abaAtivos === "ativos" ? planosAtivos : planosFinalizados;
  const listaFiltrada = listaExibida.filter((p) =>
    p.colaborador.toLowerCase().includes(busca.toLowerCase())
  );

  // Chart data
  const chartSource = useMemo(() => {
    let filtered = planosAtivos;
    if (statusFilter === "em_dia") filtered = planosAtivos.filter((p) => p.status === "em_dia");
    if (statusFilter === "atrasados") filtered = planosAtivos.filter((p) => p.status === "atrasado");

    const groupBy = (key: keyof PlanoDesenvolvimento) => {
      const map: Record<string, number> = {};
      filtered.forEach((p) => { map[p[key] as string] = (map[p[key] as string] || 0) + 1; });
      return Object.entries(map).map(([name, value]) => ({ name, value }));
    };

    if (chartTab === "departamentos") return groupBy("departamento");
    if (chartTab === "gestores") return groupBy("gestor");
    return groupBy("cargo");
  }, [chartTab, statusFilter]);

  const chartTitle = useMemo(() => {
    const prefix = statusFilter === "em_dia" ? "Planos em andamento" : statusFilter === "atrasados" ? "Planos atrasados" : "Todas os planos";
    const suffix = chartTab === "departamentos" ? "por departamento" : chartTab === "gestores" ? "por gestor" : "por cargo";
    return `${prefix} ${suffix}`;
  }, [chartTab, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-xl p-6 card-shadow">
        <h1 className="text-xl font-bold text-card-foreground mb-4">Planos de Desenvolvimento</h1>
        <div className="flex flex-wrap gap-4">
          {summaryCard("Individuais", individuais)}
          {summaryCard("Trilhas", trilhas)}
          {summaryCard("Onboardings", onboardings)}
        </div>
      </div>

      {/* Content */}
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
          <div className="flex gap-2">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Criar um novo plano de desenvolvimento
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Busque por uma pessoa" className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          {/* Chart dimension tabs */}
          <div className="flex border rounded-md overflow-hidden">
            {(["departamentos", "gestores", "cargos"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setChartTab(tab)}
                className={`px-3 py-1.5 text-sm capitalize ${chartTab === tab ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded-md px-3 py-1.5 text-sm bg-card text-foreground"
          >
            <option value="todos">Todos os status</option>
            <option value="em_dia">Em dia</option>
            <option value="atrasados">Atrasados</option>
          </select>
        </div>

        {/* List + Chart */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* People list */}
          <div className="flex-1 min-w-0 space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {listaFiltrada.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">Nenhum plano encontrado.</p>
            )}
            {listaFiltrada.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-card-foreground truncate">{p.colaborador}</p>
                  <p className="text-xs text-primary">{p.cargo}</p>
                  <p className="text-xs text-muted-foreground">{p.departamento}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate">{p.gestor}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.status === "atrasado" ? (
                    <span className="text-xs font-medium text-destructive">Atrasada {p.diasAtraso} dias</span>
                  ) : (
                    <span className="text-xs font-medium text-green-600">Em dia</span>
                  )}
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-primary text-primary font-bold text-xs">
                    {p.progresso}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pie chart */}
          <div className="lg:w-[420px] shrink-0">
            <p className="font-semibold text-sm text-card-foreground mb-4">{chartTitle}</p>
            {chartSource.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-16">Sem dados para exibir.</p>
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={chartSource}
                    cx="45%"
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
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2">
              {chartSource.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-card-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
