import { useEffect, useMemo, useRef, useState } from "react";
import {
  PartyPopper, Download, Send, Eraser,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Image as ImageIcon, Video, Smile, Link as LinkIcon, ChevronDown,
  ArrowRight, Github, Linkedin, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Info } from "lucide-react";
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

type BlockTag = "p" | "h1";

function exec(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

export default function Celebracoes() {
  const { colaboradores } = useColaboradores();
  const { colaborador: meuColab, nome: meuNome, iniciais: minhasIniciais } = useCurrentColaborador();
  const dadosPerfil: any = meuColab?.dadosCompletos ?? {};
  const fotoPerfil: string | null = dadosPerfil.avatarUrl ?? null;
  const linksPerfil: { titulo: string; url: string }[] = Array.isArray(dadosPerfil.links)
    ? dadosPerfil.links.filter((l: any) => l?.url)
    : [];
  const cargoPerfil = meuColab?.cargoVisivel || meuColab?.cargo || "";
  const placeholderMsg =
    "Você deve celebrar com um colega usando @NomeDoColega, com uma equipe usando @NomeDoDepartamento ou com todo mundo usando @todos";
  const [textoPlano, setTextoPlano] = useState("");
  const [celebracoes, setCelebracoes] = useState<Celebracao[]>([]);
  const [suggestion, setSuggestion] = useState<{ kind: "colega" | "todos"; query: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [dicasOpen, setDicasOpen] = useState(false);
  const [listaAberta, setListaAberta] = useState<null | "recebidas" | "enviadas">(null);

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

  const readFileAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Máximo 10MB.", variant: "destructive" });
      return;
    }
    const data = await readFileAsDataURL(file);
    runCmd("insertHTML", `<img src="${data}" alt="" style="max-width:100%;border-radius:8px;margin:8px 0;" />`);
  };

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast({ title: "Vídeo muito grande", description: "Máximo 25MB.", variant: "destructive" });
      return;
    }
    const data = await readFileAsDataURL(file);
    runCmd(
      "insertHTML",
      `<video src="${data}" controls style="max-width:100%;border-radius:8px;margin:8px 0;"></video>`
    );
  };

  const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
    { label: "Smileys", emojis: "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😙 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🥵 🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐".split(" ") },
    { label: "Pessoas", emojis: "👍 👎 👌 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤝 🙏 👏 🙌 👐 🤲 🤜 🤛 ✊ 👊 💪 🫶 🫰 🫵".split(" ") },
    { label: "Coração", emojis: "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟".split(" ") },
    { label: "Festa", emojis: "🎉 🎊 🎈 🎂 🎁 🎀 🪅 🎆 🎇 ✨ 🌟 ⭐ 💫 🔥 💯 🏆 🥇 🥈 🥉 🏅 🎖️ 🚀".split(" ") },
    { label: "Objetos", emojis: "💼 📌 📍 📎 🖇️ 📏 📐 ✂️ 🖊️ 🖋️ ✒️ 📝 📄 📃 📑 📊 📈 📉 🗂️ 📅 📆 📇 🗒️ 🗓️ 📋 📁 📂 💡 🔔 🔒 🔑".split(" ") },
  ];

  const insertEmoji = (e: string) => {
    runCmd("insertText", e);
    setEmojiOpen(false);
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

  const recebidasCount = celebracoes.filter((c) => c.destinatarios.includes(meuNome)).length;
  const enviadasCount = celebracoes.filter((c) => c.autor === meuNome).length;

  const iconForLink = (titulo: string) => {
    const t = (titulo || "").toLowerCase();
    if (t.includes("github")) return Github;
    if (t.includes("linkedin")) return Linkedin;
    return Globe;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-7xl">
      <div className="space-y-6 min-w-0">
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
              <button
                className="text-primary font-semibold underline"
                type="button"
                onClick={() => setDicasOpen(true)}
              >
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
                <DropdownMenuItem onClick={() => setBlock("h1")}>Título</DropdownMenuItem>
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
            <ToolbarBtn icon={ImageIcon} title="Imagem" onClick={() => imageInputRef.current?.click()} />
            <ToolbarBtn icon={Video} title="Vídeo" onClick={() => videoInputRef.current?.click()} />
            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title="Emoji"
                  onMouseDown={(e) => e.preventDefault()}
                  className="p-1.5 hover:bg-muted rounded text-foreground/70 hover:text-foreground"
                >
                  <Smile className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="max-h-72 overflow-y-auto p-2">
                  {EMOJI_GROUPS.map((g) => (
                    <div key={g.label} className="mb-2">
                      <div className="text-[10px] uppercase text-muted-foreground px-1 mb-1">{g.label}</div>
                      <div className="grid grid-cols-8 gap-0.5">
                        {g.emojis.map((e, i) => (
                          <button
                            key={`${g.label}-${i}`}
                            type="button"
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => insertEmoji(e)}
                            className="h-8 w-8 flex items-center justify-center text-lg hover:bg-muted rounded"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <ToolbarBtn icon={LinkIcon} title="Link" onClick={promptLink} />
          </div>

          <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageFile} />
          <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={handleVideoFile} />

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyUp={handleInput}
            onBlur={saveSelection}
            data-placeholder={placeholderMsg}
            className="min-h-[260px] px-3 py-2 text-sm focus:outline-none max-w-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-0.5 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_a]:text-primary [&_a]:underline empty:before:content-[attr(data-placeholder)] before:text-muted-foreground [&:empty]:before:content-[attr(data-placeholder)]"
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

      <aside className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-muted overflow-hidden flex items-center justify-center text-sm font-semibold text-muted-foreground flex-shrink-0">
              {fotoPerfil ? (
                <img src={fotoPerfil} alt={meuNome} className="h-full w-full object-cover" />
              ) : (
                <span>{minhasIniciais}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm uppercase truncate">{meuNome}</p>
              {cargoPerfil && (
                <p className="text-xs text-muted-foreground truncate">{cargoPerfil}</p>
              )}
            </div>
          </div>

          {linksPerfil.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold mb-1">Links úteis</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Acesse links importantes rapidamente. O link abrirá em uma nova aba.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {linksPerfil.map((l, i) => {
                  const Icon = iconForLink(l.titulo);
                  return (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 px-3 py-2 border rounded-md text-xs hover:bg-muted transition-colors"
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{l.titulo || l.url}</span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Celebrações</h3>
              <PartyPopper className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-2">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 border rounded-md text-xs hover:bg-muted transition-colors"
              >
                <span>{recebidasCount} Recebidas</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 border rounded-md text-xs hover:bg-muted transition-colors"
              >
                <span>{enviadasCount} Enviadas</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </Card>
      </aside>


      <Dialog open={dicasOpen} onOpenChange={setDicasOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="border-b px-6 py-3">
            <DialogTitle className="text-center text-base font-semibold">
              Como enviar uma boa Celebração!
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-0">
            <div className="px-6 py-5 border-r">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" fill="currentColor" stroke="white" />
              </div>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/80">
                <li>Reconheça pequenas vitórias: uma boa reunião, ações legais do seu time ou de alguém. Descreva o que, quando e o por quê do reconhecimento;</li>
                <li>Comemore com os aniversariantes da sua empresa.</li>
              </ul>
            </div>
            <div className="px-6 py-5">
              <div className="flex justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" fill="currentColor" stroke="white" />
              </div>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/80">
                <li>Não marque várias pessoas sem escrever nada;</li>
                <li>Não envie mensagens de bom dia, boa tarde ou boa noite;</li>
                <li>Não repetir o mesmo reconhecimento para várias pessoas diferentes.</li>
              </ul>
            </div>
          </div>
          <div className="border-t bg-muted/30 px-6 py-4 flex items-start gap-3">
            <Info className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              São aceitos: links de vídeos (YouTube, GoogleDrive, Instagram); links compartilhados (Google Drive, OneDrive, Amazon Cloud Drive, Dropbox, iCloud); imagens com até 10mb e emojis.
            </p>
          </div>
          <DialogFooter className="border-t px-6 py-3">
            <Button onClick={() => setDicasOpen(false)}>OK, Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
