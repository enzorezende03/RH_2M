import { useMemo, useRef, useState } from "react";
import {
  PartyPopper, Download, Send, Eraser,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Image as ImageIcon, Video, Smile, Link as LinkIcon, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";
import { toast } from "@/hooks/use-toast";

function ToolbarBtn({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <button type="button" className="p-1.5 hover:bg-muted rounded" tabIndex={-1}>
      <Icon className="h-4 w-4" />
    </button>
  );
}

interface Celebracao {
  id: string;
  autor: string;
  mensagem: string;
  destinatarios: string[];
  tipo: "colega" | "departamento" | "todos";
  criadoEm: Date;
}

export default function Celebracoes() {
  const { colaboradores } = useColaboradores();
  const { nome: meuNome } = useCurrentColaborador();
  const [mensagem, setMensagem] = useState("");
  const placeholderMsg =
    "Você deve celebrar com um colega usando @NomeDoColega, com uma equipe usando @NomeDoDepartamento ou com todo mundo usando @todos";
  const [celebracoes, setCelebracoes] = useState<Celebracao[]>([]);
  const [suggestion, setSuggestion] = useState<{ kind: "colega" | "departamento" | "todos"; query: string; pos: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const departamentos = useMemo(
    () => Array.from(new Set(colaboradores.map((c) => c.departamento).filter(Boolean))),
    [colaboradores]
  );

  const detectMention = (value: string, cursor: number) => {
    const before = value.slice(0, cursor);
    const match = before.match(/@(\S*)$/);
    if (!match) {
      setSuggestion(null);
      return;
    }
    const q = match[1].toLowerCase();
    if ("todos".startsWith(q) && q.length <= 5) {
      setSuggestion({ kind: "todos", query: q, pos: cursor - match[0].length });
    } else {
      setSuggestion({ kind: "colega", query: q, pos: cursor - match[0].length });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMensagem(e.target.value);
    detectMention(e.target.value, e.target.selectionStart ?? e.target.value.length);
  };

  const insertMention = (tag: string) => {
    if (!suggestion) return;
    const before = mensagem.slice(0, suggestion.pos);
    const afterStart = (textareaRef.current?.selectionStart ?? mensagem.length);
    const after = mensagem.slice(afterStart);
    const novo = `${before}@${tag} ${after}`;
    setMensagem(novo);
    setSuggestion(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const filtroColegas = useMemo(() => {
    if (!suggestion || suggestion.kind !== "colega") return [];
    return colaboradores
      .filter((c) => c.nomeVisivel.toLowerCase().includes(suggestion.query))
      .slice(0, 6);
  }, [suggestion, colaboradores]);

  const filtroDepartamentos = useMemo(() => {
    if (!suggestion || suggestion.kind !== "colega") return [];
    return departamentos.filter((d) => d.toLowerCase().includes(suggestion.query)).slice(0, 4);
  }, [suggestion, departamentos]);

  const limpar = () => setMensagem("");

  const enviar = () => {
    const texto = mensagem.trim();
    if (!texto) {
      toast({ title: "Mensagem vazia", description: "Escreva uma celebração antes de enviar.", variant: "destructive" });
      return;
    }
    const mentions = Array.from(texto.matchAll(/@(\S+)/g)).map((m) => m[1]);
    let tipo: Celebracao["tipo"] = "colega";
    let destinatarios: string[] = [];

    if (mentions.some((m) => m.toLowerCase() === "todos")) {
      tipo = "todos";
      destinatarios = colaboradores.map((c) => c.nomeVisivel);
    } else {
      const deps = mentions.filter((m) => departamentos.some((d) => d.toLowerCase() === m.toLowerCase()));
      if (deps.length) {
        tipo = "departamento";
        destinatarios = colaboradores
          .filter((c) => deps.some((d) => d.toLowerCase() === c.departamento.toLowerCase()))
          .map((c) => c.nomeVisivel);
      } else {
        const nomes = mentions.filter((m) =>
          colaboradores.some((c) => c.nomeVisivel.toLowerCase() === m.toLowerCase())
        );
        destinatarios = nomes;
      }
    }

    if (!destinatarios.length) {
      toast({
        title: "Nenhum destinatário identificado",
        description: "Use @NomeDoColega, @NomeDoDepartamento ou @todos.",
        variant: "destructive",
      });
      return;
    }

    setCelebracoes((prev) => [
      { id: crypto.randomUUID(), autor: meuNome, mensagem: texto, destinatarios, tipo, criadoEm: new Date() },
      ...prev,
    ]);
    setMensagem("");
    toast({ title: "Celebração enviada!", description: `Enviada para ${destinatarios.length} pessoa(s).` });
  };

  const exportar = () => {
    const blob = new Blob([JSON.stringify(celebracoes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `celebracoes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <Card className="p-6 relative">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <PartyPopper className="h-6 w-6 text-primary" /> Celebre com alguém!
            </h1>
            <p className="text-sm text-primary/80 mt-1">
              Quem fez algo super legal hoje? Reconheça e compartilhe com todo mundo!
            </p>
            <p className="text-sm mt-1">
              Quer algumas dicas?{" "}
              <button className="text-primary font-semibold underline" type="button">
                Clique aqui
              </button>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportar} className="gap-2">
            <Download className="h-4 w-4" /> Exportar
          </Button>
        </div>

        <div className="relative border rounded-md overflow-hidden">
          <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-2 py-1.5 text-muted-foreground">
            <button type="button" className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-muted rounded">
              Parágrafo <ChevronDown className="h-3 w-3" />
            </button>
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarBtn icon={Bold} />
            <ToolbarBtn icon={Italic} />
            <ToolbarBtn icon={Underline} />
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarBtn icon={AlignLeft} />
            <ToolbarBtn icon={AlignCenter} />
            <ToolbarBtn icon={AlignRight} />
            <ToolbarBtn icon={AlignJustify} />
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarBtn icon={List} />
            <ToolbarBtn icon={ListOrdered} />
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarBtn icon={ImageIcon} />
            <ToolbarBtn icon={Video} />
            <ToolbarBtn icon={Smile} />
            <ToolbarBtn icon={LinkIcon} />
          </div>
          <Textarea
            ref={textareaRef}
            value={mensagem}
            onChange={handleChange}
            onKeyUp={(e) => detectMention(e.currentTarget.value, e.currentTarget.selectionStart ?? 0)}
            className="min-h-[260px] resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder={placeholderMsg}
          />

          {suggestion && (filtroColegas.length > 0 || filtroDepartamentos.length > 0 || "todos".startsWith(suggestion.query)) && (
            <div className="absolute left-3 bottom-3 z-10 w-72 bg-popover border rounded-md shadow-lg max-h-64 overflow-auto">
              {"todos".startsWith(suggestion.query) && (
                <button
                  type="button"
                  onClick={() => insertMention("todos")}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b"
                >
                  <span className="font-semibold">@todos</span>
                  <span className="text-xs text-muted-foreground ml-2">Todos os colaboradores</span>
                </button>
              )}
              {filtroDepartamentos.length > 0 && (
                <div className="px-3 py-1 text-[10px] uppercase text-muted-foreground bg-muted/50">Departamentos</div>
              )}
              {filtroDepartamentos.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => insertMention(d)}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                >
                  @{d}
                </button>
              ))}
              {filtroColegas.length > 0 && (
                <div className="px-3 py-1 text-[10px] uppercase text-muted-foreground bg-muted/50">Colegas</div>
              )}
              {filtroColegas.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => insertMention(c.nomeVisivel.replace(/\s+/g, ""))}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                >
                  <div className="font-medium">@{c.nomeVisivel}</div>
                  <div className="text-xs text-muted-foreground">{c.cargo} · {c.departamento}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={limpar} className="gap-2">
            <Eraser className="h-4 w-4" /> Limpar
          </Button>
          <Button onClick={enviar} className="gap-2">
            <Send className="h-4 w-4" /> Enviar
          </Button>
        </div>
      </Card>

      {celebracoes.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Celebrações enviadas</h2>
          <div className="space-y-3">
            {celebracoes.map((c) => (
              <div key={c.id} className="border rounded-md p-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{c.autor}</span>
                  <span>{c.criadoEm.toLocaleString("pt-BR")}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{c.mensagem}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Para <span className="font-medium">{c.destinatarios.length}</span> destinatário(s) · tipo: {c.tipo}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
