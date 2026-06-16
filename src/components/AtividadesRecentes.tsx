import { useState } from "react";
import {
  UserPlus,
  Target,
  MessageSquare,
  BarChart3,
  Megaphone,
  Calendar,
  TrendingUp,
  PartyPopper,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AtividadeItem } from "@/hooks/useAtividadeFeed";

const TIPO_META: Record<AtividadeItem["tipo"], { icon: any; bg: string; rotulo: string }> = {
  colaborador: { icon: UserPlus, bg: "bg-info/10 text-info", rotulo: "Colaborador" },
  meta: { icon: Target, bg: "bg-success/10 text-success", rotulo: "Meta" },
  feedback: { icon: MessageSquare, bg: "bg-primary/10 text-primary", rotulo: "Feedback" },
  pesquisa: { icon: BarChart3, bg: "bg-accent/10 text-accent", rotulo: "Pesquisa" },
  comunicado: { icon: Megaphone, bg: "bg-warning/10 text-warning", rotulo: "Comunicado" },
  reuniao: { icon: Calendar, bg: "bg-primary/10 text-primary", rotulo: "Reunião 1:1" },
  celebracao: { icon: PartyPopper, bg: "bg-primary/10 text-primary", rotulo: "Celebração" },
};

const LIMITE = 5;

function tempoRelativo(d: Date): string {
  const ms = Date.now() - d.getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.round(h / 24);
  if (dias < 30) return `há ${dias} d`;
  return d.toLocaleDateString("pt-BR");
}

function dataLonga(d: Date): string {
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AtividadeRow({ item }: { item: AtividadeItem }) {
  const meta = TIPO_META[item.tipo];
  const Icon = meta.icon;
  return (
    <li className="flex items-center gap-3 py-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.bg} shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{item.titulo}</p>
          {item.pessoal && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">Pessoal</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{item.descricao}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{tempoRelativo(item.criadoEm)}</span>
    </li>
  );
}

function AtividadeCardDetalhado({ item }: { item: AtividadeItem }) {
  const meta = TIPO_META[item.tipo];
  const Icon = meta.icon;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.bg} shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">{item.titulo}</p>
          <Badge variant="outline" className="text-[10px] h-5 px-1.5">{meta.rotulo}</Badge>
          {item.pessoal && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">Pessoal</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{item.descricao}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{dataLonga(item.criadoEm)}</p>
      </div>
    </div>
  );
}

export function AtividadesRecentes({ atividades }: { atividades: AtividadeItem[] }) {
  const [aberto, setAberto] = useState(false);
  const visiveis = atividades.slice(0, LIMITE);

  return (
    <div className="rounded-xl bg-card p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Atividades recentes</h2>
          <p className="text-xs text-muted-foreground">Tudo que está acontecendo no sistema</p>
        </div>
        <Badge variant="secondary">{atividades.length}</Badge>
      </div>

      {atividades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-3">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Sem atividades ainda</h3>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Conforme novos cadastros, metas, feedbacks e pesquisas forem criados, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-border">
            {visiveis.map((a) => (
              <AtividadeRow key={a.id} item={a} />
            ))}
          </ul>
          {atividades.length > LIMITE && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" size="sm" onClick={() => setAberto(true)}>
                Ver Mais ({atividades.length})
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Todas as atividades recentes</DialogTitle>
            <DialogDescription>
              {atividades.length} {atividades.length === 1 ? "registro" : "registros"} no histórico
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-3">
            <div className="space-y-2">
              {atividades.map((a) => (
                <AtividadeCardDetalhado key={a.id} item={a} />
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
