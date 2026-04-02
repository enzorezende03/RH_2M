import { Users, Target, MessageSquare, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Colaboradores" value={0} change="Nenhum cadastrado" changeType="neutral" icon={Users} />
        <StatCard title="Metas ativas" value={0} change="Nenhuma meta" changeType="neutral" icon={Target} />
        <StatCard title="Feedbacks (mês)" value={0} change="Nenhum feedback" changeType="neutral" icon={MessageSquare} />
        <StatCard title="Engajamento" value="--" change="Sem dados" changeType="neutral" icon={TrendingUp} />
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl bg-card p-16 card-shadow">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Sem dados ainda</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Cadastre colaboradores e comece a usar os módulos para ver informações aqui.
        </p>
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
