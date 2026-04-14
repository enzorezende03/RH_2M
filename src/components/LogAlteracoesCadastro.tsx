import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface LogEntry {
  id: string;
  dataAcao: string;
  colaboradorNome: string;
  colaboradorCargo: string;
  acao: string;
  origem: string;
  descricao: string;
  alteradoPorNome: string;
  alteradoPorEmail: string;
  alteradoPorPapel: string;
  colaboradorEmail: string;
  colaboradorPapel: string;
  detalhes: { campo: string; antes: string; depois: string }[];
}

const MOCK_LOGS: LogEntry[] = [
  {
    id: "1",
    dataAcao: "10/04/2026 18:10:35",
    colaboradorNome: "ISABELA SANTOS BRAGA",
    colaboradorCargo: "ANALISTA III - Step 1",
    colaboradorEmail: "isabela.braga@empresa.com",
    colaboradorPapel: "Colaborador",
    acao: "Atualização",
    origem: "Manual",
    descricao: "Atualização de Status",
    alteradoPorNome: "SULAMITA BRAS DE OLIVEIRA MACHADO",
    alteradoPorEmail: "sulamita.bras@empresa.com",
    alteradoPorPapel: "Administrador",
    detalhes: [{ campo: "Status", antes: "Ativo", depois: "Desligado" }],
  },
  {
    id: "2",
    dataAcao: "08/04/2026 13:53:51",
    colaboradorNome: "KAREN MAGESTE",
    colaboradorCargo: "ANALISTA I",
    colaboradorEmail: "karen.mageste@empresa.com",
    colaboradorPapel: "Colaborador",
    acao: "Atualização",
    origem: "Manual",
    descricao: "Atualização de Nome visível",
    alteradoPorNome: "ADMIN DO SISTEMA",
    alteradoPorEmail: "admin@empresa.com",
    alteradoPorPapel: "Administrador",
    detalhes: [{ campo: "Nome visível", antes: "Karen M.", depois: "KAREN MAGESTE" }],
  },
  {
    id: "3",
    dataAcao: "08/04/2026 13:25:41",
    colaboradorNome: "KAREN MAGESTE",
    colaboradorCargo: "ANALISTA I",
    colaboradorEmail: "karen.mageste@empresa.com",
    colaboradorPapel: "Colaborador",
    acao: "Atualização",
    origem: "Manual",
    descricao: "Atualização de Gestor direto",
    alteradoPorNome: "ADMIN DO SISTEMA",
    alteradoPorEmail: "admin@empresa.com",
    alteradoPorPapel: "Administrador",
    detalhes: [{ campo: "Gestor direto", antes: "João Silva", depois: "Maria Souza" }],
  },
  {
    id: "4",
    dataAcao: "07/04/2026 15:32:51",
    colaboradorNome: "ENZO REZENDE PAOLUCCI",
    colaboradorCargo: "Estagiário",
    colaboradorEmail: "enzo.rezende@empresa.com",
    colaboradorPapel: "Colaborador",
    acao: "Atualização",
    origem: "Manual",
    descricao: "Atualização de Permissões",
    alteradoPorNome: "ADMIN DO SISTEMA",
    alteradoPorEmail: "admin@empresa.com",
    alteradoPorPapel: "Administrador",
    detalhes: [{ campo: "Permissões", antes: "Padrão", depois: "Gestor de equipe" }],
  },
  {
    id: "5",
    dataAcao: "06/04/2026 15:59:12",
    colaboradorNome: "PRISCILA GONÇALVES ROCHA",
    colaboradorCargo: "Auxiliar",
    colaboradorEmail: "priscila.rocha@empresa.com",
    colaboradorPapel: "Colaborador",
    acao: "Atualização",
    origem: "Manual",
    descricao: "Atualização de Cargo",
    alteradoPorNome: "ADMIN DO SISTEMA",
    alteradoPorEmail: "admin@empresa.com",
    alteradoPorPapel: "Administrador",
    detalhes: [{ campo: "Cargo", antes: "Assistente", depois: "Auxiliar" }],
  },
  {
    id: "6",
    dataAcao: "06/04/2026 14:15:48",
    colaboradorNome: "KAREN MAGESTE",
    colaboradorCargo: "ANALISTA I",
    colaboradorEmail: "karen.mageste@empresa.com",
    colaboradorPapel: "Colaborador",
    acao: "Criação",
    origem: "Admissão Digital",
    descricao: "Criação de novo usuário",
    alteradoPorNome: "SISTEMA",
    alteradoPorEmail: "sistema@empresa.com",
    alteradoPorPapel: "Sistema",
    detalhes: [{ campo: "Usuário", antes: "-", depois: "Criado" }],
  },
  {
    id: "7",
    dataAcao: "02/04/2026 10:30:00",
    colaboradorNome: "PRISCILA GONÇALVES ROCHA",
    colaboradorCargo: "Auxiliar",
    colaboradorEmail: "priscila.rocha@empresa.com",
    colaboradorPapel: "Colaborador",
    acao: "Atualização",
    origem: "Manual",
    descricao: "Atualização de Status",
    alteradoPorNome: "ADMIN DO SISTEMA",
    alteradoPorEmail: "admin@empresa.com",
    alteradoPorPapel: "Administrador",
    detalhes: [{ campo: "Status", antes: "Importado", depois: "Ativo" }],
  },
];

export default function LogAlteracoesCadastro({ onBack }: { onBack: () => void }) {
  const [colaboradorFilter, setColaboradorFilter] = useState("");
  const [acaoFilter, setAcaoFilter] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const filtered = MOCK_LOGS.filter((log) => {
    if (colaboradorFilter && !log.colaboradorNome.toLowerCase().includes(colaboradorFilter.toLowerCase())) return false;
    if (acaoFilter && acaoFilter !== "__all" && log.acao !== acaoFilter) return false;
    return true;
  });

  const clearFilters = () => {
    setColaboradorFilter("");
    setAcaoFilter("");
    setDataInicial("");
    setDataFinal("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full border">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Log de alterações de cadastro</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe as alterações de papel e permissões realizadas no cadastro de colaboradores
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Colaborador alterado</label>
          <Select value={colaboradorFilter} onValueChange={setColaboradorFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o colaborador desejado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todos</SelectItem>
              {[...new Set(MOCK_LOGS.map((l) => l.colaboradorNome))].map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Ações</label>
          <Select value={acaoFilter} onValueChange={setAcaoFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a ação desejada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todas</SelectItem>
              <SelectItem value="Criação">Criação</SelectItem>
              <SelectItem value="Atualização">Atualização</SelectItem>
              <SelectItem value="Exclusão">Exclusão</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Data inicial</label>
          <Input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} placeholder="dd/mm/aaaa" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Data final</label>
          <Input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} placeholder="dd/mm/aaaa" />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={clearFilters}>Limpar filtros</Button>
        <Button>Filtrar</Button>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card card-shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Data da Ação</TableHead>
              <TableHead className="font-semibold">Colaborador</TableHead>
              <TableHead className="font-semibold">Ações</TableHead>
              <TableHead className="font-semibold">Origem</TableHead>
              <TableHead className="font-semibold">Descrição da Ação</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm whitespace-nowrap">{log.dataAcao}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-xs">
                        {log.colaboradorNome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{log.colaboradorNome}</p>
                      <p className="text-xs text-muted-foreground">{log.colaboradorCargo}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{log.acao}</TableCell>
                <TableCell className="text-sm">{log.origem}</TableCell>
                <TableCell className="text-sm">{log.descricao}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da ação</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* Info row */}
              <div className="grid grid-cols-3 gap-4 border rounded-lg p-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Colaborador</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-xs">
                        {selectedLog.colaboradorNome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{selectedLog.colaboradorNome}</p>
                      <p className="text-xs text-muted-foreground">{selectedLog.colaboradorEmail}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs text-primary border-primary">
                    {selectedLog.colaboradorPapel}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Alterado por</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-xs">
                        {selectedLog.alteradoPorNome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{selectedLog.alteradoPorNome}</p>
                      <p className="text-xs text-muted-foreground">{selectedLog.alteradoPorEmail}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs text-primary border-primary">
                    {selectedLog.alteradoPorPapel}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground"><span className="font-semibold">Data da Ação:</span> {selectedLog.dataAcao}</p>
                  <p className="text-xs text-muted-foreground"><span className="font-semibold">Origem:</span> {selectedLog.origem}</p>
                  <p className="text-xs text-muted-foreground"><span className="font-semibold">Ação:</span> {selectedLog.acao}</p>
                </div>
              </div>

              {/* Changes table */}
              <div>
                <h3 className="font-semibold text-sm mb-2 text-primary">{selectedLog.descricao.split(" de ").pop()}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-primary">Informação</TableHead>
                      <TableHead className="font-semibold text-primary">Antes</TableHead>
                      <TableHead className="font-semibold text-primary">Depois</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedLog.detalhes.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{d.campo}</TableCell>
                        <TableCell className="text-sm">{d.antes}</TableCell>
                        <TableCell className="text-sm">{d.depois}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>Fechar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
