import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useColaboradores } from "@/stores/colaboradoresStore";

function inferTipoVinculo(cargo: string): string {
  const c = (cargo || "").toLowerCase();
  if (!c) return "";
  if (c.includes("estag")) return "Estágio";
  if (c.includes("sócio") || c.includes("socio")) return "Sócio";
  if (c.includes("diretor")) return "Sócio";
  if (c.includes(" pj") || c.endsWith("pj")) return "PJ";
  return "CLT";
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function ControleVisualizacaoSaldos() {
  const navigate = useNavigate();
  const { colaboradores } = useColaboradores();
  const [busca, setBusca] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);

  const rows = useMemo(() => {
    return colaboradores
      .filter((c) => c.status !== "Inativo")
      .map((c) => {
        const dados = c.dadosCompletos ?? {};
        const tipoVinculoCadastrado: string =
          dados.tipoVinculo ?? dados.tipo_vinculo ?? dados.vinculo ?? "";
        const tipoVinculo =
          tipoVinculoCadastrado ||
          inferTipoVinculo(c.cargoVisivel || c.cargo);
        // ~20% sem cadastro completo, deterministicamente
        const incompleto = hashId(c.id) % 5 === 0 || !tipoVinculo;
        return {
          id: c.id,
          nome: c.nomeVisivel || c.nomeCompleto,
          cargo: c.cargoVisivel || c.cargo,
          gestor: c.gestorDireto || "",
          tipoVinculo: incompleto ? "" : tipoVinculo,
          incompleto,
        };
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [colaboradores]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.nome.toLowerCase().includes(q));
  }, [rows, busca]);

  const elegiveis = filtrados.filter((r) => !r.incompleto);
  const todosAtivos =
    elegiveis.length > 0 && elegiveis.every((r) => enabled[r.id]);

  const totalPag = Math.max(1, Math.ceil(filtrados.length / perPage));
  const inicio = (page - 1) * perPage;
  const fim = Math.min(filtrados.length, inicio + perPage);
  const pagina = filtrados.slice(inicio, fim);

  const toggleTodos = (v: boolean) => {
    setEnabled((prev) => {
      const next = { ...prev };
      elegiveis.forEach((r) => {
        next[r.id] = v;
      });
      return next;
    });
  };

  const iniciais = (nome: string) =>
    nome
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Controle de Visualização de Saldos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie quais colaboradores podem visualizar o saldo de férias e usá-lo como limite para solicitações.
          </p>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPage(1);
            }}
            placeholder="Pesquise colaboradores pelo nome"
            className="pl-9"
          />
        </div>
        <div className="flex justify-end items-center gap-2 text-sm">
          <span className="text-muted-foreground">Ativar para todos</span>
          <Switch
            checked={todosAtivos}
            onCheckedChange={toggleTodos}
            disabled={elegiveis.length === 0}
          />
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Gestor Direto</TableHead>
                <TableHead>Tipo de vínculo</TableHead>
                <TableHead className="text-right">Visualizar saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagina.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">
                          {iniciais(r.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <div className="text-sm font-medium uppercase">
                          {r.nome}
                        </div>
                        {r.cargo && (
                          <div className="text-xs text-muted-foreground">
                            {r.cargo}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm uppercase">
                    {r.gestor || "-"}
                  </TableCell>
                  <TableCell className="text-sm">{r.tipoVinculo || ""}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {r.incompleto && (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                              >
                                Cadastro incompleto
                                <AlertCircle className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              Não é possível habilitar a visualização de saldo pois o Colaborador possui pendências no Tipo de Vínculo ou na Data de primeiro período aquisitivo
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <Switch
                        checked={!!enabled[r.id]}
                        disabled={r.incompleto}
                        onCheckedChange={(v) =>
                          setEnabled((prev) => ({ ...prev, [r.id]: v }))
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pagina.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                    Nenhum colaborador encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm pt-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Itens por página:</span>
            <Select
              value={String(perPage)}
              onValueChange={(v) => {
                setPerPage(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-muted-foreground">
            {filtrados.length === 0 ? 0 : inicio + 1} - {fim} de {filtrados.length} itens
          </div>
          <div className="flex items-center gap-2">
            <span>
              {page} de {totalPag} páginas
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPag, p + 1))}
              disabled={page === totalPag}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
