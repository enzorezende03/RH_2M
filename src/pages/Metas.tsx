import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const metas = [
  { id: 1, nome: "Reduzir turnover em 15%", responsavel: "RH", tipo: "Equipe", progresso: 72, prazo: "30/06/2026", status: "Em andamento" },
  { id: 2, nome: "Implementar pesquisa de clima Q2", responsavel: "Ana Costa", tipo: "Individual", progresso: 45, prazo: "15/05/2026", status: "Em andamento" },
  { id: 3, nome: "100% dos PDIs atualizados", responsavel: "Líderes", tipo: "Equipe", progresso: 88, prazo: "30/04/2026", status: "Em andamento" },
  { id: 4, nome: "NPS interno > 8.0", responsavel: "RH", tipo: "Equipe", progresso: 95, prazo: "31/03/2026", status: "Quase lá" },
  { id: 5, nome: "Certificação AWS", responsavel: "Lucas Mendes", tipo: "Individual", progresso: 60, prazo: "30/09/2026", status: "Em andamento" },
  { id: 6, nome: "Treinamento de vendas 100%", responsavel: "Comercial", tipo: "Equipe", progresso: 100, prazo: "28/02/2026", status: "Concluída" },
];

const statusCores: Record<string, string> = {
  "Em andamento": "bg-info/10 text-info border-info/20",
  "Quase lá": "bg-warning/10 text-warning border-warning/20",
  "Concluída": "bg-success/10 text-success border-success/20",
  "Atrasada": "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Metas() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metas</h1>
          <p className="text-sm text-muted-foreground">Metas individuais e de equipe</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nova meta
        </Button>
      </div>

      <div className="space-y-3">
        {metas.map((m) => (
          <div key={m.id} className="rounded-xl bg-card p-5 card-shadow hover:card-shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.nome}</p>
                    <p className="text-xs text-muted-foreground">{m.responsavel} · Prazo: {m.prazo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{m.tipo}</Badge>
                    <Badge variant="outline" className={statusCores[m.status]}>{m.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={m.progresso} className="h-2 flex-1" />
                  <span className="text-sm font-semibold text-primary">{m.progresso}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
