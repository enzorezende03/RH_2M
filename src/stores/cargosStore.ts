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

interface CargosContextType {
  cargos: Cargo[];
  addCargo: (cargo: Omit<Cargo, "id">) => void;
  removeCargo: (id: string) => void;
  updateCargo: (id: string, data: Partial<Cargo>) => void;
}

const CargosContext = createContext<CargosContextType | null>(null);

export function CargosProvider({ children }: { children: ReactNode }) {
  const [cargos, setCargos] = useState<Cargo[]>([]);

  const addCargo = useCallback((cargo: Omit<Cargo, "id">) => {
    setCargos((prev) => [...prev, { ...cargo, id: crypto.randomUUID() }]);
  }, []);

  const removeCargo = useCallback((id: string) => {
    setCargos((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCargo = useCallback((id: string, data: Partial<Cargo>) => {
    setCargos((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  return (
    <CargosContext.Provider value={{ cargos, addCargo, removeCargo, updateCargo }}>
      {children}
    </CargosContext.Provider>
  );
}

export function useCargos() {
  const ctx = useContext(CargosContext);
  if (!ctx) throw new Error("useCargos must be used within CargosProvider");
  return ctx;
}
