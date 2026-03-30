import { useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const feedbacks = [
  { id: 1, de: "Ana Costa", para: "Carlos Silva", tipo: "Reconhecimento", resumo: "Excelente apresentação no Sprint Review.", data: "25/03/2026", status: "Enviado" },
  { id: 2, de: "Fernanda Rocha", para: "Ana Costa", tipo: "Desenvolvimento", resumo: "Buscar mais autonomia nas decisões de RH.", data: "22/03/2026", status: "Enviado" },
  { id: 3, de: "Carlos Silva", para: "Pedro Lima", tipo: "Melhoria", resumo: "Melhorar a comunicação em reuniões de equipe.", data: "20/03/2026", status: "Pendente" },
  { id: 4, de: "Maria Souza", para: "Julia Santos", tipo: "Reconhecimento", resumo: "Design impecável na nova landing page.", data: "18/03/2026", status: "Enviado" },
  { id: 5, de: "Pedro Lima", para: "Lucas Mendes", tipo: "Desenvolvimento", resumo: "Aprofundar conhecimentos em cloud computing.", data: "15/03/2026", status: "Rascunho" },
];

const tipoCores: Record<string, string> = {
  Reconhecimento: "bg-success/10 text-success border-success/20",
  Melhoria: "bg-warning/10 text-warning border-warning/20",
  Desenvolvimento: "bg-info/10 text-info border-info/20",
};

const statusCores: Record<string, string> = {
  Enviado: "bg-success/10 text-success border-success/20",
  Pendente: "bg-warning/10 text-warning border-warning/20",
  Rascunho: "bg-muted text-muted-foreground",
};

export default function Feedbacks() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedbacks</h1>
          <p className="text-sm text-muted-foreground">Gestão de feedbacks entre colaboradores</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Novo feedback
        </Button>
      </div>

      <div className="space-y-3">
        {feedbacks.map((fb) => (
          <div key={fb.id} className="rounded-xl bg-card p-5 card-shadow hover:card-shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {fb.de} <span className="text-muted-foreground font-normal">→</span> {fb.para}
                  </p>
                  <p className="text-sm text-muted-foreground">{fb.resumo}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline" className={tipoCores[fb.tipo]}>{fb.tipo}</Badge>
                    <Badge variant="outline" className={statusCores[fb.status]}>{fb.status}</Badge>
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{fb.data}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
