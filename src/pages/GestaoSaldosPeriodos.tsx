import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Info,
  RotateCcw,
  Eye,
  User,
  CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ColaboradorMock {
  nome: string;
  cargo: string;
  vinculo: string;
  gestor: string;
  gestorCargo: string;
  admissao: string;
  inicioAquisitivo: string;
}

const MOCK: Record<string, ColaboradorMock> = {
  default: {
    nome: "DANIELA NASCIMENTO COSTA BICALHO",
    cargo: "Coordenadora",
    vinculo: "CLT",
    gestor: "ANA CAROLINA BRAGA DE MOURA",
    gestorCargo: "DIRETORA DE...",
    admissao: "01/11/2010",
    inicioAquisitivo: "01/11/2022",
  },
};

interface SolicPeriodo {
  periodo: string;
  dias: string;
  abono: string;
  adiantamento: string;
  status: "Concluída" | "Cancelada" | "Em análise";
}

interface PeriodoAberto {
  id: string;
  tipo: "vigente" | "proporcional";
  aquisitivo: string;
  diasPlanejamento: string;
  direitoA: string;
  dataLimite: string;
  solicitacoes: SolicPeriodo[];
}

interface PeriodoConcluido {
  id: string;
  aquisitivo: string;
  diasPlanejamento: string;
  direitoA: string;
  dataLimite: string;
  solicitacoes: SolicPeriodo[];
}

const PERIODOS_ABERTOS: PeriodoAberto[] = [
  {
    id: "pa1",
    tipo: "vigente",
    aquisitivo: "31/10/2024 - 30/10/2025",
    diasPlanejamento: "16 dias",
    direitoA: "31/10/2025",
    dataLimite: "15/10/2026",
    solicitacoes: [
      {
        periodo: "22/12/2025 - 04/01/2026",
        dias: "14 dias",
        abono: "0 dias",
        adiantamento: "Não",
        status: "Concluída",
      },
    ],
  },
  {
    id: "pa2",
    tipo: "proporcional",
    aquisitivo: "31/10/2025 - 30/10/2026",
    diasPlanejamento: "30 dias",
    direitoA: "31/10/2026",
    dataLimite: "01/10/2027",
    solicitacoes: [],
  },
];

const PERIODOS_CONCLUIDOS: PeriodoConcluido[] = [
  {
    id: "pc1",
    aquisitivo: "01/11/2023 - 30/10/2024",
    diasPlanejamento: "0 dias",
    direitoA: "31/10/2024",
    dataLimite: "-",
    solicitacoes: [
      { periodo: "19/12/2024 - 01/01/2025", dias: "14 dias", abono: "0 dias", adiantamento: "Não", status: "Concluída" },
      { periodo: "10/09/2025 - 20/09/2025", dias: "11 dias", abono: "5 dias", adiantamento: "Não", status: "Cancelada" },
      { periodo: "15/09/2025 - 25/09/2025", dias: "11 dias", abono: "5 dias", adiantamento: "Não", status: "Concluída" },
    ],
  },
  {
    id: "pc2",
    aquisitivo: "01/11/2022 - 31/10/2023",
    diasPlanejamento: "0 dias",
    direitoA: "01/11/2023",
    dataLimite: "-",
    solicitacoes: [
      { periodo: "30/09/2024 - 29/10/2024", dias: "30 dias", abono: "0 dias", adiantamento: "Não", status: "Concluída" },
    ],
  },
];

const statusCor: Record<SolicPeriodo["status"], string> = {
  Concluída: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Cancelada: "bg-gray-200 text-gray-700 hover:bg-gray-200",
  "Em análise": "bg-blue-100 text-blue-700 hover:bg-blue-100",
};

function parseDateBR(value: string): Date | undefined {
  const parsed = parse(value, "dd/MM/yyyy", new Date(), { locale: ptBR });
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatDateBR(value: Date | undefined): string {
  return value ? format(value, "dd/MM/yyyy", { locale: ptBR }) : "";
}

function PeriodoCard({
  aquisitivo,
  diasPlanejamento,
  direitoA,
  dataLimite,
  solicitacoes,
  emptyMsg,
}: {
  aquisitivo: string;
  diasPlanejamento: string;
  direitoA: string;
  dataLimite: string;
  solicitacoes: SolicPeriodo[];
  emptyMsg: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Card className="p-0 overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 items-start px-4 py-3 text-left hover:bg-muted/40"
          >
            <div>
              <div className="text-xs text-muted-foreground">Período aquisitivo</div>
              <div className="text-sm">{aquisitivo}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Dias para planejamento</div>
              <div className="text-sm text-primary">{diasPlanejamento}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Direito a férias a partir de</div>
              <div className="text-sm">{direitoA}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                Data limite de férias {dataLimite === "-" && <Info className="h-3 w-3" />}
              </div>
              <div className="text-sm">{dataLimite}</div>
            </div>
            {open ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground mt-1" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground mt-1" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-xs text-muted-foreground bg-muted/30">
              <div>Período Solicitado</div>
              <div>Dias solicitados</div>
              <div>Abono Pecuniário</div>
              <div>Adiantamento 13°</div>
              <div>Status da Solicitação</div>
            </div>
            {solicitacoes.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4 bg-muted/10">
                {emptyMsg}
              </div>
            ) : (
              solicitacoes.map((s, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 items-center px-4 py-3 text-sm border-t bg-muted/10"
                >
                  <div className="text-primary">{s.periodo}</div>
                  <div>{s.dias}</div>
                  <div>{s.abono}</div>
                  <div>{s.adiantamento}</div>
                  <div className="flex items-center gap-2 justify-end">
                    <Badge className={statusCor[s.status]} variant="secondary">
                      {s.status}
                    </Badge>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default function GestaoSaldosPeriodos() {
  const navigate = useNavigate();
  const { id } = useParams();
  const colab = MOCK.default;

  const [visualizar, setVisualizar] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [inicioAquisitivo, setInicioAquisitivo] = useState<Date | undefined>(
    parseDateBR(colab.inicioAquisitivo),
  );

  const saldoTotal = useMemo(
    () => PERIODOS_ABERTOS.reduce((sum, p) => sum + (p.tipo === "vigente" ? 16 : 0), 0) || 16,
    [],
  );

  const iniciais = (n: string) =>
    n
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Gestão de saldos e períodos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os períodos aquisitivos e saldos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button>Criar solicitação</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Mais opções">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                Editar Início do primeiro período aquisitivo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr_1.2fr] gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold uppercase leading-tight">
                {colab.nome}
              </div>
              <div className="text-xs text-muted-foreground">{colab.cargo}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {colab.vinculo} <Info className="h-3 w-3" />
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Gestor direto</div>
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {iniciais(colab.gestor)}
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <div className="text-sm uppercase">{colab.gestor}</div>
                <div className="text-xs text-muted-foreground uppercase">
                  {colab.gestorCargo}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-muted-foreground font-medium">Data de admissão</div>
              <div className="text-sm">{colab.admissao}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">
                Início do 1° período aquisitivo
              </div>
              <div className="text-sm">{colab.inicioAquisitivo}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Visualização de Saldo</div>
            <div className="flex items-start gap-2 mt-1">
              <Switch checked={visualizar} onCheckedChange={setVisualizar} />
              <div className="text-xs text-muted-foreground">
                Exibir para o colaborador seu saldo de férias e usá-lo como limite para solicitações de férias.
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="abertos">
        <TabsList>
          <TabsTrigger value="abertos">
            Períodos em aberto ({PERIODOS_ABERTOS.length})
          </TabsTrigger>
          <TabsTrigger value="concluidos">
            Períodos concluídos ({PERIODOS_CONCLUIDOS.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="abertos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Períodos em aberto</h2>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Saldo adquirido total</div>
              <div className="text-sm font-medium">{saldoTotal} dias</div>
            </div>
          </div>

          {PERIODOS_ABERTOS.map((p) => (
            <div key={p.id} className="space-y-1">
              <div>
                <div className="text-sm font-semibold">
                  {p.tipo === "vigente" ? "Em período vigente" : "Em período proporcional"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {p.tipo === "vigente"
                    ? "Férias que estão dentro do período disponível para gozo."
                    : "Período ainda em fase de aquisição e com saldo visível integralmente para planejamento."}
                </div>
              </div>
              <PeriodoCard
                aquisitivo={p.aquisitivo}
                diasPlanejamento={p.diasPlanejamento}
                direitoA={p.direitoA}
                dataLimite={p.dataLimite}
                solicitacoes={p.solicitacoes}
                emptyMsg="Nenhuma solicitação realizada nesse período."
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="concluidos" className="space-y-4">
          <h2 className="text-lg font-semibold">Períodos</h2>
          {PERIODOS_CONCLUIDOS.map((p) => (
            <PeriodoCard
              key={p.id}
              aquisitivo={p.aquisitivo}
              diasPlanejamento={p.diasPlanejamento}
              direitoA={p.direitoA}
              dataLimite={p.dataLimite}
              solicitacoes={p.solicitacoes}
              emptyMsg="Nenhuma solicitação realizada nesse período."
            />
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Início do primeiro período aquisitivo</DialogTitle>
            <DialogDescription>
              Editar o início do período aquisitivo para o sistema reiniciar os cálculos de saldo do colaborador.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight">
                <div className="text-sm font-semibold uppercase">{colab.nome}</div>
                <div className="text-xs text-muted-foreground">{colab.cargo}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tipo de Vínculo</div>
              <div className="text-sm">{colab.vinculo}</div>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="inicio-aquisitivo">
              Início do primeiro período aquisitivo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="inicio-aquisitivo"
              value={inicioAquisitivo}
              onChange={(e) => setInicioAquisitivo(e.target.value)}
              placeholder="DD/MM/AAAA"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setEditOpen(false)}>Salvar e calcular períodos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
