import { Users, Target, MessageSquare, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { useEntityList } from "@/hooks/useEntity";
import { useAtividadeFeed } from "@/hooks/useAtividadeFeed";
import { AtividadesRecentes } from "@/components/AtividadesRecentes";

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

      <div className="rounded-xl bg-card p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Atividades recentes</h2>
            <p className="text-xs text-muted-foreground">Tudo que está acontecendo no sistema</p>
          </div>
          <Badge variant="secondary">{atividades.length}</Badge>
        </div>

        {atividades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Sem atividades ainda</h3>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              Conforme novos cadastros, metas, feedbacks e pesquisas forem criados, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {atividades.map((a) => (
              <AtividadeRow key={a.id} item={a} />
            ))}
          </ul>
        )}
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
    </div>
  );
}

const TIPO_META: Record<AtividadeItem["tipo"], { icon: any; bg: string; rotulo: string }> = {
  colaborador: { icon: UserPlus, bg: "bg-info/10 text-info", rotulo: "Colaborador" },
  meta: { icon: Target, bg: "bg-success/10 text-success", rotulo: "Meta" },
  feedback: { icon: MessageSquare, bg: "bg-primary/10 text-primary", rotulo: "Feedback" },
  pesquisa: { icon: BarChart3, bg: "bg-accent/10 text-accent", rotulo: "Pesquisa" },
  comunicado: { icon: Megaphone, bg: "bg-warning/10 text-warning", rotulo: "Comunicado" },
  reuniao: { icon: Calendar, bg: "bg-primary/10 text-primary", rotulo: "Reunião" },
};

function tempoRelativo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.round(h / 24);
  if (dias < 30) return `há ${dias} d`;
  return d.toLocaleDateString("pt-BR");
}

function AtividadeRow({ item }: { item: AtividadeItem }) {
  const meta = TIPO_META[item.tipo];
  const Icon = meta.icon;
  return (
    <li className="flex items-center gap-3 py-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.bg} shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{item.titulo}</p>
          {item.pessoal && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">Pessoal</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{item.descricao}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{tempoRelativo(item.criadoEm)}</span>
    </li>
  );
}
