import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

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

const STORAGE_KEY = "relatorios-personalizados";

type Ctx = {
  relatorios: RelatorioPersonalizado[];
  add: (r: { title: string; file?: string; status?: string[]; campos?: string[] }) => RelatorioPersonalizado;
  remove: (id: string) => void;
};

const RelatoriosContext = createContext<Ctx | null>(null);

function load(): RelatorioPersonalizado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed: RelatorioPersonalizado[] = JSON.parse(raw);
    const ids = new Set(parsed.map((r) => r.id));
    return [...defaults.filter((d) => !ids.has(d.id)), ...parsed];
  } catch {
    return defaults;
  }
}

export function RelatoriosPersonalizadosProvider({ children }: { children: ReactNode }) {
  const [relatorios, setRelatorios] = useState<RelatorioPersonalizado[]>(() => load());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(relatorios));
  }, [relatorios]);

  const add: Ctx["add"] = useCallback((r) => {
    const novo: RelatorioPersonalizado = {
      id: `rel-${Date.now()}`,
      title: r.title,
      file: r.file ?? "/planilhas/relacao_colaboradores.xlsx",
      status: r.status,
      campos: r.campos,
      createdAt: new Date().toISOString(),
    };
    setRelatorios((prev) => [...prev, novo]);
    return novo;
  }, []);

  const remove = useCallback((id: string) => {
    setRelatorios((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <RelatoriosContext.Provider value={{ relatorios, add, remove }}>
      {children}
    </RelatoriosContext.Provider>
  );
}

export function useRelatoriosPersonalizados(): Ctx {
  const ctx = useContext(RelatoriosContext);
  if (!ctx) {
    // Fallback for components rendered outside provider — read directly
    const [relatorios, setRelatorios] = useState<RelatorioPersonalizado[]>(() => load());
    useEffect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(relatorios));
    }, [relatorios]);
    return {
      relatorios,
      add: (r) => {
        const novo: RelatorioPersonalizado = {
          id: `rel-${Date.now()}`,
          title: r.title,
          file: r.file ?? "/planilhas/relacao_colaboradores.xlsx",
          status: r.status,
          campos: r.campos,
          createdAt: new Date().toISOString(),
        };
        setRelatorios((prev) => [...prev, novo]);
        return novo;
      },
      remove: (id) => setRelatorios((prev) => prev.filter((r) => r.id !== id)),
    };
  }
  return ctx;
}
