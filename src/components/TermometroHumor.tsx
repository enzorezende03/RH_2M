import { useState } from "react";
import { Smile, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useHumor, NIVEIS_HUMOR } from "@/stores/humorStore";
import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";


const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

function formatarDias(ms: number) {
  const dias = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (dias <= 1) return "amanhã";
  return `em ${dias} dias`;
}

export function TermometroHumor() {
  const { colaborador, nome, email } = useCurrentColaborador();
  const { registrar, podeResponder, ultimaResposta } = useHumor();
  const [nivel, setNivel] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [obrigadoAberto, setObrigadoAberto] = useState(false);

  const colabId = colaborador?.id ?? null;
  const pode = podeResponder(colabId, email);

  if (!pode) {
    const ult = ultimaResposta(colabId, email);
    if (!ult) return null;
    const restante = SETE_DIAS_MS - (Date.now() - new Date(ult.criadoEm).getTime());
    return (
      <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Smile className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">Termômetro de Humor</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Obrigado por compartilhar! Você poderá responder novamente {formatarDias(restante)}.
        </p>
      </div>
    );
  }

  const handleEnviar = () => {
    if (!nivel) {
      toast.error("Selecione como você está se sentindo");
      return;
    }
    registrar({
      colaboradorId: colabId,
      colaboradorNome: nome,
      nivel,
      comentario: comentario.trim(),
    });
    setNivel(null);
    setComentario("");
    setObrigadoAberto(true);
  };

  return (
    <div className="rounded-2xl border-2 border-primary/40 bg-card p-6">
      <h2 className="text-center text-lg font-semibold text-foreground">Como você está se sentindo?</h2>
      <div className="mt-4 flex justify-center gap-6">
        {NIVEIS_HUMOR.map((n) => (
          <button
            key={n.nivel}
            type="button"
            onClick={() => setNivel(n.nivel)}
            title={n.rotulo}
            aria-label={n.rotulo}
            className={`flex h-16 w-16 items-center justify-center rounded-full text-5xl transition-all hover:scale-110 ${
              nivel === n.nivel ? "bg-primary/15 ring-2 ring-primary scale-110" : "bg-muted/40"
            }`}
          >
            <span>{n.emoji}</span>
          </button>
        ))}
      </div>
      <div className="mt-5">
        <Textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Nos conte o que te faz sentir assim"
          rows={2}
          maxLength={500}
        />
        <p className="mt-2 text-center text-xs italic text-muted-foreground">
          Fique à vontade para falar o que sente. Essa informação é privada e será lida somente por alguém que quer te ver feliz!
        </p>
      </div>
      <div className="mt-4 flex justify-center">
        <Button onClick={handleEnviar} disabled={!nivel}>
          Enviar humor
        </Button>
      </div>
    </div>

    <Dialog open={obrigadoAberto} onOpenChange={setObrigadoAberto}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-success/40 bg-success/10">
            <CheckCircle2 className="h-9 w-9 text-success" strokeWidth={2.5} />
          </div>
          <DialogTitle className="text-2xl">Obrigado!</DialogTitle>
          <DialogDescription className="text-base">
            Obrigado por compartilhar como se sente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={() => setObrigadoAberto(false)} className="min-w-[120px]">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
