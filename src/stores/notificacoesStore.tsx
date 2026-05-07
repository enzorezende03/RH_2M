import React, { createContext, useContext, useState, useCallback } from "react";

export interface Notificacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "criacao" | "atualizacao" | "exclusao" | "info";
  lida: boolean;
  criadaEm: Date;
}

interface NotificacoesContextType {
  notificacoes: Notificacao[];
  naoLidas: number;
  adicionarNotificacao: (n: Omit<Notificacao, "id" | "lida" | "criadaEm">) => void;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  limparNotificacoes: () => void;
}

const NotificacoesContext = createContext<NotificacoesContextType | undefined>(undefined);

let nextId = 1;

export function NotificacoesProvider({ children }: { children: React.ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  const adicionarNotificacao = useCallback((n: Omit<Notificacao, "id" | "lida" | "criadaEm">) => {
    const nova: Notificacao = {
      ...n,
      id: String(nextId++),
      lida: false,
      criadaEm: new Date(),
    };
    setNotificacoes((prev) => [nova, ...prev]);
  }, []);

  const marcarComoLida = useCallback((id: string) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }, []);

  const marcarTodasComoLidas = useCallback(() => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }, []);

  const limparNotificacoes = useCallback(() => {
    setNotificacoes([]);
  }, []);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <NotificacoesContext.Provider
      value={{ notificacoes, naoLidas, adicionarNotificacao, marcarComoLida, marcarTodasComoLidas, limparNotificacoes }}
    >
      {children}
    </NotificacoesContext.Provider>
  );
}

export function useNotificacoes() {
  const ctx = useContext(NotificacoesContext);
  if (!ctx) throw new Error("useNotificacoes must be used within NotificacoesProvider");
  return ctx;
}
