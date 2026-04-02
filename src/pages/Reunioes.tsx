import { Plus, HandshakeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      <div className="flex flex-col items-center justify-center rounded-xl bg-card p-16 card-shadow">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <HandshakeIcon className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Nenhuma reunião agendada</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          As reuniões 1:1 agendadas aparecerão aqui.
        </p>
      </div>
    </div>
  );
}
