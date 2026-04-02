import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ColaboradorPerfil() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => navigate("/colaboradores")}>
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      <div className="flex flex-col items-center justify-center rounded-xl bg-card p-16 card-shadow">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Colaborador não encontrado</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Este colaborador não existe ou ainda não foi cadastrado.
        </p>
      </div>
    </div>
  );
}
