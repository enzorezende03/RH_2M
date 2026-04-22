import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SENHA_PADRAO = "2m_UsuarioRH";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = email.trim().toLowerCase();

    if (!emailLower.endsWith("@2mgrupo.com.br") && !emailLower.endsWith("@2msaude.com")) {
      toast({
        title: "Email inválido",
        description: "Use seu email institucional @2mgrupo.com.br ou @2msaude.com",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailLower,
      password: senha,
    });
    setLoading(false);

    if (error) {
      toast({
        title: "Falha no login",
        description: "Email ou senha incorretos.",
        variant: "destructive",
      });
      return;
    }

    // Verifica primeiro acesso
    const { data: { user: u } } = await supabase.auth.getUser();
    if (u) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("primeiro_acesso")
        .eq("user_id", u.id)
        .maybeSingle();

      if (profile?.primeiro_acesso || senha === SENHA_PADRAO) {
        navigate("/redefinir-senha", { replace: true });
        return;
      }
    }

    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">
            2M
          </div>
          <h1 className="text-2xl font-bold">RH 2M Grupo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Entre com seu email institucional
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email institucional</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.nome@2mgrupo.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <div className="relative">
              <Input
                id="senha"
                type={showSenha ? "text" : "password"}
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Primeiro acesso? Use a senha padrão fornecida pelo RH.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Entrando...</> : "Entrar"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Sistema interno da 2M Grupo · Acesso restrito a colaboradores
        </p>
      </Card>
    </div>
  );
}
