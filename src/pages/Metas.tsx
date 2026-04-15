import { useState } from "react";
import {
  Target, TrendingUp, CheckCircle, AlertTriangle, Filter, MoreVertical,
  Map, Download, List, Network, Cloud, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Filter state defaults
const DEFAULT_FILTERS = {
  unidade: "",
  departamento: "",
  responsavel: "",
  periodo: "",
  dataInicio: "",
  dataFim: "",
  etiquetasObjetivos: "",
  etiquetasResultados: "",
  privacidade: "todos",
  contribuinte: "",
  responsavelAcao: "",
  escopo: "",
  porcentagem: "todas",
  status: "ativos",
  statusCheckin: "todos",
  ordenar: "departamento_az",
  exibicaoResultados: "todos",
};

type ViewMode = "list" | "map" | "download";

export default function Metas() {
  const [unidade, setUnidade] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [acoesOpen, setAcoesOpen] = useState(false);
  const [mapaOpen, setMapaOpen] = useState(false);

  // Active filter tags
  const filterTags = [
    `Status dos responsáveis: Todos`,
    `Privacidade: Todos`,
    `Porcentagem: Todas`,
    `Status: Ativos`,
    `Status do check-in: Todos`,
    `Ordenar objetivos por: Departamento A ➜ Z`,
    `Exibição dos Resultados Chaves: Todos`,
  ];

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setMoreFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Ações weeks
  const today = new Date();
  const getMonday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  const monday = getMonday(new Date(today));
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const start = new Date(monday);
    start.setDate(start.getDate() + i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return {
      label: `Semana ${i + 1}`,
      range: `${start.toLocaleDateString("pt-BR")} ~ ${end.toLocaleDateString("pt-BR")}`,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Objetivos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie objetivos e resultados chave com acompanhamento em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Lista</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="icon"
                onClick={() => setMapaOpen(true)}
              >
                <Network className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mapa de Objetivos</TooltipContent>
          </Tooltip>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-2">
              <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent">
                Relatório com objetivos
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent">
                Relatório com objetivos e metas
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent">
                Relatório de Objetivos, Metas e Planos de Ação
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent">
                Relatório de distribuição customizada e projeção
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Filters Row */}
      <div className="rounded-xl bg-card p-6 card-shadow space-y-4">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <Label className="text-xs font-semibold text-primary mb-1 block">Unidade</Label>
            <Select value={unidade} onValueChange={setUnidade}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <Label className="text-xs font-semibold text-primary mb-1 block">Departamentos</Label>
            <Select value={departamento} onValueChange={setDepartamento}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <Label className="text-xs font-semibold text-primary mb-1 block">Responsáveis</Label>
            <Select value={responsavel} onValueChange={setResponsavel}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <Label className="text-xs font-semibold text-primary mb-1 block">Período</Label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setMoreFiltersOpen(true)}>
            <Filter className="h-4 w-4" /> Mais filtros
          </Button>
          <Button className="gap-2">Filtrar</Button>
        </div>

        {/* Results + filter tags */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded">
              Mostrando 0 resultados para a busca
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Favoritar filtro
            </Button>
            <Button variant="outline" size="sm">Limpar filtros</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterTags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox icon={<Target className="h-5 w-5 text-foreground" />} label="Objetivos" value="0" tooltip="Total de objetivos" />
        <StatBox icon={<TrendingUp className="h-5 w-5 text-foreground" />} label="Progresso" value="0%" tooltip="Progresso geral" />
        <StatBox icon={<CheckCircle className="h-5 w-5 text-foreground" />} label="Encaminhado" value="0%" tooltip="Percentual encaminhado" />
        <StatBox icon={<AlertTriangle className="h-5 w-5 text-foreground" />} label="Em atenção" value="0%" tooltip="Percentual em atenção" />
      </div>

      {/* Empty objectives area */}
      <div className="rounded-xl bg-card p-12 card-shadow flex flex-col items-center justify-center text-center">
        <Target className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-1">Nenhum objetivo encontrado</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Utilize os filtros acima para buscar objetivos ou crie novos objetivos para começar.
        </p>
      </div>

      {/* More Filters Sheet */}
      <Sheet open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
        <SheetContent className="w-[400px] sm:w-[440px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-140px)] pr-4 mt-4">
            <div className="space-y-5">
              <FilterSection label="Unidades">
                <Select value={filters.unidade} onValueChange={(v) => setFilters({ ...filters, unidade: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma unidade" /></SelectTrigger>
                  <SelectContent><SelectItem value="todas">Todas</SelectItem></SelectContent>
                </Select>
              </FilterSection>

              <FilterSection label="Departamentos">
                <Select value={filters.departamento} onValueChange={(v) => setFilters({ ...filters, departamento: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione um departamento" /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                </Select>
              </FilterSection>

              <FilterSection label="Responsáveis">
                <Select value={filters.responsavel} onValueChange={(v) => setFilters({ ...filters, responsavel: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                </Select>
              </FilterSection>

              <FilterSection label="Período">
                <Select value={filters.periodo} onValueChange={(v) => setFilters({ ...filters, periodo: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione um período" /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                </Select>
              </FilterSection>

              <FilterSection label="Data de início a fim">
                <div className="flex gap-2">
                  <Input type="date" placeholder="Início" value={filters.dataInicio} onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })} />
                  <Input type="date" placeholder="Fim" value={filters.dataFim} onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })} />
                </div>
              </FilterSection>

              <FilterSection label="Etiquetas de Objetivos">
                <Select value={filters.etiquetasObjetivos} onValueChange={(v) => setFilters({ ...filters, etiquetasObjetivos: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma ou mais etiquetas" /></SelectTrigger>
                  <SelectContent><SelectItem value="todas">Todas</SelectItem></SelectContent>
                </Select>
              </FilterSection>

              <FilterSection label="Etiquetas de Resultados Chaves">
                <Select value={filters.etiquetasResultados} onValueChange={(v) => setFilters({ ...filters, etiquetasResultados: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma ou mais etiquetas" /></SelectTrigger>
                  <SelectContent><SelectItem value="todas">Todas</SelectItem></SelectContent>
                </Select>
              </FilterSection>

              <FilterSection label="Privacidade">
                <RadioGroup value={filters.privacidade} onValueChange={(v) => setFilters({ ...filters, privacidade: v })} className="flex gap-6">
                  <div className="flex items-center gap-2"><RadioGroupItem value="todos" id="priv-todos" /><Label htmlFor="priv-todos">Todos</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="publicos" id="priv-pub" /><Label htmlFor="priv-pub">Públicos</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="privados" id="priv-priv" /><Label htmlFor="priv-priv">Privados</Label></div>
                </RadioGroup>
              </FilterSection>

              <FilterSection label="Contribuinte">
                <Select value={filters.contribuinte} onValueChange={(v) => setFilters({ ...filters, contribuinte: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione um contribuinte" /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                </Select>
              </FilterSection>

              <FilterSection label="Responsável de Ação">
                <Select value={filters.responsavelAcao} onValueChange={(v) => setFilters({ ...filters, responsavelAcao: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione um Responsável de Ação" /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                </Select>
              </FilterSection>

              <FilterSection label="Escopo">
                <Select value={filters.escopo} onValueChange={(v) => setFilters({ ...filters, escopo: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione um colaborador" /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                </Select>
              </FilterSection>

              <FilterSection label="Porcentagem">
                <RadioGroup value={filters.porcentagem} onValueChange={(v) => setFilters({ ...filters, porcentagem: v })} className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2"><RadioGroupItem value="todas" id="pct-todas" /><Label htmlFor="pct-todas">Todas</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="0-39" id="pct-039" /><Label htmlFor="pct-039">0% - 39%</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="40-69" id="pct-4069" /><Label htmlFor="pct-4069">40% - 69%</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="70-100" id="pct-70100" /><Label htmlFor="pct-70100">70% - 100%</Label></div>
                </RadioGroup>
              </FilterSection>

              <FilterSection label="Status">
                <RadioGroup value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })} className="flex gap-6">
                  <div className="flex items-center gap-2"><RadioGroupItem value="ativos" id="st-ativos" /><Label htmlFor="st-ativos">Ativos</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="inativos" id="st-inat" /><Label htmlFor="st-inat">Inativos</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="todos" id="st-todos" /><Label htmlFor="st-todos">Todos</Label></div>
                </RadioGroup>
              </FilterSection>

              <FilterSection label="Status do check-in">
                <RadioGroup value={filters.statusCheckin} onValueChange={(v) => setFilters({ ...filters, statusCheckin: v })} className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2"><RadioGroupItem value="todos" id="ck-todos" /><Label htmlFor="ck-todos">Todos</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="emdia" id="ck-dia" /><Label htmlFor="ck-dia">Em dia</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="atrasados" id="ck-atr" /><Label htmlFor="ck-atr">Atrasados</Label></div>
                </RadioGroup>
              </FilterSection>

              <FilterSection label="Ordenar objetivos por">
                <RadioGroup value={filters.ordenar} onValueChange={(v) => setFilters({ ...filters, ordenar: v })} className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2"><RadioGroupItem value="departamento_az" id="ord-daz" /><Label htmlFor="ord-daz">Departamento A ➜ Z</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="departamento_za" id="ord-dza" /><Label htmlFor="ord-dza">Departamento Z ➜ A</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="responsavel_az" id="ord-raz" /><Label htmlFor="ord-raz">Responsável A ➜ Z</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="responsavel_za" id="ord-rza" /><Label htmlFor="ord-rza">Responsável Z ➜ A</Label></div>
                </RadioGroup>
              </FilterSection>

              <FilterSection label="Exibição dos Resultados Chaves">
                <RadioGroup value={filters.exibicaoResultados} onValueChange={(v) => setFilters({ ...filters, exibicaoResultados: v })} className="space-y-2">
                  <div className="flex items-center gap-2"><RadioGroupItem value="todos" id="exib-todos" /><Label htmlFor="exib-todos">Todos</Label></div>
                  <div className="flex items-center gap-2"><RadioGroupItem value="filtrados" id="exib-filtrados" /><Label htmlFor="exib-filtrados">Apenas os que se encaixam nos filtros selecionados</Label></div>
                </RadioGroup>
              </FilterSection>
            </div>
          </ScrollArea>

          <div className="flex items-center justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="outline" onClick={handleClearFilters}>Limpar filtros</Button>
            <Button onClick={handleApplyFilters}>Aplicar</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Ações Dialog */}
      <Dialog open={acoesOpen} onOpenChange={setAcoesOpen}>
        <DialogContent className="max-w-[90vw] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center">
              Ações <CheckCircle className="h-5 w-5 text-primary" />
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="grid grid-cols-4 gap-4 flex-1 min-w-0">
              {weeks.map((week, i) => (
                <div key={i} className="border rounded-lg overflow-hidden min-h-[300px]">
                  <div className="text-center text-xs text-muted-foreground py-1">{week.range}</div>
                  <div className={`flex items-center justify-between px-3 py-2 text-white text-sm font-semibold ${i % 2 === 0 ? "bg-primary" : "bg-amber-500"}`}>
                    <span>{week.label}</span>
                    <Badge variant="secondary" className="bg-amber-400 text-white border-0 rounded-full h-6 w-6 flex items-center justify-center p-0">0</Badge>
                  </div>
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    Nenhuma ação
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mapa de Objetivos Dialog */}
      <Dialog open={mapaOpen} onOpenChange={setMapaOpen}>
        <DialogContent className="max-w-[90vw] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Mapa de Objetivos
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm">Zoom +</Button>
                <Button variant="outline" size="sm">Zoom -</Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
            <div className="text-center">
              <Network className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-sm">Nenhum objetivo cadastrado para exibir no mapa.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatBox({ icon, label, value, tooltip }: { icon: React.ReactNode; label: string; value: string; tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-3 rounded-xl bg-card p-5 card-shadow">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60">
            {icon}
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {label}
              <span className="inline-block h-3.5 w-3.5 rounded-full bg-muted-foreground/30 text-[9px] text-center leading-[14px] font-bold">?</span>
            </p>
            <p className="text-xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      <Separator className="mt-3" />
    </div>
  );
}
