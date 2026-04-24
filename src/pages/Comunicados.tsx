import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Calendar, MoreVertical, ChevronLeft, ChevronRight, ChevronUp, ArrowLeft, Download, AlertCircle, X } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

type Comunicado = {
  assunto: string;
  status: "Ativado" | "Arquivado";
  publicacao: string;
  expiracao: string;
  lidos: string;
  destinatarios: string[];
  leitura: "Lido" | "Pendente";
  etiquetas?: string[];
  conteudo?: string;
  destaque?: boolean;
  emailNotif?: boolean;
  criadoPor?: string;
  cargoAutor?: string;
};

const initialData: Comunicado[] = [
  { assunto: "Uso do Espaço de Descanso", status: "Ativado", publicacao: "09/04/2026", expiracao: "Não configurado", lidos: "41/6", destinatarios: ["TD", "A", "G", "C"], leitura: "Lido", destaque: true, emailNotif: true, criadoPor: "SULAMITA BRAS DE OLIVEIRA MACHADO", cargoAutor: "Assistente financeiro/RH", conteudo: "Bom dia Equipe!\n\nTemos recebido reclamações recorrentes sobre o mal uso do espaço de descanso no horário de almoço.\nFoi reportado excesso de conversas em tom alto e ruídos, o que está prejudicando diretamente o descanso de colegas que utilizam o espaço para esse fim 🥱\nReforçamos que o espaço de descanso deve ser um ambiente silencioso e apropriado para relaxamento. Portanto, solicitamos que as conversas sejam mantidas em tom baixo, sempre priorizando o respeito ao ambiente.\n\nNem todos estão no mesmo ritmo: enquanto alguns gostam de conversar, outros precisam de silêncio para recarregar as energias 🔋\nVamos cuidar do ambiente como gostaríamos que cuidassem por nós 💚💙\n\nContamos com a colaboração de todas para manter um espaço respeitoso e adequado 😊." },
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

const leitoresMock = [
  { nome: "KAREN MAGESTE", cargo: "ANALISTA I", unidade: "2M Saúde", departamento: "Pessoal", data: "09/04/2026" },
  { nome: "VICTÓRIA ALVES", cargo: "Estagiária", unidade: "2M Contabilidade", departamento: "Contábil", data: "15/04/2026" },
  { nome: "JÚLIA CAROLINA SILVA", cargo: "Assistente", unidade: "2M Contabilidade", departamento: "Fiscal", data: "09/04/2026" },
  { nome: "LARISSA ANGELA LEITE", cargo: "ANALISTA FISCAL II - Step 5", unidade: "2M Saúde", departamento: "Fiscal", data: "09/04/2026" },
  { nome: "ANA CAROLINA GODEZ", cargo: "Auxiliar", unidade: "2M Saúde", departamento: "Pessoal", data: "09/04/2026" },
];

function ComunicadosTable({
  data,
  search,
  onView,
  onEdit,
  onDuplicate,
  onDetails,
  onArchiveToggle,
  onDelete,
}: {
  data: Comunicado[];
  search: string;
  onView: (c: Comunicado) => void;
  onEdit: (c: Comunicado) => void;
  onDuplicate: (c: Comunicado) => void;
  onDetails: (c: Comunicado) => void;
  onArchiveToggle: (c: Comunicado) => void;
  onDelete: (c: Comunicado) => void;
}) {
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
              <button
                type="button"
                onClick={() => onView(item)}
                className="text-primary underline text-sm cursor-pointer text-left hover:text-primary/80"
              >
                {item.assunto}
              </button>
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
                  <DropdownMenuItem className="text-primary" onClick={() => onEdit(item)}>Editar</DropdownMenuItem>
                  <DropdownMenuItem className="text-primary" onClick={() => onDuplicate(item)}>Duplicar</DropdownMenuItem>
                  <DropdownMenuItem className="text-primary" onClick={() => onDetails(item)}>Detalhes</DropdownMenuItem>
                  <DropdownMenuItem className="text-primary" onClick={() => onArchiveToggle(item)}>
                    {item.status === "Arquivado" ? "Desarquivar" : "Arquivar"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500 focus:text-red-600" onClick={() => onDelete(item)}>Excluir</DropdownMenuItem>
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

  const [comunicados, setComunicados] = useState<Comunicado[]>(initialData);
  const [viewing, setViewing] = useState<Comunicado | null>(null);
  const [details, setDetails] = useState<Comunicado | null>(null);
  const [leitoresSearch, setLeitoresSearch] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<Comunicado | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Comunicado | null>(null);

  const clearFilters = () => {
    setStatusFilter("");
    setEtiquetaFilter("");
    setDataInicio("");
    setDataFim("");
  };

  const handleEdit = (c: Comunicado) => {
    navigate("/comunicados/criar", { state: { comunicado: c, mode: "edit" } });
  };

  const handleDuplicate = (c: Comunicado) => {
    const novo: Comunicado = { ...c, assunto: `${c.assunto} (cópia)`, lidos: "0/0", leitura: "Pendente" };
    setComunicados((prev) => [novo, ...prev]);
    toast.success("Comunicado duplicado com sucesso");
  };

  const confirmArchive = () => {
    if (!archiveTarget) return;
    setComunicados((prev) =>
      prev.map((c) =>
        c.assunto === archiveTarget.assunto && c.publicacao === archiveTarget.publicacao
          ? { ...c, status: c.status === "Arquivado" ? "Ativado" : "Arquivado" }
          : c
      )
    );
    toast.success(archiveTarget.status === "Arquivado" ? "Comunicado desarquivado" : "Comunicado arquivado");
    setArchiveTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setComunicados((prev) =>
      prev.filter((c) => !(c.assunto === deleteTarget.assunto && c.publicacao === deleteTarget.publicacao))
    );
    toast.success("Comunicado excluído");
    setDeleteTarget(null);
  };

  const tableProps = {
    search,
    onView: setViewing,
    onEdit: handleEdit,
    onDuplicate: handleDuplicate,
    onDetails: setDetails,
    onArchiveToggle: setArchiveTarget,
    onDelete: setDeleteTarget,
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

            <ComunicadosTable data={comunicados} {...tableProps} />

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <span>Itens por página: 15</span>
              </div>
              <div>1 - 15 de {comunicados.length} itens</div>
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
            <ComunicadosTable data={[]} {...tableProps} />
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
            <ComunicadosTable data={[]} {...tableProps} />
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

      {/* Visualizar conteúdo do comunicado */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary border-b pb-3">
              {viewing?.assunto}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed pt-2">
            {viewing?.conteudo || "Sem conteúdo disponível para este comunicado."}
          </div>
        </DialogContent>
      </Dialog>

      {/* Detalhes do comunicado */}
      <Dialog open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setDetails(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-xl">Detalhes do comunicado</DialogTitle>
            </div>
          </DialogHeader>

          {details && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold mb-3">Informações gerais:</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold">Assunto:</span> {details.assunto}</div>
                  <div>
                    <span className="font-semibold">Etiquetas:</span>{" "}
                    {details.etiquetas?.length ? details.etiquetas.join(", ") : "Sem etiqueta"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-2">
                  <p className="text-sm font-semibold">Envio:</p>
                  <div className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Criado por:</p>
                      <p className="font-semibold">{details.criadoPor || "—"}</p>
                      <p className="text-primary text-xs">{details.cargoAutor || ""}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Informações:</p>
                      <p>Destaque: <Badge variant="outline" className="bg-blue-50 text-primary border-blue-200">{details.destaque ? "Sim" : "Não"}</Badge></p>
                      <p className="mt-1">Notificação por E-mail: <Badge variant="outline" className="bg-blue-50 text-primary border-blue-200">{details.emailNotif ? "Sim" : "Não"}</Badge></p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Data de publicação:</p>
                      <p>{details.publicacao}</p>
                      <p className="text-muted-foreground text-xs mt-2 mb-1">Data de expiração:</p>
                      <p>{details.expiracao}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Participantes:</p>
                    <Button variant="outline" size="sm" className="gap-2 h-7">
                      <Download className="h-3 w-3" />
                      Exportar
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 text-sm space-y-2">
                    <p className="text-muted-foreground text-xs">Destinatários:</p>
                    <div className="flex -space-x-1">
                      {details.destinatarios.map((d, i) => (
                        <div key={i} className="h-7 w-7 rounded-full bg-slate-800 text-white text-[10px] font-semibold flex items-center justify-center border-2 border-background">
                          {d}
                        </div>
                      ))}
                    </div>
                    <p className="text-muted-foreground text-xs mt-2">Visualizações:</p>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 w-fit">{details.lidos.split("/")[0]} lidos</Badge>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 w-fit">{details.lidos.split("/")[1] || 0} não lidos</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-3">Leitores:</h3>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Busque pelo nome do colaborador, cargo, unidade ou departamento"
                    value={leitoresSearch}
                    onChange={(e) => setLeitoresSearch(e.target.value)}
                    className="pl-10 rounded-full"
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaboradores</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Data de leitura</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leitoresMock
                      .filter((l) =>
                        [l.nome, l.cargo, l.unidade, l.departamento]
                          .join(" ")
                          .toLowerCase()
                          .includes(leitoresSearch.toLowerCase())
                      )
                      .map((l, i) => (
                        <TableRow key={i}>
                          <TableCell className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                              {l.nome.charAt(0)}
                            </div>
                            {l.nome}
                          </TableCell>
                          <TableCell>{l.cargo}</TableCell>
                          <TableCell>{l.unidade}</TableCell>
                          <TableCell>{l.departamento}</TableCell>
                          <TableCell>{l.data}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Arquivar / Desarquivar */}
      <Dialog open={!!archiveTarget} onOpenChange={(o) => !o && setArchiveTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <DialogTitle>
                {archiveTarget?.status === "Arquivado" ? "Desarquivar comunicado?" : "Arquivar comunicado?"}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">
              {archiveTarget?.status === "Arquivado"
                ? "Esse comunicado ficará visível."
                : "Esse comunicado ficará invisível."}
            </p>
            <p className="text-muted-foreground">
              {archiveTarget?.status === "Arquivado"
                ? "Uma vez desarquivado, esse comunicado será visível na listagem para todos os colaboradores. Você poderá desarquivá-lo a qualquer momento."
                : "Uma vez arquivado, esse comunicado só será visível na listagem para colaboradores com permissão de gerenciar o módulo de Comunicados. Você poderá desarquivá-lo a qualquer momento."}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setArchiveTarget(null)}>Cancelar</Button>
            <Button onClick={confirmArchive}>
              {archiveTarget?.status === "Arquivado" ? "Desarquivar" : "Arquivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excluir */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <div className="h-14 w-14 rounded-full border-2 border-orange-400 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-orange-400" />
            </div>
            <DialogTitle className="text-xl">Atenção!</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Após excluir esse comunicado não será mais possível recuperar.
            </p>
            <p className="text-sm">Você tem certeza disso?</p>
            <div className="flex gap-3 pt-2 w-full justify-center">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>Sim</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
