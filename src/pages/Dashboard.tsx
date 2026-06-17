import { Users, Target, MessageSquare, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { useEntityList } from "@/hooks/useEntity";
import { useAtividadeFeed } from "@/hooks/useAtividadeFeed";
import { AtividadesRecentes } from "@/components/AtividadesRecentes";
import { TermometroHumor } from "@/components/TermometroHumor";
import bannerEquipe from "@/assets/banner-equipe.png.asset.json";

export default function Dashboard() {
  const navigate = useNavigate();
  const { colaboradores, loading: loadingColab } = useColaboradores();
  const { data: metas = [], isLoading: loadingMetas } = useEntityList<any>("metas");
  const { data: feedbacks = [], isLoading: loadingFb } = useEntityList<any>("feedbacks");
  const { data: pesquisasResp = [] } = useEntityList<any>("pesquisas_respostas");
  const atividades = useAtividadeFeed();

  const totalColab = colaboradores.length;
  const ativos = colaboradores.filter((c) => (c.status ?? "Ativo") === "Ativo").length;
  const metasAtivas = metas.filter((m: any) => m.status === "em_andamento").length;

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const fbMes = feedbacks.filter((f: any) => new Date(f.created_at) >= inicioMes).length;

  const engajamento =
    pesquisasResp.length > 0 && totalColab > 0
      ? `${Math.min(100, Math.round((pesquisasResp.length / totalColab) * 100))}%`
      : "--";

  const semDados = totalColab === 0 && metas.length === 0 && feedbacks.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral</p>
      </div>

      <div className="rounded-2xl border-2 border-primary/40 bg-card px-6 py-6 text-center">
        <p className="text-lg font-bold text-foreground">Propósito 2M GRUPO</p>
        <p className="text-base text-foreground/80 mt-2">
          Nosso PROPÓSITO é apoiar os gestores em suas jornadas, para que desenvolvam suas empresas e ocupem posição de liderança em seus segmentos.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-primary/40 bg-card">
        <img
          src={bannerEquipe.url}
          alt="Trabalhar em equipe é a chave para o sucesso - 2M Grupo"
          className="w-full block"
          loading="lazy"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Colaboradores"
          value={loadingColab ? "..." : totalColab}
          change={totalColab === 0 ? "Nenhum cadastrado" : `${ativos} ativos`}
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="Metas ativas"
          value={loadingMetas ? "..." : metasAtivas}
          change={metas.length === 0 ? "Nenhuma meta" : `${metas.length} no total`}
          changeType="neutral"
          icon={Target}
        />
        <StatCard
          title="Feedbacks (mês)"
          value={loadingFb ? "..." : fbMes}
          change={feedbacks.length === 0 ? "Nenhum feedback" : `${feedbacks.length} no total`}
          changeType="neutral"
          icon={MessageSquare}
        />
        <StatCard
          title="Engajamento"
          value={engajamento}
          change={pesquisasResp.length === 0 ? "Sem dados" : `${pesquisasResp.length} respostas`}
          changeType="neutral"
          icon={TrendingUp}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Novo feedback", icon: MessageSquare, color: "bg-primary/10 text-primary", to: "/feedbacks" },
          { label: "Agendar 1:1", icon: Clock, color: "bg-accent/10 text-accent", to: "/reunioes" },
          { label: "Criar meta", icon: Target, color: "bg-success/10 text-success", to: "/metas" },
          { label: "Nova admissão", icon: CheckCircle2, color: "bg-info/10 text-info", to: "/recrutamento-selecao" },
        ].map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.to)}
            className="flex items-center gap-3 rounded-xl bg-card p-4 card-shadow transition-all hover:card-shadow-lg hover:-translate-y-0.5"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color}`}>
              <action.icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-card-foreground">{action.label}</span>
          </button>
        ))}
      </div>

      <AtividadesRecentes atividades={atividades} />
    </div>
  );
}
