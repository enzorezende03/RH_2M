import { useState } from "react";
import { Search, Eye, Calendar, ChevronLeft, ChevronRight, Settings, Upload, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type SolicitacaoStatus = "todas" | "analise_gestor" | "analise_rh" | "documentacao" | "reprovada" | "concluida" | "cancelada";

const statusTabs: { value: SolicitacaoStatus; label: string; count: number }[] = [
  { value: "todas", label: "Todas", count: 0 },
  { value: "analise_gestor", label: "Análise Gestor", count: 0 },
  { value: "analise_rh", label: "Análise RH", count: 0 },
  { value: "documentacao", label: "Documentação", count: 0 },
  { value: "reprovada", label: "Reprovada", count: 0 },
  { value: "concluida", label: "Concluída", count: 0 },
  { value: "cancelada", label: "Cancelada", count: 0 },
];

const saldosTabs = [
  { value: "todos", label: "Todos" },
  { value: "em_dobro", label: "Em dobro" },
  { value: "1_29", label: "A vencer 1 a 29 dias" },
  { value: "30_59", label: "A vencer 30 a 59 dias" },
  { value: "60_90", label: "A vencer 60 a 90 dias" },
];

export default function FeriasSolicitacoes() {
  const [mainTab, setMainTab] = useState("solicitacoes");
  const [statusFilter, setStatusFilter] = useState<SolicitacaoStatus>("todas");
  const [saldosFilter, setSaldosFilter] = useState("todos");
  const [searchName, setSearchName] = useState("");
  const [gestorFilter, setGestorFilter] = useState("todos");
  const [cadastroFilter, setCadastroFilter] = useState("tudo");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Form state for create dialog
  const [venderFerias, setVenderFerias] = useState("nao");
  const [diasVenda, setDiasVenda] = useState("0");
  const [adiantar13, setAdiantar13] = useState("nao");
  const [observacoes, setObservacoes] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Férias & Recesso</h1>
          <p className="text-muted-foreground text-sm">Gerencie as solicitações de férias dos colaboradores.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateDialog(true)} className="bg-primary text-primary-foreground rounded-full px-6">
            Criar solicitação
          </Button>
          <Button variant="outline" className="gap-2">
            Importar <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Tabs: Solicitações / Saldos */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="bg-muted/30 border-b w-full justify-start rounded-none h-auto p-0 gap-0">
          <TabsTrigger
            value="solicitacoes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3 gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Solicitações
          </TabsTrigger>
          <TabsTrigger
            value="saldos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3 gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Saldos
          </TabsTrigger>
        </TabsList>

        {/* Solicitações Tab */}
        <TabsContent value="solicitacoes" className="space-y-4 mt-4">
          {/* Status sub-tabs */}
          <div className="flex gap-6 border-b">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  statusFilter === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquise colaboradores pelo nome"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={gestorFilter} onValueChange={setGestorFilter}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Selecione o gestor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os gestores</SelectItem>
                {/* Gestores serão carregados quando houver colaboradores cadastrados */}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-primary">Colaborador</TableHead>
                <TableHead className="font-semibold text-primary">Gestor Direto</TableHead>
                <TableHead className="font-semibold text-primary">Data da Solicitação</TableHead>
                <TableHead className="font-semibold text-primary">Período Solicitado</TableHead>
                <TableHead className="font-semibold text-primary">Etapa</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  Nenhuma solicitação de férias encontrada.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Itens por página:</span>
              <Select defaultValue="25">
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span>0 de 0 itens</span>
            <div className="flex items-center gap-2">
              <span>1 de 1 páginas</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Saldos Tab */}
        <TabsContent value="saldos" className="space-y-4 mt-4">
          {/* Alert */}
          <Alert className="bg-accent/50 border-accent text-accent-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="flex items-center justify-between w-full">
              <span>
                Você possui <strong>0 colaboradores</strong> com cadastro incompleto para cálculo de saldos.
              </span>
              <button className="text-primary font-medium hover:underline">Filtrar lista</button>
            </AlertDescription>
          </Alert>

          {/* Saldos sub-tabs */}
          <div className="flex gap-6 border-b">
            {saldosTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSaldosFilter(tab.value)}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  saldosFilter === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquise colaboradores pelo nome"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={gestorFilter} onValueChange={setGestorFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione o gestor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os gestores</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cadastroFilter} onValueChange={setCadastroFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tudo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tudo">Tudo</SelectItem>
                <SelectItem value="incompleto">Cadastro incompleto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-primary">Colaborador</TableHead>
                <TableHead className="font-semibold text-primary">Gestor direto</TableHead>
                <TableHead className="font-semibold text-primary">Vínculo</TableHead>
                <TableHead className="font-semibold text-primary">Período aquisitivo</TableHead>
                <TableHead className="font-semibold text-primary">Saldo</TableHead>
                <TableHead className="font-semibold text-primary">Data limite</TableHead>
                <TableHead className="font-semibold text-primary">A vencer</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                  Nenhum colaborador encontrado.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Itens por página:</span>
              <Select defaultValue="25">
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span>0 de 0 itens</span>
            <div className="flex items-center gap-2">
              <span>1 de 1 páginas</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Solicitação Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar solicitação para um colaborador</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Colaborador & Gestor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Colaborador</p>
                <p className="text-sm text-muted-foreground italic">Nenhum colaborador selecionado</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Gestor</p>
                <p className="text-sm text-muted-foreground italic">—</p>
              </div>
            </div>

            <button className="text-primary text-sm font-medium hover:underline">
              Detalhes de saldo do colaborador
            </button>

            {/* Período aquisitivo */}
            <div className="border rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Solicitação referente ao período aquisitivo</span>
                <span>Saldo: — dias</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Período de Férias */}
            <div>
              <Label className="font-semibold">Período de Férias *</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Defina o período de descanso.{" "}
                <button className="text-primary hover:underline">Ver regras de solicitação</button>
              </p>
              <div className="flex items-center gap-2">
                <Input type="text" placeholder="dd/mm/aaaa" className="flex-1" />
                <span className="text-sm text-muted-foreground">até</span>
                <Input type="text" placeholder="dd/mm/aaaa" className="flex-1" />
              </div>
            </div>

            {/* Vender Férias & Adiantar 13o */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Vender Férias ?</Label>
                <RadioGroup value={venderFerias} onValueChange={setVenderFerias} className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="nao" id="vf-nao" />
                    <Label htmlFor="vf-nao" className="text-sm cursor-pointer">Não</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="sim" id="vf-sim" />
                    <Label htmlFor="vf-sim" className="text-sm cursor-pointer">Sim</Label>
                  </div>
                  {venderFerias === "sim" && (
                    <div className="flex items-center gap-1">
                      <Input
                        value={diasVenda}
                        onChange={(e) => setDiasVenda(e.target.value)}
                        className="w-12 h-8 text-center"
                      />
                      <span className="text-sm text-muted-foreground">Dias</span>
                    </div>
                  )}
                </RadioGroup>
              </div>
              <div>
                <Label className="font-semibold">Adiantar 1ª Parcela do 13º?</Label>
                <RadioGroup value={adiantar13} onValueChange={setAdiantar13} className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="nao" id="a13-nao" />
                    <Label htmlFor="a13-nao" className="text-sm cursor-pointer">Não</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="sim" id="a13-sim" />
                    <Label htmlFor="a13-sim" className="text-sm cursor-pointer">Sim</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label className="font-semibold">
                Observações <span className="text-destructive font-normal text-xs">(opcional)</span>
              </Label>
              <Textarea
                placeholder="Insira uma descrição para a ação"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                maxLength={250}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground text-right">{observacoes.length}/250</p>
            </div>

            {/* Documento */}
            <div>
              <Label className="font-semibold">
                Documento de Férias <span className="text-destructive font-normal text-xs">(opcional)</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Os documentos inseridos aqui também serão visíveis no cadastro do colaborador
              </p>
              <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>Clique aqui ou arraste e solte o arquivo nesta área para realizar o upload</p>
                <p className="text-xs mt-1">Aceitamos arquivo em formato .PDF, .PNG e .JPEG de no máximo 50MB.</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">Voltar</Button>
              <Button disabled>Solicitar Férias</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog (for view icon in Solicitações and calendar icon in Saldos) */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar solicitação para um colaborador</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Colaborador</p>
                <p className="text-sm text-muted-foreground italic">—</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Gestor</p>
                <p className="text-sm text-muted-foreground italic">—</p>
              </div>
            </div>

            <div className="border rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Solicitação referente ao período aquisitivo</span>
                <span>Saldo: — dias</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>

            <div>
              <Label className="font-semibold">Período de Férias *</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Defina o período de descanso.{" "}
                <button className="text-primary hover:underline">Ver regras de solicitação</button>
              </p>
              <div className="flex items-center gap-2">
                <Input type="text" placeholder="dd/mm/aaaa" className="flex-1" disabled />
                <span className="text-sm text-muted-foreground">até</span>
                <Input type="text" placeholder="dd/mm/aaaa" className="flex-1" disabled />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Vender Férias ?</Label>
                <RadioGroup value="nao" className="flex items-center gap-3 mt-2" disabled>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="nao" id="d-vf-nao" />
                    <Label htmlFor="d-vf-nao" className="text-sm">Não</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="sim" id="d-vf-sim" />
                    <Label htmlFor="d-vf-sim" className="text-sm">Sim</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input value="0" className="w-12 h-8 text-center" disabled />
                    <span className="text-sm text-muted-foreground">Dias</span>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label className="font-semibold">Adiantar 1ª Parcela do 13º?</Label>
                <RadioGroup value="nao" className="flex items-center gap-3 mt-2" disabled>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="nao" id="d-a13-nao" />
                    <Label htmlFor="d-a13-nao" className="text-sm">Não</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="sim" id="d-a13-sim" />
                    <Label htmlFor="d-a13-sim" className="text-sm">Sim</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div>
              <Label className="font-semibold">
                Observações <span className="text-destructive font-normal text-xs">(opcional)</span>
              </Label>
              <Textarea placeholder="Insira uma descrição para a ação" disabled maxLength={250} className="mt-1" />
              <p className="text-xs text-muted-foreground text-right">0/250</p>
            </div>

            <div>
              <Label className="font-semibold">
                Documento de Férias <span className="text-destructive font-normal text-xs">(opcional)</span>
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Os documentos inseridos aqui também serão visíveis no cadastro do colaborador
              </p>
              <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>Clique aqui ou arraste e solte o arquivo nesta área para realizar o upload</p>
                <p className="text-xs mt-1">Aceitamos arquivo em formato .PDF, .PNG e .JPEG de no máximo 50MB.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">Voltar</Button>
              <Button disabled>Solicitar Férias</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
