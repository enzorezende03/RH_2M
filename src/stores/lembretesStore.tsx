import React, { createContext, useContext, useState, useCallback } from "react";

export interface Lembrete {
  id: string;
  pesquisaNome: string;
  mensagem: string;
  destinatarios: number;
  criadoEm: Date;
}

interface LembretesContextType {
  lembretes: Lembrete[];
  adicionarLembrete: (l: Omit<Lembrete, "id" | "criadoEm">) => void;
}

const LembretesContext = createContext<LembretesContextType | undefined>(undefined);

let nextId = 1;

export function LembretesProvider({ children }: { children: React.ReactNode }) {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);

  const adicionarLembrete = useCallback((l: Omit<Lembrete, "id" | "criadoEm">) => {
    setLembretes((prev) => [
      { ...l, id: String(nextId++), criadoEm: new Date() },
      ...prev,
    ]);
  }, []);

  return (
    <LembretesContext.Provider value={{ lembretes, adicionarLembrete }}>
      {children}
    </LembretesContext.Provider>
  );
}

export function useLembretes() {
  const ctx = useContext(LembretesContext);
  if (!ctx) throw new Error("useLembretes must be used within LembretesProvider");
  return ctx;
}
