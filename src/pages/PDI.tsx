import { useState, useMemo } from "react";
import { Search, Filter, Plus, Download, User, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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
}

const mockPlanos: PlanoDesenvolvimento[] = [
  { id: "1", colaborador: "Daniela Nascimento Costa Bicalho", cargo: "COORDENADORA", departamento: "Diretoria", gestor: "Ana Carolina Braga de Moura", status: "em_dia", progresso: 80, tipo: "individual", finalizado: false },
  { id: "2", colaborador: "Daiane Matos Brito", cargo: "ANALISTA I - Step 1", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 66, tipo: "individual", finalizado: false },
  { id: "3", colaborador: "Nayara Rocha", cargo: "ANALISTA II", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 50, tipo: "individual", finalizado: false },
  { id: "4", colaborador: "Thalita Araujo de Oliveira", cargo: "ANALISTA III", departamento: "Fiscal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 50, tipo: "individual", finalizado: false },
  { id: "5", colaborador: "Ana Cláudia Rossi", cargo: "ANALISTA CONTÁBIL III", departamento: "Contábil", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 66, tipo: "individual", finalizado: false },
  { id: "6", colaborador: "Carlos Henrique Silva", cargo: "ANALISTA III", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 80, tipo: "individual", finalizado: false },
  { id: "7", colaborador: "Mariana Ferreira", cargo: "ANALISTA III", departamento: "Fiscal", gestor: "Ana Carolina Braga de Moura", status: "em_dia", progresso: 90, tipo: "individual", finalizado: false },
  // Finalizados
  { id: "8", colaborador: "Pedro Henrique", cargo: "ANALISTA III", departamento: "Fiscal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 100, tipo: "individual", finalizado: true },
  { id: "9", colaborador: "Maria Clara", cargo: "COORDENADORA", departamento: "Contábil", gestor: "Ana Carolina Braga de Moura", status: "em_dia", progresso: 100, tipo: "individual", finalizado: true },
  { id: "10", colaborador: "João Pedro", cargo: "ANALISTA II", departamento: "Pessoal", gestor: "Daniela Nascimento Costa Bicalho", status: "em_dia", progresso: 100, tipo: "individual", finalizado: true },
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

  const listaExibida = abaAtivos === "ativos" ? planosAtivos : planosFinalizados;
  const listaFiltrada = listaExibida.filter((p) =>
    p.colaborador.toLowerCase().includes(busca.toLowerCase())
  );

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
  }, [chartTab, statusFilter, planosAtivos]);

  const chartTitle = useMemo(() => {
    const prefix = statusFilter === "em_dia" ? "Planos em andamento" : statusFilter === "atrasados" ? "Planos atrasados" : "Todas os planos";
    const suffix = chartTab === "departamentos" ? "por departamento" : chartTab === "gestores" ? "por gestor" : "por cargo";
    return `${prefix} ${suffix}`;
  }, [chartTab, statusFilter]);

  return (
    <div className="space-y-6">
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

        {/* Search + filters + chart tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Busque por uma pessoa" className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
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
          <div className="flex-1 min-w-0 space-y-0 max-h-[500px] overflow-y-auto">
            {listaFiltrada.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">Nenhum plano encontrado.</p>
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
                <div className="shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            ))}
          </div>

          {/* Pie chart */}
          <div className="lg:w-[480px] shrink-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <div className="flex border rounded-md overflow-hidden">
                {(["departamentos", "gestores", "cargos"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setChartTab(tab)}
                    className={`px-3 py-1.5 text-sm capitalize ${chartTab === tab ? "text-primary border-b-2 border-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
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
            <p className="font-semibold text-sm text-card-foreground mb-2">{chartTitle}</p>
            {chartSource.length === 0 ? (
              <div className="flex items-center justify-center h-[340px]">
                <p className="text-muted-foreground text-sm">Nenhum dado</p>
              </div>
            ) : (
              <div className="flex items-start gap-4">
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
              </div>
            )}
            {/* Legend */}
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
    </div>
  );
}
