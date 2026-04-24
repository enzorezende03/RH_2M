import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Calendar, MoreVertical, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Comunicado = {
  assunto: string;
  status: "Ativado" | "Arquivado";
  publicacao: string;
  expiracao: string;
  lidos: string;
  destinatarios: string[];
  leitura: "Lido" | "Pendente";
  etiquetas?: string[];
};

const comunicadosData: Comunicado[] = [
  { assunto: "Uso do Espaço de Descanso", status: "Ativado", publicacao: "09/04/2026", expiracao: "Não configurado", lidos: "41/6", destinatarios: ["TD", "A", "G", "C"], leitura: "Lido" },
  { assunto: "Como registrar uma dispensa/atestado par...", status: "Ativado", publicacao: "11/02/2026", expiracao: "Não configurado", lidos: "41/6", destinatarios: ["TD", "A", "G", "C"], leitura: "Lido" },
  { assunto: "Lembrete: Avaliação STEPS e Envio de ...", status: "Ativado", publicacao: "03/02/2026", expiracao: "Não configurado", lidos: "41/6", destinatarios: ["TD", "A", "G", "C"], leitura: "Lido" },
  { assunto: "Fotos Corporativas", status: "Ativado", publicacao: "28/01/2026", expiracao: "Não configurado", lidos: "37/8", destinatarios: ["TD", "G", "C"], leitura: "Lido" },
  { assunto: "Calendário 2026", status: "Ativado", publicacao: "06/01/2026", expiracao: "Não configurado", lidos: "36/8", destinatarios: ["TD", "A", "G", "C"], leitura: "Pendente", etiquetas: ["#calendario #2026..."] },
  { assunto: "NOVA DATA - Fotos Corporativas", status: "Ativado", publicacao: "09/10/2025", expiracao: "Não configurado", lidos: "32/12", destinatarios: ["TD", "TU", "G", "C"], leitura: "Pendente" },
  { assunto: "Fotos Corporativas", status: "Ativado", publicacao: "07/10/2025", expiracao: "Não configurado", lidos: "32/12", destinatarios: ["TD", "TU", "G", "C"], leitura: "Pendente" },
  { assunto: "Plano de Participação nos Resultados (PP...", status: "Ativado", publicacao: "11/09/2025", expiracao: "Não configurado", lidos: "35/12", destinatarios: ["TD", "A", "G", "C"], leitura: "Pendente", etiquetas: ["#PPR2025"] },
  { assunto: "REGULAMENTO INTERNO - GRUPO 2M - atualiz...", status: "Ativado", publicacao: "11/09/2025", expiracao: "Não configurado", lidos: "35/11", destinatarios: ["TD", "G", "C"], leitura: "Pendente", etiquetas: ["#regulamentointer..."] },
  { assunto: "Convivência e Respeito nos Espaços Compa...", status: "Ativado", publicacao: "01/08/2025", expiracao: "Não configurado", lidos: "32/13", destinatarios: ["TD", "A", "G", "C"], leitura: "Pendente" },
  { assunto: "Nosso Plano de Cargos e Salários já Está...", status: "Ativado", publicacao: "06/03/2025", expiracao: "Não configurado", lidos: "32/11", destinatarios: ["TD", "TU", "C"], leitura: "Pendente" },
  { assunto: "Calendário 2025 - Feriados", status: "Ativado", publicacao: "13/02/2025", expiracao: "15/02/2025", lidos: "30/15", destinatarios: ["TD", "A", "G", "C"], leitura: "Pendente", etiquetas: ["#calendario #2025..."] },
  { assunto: "Fotos Corporativas - Camisa de Sexta-fei...", status: "Arquivado", publicacao: "16/01/2025", expiracao: "17/01/2025", lidos: "19/25", destinatarios: ["TD", "A", "G", "C"], leitura: "Pendente" },
  { assunto: "Compartilhe seu instagram com a gente!", status: "Arquivado", publicacao: "04/12/2024", expiracao: "05/12/2024", lidos: "17/27", destinatarios: ["TD", "A", "G", "C"], leitura: "Pendente" },
  { assunto: "Atualização no sistema de pontuação.", status: "Arquivado", publicacao: "04/11/2024", expiracao: "06/11/2024", lidos: "21/24", destinatarios: ["TD", "A", "G", "C"], leitura: "Pendente" },
];

const etiquetas = [
  "#manual #feedz #orientacao",
  "#uniforme",
  "#calendario #2025 #feriados",
  "#orienteme",
  "#regulamentointerno",
  "#PPR2025",
  "#calendario #2026 #feriados",
];

function ComunicadosTable({ data, search }: { data: Comunicado[]; search: string }) {
  const filtered = data.filter((c) => c.assunto.toLowerCase().includes(search.toLowerCase()));
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-bold text-primary">Assunto</TableHead>
          <TableHead className="font-bold text-foreground">Status</TableHead>
          <TableHead className="font-bold text-foreground">Publicação</TableHead>
          <TableHead className="font-bold text-foreground">Expiração</TableHead>
          <TableHead className="font-bold text-foreground">Lidos / Não Lidos</TableHead>
          <TableHead className="font-bold text-foreground">Destinatários</TableHead>
          <TableHead className="font-bold text-foreground">Leitura</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((item, idx) => (
          <TableRow key={idx} className="hover:bg-muted/50">
            <TableCell>
              <span className="text-primary underline text-sm cursor-pointer">{item.assunto}</span>
              {item.etiquetas && item.etiquetas.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {item.etiquetas.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  item.status === "Ativado"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }
              >
                {item.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{item.publicacao}</TableCell>
            <TableCell className={`text-sm ${item.expiracao !== "Não configurado" ? "text-red-500" : "text-muted-foreground"}`}>
              {item.expiracao}
            </TableCell>
            <TableCell className="text-sm">{item.lidos}</TableCell>
            <TableCell>
              <div className="flex -space-x-1">
                {item.destinatarios.map((d, i) => (
                  <div
                    key={i}
                    className="h-7 w-7 rounded-full bg-slate-800 text-white text-[10px] font-semibold flex items-center justify-center border-2 border-background"
                  >
                    {d}
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  item.leitura === "Lido"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-red-50 text-red-500 border-red-200"
                }
              >
                {item.leitura}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="text-primary">Editar</DropdownMenuItem>
                  <DropdownMenuItem className="text-primary">Duplicar</DropdownMenuItem>
                  <DropdownMenuItem className="text-primary">Detalhes</DropdownMenuItem>
                  <DropdownMenuItem className="text-primary">Arquivar</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500 focus:text-red-600">Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Comunicados() {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [etiquetaFilter, setEtiquetaFilter] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const clearFilters = () => {
    setStatusFilter("");
    setEtiquetaFilter("");
    setDataInicio("");
    setDataFim("");
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="px-8 py-6 flex items-start justify-between border-b">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-foreground">Comunicados</h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Melhore a comunicação na sua empresa criando facilmente comunicados dinâmicos e divertidos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate("/comunicados/criar")} className="gap-2">
            Criar Comunicado
          </Button>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <Tabs defaultValue="destaque">
          <TabsList className="bg-transparent border-b rounded-none w-full justify-start gap-4 px-0">
            <TabsTrigger
              value="destaque"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm px-1 pb-2"
            >
              Em Destaque
            </TabsTrigger>
            <TabsTrigger
              value="geral"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm px-1 pb-2"
            >
              Geral
            </TabsTrigger>
            <TabsTrigger
              value="gestores"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm px-1 pb-2"
            >
              Dos Gestores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="destaque" className="mt-6 space-y-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Busque pelo assunto"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>
              <Button variant="outline" className="gap-2 rounded-lg" onClick={() => setFilterOpen(true)}>
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>

            <ComunicadosTable data={comunicadosData} search={search} />

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <span>Itens por página: 15</span>
              </div>
              <div>1 - 15 de 20 itens</div>
              <div className="flex items-center gap-3">
                <span>1 de 2 páginas</span>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="geral" className="mt-6 space-y-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Busque pelo assunto"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>
              <Button variant="outline" className="gap-2 rounded-lg" onClick={() => setFilterOpen(true)}>
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
            <ComunicadosTable data={[]} search={search} />
          </TabsContent>

          <TabsContent value="gestores" className="mt-6 space-y-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Busque pelo assunto"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>
              <Button variant="outline" className="gap-2 rounded-lg" onClick={() => setFilterOpen(true)}>
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
            <ComunicadosTable data={[]} search={search} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Sheet de Filtros */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-4 mt-4">
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-semibold text-sm">
                Status da leitura
                <ChevronUp className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Selecione o status da leitura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lido">Lido</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-semibold text-sm">
                Etiqueta do comunicado
                <ChevronUp className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <Select value={etiquetaFilter} onValueChange={setEtiquetaFilter}>
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Selecione a etiqueta do comunicado" />
                  </SelectTrigger>
                  <SelectContent>
                    {etiquetas.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 font-semibold text-sm">
                Data publicação
                <ChevronUp className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Inicio"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="pl-10 rounded-full"
                      type="date"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Fim"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="pl-10 rounded-full"
                      type="date"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <SheetFooter className="flex gap-3 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
            <SheetClose asChild>
              <Button>Aplicar</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
