import { Users, Target, MessageSquare, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const alerts = [
  { text: "5 feedbacks pendentes de envio", type: "warning" as const },
  { text: "3 reuniões 1:1 atrasadas", type: "destructive" as const },
  { text: "Meta Q1 — prazo em 5 dias", type: "warning" as const },
  { text: "Pesquisa de clima finalizada", type: "default" as const },
];

const recentFeedbacks = [
  { from: "Ana Costa", to: "Carlos Silva", type: "Reconhecimento", date: "Hoje" },
  { from: "Pedro Lima", to: "Maria Souza", type: "Desenvolvimento", date: "Ontem" },
  { from: "Julia Santos", to: "Ana Costa", type: "Melhoria", date: "28/03" },
];

const teamGoals = [
  { name: "Reduzir turnover em 15%", progress: 72, status: "Em andamento" },
  { name: "100% dos PDIs atualizados", progress: 88, status: "Em andamento" },
  { name: "NPS interno > 8.0", progress: 95, status: "Quase lá" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral do Grupo 2M</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Colaboradores" value={247} change="+12 este mês" changeType="positive" icon={Users} />
        <StatCard title="Metas ativas" value={34} change="85% no prazo" changeType="positive" icon={Target} />
        <StatCard title="Feedbacks (mês)" value={89} change="+23% vs. anterior" changeType="positive" icon={MessageSquare} />
        <StatCard title="Engajamento" value="8.2" change="Score médio" changeType="neutral" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Alertas */}
        <div className="rounded-xl bg-card p-5 card-shadow">
          <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Alertas
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  alert.type === "warning" ? "bg-warning" : alert.type === "destructive" ? "bg-destructive" : "bg-success"
                }`} />
                <p className="text-sm text-foreground">{alert.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feedbacks recentes */}
        <div className="rounded-xl bg-card p-5 card-shadow">
          <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Feedbacks recentes
          </h2>
          <div className="space-y-3">
            {recentFeedbacks.map((fb, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{fb.from} → {fb.to}</p>
                  <p className="text-xs text-muted-foreground">{fb.type}</p>
                </div>
                <span className="text-xs text-muted-foreground">{fb.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metas da equipe */}
        <div className="rounded-xl bg-card p-5 card-shadow">
          <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-accent" />
            Metas em destaque
          </h2>
          <div className="space-y-4">
            {teamGoals.map((goal, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{goal.name}</p>
                  <span className="text-xs font-semibold text-primary">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Novo feedback", icon: MessageSquare, color: "bg-primary/10 text-primary" },
          { label: "Agendar 1:1", icon: Clock, color: "bg-accent/10 text-accent" },
          { label: "Criar meta", icon: Target, color: "bg-success/10 text-success" },
          { label: "Nova admissão", icon: CheckCircle2, color: "bg-info/10 text-info" },
        ].map((action, i) => (
          <button
            key={i}
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
