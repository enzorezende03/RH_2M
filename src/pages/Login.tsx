import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SENHA_PADRAO = "2m_UsuarioRH";
const LOGIN_TIMEOUT_MS = 12000;
const PUBLISHED_LOGIN_URL = "https://rh2m.lovable.app/login";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectPath] = useState(() => {
    if (typeof window === "undefined") return "/";

    const redirectParam = new URLSearchParams(window.location.search).get("redirect");
    return redirectParam?.startsWith("/") ? redirectParam : "/";
  });

  const isPreviewEnvironment =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("lovableproject.com") ||
      window.location.hostname.includes("id-preview--"));

  const buildPublishedLoginUrl = (
    emailPrefill?: string,
    firstAccessPrefill?: boolean,
    redirectPrefill?: string,
  ) => {
    const publishedUrl = new URL(PUBLISHED_LOGIN_URL);

    if (emailPrefill) publishedUrl.searchParams.set("email", emailPrefill);
    if (firstAccessPrefill) publishedUrl.searchParams.set("primeiroAcesso", "1");
    if (redirectPrefill?.startsWith("/")) publishedUrl.searchParams.set("redirect", redirectPrefill);

    return publishedUrl.toString();
  };

  const openPublishedLogin = (
    emailPrefill?: string,
    firstAccessPrefill?: boolean,
    redirectPrefill?: string,
  ) => {
    const destination = buildPublishedLoginUrl(emailPrefill, firstAccessPrefill, redirectPrefill);

    try {
      window.open(destination, "_top");
      return;
    } catch {
      // noop
    }

    try {
      if (window.top) {
        window.top.location.href = destination;
        return;
      }
    } catch {
      // noop
    }

    window.location.replace(destination);
  };

  const withTimeout = async <T,>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> => {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_, reject) => {
        window.setTimeout(() => reject(new Error("login-timeout")), timeoutMs);
      }),
    ]);
  };

  useEffect(() => {
    if (!authLoading && user) navigate(redirectPath, { replace: true });
  }, [user, authLoading, navigate, redirectPath]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const primeiroAcessoParam = params.get("primeiroAcesso");

    if (emailParam) setEmail(emailParam);
    if (primeiroAcessoParam === "1") setPrimeiroAcesso(true);
  }, []);

  // Trava a senha no padrão quando "Primeiro acesso" está marcado
  useEffect(() => {
    if (primeiroAcesso) {
      setSenha(SENHA_PADRAO);
      setShowSenha(false);
    } else {
      setSenha("");
    }
  }, [primeiroAcesso]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const emailLower = email.trim().toLowerCase();

    if (!emailLower) {
      toast({
        title: "Informe seu email",
        description: "Preencha seu email institucional para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!emailLower.endsWith("@2mgrupo.com.br") && !emailLower.endsWith("@2msaude.com")) {
      toast({
        title: "Email inválido",
        description: "Use seu email institucional @2mgrupo.com.br ou @2msaude.com",
        variant: "destructive",
      });
      return;
    }

    if (isPreviewEnvironment) {
      window.location.href = buildPublishedLoginUrl(emailLower, primeiroAcesso, redirectPath);
      return;
    }

    setLoading(true);
    const senhaUsada = primeiroAcesso ? SENHA_PADRAO : senha;
    try {
      const loginResult = await withTimeout(
        Promise.resolve(supabase.auth.signInWithPassword({
          email: emailLower,
          password: senhaUsada,
        })),
        LOGIN_TIMEOUT_MS,
      );

      if (loginResult.error) {
        setLoading(false);
        toast({
          title: "Falha no login",
          description: primeiroAcesso
            ? "Email não encontrado ou senha padrão já foi alterada. Desmarque 'Primeiro acesso' para usar sua senha pessoal."
            : "Email ou senha incorretos.",
          variant: "destructive",
        });
        return;
      }

      const { data: refreshedSessionData } = await withTimeout(
        Promise.resolve(supabase.auth.getSession()),
        5000,
      );

      const activeSession = refreshedSessionData.session ?? loginResult.data.session ?? null;
      const usuarioAutenticado = activeSession?.user ?? loginResult.data.user;

      if (!activeSession || !usuarioAutenticado) {
        throw new Error("session-not-ready");
      }

      const profileResult = await withTimeout(
        Promise.resolve(
          supabase
            .from("profiles")
            .select("primeiro_acesso")
            .eq("user_id", usuarioAutenticado.id)
            .maybeSingle(),
        ),
        5000,
      );

      setLoading(false);

      if (profileResult.data?.primeiro_acesso || primeiroAcesso) {
        window.location.replace("/redefinir-senha");
        return;
      }

      window.location.replace(redirectPath);
    } catch (error) {
      setLoading(false);

      const loginTimedOut = error instanceof Error && error.message === "login-timeout";
      if (loginTimedOut && isPreviewEnvironment) {
        toast({
          title: "Abrindo o site publicado para concluir o login",
          description: "O preview travou a autenticação. Vou te levar para o ambiente estável.",
          variant: "destructive",
        });

        window.setTimeout(() => {
          openPublishedLogin(emailLower, primeiroAcesso, redirectPath);
        }, 900);
        return;
      }

      toast({
        title: "Não foi possível concluir o login",
        description:
          loginTimedOut
            ? "A autenticação demorou mais que o esperado. Se isso acontecer só no preview, teste também no site publicado e use 'Limpar sessão'."
            : "O login não pôde ser finalizado agora. Tente novamente em alguns segundos.",
        variant: "destructive",
      });
    }
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
                type={showSenha || primeiroAcesso ? "text" : "password"}
                placeholder={primeiroAcesso ? "Senha padrão de primeiro acesso" : "Sua senha"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={primeiroAcesso}
                readOnly={primeiroAcesso}
                autoComplete="current-password"
                className={`pr-10 ${primeiroAcesso ? "bg-muted cursor-not-allowed" : ""}`}
              />
              {primeiroAcesso ? (
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-3">
            <Checkbox
              id="primeiro-acesso"
              checked={primeiroAcesso}
              onCheckedChange={(v) => setPrimeiroAcesso(v === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label htmlFor="primeiro-acesso" className="cursor-pointer text-sm font-medium">
                Primeiro acesso
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Marque para entrar com a senha padrão. Você definirá uma nova senha em seguida.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Entrando...</> : "Entrar"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Sistema interno da 2M Grupo · Acesso restrito a colaboradores
        </p>
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut().catch(() => {});
            try {
              Object.keys(localStorage)
                .filter((k) => k.startsWith("sb-"))
                .forEach((k) => localStorage.removeItem(k));
            } catch {}
            window.location.replace("/login");
          }}
          className="block mx-auto mt-2 text-xs text-muted-foreground underline hover:text-foreground"
        >
          Problemas para entrar? Limpar sessão
        </button>
        {isPreviewEnvironment && (
          <a
            href={buildPublishedLoginUrl(email.trim().toLowerCase() || undefined, primeiroAcesso, redirectPath)}
            target="_top"
            rel="noreferrer"
            className="block mx-auto mt-2 text-xs text-primary underline hover:text-primary/80"
          >
            Abrir o site publicado
          </a>
        )}
      </Card>
    </div>
  );
}
