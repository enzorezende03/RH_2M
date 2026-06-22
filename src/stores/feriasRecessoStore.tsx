import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

/**
 * Store unificada que integra as 4 páginas de Férias/Recesso:
 *  - Meu Recesso (visão do colaborador)
 *  - Calendário de Férias & Recesso / Férias e Solicitações
 *  - Férias & Recesso - RH
 *  - Férias Coletivas
 *
 * Toda solicitação criada em qualquer página entra aqui e aparece nas demais.
 * Aprovações/cancelamentos do RH refletem em tempo real para o colaborador.
 * Férias coletivas geram automaticamente solicitações "Concluída" para os
 * colaboradores incluídos, consumindo saldo deles.
 */

export type StatusUni =
  | "Análise Gestor"
  | "Análise RH"
  | "Documentação"
  | "Concluída"
  | "Reprovada"
  | "Cancelada";

export interface SolicitacaoUni {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  cargo: string;
  gestor: string;
  /** ISO yyyy-mm-dd */
  inicio: string;
  /** ISO yyyy-mm-dd */
  fim: string;
  dias: number;
  /** dd/mm/yyyy */
  dataSolicitacao: string;
  observacoes?: string;
  status: StatusUni;
  tipo: "recesso" | "ferias" | "coletiva";
  origem?: "colaborador" | "rh" | "coletiva";
  coletivaId?: string;
  motivoReprovacao?: string;
  motivoCancelamento?: string;
}

export interface ColetivaUni {
  id: string;
  titulo: string;
  /** ISO yyyy-mm-dd */
  inicio: string;
  fim: string;
  saldo: number;
  departamentos: string[];
  totalColaboradores: number;
  colaboradoresIncluidos: { id: string; nome: string; departamento: string }[];
  colaboradoresExcluidos: { id: string; nome: string; departamento: string }[];
}

interface CtxType {
  solicitacoes: SolicitacaoUni[];
  coletivas: ColetivaUni[];
  saldoAnual: number;
  criarSolicitacao: (
    s: Omit<SolicitacaoUni, "id" | "dataSolicitacao" | "dias"> &
      Partial<Pick<SolicitacaoUni, "dias" | "dataSolicitacao">>,
  ) => SolicitacaoUni;
  atualizarStatus: (id: string, status: StatusUni, motivo?: string) => void;
  cancelarSolicitacao: (id: string, motivo?: string) => void;
  removerSolicitacao: (id: string) => void;
  criarColetiva: (c: Omit<ColetivaUni, "id">) => ColetivaUni;
  excluirColetiva: (id: string) => void;
  saldoColaborador: (colaboradorId: string) => number;
  solicitacoesDoColaborador: (colaboradorId: string) => SolicitacaoUni[];
}

const Ctx = createContext<CtxType | null>(null);

const KEY_SOL = "feriasRecesso.solicitacoes.v1";
const KEY_COL = "feriasRecesso.coletivas.v1";

function isoFromBR(s: string): string {
  if (!s) return "";
  if (s.includes("-")) return s;
  const [d, m, y] = s.split("/");
  if (!d || !m || !y) return s;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function diasEntre(iniISO: string, fimISO: string): number {
  if (!iniISO || !fimISO) return 0;
  const a = new Date(iniISO);
  const b = new Date(fimISO);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  const d = Math.floor((b.getTime() - a.getTime()) / 86400000) + 1;
  return d > 0 ? d : 0;
}

function hojeBR(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// Seed inicial vindo do mock existente do RH, para preservar a UX da página
const SEED_SOLICITACOES: SolicitacaoUni[] = [
  ["ag1", "LAURA VITÓRIA DE SOUZA ROBERTO", "Auxiliar", "ANA CAROLINA BRAGA DE MOURA", "09/06/2026", "27/07/2026", "31/07/2026", "Análise Gestor"],
  ["ag2", "STEPHANY OLIVEIRA", "Recepcionista I", "ANA CAROLINA BRAGA DE MOURA", "16/06/2026", "24/08/2026", "28/08/2026", "Análise Gestor"],
  ["ag3", "THALITA ARAUJO DE OLIVEIRA", "Analista III", "DANIELA NASCIMENTO COSTA BICALHO", "09/09/2025", "21/12/2026", "31/12/2026", "Análise Gestor"],
  ["rh1", "THALITA ARAUJO DE OLIVEIRA", "Analista III", "DANIELA NASCIMENTO COSTA BICALHO", "09/09/2025", "20/07/2026", "24/07/2026", "Análise RH"],
  ["rh2", "MARIA EDUARDA COSTA GONÇALVES", "Assistente", "DANIELA NASCIMENTO COSTA BICALHO", "25/03/2026", "27/07/2026", "31/07/2026", "Análise RH"],
  ["rh3", "THALITA RODRIGUES GUEDES", "Auxiliar", "DANIELA NASCIMENTO COSTA BICALHO", "05/05/2026", "29/07/2026", "11/08/2026", "Análise RH"],
  ["rh4", "GABRIELA CALDEIRA NUNES VERA", "Assistente", "DANIELA NASCIMENTO COSTA BICALHO", "10/05/2026", "03/08/2026", "13/08/2026", "Análise RH"],
  ["rh5", "ANA CLÁUDIA ROSSI", "ANALISTA III - Step 1", "DANIELA NASCIMENTO COSTA BICALHO", "10/06/2026", "03/08/2026", "07/08/2026", "Análise RH"],
  ["rh6", "JANAINA MARIANI", "Analista III", "DANIELA NASCIMENTO COSTA BICALHO", "29/01/2026", "10/08/2026", "24/08/2026", "Análise RH"],
  ["rh7", "STEFANY MELGACO LAVINSKY", "Analista I", "DANIELA NASCIMENTO COSTA BICALHO", "14/05/2026", "10/08/2026", "24/08/2026", "Análise RH"],
  ["rh8", "LIVIA GARCIA XAVIER", "Analista III", "ANA CAROLINA BRAGA DE MOURA", "07/11/2025", "17/08/2026", "01/09/2026", "Análise RH"],
  ["rh9", "ANDREZA FERNANDA TEIXEIRA DA SILVA", "Analista I", "DANIELA NASCIMENTO COSTA BICALHO", "19/01/2026", "21/09/2026", "30/09/2026", "Análise RH"],
  ["rh10", "CAMILA OLIVEIRA MACEDO", "Analista I", "LIVIA GARCIA XAVIER", "20/01/2026", "21/09/2026", "30/09/2026", "Análise RH"],
  ["rh11", "BRUNA LOPES PEREIRA", "Assistente", "LIVIA GARCIA XAVIER", "11/02/2026", "05/10/2026", "14/10/2026", "Análise RH"],
  ["rh12", "FERNANDA FABIANA DA SILVA", "Assistente", "DANIELA NASCIMENTO COSTA BICALHO", "20/02/2026", "12/10/2026", "26/10/2026", "Análise RH"],
  ["rh13", "MAIANE KELLY DIAS", "Assistente", "DANIELA NASCIMENTO COSTA BICALHO", "02/03/2026", "19/10/2026", "28/10/2026", "Análise RH"],
  ["doc1", "SULAMITA BRAS DE OLIVEIRA MACHADO", "Assistente Financeiro/RH", "ANA CAROLINA BRAGA DE MOURA", "09/02/2026", "16/07/2026", "30/07/2026", "Documentação"],
  ["c1", "ERICK VINICIOS BORGES PIRES", "Auxiliar", "DANIELA NASCIMENTO COSTA BICALHO", "29/08/2024", "04/10/2023", "13/10/2023", "Concluída"],
  ["c2", "JAMILA SILVEIRA COSTA", "Analista I", "LIVIA GARCIA XAVIER", "29/08/2024", "21/12/2023", "30/12/2023", "Concluída"],
  ["c3", "JESSYCA LOPES", "Analista III", "DANIELA NASCIMENTO COSTA BICALHO", "29/08/2024", "21/12/2023", "30/12/2023", "Concluída"],
  ["c4", "DANIELLE CAMPOS MILLIOR", "ANALISTA III - Step 2", "DANIELA NASCIMENTO COSTA BICALHO", "29/08/2024", "21/12/2023", "30/12/2023", "Concluída"],
  ["c5", "LIVIA GARCIA XAVIER", "Analista III", "ANA CAROLINA BRAGA DE MOURA", "29/08/2024", "21/12/2023", "30/12/2023", "Concluída"],
].map(([id, nome, cargo, gestor, ds, ini, fim, st]) => {
  const iniISO = isoFromBR(ini as string);
  const fimISO = isoFromBR(fim as string);
  return {
    id: id as string,
    colaboradorId: "",
    colaboradorNome: nome as string,
    cargo: cargo as string,
    gestor: gestor as string,
    inicio: iniISO,
    fim: fimISO,
    dias: diasEntre(iniISO, fimISO),
    dataSolicitacao: ds as string,
    status: st as StatusUni,
    tipo: "recesso" as const,
    origem: "colaborador" as const,
  };
});

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function FeriasRecessoProvider({ children }: { children: ReactNode }) {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoUni[]>(() =>
    loadLS<SolicitacaoUni[]>(KEY_SOL, SEED_SOLICITACOES),
  );
  const [coletivas, setColetivas] = useState<ColetivaUni[]>(() => loadLS<ColetivaUni[]>(KEY_COL, []));

  useEffect(() => {
    try { localStorage.setItem(KEY_SOL, JSON.stringify(solicitacoes)); } catch {}
  }, [solicitacoes]);
  useEffect(() => {
    try { localStorage.setItem(KEY_COL, JSON.stringify(coletivas)); } catch {}
  }, [coletivas]);

  const criarSolicitacao = useCallback<CtxType["criarSolicitacao"]>((s) => {
    const inicio = isoFromBR(s.inicio);
    const fim = isoFromBR(s.fim);
    const novo: SolicitacaoUni = {
      id: crypto.randomUUID(),
      colaboradorId: s.colaboradorId || "",
      colaboradorNome: s.colaboradorNome,
      cargo: s.cargo || "",
      gestor: s.gestor || "",
      inicio,
      fim,
      dias: s.dias ?? diasEntre(inicio, fim),
      dataSolicitacao: s.dataSolicitacao ?? hojeBR(),
      observacoes: s.observacoes,
      status: s.status ?? "Análise Gestor",
      tipo: s.tipo ?? "recesso",
      origem: s.origem ?? "colaborador",
      coletivaId: s.coletivaId,
    };
    setSolicitacoes((prev) => [novo, ...prev]);
    return novo;
  }, []);

  const atualizarStatus = useCallback((id: string, status: StatusUni, motivo?: string) => {
    setSolicitacoes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              motivoReprovacao: status === "Reprovada" ? motivo ?? s.motivoReprovacao : s.motivoReprovacao,
              motivoCancelamento: status === "Cancelada" ? motivo ?? s.motivoCancelamento : s.motivoCancelamento,
            }
          : s,
      ),
    );
  }, []);

  const cancelarSolicitacao = useCallback((id: string, motivo?: string) => {
    atualizarStatus(id, "Cancelada", motivo);
  }, [atualizarStatus]);

  const removerSolicitacao = useCallback((id: string) => {
    setSolicitacoes((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const criarColetiva = useCallback<CtxType["criarColetiva"]>((c) => {
    const novo: ColetivaUni = {
      id: crypto.randomUUID(),
      ...c,
      inicio: isoFromBR(c.inicio),
      fim: isoFromBR(c.fim),
    };
    setColetivas((prev) => [novo, ...prev]);
    // Gerar solicitações automáticas (já aprovadas) para cada incluído
    const hoje = hojeBR();
    const dias = diasEntre(novo.inicio, novo.fim);
    setSolicitacoes((prev) => [
      ...novo.colaboradoresIncluidos.map((inc) => ({
        id: crypto.randomUUID(),
        colaboradorId: inc.id,
        colaboradorNome: inc.nome,
        cargo: "",
        gestor: "",
        inicio: novo.inicio,
        fim: novo.fim,
        dias,
        dataSolicitacao: hoje,
        status: "Concluída" as StatusUni,
        tipo: "coletiva" as const,
        origem: "coletiva" as const,
        coletivaId: novo.id,
        observacoes: `Férias coletivas: ${novo.titulo}`,
      })),
      ...prev,
    ]);
    return novo;
  }, []);

  const excluirColetiva = useCallback((id: string) => {
    setColetivas((prev) => prev.filter((c) => c.id !== id));
    setSolicitacoes((prev) => prev.filter((s) => s.coletivaId !== id));
  }, []);

  const saldoColaborador = useCallback(
    (colaboradorId: string) => {
      const SALDO_ANUAL = 30;
      const consumido = solicitacoes
        .filter(
          (s) =>
            s.colaboradorId === colaboradorId &&
            (s.status === "Concluída" || s.status === "Análise Gestor" || s.status === "Análise RH" || s.status === "Documentação"),
        )
        .reduce((a, s) => a + (s.dias || 0), 0);
      return Math.max(0, SALDO_ANUAL - consumido);
    },
    [solicitacoes],
  );

  const solicitacoesDoColaborador = useCallback(
    (colaboradorId: string) => solicitacoes.filter((s) => s.colaboradorId === colaboradorId),
    [solicitacoes],
  );

  const value: CtxType = useMemo(
    () => ({
      solicitacoes,
      coletivas,
      saldoAnual: 30,
      criarSolicitacao,
      atualizarStatus,
      cancelarSolicitacao,
      removerSolicitacao,
      criarColetiva,
      excluirColetiva,
      saldoColaborador,
      solicitacoesDoColaborador,
    }),
    [solicitacoes, coletivas, criarSolicitacao, atualizarStatus, cancelarSolicitacao, removerSolicitacao, criarColetiva, excluirColetiva, saldoColaborador, solicitacoesDoColaborador],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFeriasRecesso() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFeriasRecesso fora de FeriasRecessoProvider");
  return ctx;
}

export function fmtISOtoBR(iso: string): string {
  if (!iso) return "";
  if (iso.includes("/")) return iso;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
