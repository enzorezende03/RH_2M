import { Link } from "react-router-dom";
import {
  Smile,
  Zap,
  Sparkles,
  Heart,
  LogOut,
  ListChecks,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

const cards = [
  {
    title: "Pesquisa de Satisfação",
    description: "eNPS e satisfação geral dos colaboradores.",
    url: "/pesquisas/satisfacao",
    icon: Smile,
  },
  {
    title: "Pesquisa Rápida",
    description: "Pulse surveys curtas para feedback ágil.",
    url: "/pesquisas/rapida",
    icon: Zap,
  },
  {
    title: "Super Pesquisa",
    description: "Pesquisas customizadas com múltiplas perguntas.",
    url: "/pesquisas/super",
    icon: Sparkles,
  },
  {
    title: "Pesquisa de Engajamento",
    description: "Medição completa de engajamento e clima.",
    url: "/pesquisas/engajamento",
    icon: Heart,
  },
  {
    title: "Pesquisa de Desligamento",
    description: "Entenda os motivos de saída dos colaboradores.",
    url: "/pesquisas/desligamento",
    icon: LogOut,
  },
  {
    title: "Planos de Ação",
    description: "Acompanhe ações geradas a partir das pesquisas.",
    url: "/pesquisas/planos-acao",
    icon: ListChecks,
  },
];

export default function Pesquisas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pesquisas</h1>
          <p className="text-sm text-muted-foreground">
            Pesquisas internas, pulse surveys e planos de ação
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.url}
            to={card.url}
            className="group rounded-xl bg-card p-5 card-shadow transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-card-foreground">
              {card.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
