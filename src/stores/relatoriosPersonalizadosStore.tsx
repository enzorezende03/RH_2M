import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RelatorioPersonalizado = {
  id: string;
  title: string;
  file: string;
  status?: string[];
  campos?: string[];
  createdAt: string;
};

const defaults: RelatorioPersonalizado[] = [
  {
    id: "default-relacao-colaboradoras",
    title: "Relação Colaboradoras",
    file: "/planilhas/relacao_colaboradores.xlsx",
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "default-funcao-grau",
    title: "Relatório função/grau instrução",
    file: "/planilhas/relatorio_funcao_grau.xlsx",
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "default-data-admissao",
    title: "Data de admissão",
    file: "/planilhas/data_admissao.xlsx",
    createdAt: new Date(0).toISOString(),
  },
];

type State = {
  relatorios: RelatorioPersonalizado[];
  add: (r: Omit<RelatorioPersonalizado, "id" | "createdAt"> & { id?: string }) => void;
  remove: (id: string) => void;
};

export const useRelatoriosPersonalizadosStore = create<State>()(
  persist(
    (set) => ({
      relatorios: defaults,
      add: (r) =>
        set((state) => ({
          relatorios: [
            ...state.relatorios,
            {
              ...r,
              id: r.id ?? `rel-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      remove: (id) =>
        set((state) => ({
          relatorios: state.relatorios.filter((x) => x.id !== id),
        })),
    }),
    {
      name: "relatorios-personalizados",
      merge: (persisted, current) => {
        const p = (persisted as State) || current;
        const ids = new Set(p.relatorios?.map((r) => r.id));
        const merged = [
          ...defaults.filter((d) => !ids.has(d.id)),
          ...(p.relatorios ?? []),
        ];
        return { ...current, ...p, relatorios: merged };
      },
    }
  )
);
