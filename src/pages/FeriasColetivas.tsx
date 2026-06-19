import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FeriasColetiva {
  id: string;
  descricao: string;
  inicio: string;
  fim: string;
  setor: string;
  observacoes?: string;
}

export default function FeriasColetivas() {
  const [lista, setLista] = useState<FeriasColetiva[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ descricao: "", inicio: "", fim: "", setor: "", observacoes: "" });

  function criar() {
    if (!form.descricao || !form.inicio || !form.fim) {
      toast({ title: "Preencha descrição e período", variant: "destructive" });
      return;
    }
    setLista((l) => [{ id: crypto.randomUUID(), ...form }, ...l]);
    setForm({ descricao: "", inicio: "", fim: "", setor: "", observacoes: "" });
    setOpen(false);
    toast({ title: "Férias coletivas criada" });
  }

  function excluir(id: string) {
    setLista((l) => l.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Férias Coletivas</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas solicitações de férias coletivas.</p>
          </div>
          <Button onClick={() => setOpen(true)}>Criar Férias coletivas</Button>
        </div>

        {lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-40 w-40 rounded-full bg-muted/40 flex items-center justify-center mb-4">
              <span className="text-5xl">📁</span>
            </div>
            <p className="text-base font-medium text-foreground">Nenhum registro de Férias coletivas</p>
            <p className="text-sm text-primary mt-1">Crie e gerencie registros de Férias coletivas dos colaboradores</p>
            <Button variant="outline" className="mt-4" onClick={() => setOpen(true)}>Criar Férias coletivas</Button>
          </div>
        ) : (
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.descricao}</TableCell>
                    <TableCell className="text-sm">{f.inicio} até {f.fim}</TableCell>
                    <TableCell className="text-sm">{f.setor || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Ativa</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4 text-primary" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => excluir(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Férias coletivas</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
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
            <div>
              <Label>Setor</Label>
              <Input value={form.setor} onChange={(e) => setForm({ ...form, setor: e.target.value })} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={criar}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
