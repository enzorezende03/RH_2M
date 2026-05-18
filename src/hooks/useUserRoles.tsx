import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "admin" | "gestor" | "colaborador";

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("Erro ao carregar papéis:", error);
          setRoles([]);
        } else {
          setRoles((data ?? []).map((r: { role: AppRole }) => r.role));
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isAdmin = roles.includes("admin");
  const isGestor = roles.includes("gestor");
  const isColaborador = roles.includes("colaborador");

  return { roles, isAdmin, isGestor, isColaborador, loading };
}
