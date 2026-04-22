import { createContext, useContext, useState, useCallback, ReactNode } from "react";

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
}

interface ColaboradoresContextType {
  colaboradores: Colaborador[];
  addColaborador: (c: Omit<Colaborador, "id">) => Colaborador;
  removeColaborador: (id: string) => void;
  updateColaborador: (id: string, data: Partial<Colaborador>) => void;
}

const ColaboradoresContext = createContext<ColaboradoresContextType | null>(null);

export function ColaboradoresProvider({ children }: { children: ReactNode }) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  const addColaborador = useCallback((c: Omit<Colaborador, "id">) => {
    const novo: Colaborador = { ...c, id: crypto.randomUUID() };
    setColaboradores((prev) => [...prev, novo]);
    return novo;
  }, []);

  const removeColaborador = useCallback((id: string) => {
    setColaboradores((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateColaborador = useCallback((id: string, data: Partial<Colaborador>) => {
    setColaboradores((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  return (
    <ColaboradoresContext.Provider value={{ colaboradores, addColaborador, removeColaborador, updateColaborador }}>
      {children}
    </ColaboradoresContext.Provider>
  );
}

export function useColaboradores() {
  const ctx = useContext(ColaboradoresContext);
  if (!ctx) throw new Error("useColaboradores must be used within ColaboradoresProvider");
  return ctx;
}
