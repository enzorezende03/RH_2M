import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  FileText,
  Calculator,
} from "lucide-react";

type Etapa = "Análise Gestor" | "Análise RH" | "Documentação" | "Reprovada" | "Concluída" | "Cancelada";

interface Solicitacao {
  id: string;
  colaborador: string;
  cargo: string;
  gestor: string;
  dataSolicitacao: string;
  inicio: string;
  fim: string;
  etapa: Etapa;
}

const MOCK: Solicitacao[] = [
  { id: "1", colaborador: "ERICK VINICIOS BORGES PIRES", cargo: "Auxiliar", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "04/10/2023", fim: "13/10/2023", etapa: "Concluída" },
  { id: "2", colaborador: "JAMILA SILVEIRA COSTA", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "3", colaborador: "JESSYCA LOPES", cargo: "Analista III", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "4", colaborador: "DANIELLE CAMPOS MILLIOR", cargo: "ANALISTA III - Step 2", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "5", colaborador: "LIVIA GARCIA XAVIER", cargo: "Analista III", gestor: "ANA CAROLINA BRAGA DE MOURA", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "6", colaborador: "CAMILA OLIVEIRA MACEDO", cargo: "Analista I", gestor: "LIVIA GARCIA XAVIER", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "7", colaborador: "GABRIELA SOARES CAMPOS", cargo: "ANALISTA II - Step 5", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "8", colaborador: "ANA CLÁUDIA ROSSI", cargo: "ANALISTA III - Step 1", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "9", colaborador: "DAIANE MATOS BRITO", cargo: "Analista I", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
  { id: "10", colaborador: "ERICK VINICIOS BORGES PIRES", cargo: "Auxiliar", gestor: "DANIELA NASCIMENTO COSTA BICALHO", dataSolicitacao: "29/08/2024", inicio: "21/12/2023", fim: "30/12/2023", etapa: "Concluída" },
];

const etapaCor: Record<Etapa, string> = {
  "Análise Gestor": "bg-orange-100 text-orange-700 hover:bg-orange-100",
  "Análise RH": "bg-blue-100 text-blue-700 hover:bg-blue-100",
  Documentação: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Reprovada: "bg-red-100 text-red-700 hover:bg-red-100",
  Concluída: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Cancelada: "bg-gray-200 text-gray-700 hover:bg-gray-200",
};

export default function FeriasRecessoRH() {
  const [tab, setTab] = useState("solicitacoes");
  const [etapaFiltro, setEtapaFiltro] = useState<string>("todas");
  const [busca, setBusca] = useState("");
  const [gestorFiltro, setGestorFiltro] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const c = { todas: MOCK.length, "Análise Gestor": 3, "Análise RH": 13, Documentação: 1, Reprovada: 24, Concluída: 156, Cancelada: 56 } as Record<string, number>;
    return c;
  }, []);

  const filtrada = useMemo(() => {
    return MOCK.filter((s) => {
      if (etapaFiltro !== "todas" && s.etapa !== etapaFiltro) return false;
      if (busca && !s.colaborador.toLowerCase().includes(busca.toLowerCase())) return false;
      if (gestorFiltro && !s.gestor.toLowerCase().includes(gestorFiltro.toLowerCase())) return false;
      return true;
    });
  }, [etapaFiltro, busca, gestorFiltro]);

  const totalPages = Math.max(1, Math.ceil(253 / perPage));
  const pageItems = filtrada.slice((page - 1) * perPage, page * perPage);

  const etapas: { key: string; label: string }[] = [
    { key: "todas", label: `Todas (${counts.todas})` },
    { key: "Análise Gestor", label: `Análise Gestor (${counts["Análise Gestor"]})` },
    { key: "Análise RH", label: `Análise RH (${counts["Análise RH"]})` },
    { key: "Documentação", label: `Documentação (${counts.Documentação})` },
    { key: "Reprovada", label: `Reprovada (${counts.Reprovada})` },
    { key: "Concluída", label: `Concluída (${counts.Concluída})` },
    { key: "Cancelada", label: `Cancelada (${counts.Cancelada})` },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Férias & Recesso</h1>
            <p className="text-sm text-muted-foreground">Gerencie as solicitações de férias dos colaboradores.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button>Criar solicitação</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Importar <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Importar solicitações</DropdownMenuItem>
                <DropdownMenuItem>Importar saldos</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="solicitacoes" className="gap-2">
              <FileText className="h-4 w-4" /> Solicitações
            </TabsTrigger>
            <TabsTrigger value="saldos" className="gap-2">
              <Calculator className="h-4 w-4" /> Saldos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solicitacoes" className="mt-4 space-y-4">
            <div className="flex items-center gap-3 border-b pb-2 overflow-x-auto">
              {etapas.map((e) => (
                <button
                  key={e.key}
                  onClick={() => { setEtapaFiltro(e.key); setPage(1); }}
                  className={`text-sm whitespace-nowrap pb-2 border-b-2 transition-colors ${
                    etapaFiltro === e.key ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquise colaboradores pelo nome" className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              <Input placeholder="Selecione o gestor" value={gestorFiltro} onChange={(e) => setGestorFiltro(e.target.value)} />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Gestor Direto</TableHead>
                  <TableHead>Data da Solicitação</TableHead>
                  <TableHead>Período Solicitado</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-muted-foreground"><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-semibold">{s.colaborador}</div>
                          <div className="text-xs text-muted-foreground">{s.cargo}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{s.gestor}</TableCell>
                    <TableCell className="text-sm">{s.dataSolicitacao}</TableCell>
                    <TableCell className="text-sm">
                      <div><span className="font-semibold">De:</span> {s.inicio}</div>
                      <div><span className="font-semibold">Até:</span> {s.fim}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={etapaCor[s.etapa]} variant="secondary">{s.etapa}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4 text-primary" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Itens por página:</span>
                <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50].map((n) => (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>{(page - 1) * perPage + 1} - {Math.min(page * perPage, 253)} de 253 itens</div>
              <div className="flex items-center gap-2">
                <span>{page} de {totalPages} páginas</span>
                <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saldos" className="mt-4">
            <div className="text-center text-sm text-muted-foreground py-12">
              Nenhum saldo cadastrado.
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
