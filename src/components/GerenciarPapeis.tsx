import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles, type AppRole } from "@/hooks/useUserRoles";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PAPEIS: { role: AppRole; label: string; desc: string }[] = [
  { role: "admin", label: "Administrador", desc: "Acesso total ao sistema" },
  { role: "gestor", label: "Gestor", desc: "Vê e edita o próprio time" },
  { role: "colaborador", label: "Colaborador", desc: "Vê apenas os próprios dados" },
];

export function GerenciarPapeis({ userId }: { userId: string | null }) {
  const { isAdmin } = useUserRoles();
  const [current, setCurrent] = useState<AppRole[]>([]);
  const [saving, setSaving] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) console.warn(error);
        setCurrent((data ?? []).map((r: { role: AppRole }) => r.role));
        setLoading(false);
      });
  }, [userId]);

  if (!isAdmin) return null;

  if (!userId) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Papéis de acesso</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Este colaborador ainda não está vinculado a um usuário do sistema. Vincule um <code className="text-xs">user_id</code> ao registro para gerenciar papéis.
        </p>
      </Card>
    );
  }

  const toggle = async (role: AppRole, checked: boolean) => {
    setSaving(role);
    if (checked) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) {
        toast({ title: "Erro ao atribuir papel", description: error.message, variant: "destructive" });
      } else {
        setCurrent((c) => [...c, role]);
        toast({ title: "Papel atribuído", description: role });
      }
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) {
        toast({ title: "Erro ao remover papel", description: error.message, variant: "destructive" });
      } else {
        setCurrent((c) => c.filter((r) => r !== role));
        toast({ title: "Papel removido", description: role });
      }
    }
    setSaving(null);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Papéis de acesso</h3>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      ) : (
        <div className="space-y-3">
          {PAPEIS.map((p) => {
            const checked = current.includes(p.role);
            return (
              <div key={p.role} className="flex items-start gap-3">
                <Checkbox
                  id={`role-${p.role}`}
                  checked={checked}
                  disabled={saving === p.role}
                  onCheckedChange={(v) => toggle(p.role, !!v)}
                />
                <div className="flex-1">
                  <Label htmlFor={`role-${p.role}`} className="text-sm font-medium cursor-pointer">
                    {p.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
