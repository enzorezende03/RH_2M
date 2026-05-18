import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string | null | undefined;
  nome: string;
}

export function ResetarSenhaDialog({ open, onOpenChange, userId, nome }: Props) {
  const { toast } = useToast();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setNovaSenha("");
    setConfirmar("");
    setShow(false);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "Colaborador sem usuário vinculado", variant: "destructive" });
      return;
    }
    if (novaSenha.length < 8) {
      toast({ title: "Senha muito curta", description: "Mínimo de 8 caracteres.", variant: "destructive" });
      return;
    }
    if (novaSenha !== confirmar) {
      toast({ title: "Senhas não coincidem", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-reset-password", {
      body: { userId, newPassword: novaSenha },
    });
    setLoading(false);

    if (error || (data as any)?.error) {
      toast({ title: "Erro ao redefinir senha", description: error?.message ?? (data as any)?.error, variant: "destructive" });
      return;
    }

    toast({ title: "Senha redefinida!", description: `Nova senha definida para ${nome}.` });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resetar senha</DialogTitle>
          <DialogDescription>
            Defina uma nova senha para <span className="font-medium text-foreground">{nome}</span>. Ele(a) precisará usar a nova senha no próximo acesso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nova">Nova senha</Label>
            <div className="relative">
              <Input
                id="nova"
                type={show ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                minLength={8}
                className="pr-10"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmar">Confirmar senha</Label>
            <Input
              id="confirmar"
              type={show ? "text" : "password"}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</> : "Salvar nova senha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
