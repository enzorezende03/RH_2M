import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// MODO DESENVOLVIMENTO: acesso livre habilitado.
// Para reativar a proteção, defina DEV_BYPASS = false.
const DEV_BYPASS = false;

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { colaborador } = useCurrentColaborador();
  const location = useLocation();

  const desligado = colaborador?.status === "Desligado";

  useEffect(() => {
    if (DEV_BYPASS) return;
    if (desligado) {
      toast.error("Acesso bloqueado: colaborador desligado.");
      signOut();
    }
  }, [desligado, signOut]);

  if (DEV_BYPASS) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (desligado) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
