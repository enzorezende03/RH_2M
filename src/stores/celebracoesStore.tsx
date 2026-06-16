import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export interface CelebracaoComentario {
  id: string;
  autor: string;
  autorIniciais: string;
  texto: string;
  criadoEm: string;
  curtidas: string[];
}

export interface Celebracao {
  id: string;
  autor: string;
  autorIniciais: string;
  mensagemHtml: string;
  mensagemTexto: string;
  destinatarios: string[];
  destinatarioLabel: string;
  tipo: "colega" | "departamento" | "todos";
  criadoEm: string;
  curtidas: string[];
  comentarios: CelebracaoComentario[];
}

interface Ctx {
  celebracoes: Celebracao[];
  add: (c: Omit<Celebracao, "id" | "criadoEm" | "curtidas" | "comentarios">) => Celebracao;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<Celebracao>) => void;
  toggleLike: (id: string, nome: string) => void;
  addComentario: (id: string, c: Omit<CelebracaoComentario, "id" | "criadoEm" | "curtidas">) => void;
  removeComentario: (id: string, comentarioId: string) => void;
  toggleComentarioLike: (id: string, comentarioId: string, nome: string) => void;
}

const STORAGE_KEY = "celebracoes:v1";
const CelebracoesContext = createContext<Ctx | null>(null);

export function CelebracoesProvider({ children }: { children: ReactNode }) {
  const [celebracoes, setCelebracoes] = useState<Celebracao[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Celebracao[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(celebracoes));
    } catch {/* ignore */}
  }, [celebracoes]);

  const add: Ctx["add"] = useCallback((c) => {
    const nova: Celebracao = {
      ...c,
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
      curtidas: [],
      comentarios: [],
    };
    setCelebracoes((prev) => [nova, ...prev]);
    return nova;
  }, []);

  const remove = useCallback((id: string) => {
    setCelebracoes((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const update = useCallback((id: string, patch: Partial<Celebracao>) => {
    setCelebracoes((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const toggleLike = useCallback((id: string, nome: string) => {
    setCelebracoes((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const has = c.curtidas.includes(nome);
      return { ...c, curtidas: has ? c.curtidas.filter((n) => n !== nome) : [...c.curtidas, nome] };
    }));
  }, []);

  const addComentario: Ctx["addComentario"] = useCallback((id, c) => {
    setCelebracoes((prev) => prev.map((celeb) => {
      if (celeb.id !== id) return celeb;
      const novo: CelebracaoComentario = {
        ...c,
        id: crypto.randomUUID(),
        criadoEm: new Date().toISOString(),
        curtidas: [],
      };
      return { ...celeb, comentarios: [...celeb.comentarios, novo] };
    }));
  }, []);

  const removeComentario = useCallback((id: string, comentarioId: string) => {
    setCelebracoes((prev) => prev.map((c) =>
      c.id === id ? { ...c, comentarios: c.comentarios.filter((co) => co.id !== comentarioId) } : c
    ));
  }, []);

  const toggleComentarioLike = useCallback((id: string, comentarioId: string, nome: string) => {
    setCelebracoes((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        comentarios: c.comentarios.map((co) => {
          if (co.id !== comentarioId) return co;
          const has = co.curtidas.includes(nome);
          return { ...co, curtidas: has ? co.curtidas.filter((n) => n !== nome) : [...co.curtidas, nome] };
        }),
      };
    }));
  }, []);

  return (
    <CelebracoesContext.Provider value={{ celebracoes, add, remove, update, toggleLike, addComentario, removeComentario, toggleComentarioLike }}>
      {children}
    </CelebracoesContext.Provider>
  );
}

export function useCelebracoes() {
  const ctx = useContext(CelebracoesContext);
  if (!ctx) throw new Error("useCelebracoes must be used within CelebracoesProvider");
  return ctx;
}
