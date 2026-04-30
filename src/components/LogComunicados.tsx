import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export type ComunicadoLog = {
  id: string;
  responsavelNome: string;
  responsavelEmail: string;
  responsavelPapel: string;
  dataHora: string;
  acao: "Criação" | "Atualização" | "Exclusão" | "Arquivamento" | "Duplicação";
  descricao: string;
  codigoComunicado: string;
  assuntoComunicado: string;
  detalhes: { campo: string; antes: string; depois: string }[];
};

const MOCK_LOGS: ComunicadoLog[] = [];

export default function LogComunicados({ onBack }: { onBack: () => void }) {
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [acaoFilter, setAcaoFilter] = useState("");
  const [selected, setSelected] = useState<ComunicadoLog | null>(null);

  const filtered = MOCK_LOGS.filter((l) => {
    if (acaoFilter && acaoFilter !== "__all" && l.acao !== acaoFilter) return false;
    return true;
  });

  const clearFilters = () => {
    setDataInicial("");
    setDataFinal("");
    setAcaoFilter("");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full border">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Log de Comunicados</h1>
          <p className="text-sm text-muted-foreground">
            Confira ações registradas no módulo de comunicados. Os dados apresentados refletem informações coletadas a partir de 02/10/2025.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-sm font-medium mb-1 block">Data Inicial</label>
          <Input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} placeholder="dd/mm/aaaa" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Data Final</label>
          <Input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} placeholder="dd/mm/aaaa" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Ação</label>
          <Select value={acaoFilter} onValueChange={setAcaoFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a ação a ser filtrada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Todas</SelectItem>
              <SelectItem value="Criação">Criação</SelectItem>
              <SelectItem value="Atualização">Atualização</SelectItem>
              <SelectItem value="Exclusão">Exclusão</SelectItem>
              <SelectItem value="Arquivamento">Arquivamento</SelectItem>
              <SelectItem value="Duplicação">Duplicação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={clearFilters}>Limpar Filtros</Button>
        <Button>Filtrar</Button>
      </div>

      <div className="rounded-xl bg-card card-shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Responsável pela ação</TableHead>
              <TableHead className="font-semibold">Data e hora da ação</TableHead>
              <TableHead className="font-semibold">Ação</TableHead>
              <TableHead className="font-semibold">Descrição da ação</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-xs">
                        {log.responsavelNome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-primary">{log.responsavelNome}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">{log.dataHora}</TableCell>
                <TableCell className="text-sm">{log.acao}</TableCell>
                <TableCell className="text-sm">{log.descricao}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => setSelected(log)}>
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Detalhes da ação</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 border rounded-lg p-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Responsável pela ação</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-xs">
                        {selected.responsavelNome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{selected.responsavelNome}</p>
                      <p className="text-xs text-muted-foreground">{selected.responsavelEmail}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="mt-1 text-xs text-primary border-primary">
                    {selected.responsavelPapel}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <p><span className="font-semibold">Data e hora da ação:</span> {selected.dataHora}</p>
                  <p><span className="font-semibold">Ação:</span> {selected.acao}</p>
                </div>
                <div className="space-y-1 text-xs">
                  <p><span className="font-semibold">Código do Comunicado:</span> {selected.codigoComunicado}</p>
                  <p><span className="font-semibold">Assunto do Comunicado:</span><br />{selected.assuntoComunicado}</p>
                </div>
              </div>

              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Informação</TableHead>
                      <TableHead className="font-semibold">Antes</TableHead>
                      <TableHead className="font-semibold">Depois</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.detalhes.map((d, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{d.campo}</TableCell>
                        <TableCell className="text-sm">{d.antes || "-"}</TableCell>
                        <TableCell className="text-sm">{d.depois || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
