import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { Megaphone, PartyPopper } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEntityList } from "@/hooks/useEntity";
import { useCelebracoes } from "@/stores/celebracoesStore";
import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";

type Novidade = {
  id: string;
  tipo: "comunicado" | "celebracao";
  titulo: string;
  conteudoHtml: string;
  criadoEm: number;
  rota: string;
};

const STORAGE_PREFIX = "novidades:vistas:";

export function NovidadesPopup() {
  const navigate = useNavigate();
  const { colaborador } = useCurrentColaborador();
  const { data: comunicados = [] } = useEntityList<any>("comunicados");
  const { celebracoes } = useCelebracoes();

  const storageKey = useMemo(
    () => `${STORAGE_PREFIX}${colaborador?.id ?? "anon"}`,
    [colaborador?.id]
  );

  const [vistas, setVistas] = useState<Set<string>>(new Set());
  const [temStorage, setTemStorage] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [atual, setAtual] = useState<Novidade | null>(null);

  // carrega ids ja vistos
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      setVistas(new Set(arr));
      setTemStorage(raw !== null);
    } catch {
      setVistas(new Set());
      setTemStorage(false);
    }
    setBootstrapped(false);
  }, [storageKey]);

  const novidades = useMemo<Novidade[]>(() => {
    const out: Novidade[] = [];
    comunicados.forEach((c: any) => {
      if (c.publicado === false) return;
      out.push({
        id: `com-${c.id}`,
        tipo: "comunicado",
        titulo: c.titulo ?? "Novo comunicado",
        conteudoHtml: c.conteudo ?? c.descricao ?? "",
        criadoEm: new Date(c.publicado_em ?? c.created_at ?? Date.now()).getTime(),
        rota: "/comunicados",
      });
    });
    celebracoes.forEach((c) => {
      out.push({
        id: `celeb-${c.id}`,
        tipo: "celebracao",
        titulo: `${c.autor} celebrou com ${c.destinatarioLabel}`,
        conteudoHtml: c.mensagemHtml || c.mensagemTexto,
        criadoEm: new Date(c.criadoEm).getTime(),
        rota: "/celebracoes",
      });
    });
    return out.sort((a, b) => a.criadoEm - b.criadoEm);
  }, [comunicados, celebracoes]);

  // primeira carga sem storage: marca tudo o que ja existe como visto sem mostrar
  // (evita popup do historico). Sessoes seguintes mostram apenas os novos.
  useEffect(() => {
    if (bootstrapped) return;
    if (novidades.length === 0) return;
    if (!temStorage) {
      const set = new Set<string>();
      novidades.forEach((n) => set.add(n.id));
      setVistas(set);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...set]));
      } catch {/* ignore */}
    }
    setBootstrapped(true);
  }, [novidades, bootstrapped, temStorage, storageKey]);

  // mostra o proximo nao visto
  useEffect(() => {
    if (atual) return;
    const pendente = novidades.find((n) => !vistas.has(n.id));
    if (pendente) setAtual(pendente);
  }, [novidades, vistas, atual]);

  const marcarVisto = (id: string) => {
    setVistas((prev) => {
      const set = new Set(prev);
      set.add(id);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...set]));
      } catch {/* ignore */}
      return set;
    });
    setAtual(null);
  };

  if (!atual) return null;

  const Icon = atual.tipo === "comunicado" ? Megaphone : PartyPopper;
  const corIcon = atual.tipo === "comunicado" ? "text-warning" : "text-primary";

  return (
    <Dialog open onOpenChange={(open) => { if (!open) marcarVisto(atual.id); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icon className={`h-5 w-5 ${corIcon}`} />
            {atual.titulo}
            <Badge variant="outline" className="ml-2 text-[10px]">
              {atual.tipo === "comunicado" ? "Novo comunicado" : "Nova celebração"}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[55vh] pr-3">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(atual.conteudoHtml || "<p>—</p>") }}
          />
        </ScrollArea>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const id = atual.id;
              const rota = atual.rota;
              marcarVisto(id);
              navigate(rota);
            }}
          >
            Ver detalhes
          </Button>
          <Button onClick={() => marcarVisto(atual.id)}>
            {atual.tipo === "comunicado" ? "Marcar como lido" : "Ok, entendi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
