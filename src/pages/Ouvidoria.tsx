import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Paperclip, MessageSquareWarning } from "lucide-react";
import { toast } from "sonner";

const categorias = [
  "Reclamação",
  "Denúncia",
  "Sugestão",
  "Elogio",
  "Ocorrência",
];

export default function Ouvidoria() {
  const [open, setOpen] = useState(false);
  const [assunto, setAssunto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [anonimo, setAnonimo] = useState(true);
  const [arquivos, setArquivos] = useState<File[]>([]);

  const resetForm = () => {
    setAssunto("");
    setCategoria("");
    setDescricao("");
    setAnonimo(true);
    setArquivos([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.size <= 1024 * 1024 && ["application/pdf", "image/png", "image/jpeg"].includes(f.type));
    if (valid.length !== files.length) {
      toast.error("Alguns arquivos foram ignorados. Máximo 1MB, formatos: PDF, PNG ou JPEG.");
    }
    setArquivos(prev => [...prev, ...valid].slice(0, 3));
  };

  const handleSalvar = () => {
    if (!assunto.trim() || !categoria || !descricao.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    toast.success("Manifestação registrada com sucesso!");
    resetForm();
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ouvidoria</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Este é um espaço seguro e de confiança, onde os colaboradores podem registrar reclamações, fazer denúncias, relatar ocorrências, dar sugestões e expressar suas ideias sabendo que serão ouvidos com atenção e respeito.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          Nova
        </Button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center rounded-xl bg-card p-16 card-shadow">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
          <MessageSquareWarning className="h-10 w-10 text-primary" />
        </div>
        <p className="text-base font-medium text-muted-foreground mb-4">
          Você não possui nenhuma criada
        </p>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Nova
        </Button>
      </div>

      {/* Dialog Nova Manifestação */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Manifestação</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Assunto */}
            <div className="space-y-2">
              <Label>
                Assunto <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  placeholder="Escreva o título da manifestação"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value.slice(0, 100))}
                  maxLength={100}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {assunto.length}/100
                </span>
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label>
                Categoria <span className="text-destructive">*</span>
              </Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>
                Descrição <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Escreva sobre a manifestação"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* Anexos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Anexos <span className="text-muted-foreground text-xs font-normal">(opcional)</span></Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Você pode enviar até 3 arquivos, com tamanho máximo de 1MB cada, nos formatos PDF, PNG ou JPEG.
                  </p>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    multiple
                    onChange={handleFileChange}
                    disabled={arquivos.length >= 3}
                  />
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
                    <Paperclip className="h-4 w-4" />
                    Anexar arquivo
                  </span>
                </label>
              </div>
              {arquivos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {arquivos.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs">
                      {f.name}
                      <button onClick={() => setArquivos(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 text-muted-foreground hover:text-foreground">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Anônimo */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="anonimo"
                  checked={anonimo}
                  onCheckedChange={(v) => setAnonimo(v === true)}
                />
                <Label htmlFor="anonimo" className="font-medium cursor-pointer">
                  Manter-me anônimo <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Torna seu perfil não visível na manifestação. Atente-se quanto aos dados e informações enviadas no texto da manifestação, pois isso pode tornar possível uma identificação indireta.
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSalvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
