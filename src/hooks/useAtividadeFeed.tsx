import { useEffect, useMemo } from "react";
import { useEntityList } from "@/hooks/useEntity";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";
import { useNotificacoes } from "@/stores/notificacoesStore";

export interface AtividadeItem {
  id: string;
  tipo: "colaborador" | "meta" | "feedback" | "pesquisa" | "comunicado" | "reuniao";
  titulo: string;
  descricao: string;
  pessoal: boolean;
  criadoEm: Date;
}

const seenIds = new Set<string>();

export function useAtividadeFeed() {
  const { colaboradores } = useColaboradores();
  const { colaborador: meu } = useCurrentColaborador();
  const { adicionarNotificacao } = useNotificacoes();

  const { data: metas = [] } = useEntityList<any>("metas");
  const { data: feedbacks = [] } = useEntityList<any>("feedbacks");
  const { data: pesquisas = [] } = useEntityList<any>("pesquisas");
  const { data: comunicados = [] } = useEntityList<any>("comunicados");
  const { data: reunioes = [] } = useEntityList<any>("reunioes_1a1");

  const nomePorId = useMemo(() => {
    const m = new Map<string, string>();
    colaboradores.forEach((c) => m.set(c.id, c.nomeVisivel || c.nomeCompleto));
    return m;
  }, [colaboradores]);

  const itens = useMemo<AtividadeItem[]>(() => {
    const meuId = meu?.id ?? null;
    const out: AtividadeItem[] = [];

    colaboradores.slice(0, 20).forEach((c) => {
      const created = (c.dadosCompletos as any)?.created_at;
      out.push({
        id: `colab-${c.id}`,
        tipo: "colaborador",
        titulo: "Novo colaborador cadastrado",
        descricao: c.nomeCompleto ?? "—",
        pessoal: false,
        criadoEm: created ? new Date(created) : new Date(0),
      });
    });

    metas.forEach((m: any) => {
      const pessoal = m.privacidade === "privado" || !!m.responsavel_id;
      const ehMinha = m.responsavel_id === meuId || m.criado_por === meu?.userId;
      if (pessoal && !ehMinha) return;
      out.push({
        id: `meta-${m.id}`,
        tipo: "meta",
        titulo: "Nova meta criada",
        descricao: m.titulo ?? "Meta",
        pessoal,
        criadoEm: new Date(m.created_at),
      });
    });

    feedbacks.forEach((f: any) => {
      const pessoal = f.visibilidade !== "publico";
      const ehMeu = f.destinatario_id === meuId || f.autor_id === meu?.userId;
      if (pessoal && !ehMeu) return;
      const para = nomePorId.get(f.destinatario_id) ?? "colaborador";
      out.push({
        id: `fb-${f.id}`,
        tipo: "feedback",
        titulo: "Novo feedback",
        descricao: `Para ${para}`,
        pessoal,
        criadoEm: new Date(f.created_at),
      });
    });

    pesquisas.forEach((p: any) => {
      out.push({
        id: `pesq-${p.id}`,
        tipo: "pesquisa",
        titulo: "Nova pesquisa publicada",
        descricao: p.titulo ?? "Pesquisa",
        pessoal: false,
        criadoEm: new Date(p.created_at),
      });
    });

    comunicados.forEach((c: any) => {
      out.push({
        id: `com-${c.id}`,
        tipo: "comunicado",
        titulo: "Novo comunicado",
        descricao: c.titulo ?? "Comunicado",
        pessoal: false,
        criadoEm: new Date(c.created_at),
      });
    });

    reunioes.forEach((r: any) => {
      const ehMinha = r.colaborador_id === meuId || r.lider_id === meuId;
      if (!ehMinha) return;
      out.push({
        id: `reu-${r.id}`,
        tipo: "reuniao",
        titulo: "Nova reunião 1:1",
        descricao: r.titulo ?? "Reunião agendada",
        pessoal: true,
        criadoEm: new Date(r.data ?? r.created_at),
      });
    });

    return out
      .filter((i) => !isNaN(i.criadoEm.getTime()))
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())
      .slice(0, 30);
  }, [colabsRow, metas, feedbacks, pesquisas, comunicados, reunioes, nomePorId, meu]);

  // Push novos para notificações
  useEffect(() => {
    itens.forEach((i) => {
      if (seenIds.has(i.id)) return;
      seenIds.add(i.id);
      // Não notifica histórico antigo na primeira carga: só itens das últimas 24h
      if (Date.now() - i.criadoEm.getTime() > 24 * 60 * 60 * 1000) return;
      adicionarNotificacao({
        titulo: i.titulo,
        descricao: i.descricao,
        tipo: "criacao",
      });
    });
  }, [itens, adicionarNotificacao]);

  return itens;
}
