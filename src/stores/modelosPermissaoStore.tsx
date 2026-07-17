import { useEffect, useState, useCallback } from "react";

export type PermissoesTemplate = {
  depGerenciados: string;
  unidadesGerenciadas: string;
  permColaboradores: boolean;
  permColaboradoresAcesso: boolean;
  permCelebracoes: boolean;
  permGamificacao: boolean;
  permComunicados: boolean;
  permOuvidoria: boolean;
  permReunioes: boolean;
  reunioesScope: string;
};

export type ModeloPermissao = {
  id: string;
  nome: string;
  nivel: "Diretoria" | "RH" | "Coordenação" | "Liderança" | "Operacional" | "Personalizado";
  descricao?: string;
  padrao?: boolean;
  permissoes: PermissoesTemplate;
};

export const PERMISSOES_VAZIAS: PermissoesTemplate = {
  depGerenciados: "",
  unidadesGerenciadas: "",
  permColaboradores: false,
  permColaboradoresAcesso: false,
  permCelebracoes: false,
  permGamificacao: false,
  permComunicados: false,
  permOuvidoria: false,
  permReunioes: false,
  reunioesScope: "todas",
};

const mk = (
  id: string,
  nome: string,
  nivel: ModeloPermissao["nivel"],
  descricao: string,
  overrides: Partial<PermissoesTemplate>,
): ModeloPermissao => ({
  id,
  nome,
  nivel,
  descricao,
  padrao: true,
  permissoes: { ...PERMISSOES_VAZIAS, ...overrides },
});

export const MODELOS_PADRAO: ModeloPermissao[] = [
  mk("diretoria", "Diretoria", "Diretoria", "Acesso total ao sistema.", {
    permColaboradores: true,
    permColaboradoresAcesso: true,
    permCelebracoes: true,
    permGamificacao: true,
    permComunicados: true,
    permOuvidoria: true,
    permReunioes: true,
    reunioesScope: "todas",
  }),
  mk("rh", "RH", "RH", "Gestão de colaboradores, comunicados, celebrações e ouvidoria.", {
    permColaboradores: true,
    permColaboradoresAcesso: true,
    permCelebracoes: true,
    permGamificacao: true,
    permComunicados: true,
    permOuvidoria: true,
    permReunioes: true,
    reunioesScope: "todas",
  }),
  mk("coordenacao", "Coordenação", "Coordenação", "Coordenadores de área — gestão da equipe e comunicados.", {
    permComunicados: true,
    permCelebracoes: true,
    permReunioes: true,
    reunioesScope: "somente",
  }),
  mk("lideranca", "Liderança", "Liderança", "Líderes diretos — reuniões 1:1 e celebrações da equipe.", {
    permCelebracoes: true,
    permReunioes: true,
    reunioesScope: "somente",
  }),
  mk("operacional", "Operacional", "Operacional", "Acesso somente de visualização (padrão).", {}),
];

const STORAGE_KEY = "modelos-permissao-v1";
const EVENT = "modelos-permissao-changed";

function ler(): ModeloPermissao[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return MODELOS_PADRAO;
    const parsed = JSON.parse(raw) as ModeloPermissao[];
    if (!Array.isArray(parsed) || parsed.length === 0) return MODELOS_PADRAO;
    // Garante que os padrões sempre estejam presentes
    const personalizados = parsed.filter((m) => !m.padrao);
    const padraoAtualizados = MODELOS_PADRAO.map(
      (base) => parsed.find((m) => m.id === base.id) ?? base,
    );
    return [...padraoAtualizados, ...personalizados];
  } catch {
    return MODELOS_PADRAO;
  }
}

function salvar(modelos: ModeloPermissao[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(modelos));
  window.dispatchEvent(new Event(EVENT));
}

export function useModelosPermissao() {
  const [modelos, setModelos] = useState<ModeloPermissao[]>(() => ler());

  useEffect(() => {
    const handler = () => setModelos(ler());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const criarModelo = useCallback(
    (m: Omit<ModeloPermissao, "id" | "padrao">) => {
      const novo: ModeloPermissao = {
        ...m,
        id: `mod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        padrao: false,
      };
      const atual = ler();
      salvar([...atual, novo]);
      return novo;
    },
    [],
  );

  const atualizarModelo = useCallback((id: string, patch: Partial<ModeloPermissao>) => {
    const atual = ler();
    salvar(atual.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const excluirModelo = useCallback((id: string) => {
    const atual = ler();
    salvar(atual.filter((m) => m.id !== id || m.padrao));
  }, []);

  const restaurarPadrao = useCallback(() => {
    const atual = ler();
    const personalizados = atual.filter((m) => !m.padrao);
    salvar([...MODELOS_PADRAO, ...personalizados]);
  }, []);

  return { modelos, criarModelo, atualizarModelo, excluirModelo, restaurarPadrao };
}
