import { useEffect, useMemo } from "react";
import { useEntityList } from "@/hooks/useEntity";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";
import { useNotificacoes } from "@/stores/notificacoesStore";
import { useCelebracoes } from "@/stores/celebracoesStore";
import { useHumor } from "@/stores/humorStore";
import { useLembretes } from "@/stores/lembretesStore";

export interface AtividadeItem {
  id: string;
  tipo: "colaborador" | "meta" | "feedback" | "pesquisa" | "comunicado" | "reuniao" | "celebracao" | "humor" | "holerite" | "ferias" | "recesso" | "treinamento" | "avaliacao" | "lembrete";
  titulo: string;
  descricao: string;
  pessoal: boolean;
  criadoEm: Date;
  humorNivel?: number;
}

const seenIds = new Set<string>();

export function useAtividadeFeed() {
  const { colaboradores } = useColaboradores();
  const { colaborador: meu } = useCurrentColaborador();
  const { adicionarNotificacao } = useNotificacoes();
  const { celebracoes } = useCelebracoes();
  const { respostas: humorRespostas } = useHumor();
  const { lembretes } = useLembretes();

  const { data: metas = [] } = useEntityList<any>("metas");
  const { data: feedbacks = [] } = useEntityList<any>("feedbacks");
  const { data: pesquisas = [] } = useEntityList<any>("pesquisas");
  const { data: comunicados = [] } = useEntityList<any>("comunicados");
  const { data: reunioes = [] } = useEntityList<any>("reunioes_1a1");
  const { data: holerites = [] } = useEntityList<any>("holerites");
  const { data: feriasSol = [] } = useEntityList<any>("ferias_solicitacoes");
  const { data: recessoSol = [] } = useEntityList<any>("recesso_solicitacoes");
  const { data: treinamentos = [] } = useEntityList<any>("treinamentos");
  const { data: avaliacoes = [] } = useEntityList<any>("avaliacoes");

  const nomePorId = useMemo(() => {
    const m = new Map<string, string>();
    colaboradores.forEach((c) => m.set(c.id, c.nomeVisivel || c.nomeCompleto));
    return m;
  }, [colaboradores]);

  const itens = useMemo<AtividadeItem[]>(() => {
    const meuId = meu?.id ?? null;
    const out: AtividadeItem[] = [];

    colaboradores.forEach((c) => {
      if (!c.createdAt) return;
      out.push({
        id: `colab-${c.id}`,
        tipo: "colaborador",
        titulo: "Novo colaborador cadastrado",
        descricao: c.nomeCompleto ?? "—",
        pessoal: false,
        criadoEm: new Date(c.createdAt),
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

    celebracoes.forEach((c) => {
      out.push({
        id: `celeb-${c.id}`,
        tipo: "celebracao",
        titulo: `${c.autor} celebrou com ${c.destinatarioLabel}`,
        descricao: c.mensagemTexto.slice(0, 140) || "Celebração",
        pessoal: false,
        criadoEm: new Date(c.criadoEm),
      });
    });

    humorRespostas.forEach((h) => {
      out.push({
        id: h.id,
        tipo: "humor",
        titulo: `${h.colaboradorNome} respondeu o Termômetro de Humor`,
        descricao: h.comentario ? h.comentario.slice(0, 140) : "Resposta enviada",
        pessoal: false,
        criadoEm: new Date(h.criadoEm),
        humorNivel: h.nivel,
      });
    });

    holerites.forEach((h: any) => {
      const ehMeu = h.colaborador_id === meuId;
      const nome = nomePorId.get(h.colaborador_id) ?? "colaborador";
      out.push({
        id: `hol-${h.id}`,
        tipo: "holerite",
        titulo: ehMeu ? "Novo holerite disponível" : "Holerite disponibilizado",
        descricao: ehMeu ? (h.referencia ?? "Holerite") : `Para ${nome}`,
        pessoal: ehMeu,
        criadoEm: new Date(h.created_at),
      });
    });

    feriasSol.forEach((f: any) => {
      const ehMinha = f.colaborador_id === meuId;
      const nome = nomePorId.get(f.colaborador_id) ?? "colaborador";
      const status = (f.status ?? "").toString();
      const aprovada = ["aprovada", "aprovado", "deferida", "deferido"].includes(status.toLowerCase());
      out.push({
        id: `fer-${f.id}-${status}`,
        tipo: "ferias",
        titulo: aprovada
          ? (ehMinha ? "Suas férias foram aprovadas" : `Férias aprovadas para ${nome}`)
          : (ehMinha ? "Nova solicitação de férias" : `Solicitação de férias de ${nome}`),
        descricao: f.periodo ?? f.data_inicio ?? "Férias",
        pessoal: ehMinha,
        criadoEm: new Date(f.updated_at ?? f.created_at),
      });
    });

    recessoSol.forEach((r: any) => {
      const ehMinha = r.colaborador_id === meuId;
      const nome = nomePorId.get(r.colaborador_id) ?? "colaborador";
      const status = (r.status ?? "").toString();
      const aprovada = ["aprovada", "aprovado", "deferida", "deferido"].includes(status.toLowerCase());
      out.push({
        id: `rec-${r.id}-${status}`,
        tipo: "recesso",
        titulo: aprovada
          ? (ehMinha ? "Seu recesso foi aprovado" : `Recesso aprovado para ${nome}`)
          : (ehMinha ? "Nova solicitação de recesso" : `Solicitação de recesso de ${nome}`),
        descricao: r.periodo ?? r.data_inicio ?? "Recesso",
        pessoal: ehMinha,
        criadoEm: new Date(r.updated_at ?? r.created_at),
      });
    });

    treinamentos.forEach((t: any) => {
      out.push({
        id: `tre-${t.id}`,
        tipo: "treinamento",
        titulo: "Novo treinamento disponível",
        descricao: t.titulo ?? "Treinamento",
        pessoal: false,
        criadoEm: new Date(t.created_at),
      });
    });

    avaliacoes.forEach((a: any) => {
      out.push({
        id: `ava-${a.id}`,
        tipo: "avaliacao",
        titulo: "Nova avaliação",
        descricao: a.titulo ?? a.tipo ?? "Avaliação",
        pessoal: false,
        criadoEm: new Date(a.created_at),
      });
    });

    lembretes.forEach((l) => {
      out.push({
        id: `lemb-${l.id}`,
        tipo: "lembrete",
        titulo: `Lembrete enviado: ${l.pesquisaNome}`,
        descricao: l.mensagem
          ? `${l.destinatarios} participante(s) — "${l.mensagem.slice(0, 100)}"`
          : `${l.destinatarios} participante(s) que ainda não responderam`,
        pessoal: false,
        criadoEm: new Date(l.criadoEm),
      });
    });

    return out
      .filter((i) => !isNaN(i.criadoEm.getTime()))
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())
      .slice(0, 300);
  }, [colaboradores, metas, feedbacks, pesquisas, comunicados, reunioes, celebracoes, humorRespostas, holerites, feriasSol, recessoSol, treinamentos, avaliacoes, lembretes, nomePorId, meu]);

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
