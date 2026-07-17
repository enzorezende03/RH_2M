import { create } from "zustand";
import { persist } from "zustand/middleware";

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

const seed = (
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

const MODELOS_PADRAO: ModeloPermissao[] = [
  seed("diretoria", "Diretoria", "Diretoria", "Acesso total ao sistema.", {
    permColaboradores: true,
    permColaboradoresAcesso: true,
    permCelebracoes: true,
    permGamificacao: true,
    permComunicados: true,
    permOuvidoria: true,
    permReunioes: true,
    reunioesScope: "todas",
  }),
  seed("rh", "RH", "RH", "Gestão de colaboradores, comunicados, celebrações e ouvidoria.", {
    permColaboradores: true,
    permColaboradoresAcesso: true,
    permCelebracoes: true,
    permGamificacao: true,
    permComunicados: true,
    permOuvidoria: true,
    permReunioes: true,
    reunioesScope: "todas",
  }),
  seed("coordenacao", "Coordenação", "Coordenação", "Coordenadores de área — gestão da equipe e comunicados.", {
    permComunicados: true,
    permCelebracoes: true,
    permReunioes: true,
    reunioesScope: "somente",
  }),
  seed("lideranca", "Liderança", "Liderança", "Líderes diretos — reuniões 1:1 e celebrações da equipe.", {
    permCelebracoes: true,
    permReunioes: true,
    reunioesScope: "somente",
  }),
  seed("operacional", "Operacional", "Operacional", "Acesso somente de visualização (padrão).", {}),
];

type Store = {
  modelos: ModeloPermissao[];
  criarModelo: (m: Omit<ModeloPermissao, "id" | "padrao">) => ModeloPermissao;
  atualizarModelo: (id: string, patch: Partial<ModeloPermissao>) => void;
  excluirModelo: (id: string) => void;
  restaurarPadrao: () => void;
};

export const useModelosPermissao = create<Store>()(
  persist(
    (set, get) => ({
      modelos: MODELOS_PADRAO,
      criarModelo: (m) => {
        const novo: ModeloPermissao = {
          ...m,
          id: `mod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          padrao: false,
        };
        set({ modelos: [...get().modelos, novo] });
        return novo;
      },
      atualizarModelo: (id, patch) =>
        set({ modelos: get().modelos.map((m) => (m.id === id ? { ...m, ...patch } : m)) }),
      excluirModelo: (id) =>
        set({ modelos: get().modelos.filter((m) => m.id !== id || m.padrao) }),
      restaurarPadrao: () => {
        const personalizados = get().modelos.filter((m) => !m.padrao);
        set({ modelos: [...MODELOS_PADRAO, ...personalizados] });
      },
    }),
    {
      name: "modelos-permissao-v1",
      version: 1,
    },
  ),
);
