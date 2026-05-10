import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useColaboradores } from "@/stores/colaboradoresStore";

export function useCurrentColaborador() {
  const { user } = useAuth();
  const { colaboradores } = useColaboradores();

  return useMemo(() => {
    const email = user?.email?.toLowerCase();
    const colab = email
      ? colaboradores.find((c) => (c.email ?? "").toLowerCase() === email)
      : null;

    const nome = colab?.nomeCompleto || (user?.user_metadata as any)?.nome || user?.email || "Admin RH";
    const iniciais = nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n: string) => n[0]?.toUpperCase() ?? "")
      .join("") || "RH";

    return { colaborador: colab ?? null, nome, iniciais, email: user?.email ?? null };
  }, [user, colaboradores]);
}
