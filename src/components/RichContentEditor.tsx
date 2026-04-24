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

/* ---------- Table size grid picker ---------- */
function TableGridPicker({ onPick }: { onPick: (rows: number, cols: number) => void }) {
  const MAX = 10;
  const [hover, setHover] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  return (
    <div className="p-2 select-none" onMouseLeave={() => setHover({ r: 0, c: 0 })}>
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${MAX}, 18px)` }}
      >
        {Array.from({ length: MAX * MAX }).map((_, i) => {
          const r = Math.floor(i / MAX) + 1;
          const c = (i % MAX) + 1;
          const active = r <= hover.r && c <= hover.c;
          return (
            <div
              key={i}
              onMouseEnter={() => setHover({ r, c })}
              onClick={() => onPick(hover.r || r, hover.c || c)}
              className={`h-[18px] w-[18px] border cursor-pointer ${
                active ? "bg-primary/70 border-primary" : "bg-background border-border"
              }`}
            />
          );
        })}
      </div>
      <div className="text-center text-xs mt-2 text-muted-foreground">
        {hover.r > 0 ? `${hover.r} x ${hover.c}` : "Selecione o tamanho"}
      </div>
    </div>
  );
}

/* ---------- DOM helpers for table edit ---------- */
const getCell = (): HTMLTableCellElement | null => {
  const sel = window.getSelection();
  let node = sel?.anchorNode as Node | null;
  while (node && node.nodeType !== 1) node = node.parentNode;
  return (node as HTMLElement | null)?.closest("td,th") as HTMLTableCellElement | null;
};

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

  const sync = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    sync();
  };

  const insertHTML = (html: string) => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    sync();
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

  /* ---- Table operations ---- */
  const withCell = (fn: (cell: HTMLTableCellElement, row: HTMLTableRowElement, table: HTMLTableElement) => void) => {
    const cell = getCell();
    if (!cell) return;
    const row = cell.parentElement as HTMLTableRowElement;
    const table = cell.closest("table") as HTMLTableElement;
    if (!row || !table) return;
    fn(cell, row, table);
    sync();
  };

  const insertRow = (after: boolean) =>
    withCell((_c, row) => {
      const cols = row.children.length;
      const newRow = row.parentElement!.insertRow(row.rowIndex + (after ? 1 : 0));
      for (let i = 0; i < cols; i++) {
        const td = newRow.insertCell();
        td.style.border = "1px solid #ccc";
        td.style.padding = "6px";
        td.innerHTML = "&nbsp;";
      }
    });

  const deleteRow = () => withCell((_c, row) => row.remove());

  const insertCol = (after: boolean) =>
    withCell((cell, _row, table) => {
      const idx = cell.cellIndex + (after ? 1 : 0);
      Array.from(table.rows).forEach((r) => {
        const td = r.insertCell(idx);
        td.style.border = "1px solid #ccc";
        td.style.padding = "6px";
        td.innerHTML = "&nbsp;";
      });
    });

  const deleteCol = () =>
    withCell((cell, _row, table) => {
      const idx = cell.cellIndex;
      Array.from(table.rows).forEach((r) => r.deleteCell(idx));
    });

  const deleteTable = () =>
    withCell((_c, _r, table) => table.remove());

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

  /* ---- Expanded color palette ---- */
  const textColors = [
    "#000000","#1f2937","#374151","#4b5563","#6b7280","#9ca3af","#d1d5db","#ffffff",
    "#7f1d1d","#b91c1c","#ef4444","#f87171","#fca5a5","#fecaca","#fee2e2","#fef2f2",
    "#7c2d12","#c2410c","#f97316","#fb923c","#fdba74","#fed7aa","#ffedd5","#fff7ed",
    "#78350f","#b45309","#f59e0b","#fbbf24","#fcd34d","#fde68a","#fef3c7","#fffbeb",
    "#365314","#4d7c0f","#84cc16","#a3e635","#bef264","#d9f99d","#ecfccb","#f7fee7",
    "#14532d","#15803d","#22c55e","#4ade80","#86efac","#bbf7d0","#dcfce7","#f0fdf4",
    "#134e4a","#0f766e","#14b8a6","#2dd4bf","#5eead4","#99f6e4","#ccfbf1","#f0fdfa",
    "#1e3a8a","#1d4ed8","#3b82f6","#60a5fa","#93c5fd","#bfdbfe","#dbeafe","#eff6ff",
    "#4c1d95","#6d28d9","#8b5cf6","#a78bfa","#c4b5fd","#ddd6fe","#ede9fe","#f5f3ff",
    "#831843","#be185d","#ec4899","#f472b6","#f9a8d4","#fbcfe8","#fce7f3","#fdf2f8",
  ];

  const bgColors = [
    "transparent",
    "#ffffff","#f3f4f6","#e5e7eb","#d1d5db","#9ca3af","#6b7280","#374151","#000000",
    "#fee2e2","#fecaca","#fca5a5","#f87171","#ef4444","#dc2626","#b91c1c",
    "#ffedd5","#fed7aa","#fdba74","#fb923c","#f97316","#ea580c","#c2410c",
    "#fef3c7","#fde68a","#fcd34d","#fbbf24","#f59e0b","#d97706","#b45309",
    "#dcfce7","#bbf7d0","#86efac","#4ade80","#22c55e","#16a34a","#15803d",
    "#ccfbf1","#99f6e4","#5eead4","#2dd4bf","#14b8a6","#0d9488","#0f766e",
    "#dbeafe","#bfdbfe","#93c5fd","#60a5fa","#3b82f6","#2563eb","#1d4ed8",
    "#ede9fe","#ddd6fe","#c4b5fd","#a78bfa","#8b5cf6","#7c3aed","#6d28d9",
    "#fce7f3","#fbcfe8","#f9a8d4","#f472b6","#ec4899","#db2777","#be185d",
  ];

  const fontFamilies = [
    "Arial","Helvetica","Times New Roman","Georgia","Garamond","Courier New",
    "Verdana","Tahoma","Trebuchet MS","Lucida Console","Comic Sans MS","Impact",
    "Palatino","Book Antiqua","Calibri","Cambria","Consolas","Monaco","Brush Script MT",
    "Roboto","Open Sans","Lato","Montserrat","Poppins","Inter","Nunito","Source Sans Pro",
  ];

  /* ---- Emoji catalog (organized by category) ---- */
  const emojiCategories: Record<string, string[]> = {
    "Smileys": "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 🫠 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🫡 🤔 🫣 🤭 🤫 🤐 🤨 😐 😑 😶 🫥 😏 😒 🙄 😬 😮‍💨 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 😵‍💫 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 🫤 😟 🙁 ☹️ 😮 😯 😲 😳 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠️ 💩 🤡 👹 👺 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾".split(" "),
    "Pessoas": "👋 🤚 🖐️ ✋ 🖖 🫱 🫲 🫳 🫴 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 🫵 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦿 🦵 🦶 👂 🦻 👃 🧠 🫀 🫁 🦷 🦴 👀 👁️ 👅 👄 🫦 💋 🩸 👶 🧒 👦 👧 🧑 👱 👨 🧔 👩 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 👮 🕵️ 💂 🥷 👷 🫅 🤴 👸 👳 👲 🧕 🤵 👰 🤰 🫃 🫄 🤱 👼 🎅 🤶 🦸 🦹 🧙 🧚 🧛 🧜 🧝 🧞 🧟 🧌".split(" "),
    "Animais": "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🪲 🪳 🦟 🦗 🕷️ 🕸️ 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🦭 🐊 🐅 🐆 🦓 🦍 🦧 🦣 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🦬 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🦮 🐕‍🦺 🐈 🐈‍⬛ 🪶 🐓 🦃 🦤 🦚 🦜 🦢 🦩 🕊️ 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐀 🐿️ 🦔 🐾 🐉 🐲 🌵 🎄 🌲 🌳 🌴 🪵 🌱 🌿 ☘️ 🍀 🎍 🪴 🎋 🍃 🍂 🍁 🍄 🐚 🪨 🌾 💐 🌷 🌹 🥀 🌺 🌸 🌼 🌻".split(" "),
    "Comidas": "🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🫑 🌽 🥕 🫒 🧄 🧅 🥔 🍠 🫛 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🦴 🌭 🍔 🍟 🍕 🥪 🥙 🧆 🌮 🌯 🫔 🥗 🥘 🫕 🥫 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🦪 🍤 🍙 🍚 🍘 🍥 🥠 🥮 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🫘 🍯 🥛 🫗 🍼 🫖 ☕ 🍵 🧃 🥤 🧋 🍶 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🧉 🍾 🧊 🥄 🍴 🍽️ 🥣 🥡 🥢 🧂".split(" "),
    "Atividades": "⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🪃 🥅 ⛳ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛼 🛷 ⛸️ 🥌 🎿 ⛷️ 🏂 🪂 🏋️ 🤼 🤸 ⛹️ 🤺 🤾 🏌️ 🏇 🧘 🏄 🏊 🤽 🚣 🧗 🚵 🚴 🏆 🥇 🥈 🥉 🏅 🎖️ 🏵️ 🎗️ 🎫 🎟️ 🎪 🤹 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🪘 🎷 🎺 🪗 🎸 🪕 🎻 🎲 ♟️ 🎯 🎳 🎮 🎰 🧩".split(" "),
    "Viagens": "🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🦯 🦽 🦼 🛴 🚲 🛵 🏍️ 🛺 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈 🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🛩️ 💺 🛰️ 🚀 🛸 🚁 🛶 ⛵ 🚤 🛥️ 🛳️ ⛴️ 🚢 ⚓ 🪝 ⛽ 🚧 🚦 🚥 🚏 🗺️ 🗿 🗽 🗼 🏰 🏯 🏟️ 🎡 🎢 🎠 ⛲ ⛱️ 🏖️ 🏝️ 🏜️ 🌋 ⛰️ 🏔️ 🗻 🏕️ ⛺ 🛖 🏠 🏡 🏘️ 🏚️ 🏗️ 🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛️ ⛪ 🕌 🕍 🛕 🕋 ⛩️".split(" "),
    "Objetos": "⌚ 📱 📲 💻 ⌨️ 🖥️ 🖨️ 🖱️ 🖲️ 🕹️ 🗜️ 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽️ 🎞️ 📞 ☎️ 📟 📠 📺 📻 🎙️ 🎚️ 🎛️ 🧭 ⏱️ ⏲️ ⏰ 🕰️ ⌛ ⏳ 📡 🔋 🪫 🔌 💡 🔦 🕯️ 🪔 🧯 🛢️ 💸 💵 💴 💶 💷 🪙 💰 💳 💎 ⚖️ 🪜 🧰 🪛 🔧 🔨 ⚒️ 🛠️ ⛏️ 🪚 🔩 ⚙️ 🪤 🧱 ⛓️ 🧲 🔫 💣 🧨 🪓 🔪 🗡️ ⚔️ 🛡️ 🚬 ⚰️ 🪦 ⚱️ 🏺 🔮 📿 🧿 🪬 💈 ⚗️ 🔭 🔬 🕳️ 🩹 🩺 🩻 💊 💉 🩸 🧬 🦠 🧫 🧪 🌡️ 🧹 🪠 🧺 🧻 🚽 🚰 🚿 🛁 🛀 🧼 🪥 🪒 🧽 🪣 🧴 🛎️ 🔑 🗝️ 🚪 🪑 🛋️ 🛏️ 🛌 🧸 🪆 🖼️ 🪞 🪟 🛍️ 🛒 🎁 🎈 🎏 🎀 🪄 🪅 🎊 🎉 🎎 🏮 🎐 🧧 ✉️ 📩 📨 📧 💌 📥 📤 📦 🏷️ 🪧 📪 📫 📬 📭 📮 📯 📜 📃 📄 📑 🧾 📊 📈 📉 🗒️ 🗓️ 📆 📅 🗑️ 📇 🗃️ 🗳️ 🗄️ 📋 📁 📂 🗂️ 🗞️ 📰 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 🧷 🔗 📎 🖇️ 📐 📏 🧮 📌 📍 ✂️ 🖊️ 🖋️ ✒️ 🖌️ 🖍️ 📝 ✏️ 🔍 🔎 🔏 🔐 🔒 🔓".split(" "),
    "Símbolos": "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ☮️ ✝️ ☪️ 🕉️ ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 🆔 ⚛️ 🉑 ☢️ ☣️ 📴 📳 🈶 🈚 🈸 🈺 🈷️ ✴️ 🆚 💮 🉐 ㊙️ ㊗️ 🈴 🈵 🈹 🈲 🅰️ 🅱️ 🆎 🆑 🅾️ 🆘 ❌ ⭕ 🛑 ⛔ 📛 🚫 💯 💢 ♨️ 🚷 🚯 🚳 🚱 🔞 📵 🚭 ❗ ❕ ❓ ❔ ‼️ ⁉️ 🔅 🔆 〽️ ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ 🈯 💹 ❇️ ✳️ ❎ 🌐 💠 Ⓜ️ 🌀 💤 🏧 🚾 ♿ 🅿️ 🛗 🈳 🈂️ 🛂 🛃 🛄 🛅 🚹 🚺 🚼 ⚧ 🚻 🚮 🎦 📶 🈁 🔣 ℹ️ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆓 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔢 #️⃣ *️⃣ ⏏️ ▶️ ⏸️ ⏯️ ⏹️ ⏺️ ⏭️ ⏮️ ⏩ ⏪ ⏫ ⏬ ◀️ 🔼 🔽 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ ↪️ ↩️ ⤴️ ⤵️ 🔀 🔁 🔂 🔄 🔃 🎵 🎶 ➕ ➖ ➗ ✖️ 🟰 ♾️ 💲 💱 ™️ ©️ ®️ 〰️ ➰ ➿ 🔚 🔙 🔛 🔝 🔜 ✔️ ☑️ 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲 ▪️ ▫️ ◾ ◽ ◼️ ◻️ 🟥 🟧 🟨 🟩 🟦 🟪 ⬛ ⬜ 🟫".split(" "),
    "Bandeiras": "🏁 🚩 🎌 🏴 🏳️ 🏳️‍🌈 🏳️‍⚧️ 🏴‍☠️ 🇧🇷 🇺🇸 🇵🇹 🇪🇸 🇫🇷 🇮🇹 🇩🇪 🇬🇧 🇯🇵 🇨🇳 🇰🇷 🇲🇽 🇦🇷 🇨🇦 🇦🇺 🇮🇳 🇷🇺 🇿🇦 🇨🇭 🇸🇪 🇳🇱 🇧🇪 🇳🇴 🇩🇰 🇫🇮 🇮🇪 🇵🇱 🇬🇷 🇹🇷 🇸🇦 🇦🇪 🇪🇬 🇨🇱 🇨🇴 🇵🇪 🇺🇾 🇵🇾 🇧🇴 🇪🇨 🇻🇪".split(" "),
  };

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
              <DropdownMenuSubContent className="max-h-72 overflow-y-auto">
                {fontFamilies.map((f) => (
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
                <div className="grid grid-cols-8 gap-1 p-2">
                  {textColors.map((c) => (
                    <button
                      key={c}
                      title={c}
                      className="h-5 w-5 rounded border"
                      style={{ background: c }}
                      onClick={() => exec("foreColor", c)}
                    />
                  ))}
                </div>
                <div className="px-2 pb-2">
                  <input
                    type="color"
                    onChange={(e) => exec("foreColor", e.target.value)}
                    className="w-full h-7 cursor-pointer"
                  />
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <PaintBucket className="h-4 w-4 mr-2" /> Cor do fundo
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <div className="grid grid-cols-8 gap-1 p-2">
                  {bgColors.map((c) => (
                    <button
                      key={c}
                      title={c}
                      className="h-5 w-5 rounded border"
                      style={{
                        background:
                          c === "transparent"
                            ? "repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 50% / 8px 8px"
                            : c,
                      }}
                      onClick={() => exec("hiliteColor", c)}
                    />
                  ))}
                </div>
                <div className="px-2 pb-2">
                  <input
                    type="color"
                    onChange={(e) => exec("hiliteColor", e.target.value)}
                    className="w-full h-7 cursor-pointer"
                  />
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
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <TableIcon className="h-4 w-4 mr-2" /> Tabela
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <TableGridPicker onPick={(r, c) => insertTable(r, c)} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Célula</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem disabled>Propriedades da célula</DropdownMenuItem>
                <DropdownMenuItem disabled>Agrupar células</DropdownMenuItem>
                <DropdownMenuItem disabled>Dividir célula</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Linha</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => insertRow(false)}>Inserir linha antes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertRow(true)}>Inserir linha depois</DropdownMenuItem>
                <DropdownMenuItem onClick={deleteRow}>Excluir linha</DropdownMenuItem>
                <DropdownMenuItem disabled>Propriedades da linha</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Recortar linha</DropdownMenuItem>
                <DropdownMenuItem disabled>Copiar linha</DropdownMenuItem>
                <DropdownMenuItem disabled>Colar linha antes</DropdownMenuItem>
                <DropdownMenuItem disabled>Colar linha depois</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Coluna</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => insertCol(false)}>Inserir coluna antes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => insertCol(true)}>Inserir coluna depois</DropdownMenuItem>
                <DropdownMenuItem onClick={deleteCol}>Excluir coluna</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Propriedades da tabela</DropdownMenuItem>
            <DropdownMenuItem onClick={deleteTable}>Excluir tabela</DropdownMenuItem>
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
                <TableGridPicker onPick={(r, c) => insertTable(r, c)} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Smile className="h-4 w-4 mr-2" /> Emoji
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-80 p-0">
                <div className="max-h-80 overflow-y-auto p-2">
                  {Object.entries(emojiCategories).map(([cat, list]) => (
                    <div key={cat} className="mb-2">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground px-1 py-1 sticky top-0 bg-popover">
                        {cat}
                      </div>
                      <div className="grid grid-cols-8 gap-1 text-lg">
                        {list.map((e, i) => (
                          <button
                            key={cat + i}
                            type="button"
                            className="hover:bg-muted rounded p-1 leading-none"
                            onClick={() => insertHTML(e)}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
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
