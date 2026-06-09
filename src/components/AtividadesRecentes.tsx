import { useMemo, useState } from "react";
import {
  UserPlus,
  Target,
  MessageSquare,
  BarChart3,
  Megaphone,
  Calendar,
  TrendingUp,
  ChevronRight,
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

const TIPO_META: Record<
  AtividadeItem["tipo"],
  { icon: any; bg: string; rotulo: string; rotuloPlural: string }
> = {
  colaborador: { icon: UserPlus, bg: "bg-info/10 text-info", rotulo: "Colaborador", rotuloPlural: "Colaboradores" },
  meta: { icon: Target, bg: "bg-success/10 text-success", rotulo: "Meta", rotuloPlural: "Metas" },
  feedback: { icon: MessageSquare, bg: "bg-primary/10 text-primary", rotulo: "Feedback", rotuloPlural: "Feedbacks" },
  pesquisa: { icon: BarChart3, bg: "bg-accent/10 text-accent", rotulo: "Pesquisa", rotuloPlural: "Pesquisas" },
  comunicado: { icon: Megaphone, bg: "bg-warning/10 text-warning", rotulo: "Comunicado", rotuloPlural: "Comunicados" },
  reuniao: { icon: Calendar, bg: "bg-primary/10 text-primary", rotulo: "Reunião 1:1", rotuloPlural: "Reuniões 1:1" },
};

const ORDEM: AtividadeItem["tipo"][] = [
  "colaborador",
  "meta",
  "feedback",
  "pesquisa",
  "comunicado",
  "reuniao",
];

const LIMITE_INICIAL = 5;

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

function AtividadeCard({ item, detalhada = false }: { item: AtividadeItem; detalhada?: boolean }) {
  const meta = TIPO_META[item.tipo];
  const Icon = meta.icon;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.bg} shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground truncate">{item.titulo}</p>
          {item.pessoal && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">Pessoal</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{item.descricao}</p>
        {detalhada && (
          <p className="text-[11px] text-muted-foreground mt-1">{dataLonga(item.criadoEm)}</p>
        )}
      </div>
      {!detalhada && (
        <span className="text-xs text-muted-foreground shrink-0">{tempoRelativo(item.criadoEm)}</span>
      )}
    </div>
  );
}

export function AtividadesRecentes({ atividades }: { atividades: AtividadeItem[] }) {
  const [abertoTipo, setAbertoTipo] = useState<AtividadeItem["tipo"] | null>(null);

  const grupos = useMemo(() => {
    const map = new Map<AtividadeItem["tipo"], AtividadeItem[]>();
    atividades.forEach((a) => {
      const arr = map.get(a.tipo) ?? [];
      arr.push(a);
      map.set(a.tipo, arr);
    });
    return map;
  }, [atividades]);

  const tiposComDados = ORDEM.filter((t) => (grupos.get(t)?.length ?? 0) > 0);

  if (tiposComDados.length === 0) {
    return (
      <div className="rounded-xl bg-card p-6 card-shadow">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Atividades recentes</h2>
          <p className="text-xs text-muted-foreground">Tudo que está acontecendo no sistema</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-3">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Sem atividades ainda</h3>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Conforme novos cadastros, metas, feedbacks e pesquisas forem criados, eles aparecerão aqui.
          </p>
        </div>
      </div>
    );
  }

  const tipoAberto = abertoTipo ? TIPO_META[abertoTipo] : null;
  const itensAbertos = abertoTipo ? grupos.get(abertoTipo) ?? [] : [];

  return (
    <div className="rounded-xl bg-card p-6 card-shadow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Atividades recentes</h2>
          <p className="text-xs text-muted-foreground">Agrupado por categoria</p>
        </div>
        <Badge variant="secondary">{atividades.length}</Badge>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {tiposComDados.map((tipo) => {
          const meta = TIPO_META[tipo];
          const Icon = meta.icon;
          const itens = grupos.get(tipo) ?? [];
          const visiveis = itens.slice(0, LIMITE_INICIAL);
          const restante = itens.length - visiveis.length;
          return (
            <div key={tipo} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md ${meta.bg}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{meta.rotuloPlural}</h3>
                  <Badge variant="outline" className="h-5 text-[10px]">{itens.length}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                {visiveis.map((a) => (
                  <AtividadeCard key={a.id} item={a} />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs"
                onClick={() => setAbertoTipo(tipo)}
              >
                <span>
                  {restante > 0
                    ? `Ver todos (${itens.length}) — mais ${restante}`
                    : `Ver detalhes (${itens.length})`}
                </span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={!!abertoTipo} onOpenChange={(v) => !v && setAbertoTipo(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {tipoAberto && (
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${tipoAberto.bg}`}>
                  <tipoAberto.icon className="h-4 w-4" />
                </div>
              )}
              {tipoAberto?.rotuloPlural ?? "Atividades"}
            </DialogTitle>
            <DialogDescription>
              {itensAbertos.length} {itensAbertos.length === 1 ? "registro" : "registros"} no histórico
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="space-y-2">
              {itensAbertos.map((a) => (
                <AtividadeCard key={a.id} item={a} detalhada />
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
