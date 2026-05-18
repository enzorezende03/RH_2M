import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Colaborador {
  id: string;
  nomeCompleto: string;
  nomeVisivel: string;
  cargo: string;
  cargoVisivel?: string;
  gestorDireto: string;
  gestorCargo?: string;
  unidade: string;
  departamento: string;
  papel: string;
  status: string;
  tag?: string;
  email?: string;
  lider?: string | null;
  responsavel?: string | null;
  userId?: string | null;
  createdAt?: string | null;
  dadosCompletos?: Record<string, any>;
}

interface ColaboradoresContextType {
  colaboradores: Colaborador[];
  loading: boolean;
  addColaborador: (c: Omit<Colaborador, "id">) => Promise<Colaborador | null>;
  removeColaborador: (id: string) => Promise<void>;
  updateColaborador: (id: string, data: Partial<Colaborador>) => Promise<void>;
  reload: () => Promise<void>;
}

const ColaboradoresContext = createContext<ColaboradoresContextType | null>(null);

function fromRow(r: any): Colaborador {
  return {
    id: r.id,
    nomeCompleto: r.nome_completo ?? "",
    nomeVisivel: r.nome_visivel ?? r.nome_completo ?? "",
    cargo: r.cargo ?? "",
    cargoVisivel: r.cargo_visivel ?? undefined,
    gestorDireto: r.gestor_direto ?? "",
    gestorCargo: r.gestor_cargo ?? undefined,
    unidade: r.unidade ?? "",
    departamento: r.departamento ?? "",
    papel: r.papel ?? "Colaborador",
    status: r.status ?? "Ativo",
    tag: r.tag ?? undefined,
    email: r.email ?? undefined,
    lider: r.lider ?? null,
    responsavel: r.responsavel ?? null,
    userId: r.user_id ?? null,
    dadosCompletos: r.dados_completos ?? {},
  };
}

function toRow(c: Partial<Colaborador>) {
  const row: any = {};
  if (c.nomeCompleto !== undefined) row.nome_completo = c.nomeCompleto;
  if (c.nomeVisivel !== undefined) row.nome_visivel = c.nomeVisivel;
  if (c.email !== undefined) row.email = c.email;
  if (c.cargo !== undefined) row.cargo = c.cargo;
  if (c.cargoVisivel !== undefined) row.cargo_visivel = c.cargoVisivel;
  if (c.gestorDireto !== undefined) row.gestor_direto = c.gestorDireto;
  if (c.gestorCargo !== undefined) row.gestor_cargo = c.gestorCargo;
  if (c.unidade !== undefined) row.unidade = c.unidade;
  if (c.departamento !== undefined) row.departamento = c.departamento;
  if (c.papel !== undefined) row.papel = c.papel;
  if (c.status !== undefined) row.status = c.status;
  if (c.tag !== undefined) row.tag = c.tag;
  if (c.lider !== undefined) row.lider = c.lider;
  if (c.responsavel !== undefined) row.responsavel = c.responsavel;
  if (c.dadosCompletos !== undefined) row.dados_completos = c.dadosCompletos;
  return row;
}

export function ColaboradoresProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("colaboradores")
      .select("*")
      .order("nome_completo", { ascending: true });
    if (!error && data) setColaboradores(data.map(fromRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setColaboradores([]);
      setLoading(false);
      return;
    }

    void reload();
  }, [authLoading, user, reload]);

  const addColaborador = useCallback(async (c: Omit<Colaborador, "id">) => {
    const { data, error } = await supabase
      .from("colaboradores")
      .insert(toRow(c))
      .select()
      .single();
    if (error || !data) return null;
    const novo = fromRow(data);
    setColaboradores((prev) => [...prev, novo]);
    return novo;
  }, []);

  const removeColaborador = useCallback(async (id: string) => {
    await supabase.from("colaboradores").delete().eq("id", id);
    setColaboradores((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateColaborador = useCallback(async (id: string, data: Partial<Colaborador>) => {
    await supabase.from("colaboradores").update(toRow(data)).eq("id", id);
    setColaboradores((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  return (
    <ColaboradoresContext.Provider value={{ colaboradores, loading, addColaborador, removeColaborador, updateColaborador, reload }}>
      {children}
    </ColaboradoresContext.Provider>
  );
}

export function useColaboradores() {
  const ctx = useContext(ColaboradoresContext);
  if (!ctx) throw new Error("useColaboradores must be used within ColaboradoresProvider");
  return ctx;
}
