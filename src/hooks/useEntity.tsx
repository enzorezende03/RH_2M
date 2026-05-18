import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type TableName =
  | "desligamentos"
  | "ferias_solicitacoes"
  | "recrutamento_vagas"
  | "recrutamento_candidatos"
  | "feedbacks"
  | "reunioes_1a1"
  | "metas"
  | "metas_checkins"
  | "avaliacoes"
  | "avaliacoes_respostas"
  | "pdi_objetivos"
  | "pdi_acoes"
  | "treinamentos"
  | "treinamentos_participantes"
  | "pesquisas"
  | "pesquisas_perguntas"
  | "pesquisas_respostas"
  | "planos_acao"
  | "ouvidoria_mensagens"
  | "comunicados"
  | "comunicados_leituras"
  | "holerites"
  | "atualizacoes_cadastro"
  | "recesso_solicitacoes";

interface UseEntityOptions {
  filters?: Record<string, string | number | boolean | null>;
  orderBy?: { column: string; ascending?: boolean };
  enabled?: boolean;
}

export function useEntityList<T = any>(table: TableName, opts: UseEntityOptions = {}) {
  return useQuery({
    queryKey: [table, opts.filters, opts.orderBy],
    enabled: opts.enabled !== false,
    queryFn: async () => {
      let q = (supabase as any).from(table).select("*");
      if (opts.filters) {
        for (const [k, v] of Object.entries(opts.filters)) {
          if (v !== undefined && v !== null) q = q.eq(k, v);
        }
      }
      if (opts.orderBy) {
        q = q.order(opts.orderBy.column, { ascending: opts.orderBy.ascending ?? false });
      } else {
        q = q.order("created_at", { ascending: false });
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useEntityCreate<T = any>(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<T>) => {
      const { data, error } = await (supabase as any).from(table).insert(payload).select().single();
      if (error) throw error;
      return data as T;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast({ title: "Registro criado" });
    },
    onError: (e: any) => toast({ title: "Erro ao criar", description: e.message, variant: "destructive" }),
  });
}

export function useEntityUpdate<T = any>(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<T> }) => {
      const { data, error } = await (supabase as any).from(table).update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data as T;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast({ title: "Registro atualizado" });
    },
    onError: (e: any) => toast({ title: "Erro ao atualizar", description: e.message, variant: "destructive" }),
  });
}

export function useEntityDelete(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast({ title: "Registro removido" });
    },
    onError: (e: any) => toast({ title: "Erro ao remover", description: e.message, variant: "destructive" }),
  });
}

export function useEntity<T = any>(table: TableName, opts: UseEntityOptions = {}) {
  const list = useEntityList<T>(table, opts);
  const create = useEntityCreate<T>(table);
  const update = useEntityUpdate<T>(table);
  const remove = useEntityDelete(table);
  return { ...list, create, update, remove };
}
