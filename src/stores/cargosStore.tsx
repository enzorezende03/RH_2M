import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Cargo {
  id: string;
  nome: string;
  unidade: string;
  departamento: string;
  sindicato: string;
  cbo: string;
  grupoCargo: string;
  missao: string;
  modeloCargo: "sem_nivel" | "com_nivel";
  salario: number;
  responsabilidades: string;
  requisitosAcademicos: string;
  competenciasComportamentais: string;
  competenciasOrganizacionais: string;
  experiencia: string;
  nivelHierarquico: string;
  nivelSalarial: string;
  cargoVisivel?: string;
}

export interface GrupoCargo {
  id: string;
  nome: string;
  descricao: string;
  cargoIds: string[];
}

interface CargosContextType {
  cargos: Cargo[];
  grupos: GrupoCargo[];
  loading: boolean;
  addCargo: (cargo: Omit<Cargo, "id">) => Promise<void>;
  removeCargo: (id: string) => Promise<void>;
  updateCargo: (id: string, data: Partial<Cargo>) => Promise<void>;
  addGrupo: (grupo: Omit<GrupoCargo, "id">) => void;
  removeGrupo: (id: string) => void;
  updateGrupo: (id: string, data: Partial<GrupoCargo>) => void;
  reload: () => Promise<void>;
}

const CargosContext = createContext<CargosContextType | null>(null);

const DEFAULT_GRUPOS: GrupoCargo[] = [
  { id: "g1", nome: "Step 1", descricao: "", cargoIds: [] },
  { id: "g2", nome: "Step 2", descricao: "", cargoIds: [] },
  { id: "g3", nome: "Step 3", descricao: "", cargoIds: [] },
  { id: "g4", nome: "Step 4", descricao: "", cargoIds: [] },
  { id: "g5", nome: "Step 5", descricao: "", cargoIds: [] },
];

function fromRow(r: any): Cargo {
  return {
    id: r.id,
    nome: r.nome ?? "",
    cargoVisivel: r.cargo_visivel ?? undefined,
    unidade: r.unidade ?? "",
    departamento: r.departamento ?? "",
    sindicato: r.sindicato ?? "",
    cbo: r.cbo ?? "",
    grupoCargo: r.grupo_cargo ?? "",
    missao: r.missao ?? "",
    modeloCargo: (r.modelo_cargo as "sem_nivel" | "com_nivel") ?? "sem_nivel",
    salario: Number(r.salario ?? 0),
    responsabilidades: r.responsabilidades ?? "",
    requisitosAcademicos: r.requisitos_academicos ?? "",
    competenciasComportamentais: r.competencias_comportamentais ?? "",
    competenciasOrganizacionais: r.competencias_organizacionais ?? "",
    experiencia: r.experiencia ?? "",
    nivelHierarquico: r.nivel_hierarquico ?? "",
    nivelSalarial: r.nivel_salarial ?? "",
  };
}

function toRow(c: Partial<Cargo>) {
  const row: any = {};
  if (c.nome !== undefined) row.nome = c.nome;
  if (c.cargoVisivel !== undefined) row.cargo_visivel = c.cargoVisivel;
  if (c.unidade !== undefined) row.unidade = c.unidade;
  if (c.departamento !== undefined) row.departamento = c.departamento;
  if (c.sindicato !== undefined) row.sindicato = c.sindicato;
  if (c.cbo !== undefined) row.cbo = c.cbo;
  if (c.grupoCargo !== undefined) row.grupo_cargo = c.grupoCargo;
  if (c.missao !== undefined) row.missao = c.missao;
  if (c.modeloCargo !== undefined) row.modelo_cargo = c.modeloCargo;
  if (c.salario !== undefined) row.salario = c.salario;
  if (c.responsabilidades !== undefined) row.responsabilidades = c.responsabilidades;
  if (c.requisitosAcademicos !== undefined) row.requisitos_academicos = c.requisitosAcademicos;
  if (c.competenciasComportamentais !== undefined) row.competencias_comportamentais = c.competenciasComportamentais;
  if (c.competenciasOrganizacionais !== undefined) row.competencias_organizacionais = c.competenciasOrganizacionais;
  if (c.experiencia !== undefined) row.experiencia = c.experiencia;
  if (c.nivelHierarquico !== undefined) row.nivel_hierarquico = c.nivelHierarquico;
  if (c.nivelSalarial !== undefined) row.nivel_salarial = c.nivelSalarial;
  return row;
}

export function CargosProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [grupos, setGrupos] = useState<GrupoCargo[]>(DEFAULT_GRUPOS);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const cols = "id,nome,cargo_visivel,unidade,departamento,sindicato,cbo,grupo_cargo,missao,modelo_cargo,responsabilidades,requisitos_academicos,competencias_comportamentais,competencias_organizacionais,experiencia,nivel_hierarquico,nivel_salarial";
    const { data, error } = await supabase.from("cargos").select(cols).order("nome");
    if (!error && data) {
      const base = (data as any[]).map(fromRow);
      // Salary is restricted to admin/gestor — fetched via RPC; returns empty for others.
      const { data: sal } = await (supabase as any).rpc("cargo_salarios");
      const map = new Map<string, number>(((sal as any[]) ?? []).map((r) => [r.id, Number(r.salario ?? 0)]));
      setCargos(base.map((c) => ({ ...c, salario: map.get(c.id) ?? 0 })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setCargos([]);
      setLoading(false);
      return;
    }

    void reload();
  }, [authLoading, user, reload]);

  const addCargo = useCallback(async (cargo: Omit<Cargo, "id">) => {
    const cols = "id,nome,cargo_visivel,unidade,departamento,sindicato,cbo,grupo_cargo,missao,modelo_cargo,responsabilidades,requisitos_academicos,competencias_comportamentais,competencias_organizacionais,experiencia,nivel_hierarquico,nivel_salarial";
    const { data, error } = await supabase.from("cargos").insert(toRow(cargo)).select(cols).single();
    if (!error && data) setCargos((prev) => [...prev, { ...fromRow(data), salario: cargo.salario ?? 0 }]);
  }, []);

  const removeCargo = useCallback(async (id: string) => {
    await supabase.from("cargos").delete().eq("id", id);
    setCargos((prev) => prev.filter((c) => c.id !== id));
    setGrupos((prev) => prev.map((g) => ({ ...g, cargoIds: g.cargoIds.filter((cid) => cid !== id) })));
  }, []);

  const updateCargo = useCallback(async (id: string, data: Partial<Cargo>) => {
    await supabase.from("cargos").update(toRow(data)).eq("id", id);
    setCargos((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const addGrupo = useCallback((grupo: Omit<GrupoCargo, "id">) => {
    setGrupos((prev) => [...prev, { ...grupo, id: crypto.randomUUID() }]);
  }, []);
  const removeGrupo = useCallback((id: string) => {
    setGrupos((prev) => prev.filter((g) => g.id !== id));
  }, []);
  const updateGrupo = useCallback((id: string, data: Partial<GrupoCargo>) => {
    setGrupos((prev) => prev.map((g) => (g.id === id ? { ...g, ...data } : g)));
  }, []);

  return (
    <CargosContext.Provider value={{ cargos, grupos, loading, addCargo, removeCargo, updateCargo, addGrupo, removeGrupo, updateGrupo, reload }}>
      {children}
    </CargosContext.Provider>
  );
}

export function useCargos() {
  const ctx = useContext(CargosContext);
  if (!ctx) throw new Error("useCargos must be used within CargosProvider");
  return ctx;
}
