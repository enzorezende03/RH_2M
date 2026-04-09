import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Eye, KeyRound, Search, Upload, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const tiposDesligamento = [
  "Voluntário",
  "Involuntário com justa causa",
  "Involuntário sem justa causa",
  "Comum Acordo",
  "Falecimento",
];

const motivosDesligamento = [
  "Alinhamento Cultural",
  "Ato de Improbidade",
  "Ausência de Feedbacks",
  "Ausência de Reconhecimento",
  "Baixo desempenho",
  "Condenação Criminal",
  "Embriaguez em serviço",
  "Equilíbrio Profissional/Pessoal",
  "Falecimento",
  "Falta de Metas",
  "Indisciplina/Mau Comportamento",
  "Insatisfação c/ Ambiente",
  "Insatisfação c/ Benefícios",
  "Insatisfação c/ Chefia",
  "Insatisfação c/ Cliente",
  "Insatisfação c/ Cultura",
  "Insatisfação c/ Empresa",
  "Insubordinação",
  "Internalização no cliente",
  "Motivos pessoais",
  "Mudança de Vínculo",
  "Negociação/Acordo",
  "Nova Oportunidade",
  "Ofensas físicas",
  "Perda da habilitação profissional",
  "Problemas de Saúde",
  "Redução de Custos",
  "Salário",
  "Solicitação do cliente",
  "Subaproveitamento",
  "Término de contrato",
  "Término de projeto",
  "Violação de dados sigilosos",
  "Reestruturação da área",
  "Insatisfação c/ Desafio",
  "Não se adaptou às atividades",
  "Outros",
];

interface Desligamento {
  id: number;
  colaborador: string;
  cargo: string;
  gestor: string;
  gestorCargo?: string;
  dataSolicitacao: string;
  tipo: string;
  motivo: string;
  acessoFeedz: "Ativado" | "Desabilitado";
  etapa: "Concluído" | "Cancelado" | "Documentação";
  ultimoDiaTrabalhado: string;
}

const desligamentosMock: Desligamento[] = [
  { id: 1, colaborador: "GRACE KELLY DOS SANTOS DE OLIVEIRA", cargo: "ASSISTENTE - Step 5", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "02/04/2026", tipo: "Voluntário", motivo: "Motivos pessoais", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "01/04/2026" },
  { id: 2, colaborador: "ANA LUIZA DE OLIVEIRA MACHADO", cargo: "Auxiliar", gestor: "LIVIA GARCIA XAVIER", gestorCargo: "Analista III", dataSolicitacao: "30/03/2026", tipo: "Involuntário sem justa causa", motivo: "Baixo desempenho", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "29/03/2026" },
  { id: 3, colaborador: "PRISCILA GONÇALVES ROCHA", cargo: "Auxiliar", gestor: "LIVIA GARCIA XAVIER", gestorCargo: "Analista III", dataSolicitacao: "06/03/2026", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Ativado", etapa: "Concluído", ultimoDiaTrabalhado: "04/02/2026" },
  { id: 4, colaborador: "PRISCILA GONÇALVES ROCHA", cargo: "Auxiliar", gestor: "LIVIA GARCIA XAVIER", gestorCargo: "Analista III", dataSolicitacao: "06/03/2026", tipo: "Voluntário", motivo: "Motivos pessoais", acessoFeedz: "Ativado", etapa: "Cancelado", ultimoDiaTrabalhado: "04/02/2026" },
  { id: 5, colaborador: "SARA PAULA", cargo: "Auxiliar", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "05/03/2026", tipo: "Voluntário", motivo: "Motivos pessoais", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "04/03/2026" },
  { id: 6, colaborador: "Rayanne Fernandes", cargo: "", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "13/02/2026", tipo: "Voluntário", motivo: "Equilíbrio Profissional/Pessoal", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "12/02/2026" },
  { id: 7, colaborador: "ALINE DAIENE GOULARTH BRANCO", cargo: "Estagiária", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "09/01/2026", tipo: "Voluntário", motivo: "Motivos pessoais", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "08/01/2026" },
];

const getInitials = (name: string) => {
  const parts = name.split(" ");
  return (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "");
};

const Desligamentos = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [selectedDesligamento, setSelectedDesligamento] = useState<Desligamento | null>(null);
  const [selectedDeactivate, setSelectedDeactivate] = useState<Desligamento | null>(null);

  // Create form state
  const [formColaborador, setFormColaborador] = useState("");
  const [formTipo, setFormTipo] = useState("");
  const [formMotivo, setFormMotivo] = useState("");
  const [formUltimoDia, setFormUltimoDia] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const filtered = desligamentosMock.filter((d) => {
    const matchesSearch = d.colaborador.toLowerCase().includes(search.toLowerCase()) || d.gestor.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "todos") return matchesSearch;
    if (activeTab === "documentacao") return matchesSearch && d.etapa === "Documentação";
    if (activeTab === "concluidos") return matchesSearch && d.etapa === "Concluído";
    if (activeTab === "cancelados") return matchesSearch && d.etapa === "Cancelado";
    return matchesSearch;
  });

  const counts = {
    todos: desligamentosMock.length,
    documentacao: desligamentosMock.filter((d) => d.etapa === "Documentação").length,
    concluidos: desligamentosMock.filter((d) => d.etapa === "Concluído").length,
    cancelados: desligamentosMock.filter((d) => d.etapa === "Cancelado").length,
  };

  const handleCreate = () => {
    const errors: Record<string, boolean> = {};
    if (!formColaborador) errors.colaborador = true;
    if (!formTipo) errors.tipo = true;
    if (!formMotivo) errors.motivo = true;
    if (!formUltimoDia) errors.ultimoDia = true;
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    toast({ title: "Desligamento criado", description: "O processo de desligamento foi registrado com sucesso." });
    setShowCreateDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormColaborador("");
    setFormTipo("");
    setFormMotivo("");
    setFormUltimoDia("");
    setFormErrors({});
  };

  const handleDeactivateAccess = () => {
    toast({ title: "Acesso desativado", description: `O acesso de ${selectedDeactivate?.colaborador} foi removido.` });
    setShowDeactivateDialog(false);
    setSelectedDeactivate(null);
  };

  const colaboradoresList = [...new Set(desligamentosMock.map((d) => d.colaborador))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Desligamento de colaboradores</h1>
          <p className="text-muted-foreground">Gerencie as solicitações de desligamento dos colaboradores.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} className="rounded-full px-6">
          Criar desligamento
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 gap-0">
          {[
            { value: "todos", label: `Todos (${counts.todos})` },
            { value: "documentacao", label: `Documentação (${counts.documentacao})` },
            { value: "concluidos", label: `Concluídos (${counts.concluidos})` },
            { value: "cancelados", label: `Cancelados (${counts.cancelados})` },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquise colaboradores pelo nome ou e-mail"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary font-semibold italic">Colaborador</TableHead>
                <TableHead className="text-primary font-semibold italic">Gestor Direto</TableHead>
                <TableHead className="text-primary font-semibold italic">Data da Solicitação</TableHead>
                <TableHead className="text-primary font-semibold italic">Tipo</TableHead>
                <TableHead className="text-primary font-semibold italic">Acesso a Feedz</TableHead>
                <TableHead className="text-primary font-semibold italic">Etapa</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-muted">{getInitials(d.colaborador)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{d.colaborador}</p>
                        {d.cargo && <p className="text-xs text-muted-foreground">{d.cargo}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs bg-muted">{getInitials(d.gestor)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{d.gestor}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{d.dataSolicitacao}</TableCell>
                  <TableCell className="text-sm">{d.tipo}</TableCell>
                  <TableCell className="text-sm">{d.acessoFeedz}</TableCell>
                  <TableCell>
                    <Badge
                      variant={d.etapa === "Concluído" ? "default" : d.etapa === "Cancelado" ? "destructive" : "secondary"}
                      className={d.etapa === "Concluído" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {d.etapa === "Concluído" ? "Concluído" : d.etapa === "Cancelado" ? "Cancelado" : "Documentação"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {d.acessoFeedz === "Ativado" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setSelectedDeactivate(d); setShowDeactivateDialog(true); }}
                          title="Desativar acesso"
                        >
                          <KeyRound className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setSelectedDesligamento(d); setShowViewDialog(true); }}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum desligamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do desligamento</DialogTitle>
            <DialogDescription className="sr-only">Informações detalhadas do processo de desligamento</DialogDescription>
          </DialogHeader>

          {selectedDesligamento && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">Status do processo</span>
                <Badge
                  variant={selectedDesligamento.etapa === "Concluído" ? "default" : selectedDesligamento.etapa === "Cancelado" ? "destructive" : "secondary"}
                  className={selectedDesligamento.etapa === "Concluído" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {selectedDesligamento.etapa}
                </Badge>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${selectedDesligamento.etapa === "Concluído" || selectedDesligamento.etapa === "Cancelado" ? "bg-primary" : "bg-muted"}`}>✓</div>
                <div className={`flex-1 h-1 rounded ${selectedDesligamento.etapa === "Concluído" ? "bg-primary" : "bg-muted"}`} />
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${selectedDesligamento.etapa === "Concluído" ? "bg-primary" : "bg-muted"}`}>✓</div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground -mt-4">
                <span>Preparando documentação</span>
                <span>Concluída</span>
              </div>

              {/* Colaborador e Gestor */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-xs text-muted-foreground">Colaborador</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-muted">{getInitials(selectedDesligamento.colaborador)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{selectedDesligamento.colaborador}</p>
                      {selectedDesligamento.cargo && <p className="text-xs text-muted-foreground">{selectedDesligamento.cargo}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Gestor</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-muted">{getInitials(selectedDesligamento.gestor)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{selectedDesligamento.gestor}</p>
                      {selectedDesligamento.gestorCargo && <p className="text-xs text-muted-foreground">{selectedDesligamento.gestorCargo}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipo e Motivo */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-sm">Tipo de desligamento *</Label>
                  <Select value={selectedDesligamento.tipo} disabled>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tiposDesligamento.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Motivo do desligamento *</Label>
                  <Select value={selectedDesligamento.motivo} disabled>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {motivosDesligamento.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Último dia */}
              <div className="space-y-1">
                <Label className="text-sm">Último dia trabalhado *</Label>
                <p className="text-xs text-muted-foreground">Essa data será considerada para o relatório de turnover</p>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={selectedDesligamento.ultimoDiaTrabalhado} disabled className="pl-10" />
                </div>
              </div>

              {/* Documento */}
              <div className="space-y-1">
                <Label className="text-sm">Documento de desligamento *</Label>
                <p className="text-xs text-muted-foreground">Os documentos inseridos aqui também serão visíveis no cadastro do colaborador</p>
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <Upload className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm">Clique aqui ou arraste e solte o arquivo nesta área para realizar o upload</p>
                  <p className="text-xs mt-1">Aceitamos arquivo em formato .PDF, .PNG e JPEG e de no máximo 50MB.</p>
                </div>
              </div>

              <div>
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowCreateDialog(open); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar desligamento</DialogTitle>
            <DialogDescription className="sr-only">Formulário para criar novo desligamento</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Colaborador e Gestor display */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-xs text-muted-foreground">Colaborador</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs bg-muted">
                      {formColaborador ? getInitials(formColaborador) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{formColaborador || "Nenhum"}</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Gestor</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs bg-muted">?</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Nenhum</span>
                </div>
              </div>
            </div>

            {/* Select Colaborador */}
            <div className="space-y-1">
              <Select value={formColaborador} onValueChange={setFormColaborador}>
                <SelectTrigger className={formErrors.colaborador ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradoresList.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {formErrors.colaborador && <p className="text-xs text-destructive">O colaborador é obrigatório</p>}
            </div>

            {/* Tipo e Motivo */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm">Tipo de desligamento *</Label>
                <Select value={formTipo} onValueChange={setFormTipo}>
                  <SelectTrigger className={formErrors.tipo ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDesligamento.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                {formErrors.tipo && <p className="text-xs text-destructive">O tipo de desligamento é obrigatório</p>}
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Motivo do desligamento *</Label>
                <Select value={formMotivo} onValueChange={setFormMotivo}>
                  <SelectTrigger className={formErrors.motivo ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {motivosDesligamento.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                {formErrors.motivo && <p className="text-xs text-destructive">O motivo do desligamento é obrigatório</p>}
              </div>
            </div>

            {/* Último dia */}
            <div className="space-y-1">
              <Label className="text-sm">Último dia trabalhado *</Label>
              <p className="text-xs text-muted-foreground">Essa data será considerada para o relatório de turnover</p>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={formUltimoDia}
                  onChange={(e) => setFormUltimoDia(e.target.value)}
                  className={`pl-10 ${formErrors.ultimoDia ? "border-destructive" : ""}`}
                />
              </div>
              {formErrors.ultimoDia && <p className="text-xs text-destructive">O último dia trabalhado é obrigatório</p>}
            </div>

            {/* Documento */}
            <div className="space-y-1">
              <Label className="text-sm">Documento de desligamento <span className="text-muted-foreground">(opcional)</span></Label>
              <p className="text-xs text-muted-foreground">Os documentos inseridos aqui também serão visíveis no cadastro do colaborador</p>
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">Clique aqui ou arraste e solte o arquivo nesta área para realizar o upload</p>
                <p className="text-xs mt-1">Aceitamos arquivo em formato .PDF, .PNG e JPEG e de no máximo 50MB.</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowCreateDialog(false); }}>Cancelar</Button>
            <Button onClick={handleCreate}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Access Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent className="bg-slate-700 text-white border-slate-600">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <span className="text-destructive">◆</span> Desativar acesso à Feedz
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-200">
              <span className="font-semibold text-white block mb-1">Deseja remover o acesso deste colaborador?</span>
              O colaborador não poderá mais acessar a plataforma Feedz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-500 text-white hover:bg-slate-600 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateAccess} className="bg-destructive hover:bg-destructive/90 text-white">
              Desativar acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Desligamentos;
