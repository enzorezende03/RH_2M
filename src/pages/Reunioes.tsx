import { Plus, HandshakeIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const reunioes = [
  { id: 1, lider: "Fernanda Rocha", colaborador: "Ana Costa", data: "28/03/2026", status: "Agendada", pontos: "PDI, metas Q2, feedback sobre onboarding" },
  { id: 2, lider: "Carlos Silva", colaborador: "Lucas Mendes", data: "25/03/2026", status: "Realizada", pontos: "Desenvolvimento técnico, próximos projetos" },
  { id: 3, lider: "Maria Souza", colaborador: "Pedro Lima", data: "22/03/2026", status: "Realizada", pontos: "Performance comercial, treinamento vendas" },
  { id: 4, lider: "Fernanda Rocha", colaborador: "Julia Santos", data: "20/03/2026", status: "Atrasada", pontos: "Adaptação, integração com equipe" },
];

const statusCores: Record<string, string> = {
  Agendada: "bg-info/10 text-info border-info/20",
  Realizada: "bg-success/10 text-success border-success/20",
  Atrasada: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Reunioes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reuniões 1:1</h1>
          <p className="text-sm text-muted-foreground">Acompanhamento de reuniões individuais</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Agendar 1:1
        </Button>
      </div>

      <div className="space-y-3">
        {reunioes.map((r) => (
          <div key={r.id} className="rounded-xl bg-card p-5 card-shadow hover:card-shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <HandshakeIcon className="h-5 w-5 text-accent" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{r.lider} ↔ {r.colaborador}</p>
                  <p className="text-sm text-muted-foreground">{r.pontos}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className={statusCores[r.status]}>{r.status}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {r.data}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
