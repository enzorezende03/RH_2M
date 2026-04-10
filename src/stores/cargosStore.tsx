import { createContext, useContext, useState, useCallback, ReactNode } from "react";

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
  addCargo: (cargo: Omit<Cargo, "id">) => void;
  removeCargo: (id: string) => void;
  updateCargo: (id: string, data: Partial<Cargo>) => void;
  addGrupo: (grupo: Omit<GrupoCargo, "id">) => void;
  removeGrupo: (id: string) => void;
  updateGrupo: (id: string, data: Partial<GrupoCargo>) => void;
}

const CargosContext = createContext<CargosContextType | null>(null);

const DEFAULT_GRUPOS: GrupoCargo[] = [
  { id: "g1", nome: "Step 1", descricao: "", cargoIds: [] },
  { id: "g2", nome: "Step 2", descricao: "", cargoIds: [] },
  { id: "g3", nome: "Step 3", descricao: "", cargoIds: [] },
  { id: "g4", nome: "Step 4", descricao: "", cargoIds: [] },
  { id: "g5", nome: "Step 5", descricao: "", cargoIds: [] },
];

export function CargosProvider({ children }: { children: ReactNode }) {
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [grupos, setGrupos] = useState<GrupoCargo[]>(DEFAULT_GRUPOS);

  const addCargo = useCallback((cargo: Omit<Cargo, "id">) => {
    setCargos((prev) => [...prev, { ...cargo, id: crypto.randomUUID() }]);
  }, []);

  const removeCargo = useCallback((id: string) => {
    setCargos((prev) => prev.filter((c) => c.id !== id));
    setGrupos((prev) => prev.map((g) => ({ ...g, cargoIds: g.cargoIds.filter((cid) => cid !== id) })));
  }, []);

  const updateCargo = useCallback((id: string, data: Partial<Cargo>) => {
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
    <CargosContext.Provider value={{ cargos, grupos, addCargo, removeCargo, updateCargo, addGrupo, removeGrupo, updateGrupo }}>
      {children}
    </CargosContext.Provider>
  );
}

export function useCargos() {
  const ctx = useContext(CargosContext);
  if (!ctx) throw new Error("useCargos must be used within CargosProvider");
  return ctx;
}
