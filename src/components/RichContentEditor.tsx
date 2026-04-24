import { useRef, useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  Code,
  Type,
  Palette,
  PaintBucket,
  Eraser,
  Table as TableIcon,
  Link2,
  Minus,
  Smile,
  Undo2,
  Redo2,
  Scissors,
  Copy,
  ClipboardPaste,
  MousePointer2,
  FileText,
  Image as ImageIcon,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichContentEditor({ value, onChange, placeholder }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileImgRef = useRef<HTMLInputElement>(null);
  const fileVidRef = useRef<HTMLInputElement>(null);
  const filePdfRef = useRef<HTMLInputElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      setInitialized(true);
    }
  }, [value, initialized]);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertHTML = (html: string) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertTable = (rows = 3, cols = 3) => {
    let html = '<table style="border-collapse:collapse;width:100%;margin:8px 0">';
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html += '<td style="border:1px solid #ccc;padding:6px;min-width:40px">&nbsp;</td>';
      }
      html += "</tr>";
    }
    html += "</table><p><br/></p>";
    insertHTML(html);
  };

  const onPickFile = (kind: "img" | "vid" | "pdf") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      if (kind === "img") insertHTML(`<img src="${url}" style="max-width:100%;margin:8px 0"/>`);
      if (kind === "vid") insertHTML(`<video src="${url}" controls style="max-width:100%;margin:8px 0"></video>`);
      if (kind === "pdf")
        insertHTML(
          `<a href="${url}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #ccc;border-radius:6px;text-decoration:none">📄 ${file.name}</a>`,
        );
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const colors = ["#000000", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280"];

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1 border-b bg-muted/50 text-xs">
        {/* Formato */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-2 py-1 hover:bg-muted rounded inline-flex items-center gap-1">
            Formato <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => exec("bold")}>
              <Bold className="h-4 w-4 mr-2" /> Negrito
              <span className="ml-auto text-muted-foreground">Ctrl+B</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exec("italic")}>
              <Italic className="h-4 w-4 mr-2" /> Itálico
              <span className="ml-auto text-muted-foreground">Ctrl+I</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exec("underline")}>
              <Underline className="h-4 w-4 mr-2" /> Sublinhado
              <span className="ml-auto text-muted-foreground">Ctrl+U</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exec("strikeThrough")}>
              <Strikethrough className="h-4 w-4 mr-2" /> Tachado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exec("superscript")}>
              <Superscript className="h-4 w-4 mr-2" /> Sobrescrito
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exec("subscript")}>
              <Subscript className="h-4 w-4 mr-2" /> Subscrito
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => insertHTML('<code style="background:#f3f4f6;padding:2px 4px;border-radius:3px">código</code>')}
            >
              <Code className="h-4 w-4 mr-2" /> Código
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Type className="h-4 w-4 mr-2" /> Formatos
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => exec("formatBlock", "<p>")}>Parágrafo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exec("formatBlock", "<h1>")}>Título 1</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exec("formatBlock", "<h2>")}>Título 2</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exec("formatBlock", "<h3>")}>Título 3</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Blocos</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => exec("formatBlock", "<blockquote>")}>Citação</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exec("formatBlock", "<pre>")}>Pré-formatado</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exec("insertUnorderedList")}>Lista com marcadores</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exec("insertOrderedList")}>Lista numerada</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Fontes</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana"].map((f) => (
                  <DropdownMenuItem key={f} onClick={() => exec("fontName", f)} style={{ fontFamily: f }}>
                    {f}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Tamanho da fonte</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {[
                  { l: "Pequena", v: "2" },
                  { l: "Normal", v: "3" },
                  { l: "Média", v: "4" },
                  { l: "Grande", v: "5" },
                  { l: "Muito grande", v: "6" },
                  { l: "Enorme", v: "7" },
                ].map((s) => (
                  <DropdownMenuItem key={s.v} onClick={() => exec("fontSize", s.v)}>
                    {s.l}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Alinhamento</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => exec("justifyLeft")}>
                  <AlignLeft className="h-4 w-4 mr-2" /> Esquerda
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exec("justifyCenter")}>
                  <AlignCenter className="h-4 w-4 mr-2" /> Centralizado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exec("justifyRight")}>
                  <AlignRight className="h-4 w-4 mr-2" /> Direita
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exec("justifyFull")}>
                  <AlignJustify className="h-4 w-4 mr-2" /> Justificado
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Altura da linha</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {["1", "1.15", "1.5", "2", "2.5", "3"].map((lh) => (
                  <DropdownMenuItem
                    key={lh}
                    onClick={() => insertHTML(`<div style="line-height:${lh}">Linha (${lh})</div>`)}
                  >
                    {lh}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="h-4 w-4 mr-2" /> Cor do texto
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <div className="grid grid-cols-4 gap-1 p-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      className="h-6 w-6 rounded border"
                      style={{ background: c }}
                      onClick={() => exec("foreColor", c)}
                    />
                  ))}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <PaintBucket className="h-4 w-4 mr-2" /> Cor do fundo
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <div className="grid grid-cols-4 gap-1 p-2">
                  {["#fef3c7", "#fee2e2", "#dcfce7", "#dbeafe", "#ede9fe", "#fce7f3", "#f3f4f6", "transparent"].map(
                    (c) => (
                      <button
                        key={c}
                        className="h-6 w-6 rounded border"
                        style={{ background: c }}
                        onClick={() => exec("hiliteColor", c)}
                      />
                    ),
                  )}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => exec("removeFormat")}>
              <Eraser className="h-4 w-4 mr-2" /> Limpar formatação
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tabela */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-2 py-1 hover:bg-muted rounded inline-flex items-center gap-1">
            Tabela <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <TableIcon className="h-4 w-4 mr-2" /> Tabela
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => insertTable(2, 2)}>2 x 2</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertTable(3, 3)}>3 x 3</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertTable(4, 4)}>4 x 4</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertTable(5, 5)}>5 x 5</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem disabled>Célula</DropdownMenuItem>
            <DropdownMenuItem disabled>Linha</DropdownMenuItem>
            <DropdownMenuItem disabled>Coluna</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Propriedades da tabela</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const sel = window.getSelection();
                const node = sel?.anchorNode as HTMLElement | null;
                const table = node?.parentElement?.closest("table");
                table?.remove();
                if (editorRef.current) onChange(editorRef.current.innerHTML);
              }}
            >
              Excluir tabela
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Inserir */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-2 py-1 hover:bg-muted rounded inline-flex items-center gap-1">
            Inserir <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem
              onClick={() => {
                const url = window.prompt("URL do link:");
                if (url) exec("createLink", url);
              }}
            >
              <Link2 className="h-4 w-4 mr-2" /> Link...
              <span className="ml-auto text-muted-foreground">Ctrl+K</span>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <TableIcon className="h-4 w-4 mr-2" /> Tabela
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => insertTable(2, 2)}>2 x 2</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertTable(3, 3)}>3 x 3</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertTable(4, 4)}>4 x 4</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Smile className="h-4 w-4 mr-2" /> Emoji
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <div className="grid grid-cols-6 gap-1 p-2 text-lg">
                  {["😀", "😊", "👍", "🎉", "❤️", "🔥", "✅", "⚠️", "📌", "💡", "📅", "🚀"].map((e) => (
                    <button key={e} className="hover:bg-muted rounded p-1" onClick={() => insertHTML(e)}>
                      {e}
                    </button>
                  ))}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={() => insertHTML('<hr style="margin:12px 0"/>')}>
              <Minus className="h-4 w-4 mr-2" /> Linha horizontal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Editar */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-2 py-1 hover:bg-muted rounded inline-flex items-center gap-1">
            Editar <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuItem onClick={() => exec("undo")}>
              <Undo2 className="h-4 w-4 mr-2" /> Desfazer
              <span className="ml-auto text-muted-foreground">Ctrl+Z</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exec("redo")}>
              <Redo2 className="h-4 w-4 mr-2" /> Refazer
              <span className="ml-auto text-muted-foreground">Ctrl+Y</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => exec("cut")}>
              <Scissors className="h-4 w-4 mr-2" /> Cortar
              <span className="ml-auto text-muted-foreground">Ctrl+X</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exec("copy")}>
              <Copy className="h-4 w-4 mr-2" /> Copiar
              <span className="ml-auto text-muted-foreground">Ctrl+C</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exec("paste")}>
              <ClipboardPaste className="h-4 w-4 mr-2" /> Colar
              <span className="ml-auto text-muted-foreground">Ctrl+V</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  insertHTML(text.replace(/</g, "&lt;"));
                } catch {}
              }}
            >
              <FileText className="h-4 w-4 mr-2" /> Colar como texto
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => exec("selectAll")}>
              <MousePointer2 className="h-4 w-4 mr-2" /> Selecionar tudo
              <span className="ml-auto text-muted-foreground">Ctrl+A</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mídia */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-2 py-1 hover:bg-muted rounded inline-flex items-center gap-1">
            Mídia <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuItem onClick={() => filePdfRef.current?.click()}>
              <FileText className="h-4 w-4 mr-2" /> PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileImgRef.current?.click()}>
              <ImageIcon className="h-4 w-4 mr-2" /> Imagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileVidRef.current?.click()}>
              <Video className="h-4 w-4 mr-2" /> Vídeo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <input ref={fileImgRef} type="file" accept="image/*" hidden onChange={onPickFile("img")} />
        <input ref={fileVidRef} type="file" accept="video/*" hidden onChange={onPickFile("vid")} />
        <input ref={filePdfRef} type="file" accept="application/pdf" hidden onChange={onPickFile("pdf")} />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="min-h-[200px] p-3 outline-none text-sm prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground [&:empty]:before:content-[attr(data-placeholder)] [&:not(:focus):empty]:before:content-[attr(data-placeholder)] [&:not(:focus):empty]:before:text-muted-foreground"
      />
    </div>
  );
}
