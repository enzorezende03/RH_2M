import { useState } from "react";
import { Search, Filter, Calendar } from "lucide-react";
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
import { ChevronUp } from "lucide-react";

const comunicadosData: { assunto: string; publicacao: string; leitura: string; etiquetas: string[] }[] = [];
const etiquetas = [
  "#manual #feedz #orientacao",
  "#uniforme",
  "#calendario #2025 #feriados",
  "#orienteme",
  "#regulamentointerno",
  "#PPR2025",
  "#calendario #2026 #feriados",
];

export default function Comunicados() {
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
      {/* Header azul */}
      <div className="bg-[hsl(210,60%,45%)] px-8 py-8 text-white">
        <h1 className="text-3xl font-bold mb-1">Comunicados</h1>
        <p className="text-white/80 text-sm max-w-xl">
          Melhore a comunicação na sua empresa criando facilmente comunicados dinâmicos e divertidos.
        </p>
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
          </TabsList>

          <TabsContent value="destaque" className="mt-6 space-y-4">
            {/* Search + Filtros */}
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
              <Button
                variant="outline"
                className="gap-2 rounded-lg"
                onClick={() => setFilterOpen(true)}
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>

            {/* Tabela */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-foreground">Assunto</TableHead>
                  <TableHead className="font-bold text-foreground">Publicação</TableHead>
                  <TableHead className="font-bold text-foreground">Leitura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comunicadosData
                  .filter((c) =>
                    c.assunto.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((item, idx) => (
                    <TableRow key={idx} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <span className="text-primary underline text-sm">
                          {item.assunto}
                        </span>
                        {item.etiquetas.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {item.etiquetas.map((tag, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.publicacao}
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
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="geral" className="mt-6">
            <p className="text-muted-foreground text-sm">Nenhum comunicado geral disponível.</p>
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
            {/* Status da leitura */}
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

            {/* Etiqueta do comunicado */}
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

            {/* Data publicação */}
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
