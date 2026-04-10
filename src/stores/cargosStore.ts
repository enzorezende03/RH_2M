import { create } from "zustand";

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

interface CargosStore {
  cargos: Cargo[];
  addCargo: (cargo: Omit<Cargo, "id">) => void;
  removeCargo: (id: string) => void;
  updateCargo: (id: string, data: Partial<Cargo>) => void;
}

export const useCargosStore = create<CargosStore>((set) => ({
  cargos: [],
  addCargo: (cargo) =>
    set((state) => ({
      cargos: [...state.cargos, { ...cargo, id: crypto.randomUUID() }],
    })),
  removeCargo: (id) =>
    set((state) => ({ cargos: state.cargos.filter((c) => c.id !== id) })),
  updateCargo: (id, data) =>
    set((state) => ({
      cargos: state.cargos.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
}));
