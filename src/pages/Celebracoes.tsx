import { PartyPopper } from "lucide-react";

export default function Celebracoes() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <PartyPopper className="h-16 w-16 text-primary mb-4" />
      <h1 className="text-2xl font-bold mb-2">Celebrações</h1>
      <p className="text-muted-foreground max-w-md">
        Página em desenvolvimento. Aqui você poderá registrar e acompanhar as celebrações do time.
      </p>
    </div>
  );
}
