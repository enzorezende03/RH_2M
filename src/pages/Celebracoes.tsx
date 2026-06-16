import { useEffect, useMemo, useRef, useState } from "react";
import {
  PartyPopper, Download, Send, Eraser,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Image as ImageIcon, Video, Smile, Link as LinkIcon, ChevronDown,
  ArrowRight, Github, Linkedin, Globe, Heart, MessageCircle, MoreVertical, Pencil, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";
import { useCelebracoes, type Celebracao } from "@/stores/celebracoesStore";
import { toast } from "@/hooks/use-toast";

type BlockTag = "p" | "h1";
type VisualizarFiltro = "todos" | "recebidas" | "enviadas";

function execCmd(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

function iniciaisDe(nome: string) {
  return nome.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function Celebracoes() {
  const { colaboradores } = useColaboradores();
  const { colaborador: meuColab, nome: meuNome, iniciais: minhasIniciais } = useCurrentColaborador();
  const {
    celebracoes, add, remove, update, toggleLike,
    addComentario, removeComentario, toggleComentarioLike,
  } = useCelebracoes();

  const dadosPerfil: any = meuColab?.dadosCompletos ?? {};
  const fotoPerfil: string | null = dadosPerfil.avatarUrl ?? null;
  const linksPerfil: { titulo: string; url: string }[] = Array.isArray(dadosPerfil.links)
    ? dadosPerfil.links.filter((l: any) => l?.url)
    : [];
  const cargoPerfil = meuColab?.cargoVisivel || meuColab?.cargo || "";
  const placeholderMsg =
    "Você deve celebrar com um colega usando @NomeDoColega, com uma equipe usando @NomeDoDepartamento ou com todo mundo usando @todos";

  const [textoPlano, setTextoPlano] = useState("");
  const [suggestion, setSuggestion] = useState<{ kind: "colega" | "todos"; query: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [dicasOpen, setDicasOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // filtros
  const [visualizar, setVisualizar] = useState<VisualizarFiltro>("todos");
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");

  // dialogs
  const [curtidasDe, setCurtidasDe] = useState<{ titulo: string; nomes: string[] } | null>(null);
  const [comentariosAbertos, setComentariosAbertos] = useState<Set<string>>(new Set());

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
    execCmd(cmd, value);
    editorRef.current?.focus();
    handleInput();
  };

  const setBlock = (tag: BlockTag) => runCmd("formatBlock", tag);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    setTextoPlano(el.innerText);
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
    execCmd("insertHTML", `<span class="text-primary font-semibold" data-mention="${tag}">@${tag}</span>&nbsp;`);
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
    setEditandoId(null);
  };

  const calcularDestinatarios = (texto: string) => {
    const mentions = Array.from(texto.matchAll(/@(\S+)/g)).map((m) => m[1]);
    let tipo: Celebracao["tipo"] = "colega";
    let destinatarios: string[] = [];
    let destinatarioLabel = "";

    if (mentions.some((m) => m.toLowerCase() === "todos")) {
      tipo = "todos";
      destinatarios = colaboradores.map((c) => c.nomeVisivel);
      destinatarioLabel = "Todos";
    } else {
      const deps = mentions.filter((m) => departamentos.some((d) => d.toLowerCase() === m.toLowerCase()));
      if (deps.length) {
        tipo = "departamento";
        destinatarios = colaboradores
          .filter((c) => deps.some((d) => d.toLowerCase() === c.departamento.toLowerCase()))
          .map((c) => c.nomeVisivel);
        destinatarioLabel = deps.map((d) => `@${d}`).join(", ");
      } else {
        const nomes = mentions.filter((m) =>
          colaboradores.some((c) => c.nomeVisivel.replace(/\s+/g, "").toLowerCase() === m.toLowerCase())
        );
        destinatarios = nomes
          .map((m) => colaboradores.find((c) => c.nomeVisivel.replace(/\s+/g, "").toLowerCase() === m.toLowerCase())?.nomeVisivel)
          .filter(Boolean) as string[];
        destinatarioLabel = nomes.map((n) => `@${n}`).join(", ");
      }
    }
    return { tipo, destinatarios, destinatarioLabel };
  };

  const enviar = () => {
    const texto = textoPlano.trim();
    const html = editorRef.current?.innerHTML ?? "";
    if (!texto) {
      toast({ title: "Mensagem vazia", description: "Escreva uma celebração antes de enviar.", variant: "destructive" });
      return;
    }
    const { tipo, destinatarios, destinatarioLabel } = calcularDestinatarios(texto);
    if (!destinatarios.length) {
      toast({
        title: "Nenhum destinatário identificado",
        description: "Use @NomeDoColega, @NomeDoDepartamento ou @todos.",
        variant: "destructive",
      });
      return;
    }

    if (editandoId) {
      update(editandoId, { mensagemHtml: html, mensagemTexto: texto, tipo, destinatarios, destinatarioLabel });
      toast({ title: "Celebração atualizada!" });
    } else {
      add({
        autor: meuNome,
        autorIniciais: minhasIniciais,
        mensagemHtml: html,
        mensagemTexto: texto,
        destinatarios,
        destinatarioLabel,
        tipo,
      });
      toast({ title: "Celebração enviada!", description: `Enviada para ${destinatarios.length} pessoa(s).` });
    }
    limpar();
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

  // filtrar feed
  const feed = useMemo(() => {
    let list = [...celebracoes];
    if (visualizar === "recebidas") list = list.filter((c) => c.destinatarios.includes(meuNome));
    if (visualizar === "enviadas") list = list.filter((c) => c.autor === meuNome);
    if (dataIni) {
      const ini = new Date(dataIni + "T00:00:00").getTime();
      list = list.filter((c) => new Date(c.criadoEm).getTime() >= ini);
    }
    if (dataFim) {
      const fim = new Date(dataFim + "T23:59:59").getTime();
      list = list.filter((c) => new Date(c.criadoEm).getTime() <= fim);
    }
    return list;
  }, [celebracoes, visualizar, dataIni, dataFim, meuNome]);

  const limparFiltros = () => { setVisualizar("todos"); setDataIni(""); setDataFim(""); };

  const editarCelebracao = (c: Celebracao) => {
    setEditandoId(c.id);
    if (editorRef.current) {
      editorRef.current.innerHTML = c.mensagemHtml;
      setTextoPlano(editorRef.current.innerText);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleComentariosCelebracao = (id: string) => {
    setComentariosAbertos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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
            <Eraser className="h-4 w-4" /> {editandoId ? "Cancelar" : "Limpar"}
          </Button>
          <Button onClick={enviar} className="gap-2">
            <Send className="h-4 w-4" /> {editandoId ? "Salvar" : "Enviar"}
          </Button>
        </div>
      </Card>

      {/* Feed */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-3 items-end mb-4">
          <div>
            <label className="text-xs text-muted-foreground">Visualizar</label>
            <Select value={visualizar} onValueChange={(v) => setVisualizar(v as VisualizarFiltro)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="recebidas">Recebidos</SelectItem>
                <SelectItem value="enviadas">Enviados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Data de início e fim</label>
            <div className="flex gap-2">
              <Input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} placeholder="Início" />
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} placeholder="Fim" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={limparFiltros}>Limpar</Button>
          </div>
        </div>

        {feed.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma celebração para mostrar.</p>
        ) : (
          <div className="space-y-4">
            {feed.map((c) => {
              const liked = c.curtidas.includes(meuNome);
              const aberto = comentariosAbertos.has(c.id);
              return (
                <div key={c.id} className="border rounded-md p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                        {c.autorIniciais || iniciaisDe(c.autor)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold uppercase">{c.autor}</span>{" "}
                          <span className="text-muted-foreground">celebrou com</span>{" "}
                          <span className="text-primary font-medium">{c.destinatarioLabel || c.tipo}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(c.criadoEm).toLocaleDateString("pt-BR")}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 hover:bg-muted rounded">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {c.autor === meuNome && (
                            <DropdownMenuItem onClick={() => editarCelebracao(c)}>
                              <Pencil className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => { remove(c.id); toast({ title: "Celebração excluída" }); }}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div
                    className="text-sm prose-sm max-w-none [&_img]:max-w-full [&_img]:rounded [&_video]:max-w-full [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h1]:text-xl [&_h1]:font-bold"
                    dangerouslySetInnerHTML={{ __html: c.mensagemHtml }}
                  />

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t text-sm">
                    <button
                      onClick={() => toggleLike(c.id, meuNome)}
                      className={`flex items-center gap-1.5 hover:text-primary transition-colors ${liked ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                      {c.curtidas.length > 0 ? (
                        <button
                          type="button"
                          className="underline"
                          onClick={(e) => { e.stopPropagation(); setCurtidasDe({ titulo: "Curtidas", nomes: c.curtidas }); }}
                        >
                          {c.curtidas.length} {c.curtidas.length === 1 ? "Curtida" : "Curtidas"}
                        </button>
                      ) : (
                        <span>Curtir</span>
                      )}
                    </button>
                    <button
                      onClick={() => toggleComentariosCelebracao(c.id)}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="underline">
                        {c.comentarios.length} {c.comentarios.length === 1 ? "Comentário" : "Comentários"}
                      </span>
                    </button>
                  </div>

                  {aberto && (
                    <ComentariosBloco
                      celebracao={c}
                      meuNome={meuNome}
                      minhasIniciais={minhasIniciais}
                      onAdd={(texto) => addComentario(c.id, { autor: meuNome, autorIniciais: minhasIniciais, texto })}
                      onRemove={(coId) => removeComentario(c.id, coId)}
                      onToggleLike={(coId) => toggleComentarioLike(c.id, coId, meuNome)}
                      onShowLikes={(co) => setCurtidasDe({ titulo: "Curtidas", nomes: co.curtidas })}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
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
                onClick={() => setVisualizar("recebidas")}
                className="w-full flex items-center justify-between px-3 py-2 border rounded-md text-xs hover:bg-muted transition-colors"
              >
                <span>{recebidasCount} Recebidas</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={() => setVisualizar("enviadas")}
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

      <Dialog open={curtidasDe !== null} onOpenChange={(o) => !o && setCurtidasDe(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{curtidasDe?.titulo ?? "Curtidas"}</DialogTitle>
          </DialogHeader>
          {curtidasDe && curtidasDe.nomes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ninguém curtiu ainda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {curtidasDe?.nomes.map((nome, i) => (
                <div key={`${nome}-${i}`} className="flex items-center gap-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground flex-shrink-0">
                    {iniciaisDe(nome)}
                  </div>
                  <span className="font-medium uppercase truncate">{nome}</span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ComentariosBloco({
  celebracao, meuNome, minhasIniciais, onAdd, onRemove, onToggleLike, onShowLikes,
}: {
  celebracao: Celebracao;
  meuNome: string;
  minhasIniciais: string;
  onAdd: (texto: string) => void;
  onRemove: (id: string) => void;
  onToggleLike: (id: string) => void;
  onShowLikes: (co: Celebracao["comentarios"][number]) => void;
}) {
  const [texto, setTexto] = useState("");

  const enviar = () => {
    const t = texto.trim();
    if (!t) return;
    onAdd(t);
    setTexto("");
  };

  const responder = (nome: string) => {
    const tag = `@${nome.replace(/\s+/g, "").toUpperCase()} `;
    setTexto((prev) => (prev.startsWith(tag) ? prev : tag + prev.replace(/^@\S+\s*/, "")));
  };

  return (
    <div className="mt-3 border-t pt-3 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground flex-shrink-0">
          {minhasIniciais}
        </div>
        <Input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); enviar(); } }}
          placeholder="Escreva um comentário..."
          className="h-8 text-xs"
        />
        <Button size="sm" onClick={enviar} disabled={!texto.trim()}>Enviar</Button>
      </div>

      <div className="space-y-2">
        {celebracao.comentarios.map((co) => {
          const liked = co.curtidas.includes(meuNome);
          return (
            <div key={co.id} className="bg-muted/40 rounded-md p-2 text-xs">
              <div className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-full bg-background flex items-center justify-center text-[10px] font-semibold text-muted-foreground flex-shrink-0">
                  {co.autorIniciais || iniciaisDe(co.autor)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold uppercase">{co.autor}</span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{new Date(co.criadoEm).toLocaleDateString("pt-BR")}</span>
                      {co.autor === meuNome && (
                        <button onClick={() => onRemove(co.id)} className="hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap break-words mt-0.5">{co.texto}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => onToggleLike(co.id)}
                      className={`flex items-center gap-1 hover:text-primary transition-colors ${liked ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <Heart className={`h-3 w-3 ${liked ? "fill-current" : ""}`} />
                      {co.curtidas.length > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onShowLikes(co); }}
                          className="underline"
                        >
                          {co.curtidas.length} {co.curtidas.length === 1 ? "Curtida" : "Curtidas"}
                        </button>
                      ) : (
                        <span>Curtir</span>
                      )}
                    </button>
                    <button
                      onClick={() => responder(co.autor)}
                      className="text-muted-foreground hover:text-primary underline"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
