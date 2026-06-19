import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Folder, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Periodo {
  id: string;
  periodo: string; // ex: "Junho 2026"
  descricao: string;
  inicio: string;
  fim: string;
}

const SEED: Periodo[] = [
  { id: "1", periodo: "Junho 2026", descricao: "Férias", inicio: "2026-06-01", fim: "2026-06-30" },
  { id: "2", periodo: "Maio 2026", descricao: "Salário 05/2026", inicio: "2026-05-01", fim: "2026-05-31" },
  { id: "3", periodo: "Maio 2026", descricao: "Férias", inicio: "2026-05-01", fim: "2026-05-31" },
  { id: "4", periodo: "Abril 2026", descricao: "salário 04/2026", inicio: "2026-04-01", fim: "2026-04-30" },
  { id: "5", periodo: "Março 2026", descricao: "Salário 03/2026", inicio: "2026-03-01", fim: "2026-03-31" },
  { id: "6", periodo: "Março 2026", descricao: "Férias", inicio: "2026-03-01", fim: "2026-03-31" },
  { id: "7", periodo: "Fevereiro 2026", descricao: "salário 02/2026", inicio: "2026-02-01", fim: "2026-02-28" },
  { id: "8", periodo: "Fevereiro 2026", descricao: "Informe de Rendimentos 2025", inicio: "2026-02-01", fim: "2026-02-28" },
  { id: "9", periodo: "Fevereiro 2026", descricao: "Férias", inicio: "2026-02-01", fim: "2026-02-28" },
  { id: "10", periodo: "Fevereiro 2026", descricao: "1ª parcela 13º", inicio: "2026-02-01", fim: "2026-02-28" },
  { id: "11", periodo: "Janeiro 2026", descricao: "1ª parcela 13º", inicio: "2026-01-01", fim: "2026-01-31" },
  { id: "12", periodo: "Janeiro 2026", descricao: "Salário 01/2026", inicio: "2026-01-01", fim: "2026-01-31" },
  { id: "13", periodo: "Dezembro 2025", descricao: "salário 12/2025", inicio: "2025-12-01", fim: "2025-12-31" },
  { id: "14", periodo: "Dezembro 2025", descricao: "Férias coletivas", inicio: "2025-12-01", fim: "2025-12-31" },
  { id: "15", periodo: "Dezembro 2025", descricao: "13º Salário", inicio: "2025-12-01", fim: "2025-12-31" },
];

export default function HoleritesRH() {
  const [lista, setLista] = useState<Periodo[]>(SEED);
  const [busca, setBusca] = useState("");
  const [pInicial, setPInicial] = useState("");
  const [pFinal, setPFinal] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Periodo | null>(null);
  const [form, setForm] = useState<Omit<Periodo, "id">>({ periodo: "", descricao: "", inicio: "", fim: "" });

  const filtrada = useMemo(() => {
    return lista.filter((p) => {
      if (busca && !p.descricao.toLowerCase().includes(busca.toLowerCase())) return false;
      if (pInicial && p.inicio < pInicial) return false;
      if (pFinal && p.fim > pFinal) return false;
      return true;
    });
  }, [lista, busca, pInicial, pFinal]);

  function abrirNovo() {
    setEditing(null);
    setForm({ periodo: "", descricao: "", inicio: "", fim: "" });
    setOpen(true);
  }

  function abrirEdicao(p: Periodo) {
    setEditing(p);
    setForm({ periodo: p.periodo, descricao: p.descricao, inicio: p.inicio, fim: p.fim });
    setOpen(true);
  }

  function salvar() {
    if (!form.periodo || !form.descricao) {
      toast({ title: "Preencha período e descrição", variant: "destructive" });
      return;
    }
    if (editing) {
      setLista((l) => l.map((p) => (p.id === editing.id ? { ...editing, ...form } : p)));
      toast({ title: "Período atualizado" });
    } else {
      setLista((l) => [{ id: crypto.randomUUID(), ...form }, ...l]);
      toast({ title: "Período criado" });
    }
    setOpen(false);
  }

  function excluir(id: string) {
    setLista((l) => l.filter((p) => p.id !== id));
    toast({ title: "Período excluído" });
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Holerites</h1>
            <p className="text-sm text-muted-foreground">
              Escolha ou crie um novo período para enviar os holerites dos colaboradores da empresa
            </p>
          </div>
          <Button onClick={abrirNovo}>Novo Período</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <Label className="text-sm font-semibold">Descrição do período</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquise pela descrição do período"
                className="pl-9"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Período inicial</Label>
            <Input type="month" value={pInicial} onChange={(e) => setPInicial(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-sm font-semibold">Período final</Label>
            <Input type="month" value={pFinal} onChange={(e) => setPFinal(e.target.value)} className="mt-1" />
          </div>
        </div>

        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Descrição do Período</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrada.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      <span>{p.periodo}</span>
                    </div>
                  </TableCell>
                  <TableCell>{p.descricao}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-3">
                      <button className="text-primary text-sm hover:underline">Abrir</button>
                      <Button variant="ghost" size="icon" onClick={() => abrirEdicao(p)}>
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => excluir(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtrada.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">
                    Nenhum período encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar período" : "Novo período"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Período (ex: Junho 2026)</Label>
              <Input value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Início</Label>
                <Input type="date" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} />
              </div>
              <div>
                <Label>Fim</Label>
                <Input type="date" value={form.fim} onChange={(e) => setForm({ ...form, fim: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
