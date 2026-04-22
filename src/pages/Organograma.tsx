import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useColaboradores, type Colaborador } from "@/stores/colaboradoresStore";
import { Download, ZoomIn, ZoomOut, ExternalLink, User as UserIcon, Network } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NodeT {
  colab: Colaborador | null; // null = raiz virtual
  children: NodeT[];
}

function buildTree(colaboradores: Colaborador[]): NodeT {
  const byId = new Map<string, NodeT>();
  colaboradores.forEach((c) => byId.set(c.id, { colab: c, children: [] }));
  const roots: NodeT[] = [];
  colaboradores.forEach((c) => {
    const node = byId.get(c.id)!;
    const liderId = c.lider || null;
    if (liderId && byId.has(liderId)) {
      byId.get(liderId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return { colab: null, children: roots };
}

function iniciais(nome: string) {
  if (!nome) return "?";
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function CardColab({ c, onOpen }: { c: Colaborador; onOpen: (id: string) => void }) {
  return (
    <div className="relative w-[260px] rounded-md border border-border bg-card shadow-sm">
      <div className="absolute left-0 right-0 top-0 h-1 rounded-t-md bg-primary" />
      <button
        onClick={() => onOpen(c.id)}
        className="absolute right-2 top-2 text-primary hover:opacity-80"
        aria-label="Abrir perfil"
      >
        <ExternalLink className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-3 p-3 pt-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-muted text-muted-foreground">
            {iniciais(c.nomeVisivel || c.nomeCompleto)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold uppercase tracking-wide text-foreground">
            {c.nomeVisivel || c.nomeCompleto || "Sem nome"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{c.departamento || "—"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {c.cargoVisivel || c.cargo || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function CardVazio() {
  return (
    <div className="relative flex w-[260px] items-center gap-3 rounded-md border border-dashed border-border bg-card/60 p-3 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <UserIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="text-xs text-muted-foreground">
        <p className="font-semibold">Sem colaboradores</p>
        <p>Cadastre colaboradores para visualizar</p>
      </div>
    </div>
  );
}

function TreeNode({
  node,
  onOpen,
}: {
  node: NodeT;
  onOpen: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  return (
    <div className="flex flex-col items-center">
      {node.colab && <CardColab c={node.colab} onOpen={onOpen} />}
      {hasChildren && (
        <>
          {/* linha vertical descendo do pai */}
          {node.colab && <div className="h-6 w-px bg-border" />}
          <div className="relative flex items-start justify-center gap-8">
            {/* linha horizontal conectando filhos */}
            {node.children.length > 1 && (
              <div className="absolute left-0 right-0 top-0 h-px bg-border" />
            )}
            {node.children.map((child, idx) => (
              <div key={child.colab?.id ?? idx} className="flex flex-col items-center">
                {/* linha vertical subindo até a horizontal */}
                <div className="h-6 w-px bg-border" />
                <TreeNode node={child} onOpen={onOpen} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Organograma() {
  const { colaboradores } = useColaboradores();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const tree = useMemo(() => buildTree(colaboradores), [colaboradores]);

  const handleOpen = (id: string) => navigate(`/colaboradores/${id}`);

  const exportar = () => {
    const linhas = ["Nome,Cargo,Departamento,Líder"];
    colaboradores.forEach((c) => {
      const lider = colaboradores.find((x) => x.id === c.lider);
      linhas.push(
        [
          c.nomeVisivel || c.nomeCompleto,
          c.cargoVisivel || c.cargo || "",
          c.departamento || "",
          lider ? lider.nomeVisivel || lider.nomeCompleto : "",
        ]
          .map((v) => `"${(v || "").replace(/"/g, '""')}"`)
          .join(",")
      );
    });
    const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "organograma.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Organograma</h1>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))}
          >
            <ZoomIn className="mr-1 h-4 w-4" /> Zoom +
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
          >
            <ZoomOut className="mr-1 h-4 w-4" /> Zoom -
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={exportar}>
          <Download className="mr-1 h-4 w-4" /> Exportar
        </Button>
      </div>

      <div
        ref={containerRef}
        className="relative h-[calc(100vh-220px)] w-full overflow-auto rounded-md border border-border bg-muted/30 p-8"
      >
        {colaboradores.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <CardVazio />
          </div>
        ) : (
          <div
            className="inline-block origin-top-left transition-transform"
            style={{ transform: `scale(${zoom})` }}
          >
            <div className="flex items-start gap-12">
              {tree.children.map((root, i) => (
                <TreeNode key={root.colab?.id ?? i} node={root} onOpen={handleOpen} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
