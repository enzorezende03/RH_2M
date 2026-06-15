import { useEffect, useMemo, useRef, useState } from "react";
import {
  PartyPopper, Download, Send, Eraser,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Image as ImageIcon, Video, Smile, Link as LinkIcon, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";
import { toast } from "@/hooks/use-toast";

interface Celebracao {
  id: string;
  autor: string;
  mensagem: string;
  destinatarios: string[];
  tipo: "colega" | "departamento" | "todos";
  criadoEm: Date;
}

type BlockTag = "p" | "h1" | "h2" | "h3";

function exec(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

export default function Celebracoes() {
  const { colaboradores } = useColaboradores();
  const { nome: meuNome } = useCurrentColaborador();
  const placeholderMsg =
    "Você deve celebrar com um colega usando @NomeDoColega, com uma equipe usando @NomeDoDepartamento ou com todo mundo usando @todos";
  const [textoPlano, setTextoPlano] = useState("");
  const [celebracoes, setCelebracoes] = useState<Celebracao[]>([]);
  const [suggestion, setSuggestion] = useState<{ kind: "colega" | "todos"; query: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);

  const departamentos = useMemo(
    () => Array.from(new Set(colaboradores.map((c) => c.departamento).filter(Boolean))),
    [colaboradores]
  );

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    } else {
      editorRef.current?.focus();
    }
  };

  const runCmd = (cmd: string, value?: string) => {
    restoreSelection();
    exec(cmd, value);
    editorRef.current?.focus();
    handleInput();
  };

  const setBlock = (tag: BlockTag) => runCmd("formatBlock", tag);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    setTextoPlano(el.innerText);
    // detect mention before caret
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const pre = range.cloneRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.endContainer, range.endOffset);
    const before = pre.toString();
    const match = before.match(/@(\S*)$/);
    if (!match) { setSuggestion(null); return; }
    const q = match[1].toLowerCase();
    setSuggestion({ kind: "colega", query: q });
  };

  const insertMention = (tag: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    // remove trailing @query from current position
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const node = range.endContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      const upTo = text.slice(0, range.endOffset);
      const m = upTo.match(/@(\S*)$/);
      if (m) {
        const start = range.endOffset - m[0].length;
        (node as Text).deleteData(start, m[0].length);
        const newRange = document.createRange();
        newRange.setStart(node, start);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      }
    }
    exec("insertHTML", `<span class="text-primary font-semibold" data-mention="${tag}">@${tag}</span>&nbsp;`);
    setSuggestion(null);
    handleInput();
  };

  const filtroColegas = useMemo(() => {
    if (!suggestion) return [];
    return colaboradores
      .filter((c) => c.nomeVisivel.toLowerCase().includes(suggestion.query))
      .slice(0, 6);
  }, [suggestion, colaboradores]);

  const filtroDepartamentos = useMemo(() => {
    if (!suggestion) return [];
    return departamentos.filter((d) => d.toLowerCase().includes(suggestion.query)).slice(0, 4);
  }, [suggestion, departamentos]);

  const limpar = () => {
    if (editorRef.current) editorRef.current.innerHTML = "";
    setTextoPlano("");
  };

  const enviar = () => {
    const texto = textoPlano.trim();
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
        destinatarios = mentions.filter((m) =>
          colaboradores.some((c) => c.nomeVisivel.replace(/\s+/g, "").toLowerCase() === m.toLowerCase())
        );
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
    limpar();
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

  const promptLink = () => {
    const url = window.prompt("Cole o link (URL):", "https://");
    if (url) runCmd("createLink", url);
  };

  const promptImage = () => {
    const url = window.prompt("URL da imagem:");
    if (url) runCmd("insertImage", url);
  };

  const promptVideo = () => {
    const url = window.prompt("URL do vídeo (YouTube/Vimeo):");
    if (!url) return;
    runCmd("insertHTML", `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`);
  };

  const insertEmoji = () => {
    const emojis = ["🎉","🥳","👏","🙌","🚀","🌟","❤️","🔥","💯","👍"];
    const e = emojis[Math.floor(Math.random() * emojis.length)];
    runCmd("insertText", e);
  };

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const handler = () => saveSelection();
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  const ToolbarBtn = ({ icon: Icon, onClick, title }: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; title: string }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="p-1.5 hover:bg-muted rounded text-foreground/70 hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );

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

        <div className="relative border rounded-md overflow-hidden bg-background">
          <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-2 py-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger
                onMouseDown={(e) => e.preventDefault()}
                className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-muted rounded"
              >
                Parágrafo <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setBlock("p")}>Parágrafo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBlock("h1")}>Título 1</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBlock("h2")}>Título 2</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBlock("h3")}>Título 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarBtn icon={Bold} title="Negrito" onClick={() => runCmd("bold")} />
            <ToolbarBtn icon={Italic} title="Itálico" onClick={() => runCmd("italic")} />
            <ToolbarBtn icon={Underline} title="Sublinhado" onClick={() => runCmd("underline")} />
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarBtn icon={AlignLeft} title="Alinhar à esquerda" onClick={() => runCmd("justifyLeft")} />
            <ToolbarBtn icon={AlignCenter} title="Centralizar" onClick={() => runCmd("justifyCenter")} />
            <ToolbarBtn icon={AlignRight} title="Alinhar à direita" onClick={() => runCmd("justifyRight")} />
            <ToolbarBtn icon={AlignJustify} title="Justificar" onClick={() => runCmd("justifyFull")} />
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarBtn icon={List} title="Lista" onClick={() => runCmd("insertUnorderedList")} />
            <ToolbarBtn icon={ListOrdered} title="Lista numerada" onClick={() => runCmd("insertOrderedList")} />
            <span className="mx-1 h-5 w-px bg-border" />
            <ToolbarBtn icon={ImageIcon} title="Imagem" onClick={promptImage} />
            <ToolbarBtn icon={Video} title="Vídeo" onClick={promptVideo} />
            <ToolbarBtn icon={Smile} title="Emoji" onClick={insertEmoji} />
            <ToolbarBtn icon={LinkIcon} title="Link" onClick={promptLink} />
          </div>

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyUp={handleInput}
            onBlur={saveSelection}
            data-placeholder={placeholderMsg}
            className="min-h-[260px] px-3 py-2 text-sm focus:outline-none prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] before:text-muted-foreground [&:empty]:before:content-[attr(data-placeholder)]"
            style={{ whiteSpace: "pre-wrap" }}
          />

          {suggestion && (filtroColegas.length > 0 || filtroDepartamentos.length > 0 || "todos".startsWith(suggestion.query)) && (
            <div className="absolute left-3 bottom-3 z-10 w-72 bg-popover border rounded-md shadow-lg max-h-64 overflow-auto">
              {"todos".startsWith(suggestion.query) && (
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMention("todos")}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b">
                  <span className="font-semibold">@todos</span>
                  <span className="text-xs text-muted-foreground ml-2">Todos os colaboradores</span>
                </button>
              )}
              {filtroDepartamentos.length > 0 && (
                <div className="px-3 py-1 text-[10px] uppercase text-muted-foreground bg-muted/50">Departamentos</div>
              )}
              {filtroDepartamentos.map((d) => (
                <button key={d} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMention(d)}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm">@{d}</button>
              ))}
              {filtroColegas.length > 0 && (
                <div className="px-3 py-1 text-[10px] uppercase text-muted-foreground bg-muted/50">Colegas</div>
              )}
              {filtroColegas.map((c) => (
                <button key={c.id} type="button" onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertMention(c.nomeVisivel.replace(/\s+/g, ""))}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm">
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
