import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export interface RespostaHumor {
  id: string;
  colaboradorId: string | null;
  colaboradorNome: string;
  nivel: number; // 1..5
  comentario: string;
  criadoEm: string; // ISO
}

interface HumorContextValue {
  respostas: RespostaHumor[];
  registrar: (r: Omit<RespostaHumor, "id" | "criadoEm">) => void;
  ultimaResposta: (colaboradorId: string | null, email: string | null) => RespostaHumor | null;
  podeResponder: (colaboradorId: string | null, email: string | null) => boolean;
}

const STORAGE_KEY = "rh2m:humor:respostas";
const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

const HumorContext = createContext<HumorContextValue | null>(null);

export function HumorProvider({ children }: { children: ReactNode }) {
  const [respostas, setRespostas] = useState<RespostaHumor[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RespostaHumor[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(respostas));
    } catch {}
  }, [respostas]);

  const registrar = useCallback((r: Omit<RespostaHumor, "id" | "criadoEm">) => {
    setRespostas((prev) => [
      {
        ...r,
        id: `humor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        criadoEm: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const ultimaResposta = useCallback(
    (colaboradorId: string | null, email: string | null) => {
      const chave = colaboradorId ?? email ?? "anon";
      const lista = respostas.filter((x) => (x.colaboradorId ?? "anon") === chave);
      return lista.length ? lista[0] : null;
    },
    [respostas]
  );

  const podeResponder = useCallback(
    (colaboradorId: string | null, email: string | null) => {
      const ult = ultimaResposta(colaboradorId, email);
      if (!ult) return true;
      return Date.now() - new Date(ult.criadoEm).getTime() >= SETE_DIAS_MS;
    },
    [ultimaResposta]
  );

  return (
    <HumorContext.Provider value={{ respostas, registrar, ultimaResposta, podeResponder }}>
      {children}
    </HumorContext.Provider>
  );
}

export function useHumor() {
  const ctx = useContext(HumorContext);
  if (!ctx) throw new Error("useHumor must be used within HumorProvider");
  return ctx;
}

export const NIVEIS_HUMOR = [
  { nivel: 1, emoji: "😢", rotulo: "Muito mal" },
  { nivel: 2, emoji: "😣", rotulo: "Mal" },
  { nivel: 3, emoji: "😐", rotulo: "Neutro" },
  { nivel: 4, emoji: "🙂", rotulo: "Bem" },
  { nivel: 5, emoji: "😄", rotulo: "Muito bem" },
];

export const PROXIMA_LIBERACAO_MS = SETE_DIAS_MS;
