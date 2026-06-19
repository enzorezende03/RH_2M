import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, FileSignature, Upload, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Documento {
  id: string;
  titulo: string;
  destinatario: string;
  tipo: string;
  status: "Pendente" | "Assinado" | "Cancelado";
  enviado: string;
}

const statusCor: Record<Documento["status"], string> = {
  Pendente: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Assinado: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Cancelado: "bg-red-100 text-red-700 hover:bg-red-100",
};

export default function AssinaturaDigital() {
  const [lista, setLista] = useState<Documento[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ titulo: "", destinatario: "", tipo: "Contrato" });

  function criar() {
    if (!form.titulo || !form.destinatario) {
      toast({ title: "Preencha título e destinatário", variant: "destructive" });
      return;
    }
    setLista((l) => [
      {
        id: crypto.randomUUID(),
        titulo: form.titulo,
        destinatario: form.destinatario,
        tipo: form.tipo,
        status: "Pendente",
        enviado: new Date().toLocaleDateString("pt-BR"),
      },
      ...l,
    ]);
    setForm({ titulo: "", destinatario: "", tipo: "Contrato" });
    setOpen(false);
    toast({ title: "Documento enviado para assinatura" });
  }

  function excluir(id: string) {
    setLista((l) => l.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assinatura Digital</h1>
            <p className="text-sm text-muted-foreground">
              Envie documentos para assinatura digital dos colaboradores.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" /> Novo documento
          </Button>
        </div>

        {lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-40 w-40 rounded-full bg-muted/40 flex items-center justify-center mb-4">
              <FileSignature className="h-16 w-16 text-primary" />
            </div>
            <p className="text-base font-medium text-foreground">Nenhum documento enviado</p>
            <p className="text-sm text-primary mt-1">
              Envie documentos para coleta de assinatura digital dos colaboradores
            </p>
            <Button variant="outline" className="mt-4 gap-2" onClick={() => setOpen(true)}>
              <Upload className="h-4 w-4" /> Novo documento
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.titulo}</TableCell>
                    <TableCell className="text-sm">{d.destinatario}</TableCell>
                    <TableCell className="text-sm">{d.tipo}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusCor[d.status]}>{d.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{d.enviado}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4 text-primary" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => excluir(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
            <DialogTitle>Novo documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div>
              <Label>Destinatário (colaborador)</Label>
              <Input value={form.destinatario} onChange={(e) => setForm({ ...form, destinatario: e.target.value })} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Contrato", "Aditivo", "Termo", "Acordo", "Outro"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Arquivo</Label>
              <Input type="file" accept=".pdf" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={criar}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
