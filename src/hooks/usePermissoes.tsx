import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";
import { useUserRoles } from "@/hooks/useUserRoles";

/**
 * Permissões do site:
 * - Colaboradores com a TAG "Ouvidoria" (e admins) podem CRIAR/EDITAR/EXCLUIR em todo o site.
 * - Demais colaboradores têm acesso somente de VISUALIZAÇÃO.
 */
export function usePermissoes() {
  const { colaborador } = useCurrentColaborador();
  const { isAdmin } = useUserRoles();

  const temTagOuvidoria = (colaborador?.tag ?? "").trim().toLowerCase() === "ouvidoria";
  const podeEditar = isAdmin || temTagOuvidoria;

  return {
    podeEditar,
    apenasVisualizacao: !podeEditar,
    temTagOuvidoria,
    isAdmin,
  };
}
