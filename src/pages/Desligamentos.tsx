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
import { useNotificacoes } from "@/stores/notificacoesStore";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useEntity } from "@/hooks/useEntity";

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

const HISTORICO_DESLIGAMENTOS: Desligamento[] = [
  { id: 100001, colaborador: "VICTORIA ALVES", cargo: "Estagiária", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "30/05/2026", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "30/05/2026" },
  { id: 100002, colaborador: "LORENA CARDOSO DE OLIVEIRA", cargo: "Estagiária", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "22/04/2026", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "22/04/2026" },
  { id: 100003, colaborador: "ANA CAROLINA TEIXEIRA", cargo: "Estagiária", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "22/04/2026", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "22/04/2026" },
  { id: 100004, colaborador: "ISABELA SANTOS BRAGA", cargo: "Analista II - Step 5", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "13/04/2026", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "13/04/2026" },
  { id: 100005, colaborador: "GRACE KELLY DOS SANTOS DE OLIVEIRA", cargo: "Assistente - Step 5", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "12/04/2026", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "12/04/2026" },
  { id: 100006, colaborador: "ANA LUIZA DE OLIVEIRA MACHADO", cargo: "Auxiliar", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "30/03/2026", tipo: "Involuntário sem justa causa", motivo: "Baixo desempenho", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "30/03/2026" },
  { id: 100007, colaborador: "PRISCILA GONÇALVES ROCHA", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "16/03/2026", tipo: "Voluntário", motivo: "Motivos pessoais", acessoFeedz: "Ativado", etapa: "Concluído", ultimoDiaTrabalhado: "16/03/2026" },
  { id: 100008, colaborador: "PRISCILA GONÇALVES ROCHA", cargo: "Assistente", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "16/03/2026", tipo: "Voluntário", motivo: "Motivos pessoais", acessoFeedz: "Ativado", etapa: "Cancelado", ultimoDiaTrabalhado: "16/03/2026" },
  { id: 100009, colaborador: "SARA PAULA", cargo: "Auxiliar", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "03/03/2026", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "03/03/2026" },
  { id: 100010, colaborador: "Rayanne Fernandes", cargo: "", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "13/02/2026", tipo: "Voluntário", motivo: "Motivos pessoais", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "13/02/2026" },
  { id: 100011, colaborador: "ALINE DAIANE GOULARTH BRANCO", cargo: "Estagiária", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "04/01/2026", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "04/01/2026" },
  { id: 100012, colaborador: "BIANCA CAROLINE LINO TAVARES", cargo: "Estagiária", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "26/11/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "26/11/2025" },
  { id: 100013, colaborador: "KAMILA ALMEIDA", cargo: "Estagiária", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "23/11/2025", tipo: "Involuntário sem justa causa", motivo: "Baixo desempenho", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "23/11/2025" },
  { id: 100014, colaborador: "LETÍCIA RIGATTO FERNANDES", cargo: "Estagiária", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "06/11/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "06/11/2025" },
  { id: 100015, colaborador: "QUÊNIA AMORIM DE OLIVEIRA", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "03/11/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "03/11/2025" },
  { id: 100016, colaborador: "ESTELA TORRES DE SOUZA PAIVA", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "04/10/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "04/10/2025" },
  { id: 100017, colaborador: "CARLA PATRICIA DOS SANTOS", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "04/10/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "04/10/2025" },
  { id: 100018, colaborador: "BRUNA LOPES PEREIRA", cargo: "Estagiária", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "01/10/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "01/10/2025" },
  { id: 100019, colaborador: "TAINARA SANTOS ALMEIDA", cargo: "Estagiária", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "18/09/2025", tipo: "Involuntário sem justa causa", motivo: "Baixo desempenho", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "18/09/2025" },
  { id: 100020, colaborador: "RAYONE CÂNDIDO PIRES SILVA", cargo: "Assistente", gestor: "ANA CAROLINA BRAGA DE MOURA", dataSolicitacao: "18/08/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "18/08/2025" },
  { id: 100021, colaborador: "Ednela Pereira de Lima", cargo: "", gestor: "—", dataSolicitacao: "15/08/2025", tipo: "Voluntário", motivo: "Motivos pessoais", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "15/08/2025" },
  { id: 100022, colaborador: "DANIELLA CRISTINA DE SOUZA GONÇALVES", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "16/08/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "16/08/2025" },
  { id: 100023, colaborador: "AGATHA PEREIRA", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "31/07/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "31/07/2025" },
  { id: 100024, colaborador: "GABRIELA SOARES CAMPOS", cargo: "Analista II - Step 5", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "15/07/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Ativado", etapa: "Concluído", ultimoDiaTrabalhado: "15/07/2025" },
  { id: 100025, colaborador: "MICHAELA MARINARA MODESTO", cargo: "Analista II", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "10/07/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "10/07/2025" },
  { id: 100026, colaborador: "JAMILA OLVEIRA COSTA", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "07/07/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "07/07/2025" },
  { id: 100027, colaborador: "KETHELEN LORRAYNE", cargo: "", gestor: "—", dataSolicitacao: "03/06/2025", tipo: "Voluntário", motivo: "Motivos pessoais", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "03/06/2025" },
  { id: 100028, colaborador: "NÚRIA DE LOURDES DOS SANTOS", cargo: "", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "03/06/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "03/06/2025" },
  { id: 100029, colaborador: "TAIS ATANÁZIO DA COSTA SANTOS", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "04/06/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "04/06/2025" },
  { id: 100030, colaborador: "TATIANA MAGDA DO NASCIMENTO", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "03/06/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "03/06/2025" },
  { id: 100031, colaborador: "LORRAYNE LOPES DE SOUZA", cargo: "Estagiária", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "02/05/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "02/05/2025" },
  { id: 100032, colaborador: "RUBIA ARAUJO", cargo: "Assistente", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "02/05/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "02/05/2025" },
  { id: 100033, colaborador: "ISAMARA CRISTINA GOMES PEDRA", cargo: "Analista I", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "03/04/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "03/04/2025" },
  { id: 100034, colaborador: "NATALIA ALVES FIGUEIREDO", cargo: "Estagiária", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "11/03/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "11/03/2025" },
  { id: 100035, colaborador: "MAYANE KELLY DIAS", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "11/03/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "11/03/2025" },
  { id: 100036, colaborador: "BECK VINICIUS BORGES PIRES", cargo: "Auxiliar", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "03/02/2025", tipo: "Voluntário", motivo: "Nova Oportunidade", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "03/02/2025" },
  { id: 100037, colaborador: "Rubia Resende Marinho Fernandes", cargo: "Assistente", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "30/01/2025", tipo: "Involuntário sem justa causa", motivo: "Baixo desempenho", acessoFeedz: "Desabilitado", etapa: "Concluído", ultimoDiaTrabalhado: "30/01/2025" },
];






const getInitials = (name: string) => {
  const parts = name.split(" ");
  return (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "");
};

const Desligamentos = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const { adicionarNotificacao } = useNotificacoes();
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

  const { colaboradores: colabStoreEarly } = useColaboradores();
  const { data: desligRows = [], create: createDesl } = useEntity<any>("desligamentos");
  const mapEtapa = (status: string): "Concluído" | "Cancelado" | "Documentação" =>
    status === "concluido" ? "Concluído" : status === "cancelado" ? "Cancelado" : "Documentação";
  const desligamentosDb: Desligamento[] = desligRows.map((r: any, i: number) => {
    const c = colabStoreEarly.find((x) => x.id === r.colaborador_id);
    return {
      id: i,
      colaborador: c?.nomeCompleto || r.dados?.colaborador || "—",
      cargo: c?.cargo || "",
      gestor: c?.gestorDireto || "—",
      gestorCargo: c?.gestorCargo,
      dataSolicitacao: r.created_at ? new Date(r.created_at).toLocaleDateString("pt-BR") : "",
      tipo: r.tipo || "",
      motivo: r.motivo || "",
      acessoFeedz: (r.dados?.acessoFeedz as "Ativado" | "Desabilitado") || "Ativado",
      etapa: mapEtapa(r.status),
      ultimoDiaTrabalhado: r.data_desligamento ? new Date(r.data_desligamento).toLocaleDateString("pt-BR") : "",
    };
  });
  const desligamentosMock: Desligamento[] = [...desligamentosDb, ...HISTORICO_DESLIGAMENTOS];

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

  const handleCreate = async () => {
    const errors: Record<string, boolean> = {};
    if (!formColaborador) errors.colaborador = true;
    if (!formTipo) errors.tipo = true;
    if (!formMotivo) errors.motivo = true;
    if (!formUltimoDia) errors.ultimoDia = true;
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const colab = colabStoreEarly.find((c) => c.nomeCompleto === formColaborador);
    await createDesl.mutateAsync({
      colaborador_id: colab?.id,
      tipo: formTipo,
      motivo: formMotivo,
      data_desligamento: formUltimoDia,
      status: "em_andamento",
      dados: { colaborador: formColaborador, acessoFeedz: "Ativado" },
    });
    adicionarNotificacao({ titulo: "Novo desligamento", descricao: `Processo de desligamento registrado para ${formColaborador}`, tipo: "criacao" });
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

  const { colaboradores: colabStore } = useColaboradores();
  const colaboradoresList = colabStore.map((c) => c.nomeCompleto);

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
