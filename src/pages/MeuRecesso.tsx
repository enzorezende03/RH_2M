import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, User, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

type Status = "Análise Gestor" | "Análise RH" | "Aguardando documentação" | "Concluída" | "Cancelada";

interface Solicitacao {
  id: string;
  inicio: string; // dd/mm/yyyy
  fim: string;
  dataSolicitacao: string;
  gestor: string;
  cargoGestor: string;
  observacoes: string;
  status: Status;
}

const STEPS: Status[] = ["Análise Gestor", "Análise RH", "Aguardando documentação", "Concluída"];

function diffDias(inicio: string, fim: string) {
  if (!inicio || !fim) return 0;
  const a = new Date(inicio);
  const b = new Date(fim);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  const ms = b.getTime() - a.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / 86400000) + 1;
}

function fmtBR(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function hojeBR() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function MeuRecesso() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [criarOpen, setCriarOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  // form
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [obs, setObs] = useState("");

  // paginação
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const dias = useMemo(() => diffDias(inicio, fim), [inicio, fim]);

  const colaborador = { nome: "NOME DO COLABORADOR", cargo: "Cargo" };
  const gestor = { nome: "NOME DO GESTOR", cargo: "Gestor / Líder" };

  function reset() {
    setInicio("");
    setFim("");
    setObs("");
  }

  function solicitar() {
    if (!inicio || !fim || dias < 1) return;
    const nova: Solicitacao = {
      id: crypto.randomUUID(),
      inicio: fmtBR(inicio),
      fim: fmtBR(fim),
      dataSolicitacao: hojeBR(),
      gestor: gestor.nome,
      cargoGestor: gestor.cargo,
      observacoes: obs,
      status: "Análise Gestor",
    };
    setSolicitacoes((p) => [nova, ...p]);
    setCriarOpen(false);
    reset();
    toast({ title: "Solicitação enviada", description: `Recesso de ${dias} dia(s) solicitado.` });
  }

  function cancelar(id: string) {
    setSolicitacoes((p) => p.map((s) => (s.id === id ? { ...s, status: "Cancelada" } : s)));
    setConfirmCancel(null);
    setDetalhesOpen(null);
    toast({ title: "Solicitação cancelada", description: "Sua solicitação foi removida do processo de aprovação." });
  }

  const detalhe = solicitacoes.find((s) => s.id === detalhesOpen);
  const totalPages = Math.max(1, Math.ceil(solicitacoes.length / perPage));
  const pageItems = solicitacoes.slice((page - 1) * perPage, page * perPage);

  const statusColor: Record<Status, string> = {
    "Análise Gestor": "bg-orange-100 text-orange-700 hover:bg-orange-100",
    "Análise RH": "bg-blue-100 text-blue-700 hover:bg-blue-100",
    "Aguardando documentação": "bg-amber-100 text-amber-700 hover:bg-amber-100",
    Concluída: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Cancelada: "bg-red-100 text-red-700 hover:bg-red-100",
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Recesso</h1>
            <p className="text-sm text-muted-foreground">Solicite e acompanhe suas solicitações de recesso.</p>
          </div>
          <Button onClick={() => setCriarOpen(true)}>Solicitar recesso</Button>
        </div>

        {solicitacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-40 w-40 rounded-full bg-muted/40 flex items-center justify-center mb-4">
              <span className="text-5xl">🌴</span>
            </div>
            <p className="text-sm text-muted-foreground">Você ainda não possui solicitações de recesso.</p>
          </div>
        ) : (
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período Solicitado</TableHead>
                  <TableHead>Data da Solicitação</TableHead>
                  <TableHead>Gestor Direto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div><span className="font-semibold">De:</span> {s.inicio}</div>
                        <div><span className="font-semibold">Até:</span> {s.fim}</div>
                      </div>
                    </TableCell>
                    <TableCell>{s.dataSolicitacao}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-muted text-muted-foreground"><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{s.gestor}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor[s.status]} variant="secondary">{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setDetalhesOpen(s.id)}>
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Itens por página:</span>
                <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                  <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50].map((n) => (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>{(page - 1) * perPage + 1} - {Math.min(page * perPage, solicitacoes.length)} de {solicitacoes.length} itens</div>
              <div className="flex items-center gap-2">
                <span>{page} de {totalPages} páginas</span>
                <Button variant="ghost" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Criar solicitação */}
      <Dialog open={criarOpen} onOpenChange={(o) => { setCriarOpen(o); if (!o) reset(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Colaborador</p>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-muted text-muted-foreground"><User className="h-5 w-5" /></AvatarFallback></Avatar>
                  <div>
                    <div className="text-sm font-semibold">{colaborador.nome}</div>
                    <div className="text-xs text-muted-foreground">{colaborador.cargo}</div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Gestor</p>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-muted text-muted-foreground"><User className="h-5 w-5" /></AvatarFallback></Avatar>
                  <div>
                    <div className="text-sm font-semibold">{gestor.nome}</div>
                    <div className="text-xs text-muted-foreground">{gestor.cargo}</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Período de recesso *</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Defina o período para o seu descanso planejado.{" "}
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="text-primary underline">Ver regras de solicitação</button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Regras de Solicitação</h4>
                      <div>
                        <p className="text-xs font-medium">Dias de antecedência:</p>
                        <p className="text-sm">15</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1.5">Dias permitidos para início:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira"].map((d) => (
                            <Badge key={d} variant="secondary" className="font-normal">{d}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </p>
              <div className="flex items-center gap-3">
                <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                <span className="text-sm text-muted-foreground">até</span>
                <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">
                Observações <span className="text-primary text-xs">(opcional)</span>
              </Label>
              <Textarea
                value={obs}
                onChange={(e) => setObs(e.target.value.slice(0, 250))}
                placeholder="Insira uma descrição para a ação"
                className="mt-1"
                rows={4}
              />
              <div className="text-right text-xs text-muted-foreground">{obs.length}/250</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCriarOpen(false); reset(); }}>Cancelar</Button>
            <Button onClick={solicitar} disabled={dias < 1}>
              {dias >= 1 ? `Solicitar ${dias} dia${dias > 1 ? "s" : ""}` : "Solicitar recesso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detalhes da solicitação */}
      <Dialog open={!!detalhe} onOpenChange={(o) => !o && setDetalhesOpen(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalhes da solicitação</DialogTitle>
          </DialogHeader>
          {detalhe && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold">Status da Solicitação</span>
                  <Badge className={statusColor[detalhe.status]} variant="secondary">{detalhe.status}</Badge>
                </div>
                <Stepper status={detalhe.status} />
              </div>

              <div>
                <h3 className="text-base font-semibold mb-3">Informações da Solicitação</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Colaborador</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-muted text-muted-foreground"><User className="h-4 w-4" /></AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-semibold">{colaborador.nome}</div>
                        <div className="text-xs text-muted-foreground">{colaborador.cargo}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gestor</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-muted text-muted-foreground"><User className="h-4 w-4" /></AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-semibold">{detalhe.gestor}</div>
                        <div className="text-xs text-muted-foreground">{detalhe.cargoGestor}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border px-3 py-2 mb-3">
                  <p className="text-xs text-muted-foreground">Total de dias solicitados</p>
                  <p className="text-sm font-semibold">{diffDias(
                    detalhe.inicio.split("/").reverse().join("-"),
                    detalhe.fim.split("/").reverse().join("-"),
                  )}</p>
                </div>

                <Label className="text-sm font-semibold">Período de recesso *</Label>
                <p className="text-xs text-muted-foreground mb-2">Defina o período para o seu descanso planejado.</p>
                <div className="flex items-center gap-3 mb-3">
                  <Input value={detalhe.inicio} readOnly />
                  <span className="text-sm text-muted-foreground">até</span>
                  <Input value={detalhe.fim} readOnly />
                </div>

                <Label className="text-sm font-semibold">
                  Observações <span className="text-primary text-xs">(opcional)</span>
                </Label>
                <Textarea value={detalhe.observacoes} readOnly rows={3} className="mt-1" />
                <div className="text-right text-xs text-muted-foreground">{detalhe.observacoes.length}/250</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetalhesOpen(null)}>Cancelar</Button>
            {detalhe && detalhe.status !== "Cancelada" && detalhe.status !== "Concluída" && (
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => setConfirmCancel(detalhe.id)}>
                Cancelar Solicitação
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar cancelamento */}
      <Dialog open={!!confirmCancel} onOpenChange={(o) => !o && setConfirmCancel(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cancelar solicitação de recesso?
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Este cancelamento resultará em:</p>
            <p>Sua solicitação será cancelada e removida do processo de aprovação.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(null)}>Cancelar</Button>
            <Button onClick={() => confirmCancel && cancelar(confirmCancel)}>Cancelar Solicitação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stepper({ status }: { status: Status }) {
  const idx = status === "Cancelada" ? -1 : STEPS.indexOf(status);
  return (
    <div className="flex items-center justify-between">
      {STEPS.map((s, i) => {
        const done = idx > i;
        const active = idx === i;
        return (
          <div key={s} className="flex-1 flex items-center">
            <div className="flex flex-col items-center">
              <div className={`h-5 w-5 rounded-full border-2 ${done ? "bg-primary border-primary" : active ? "border-primary bg-background" : "border-muted bg-background"}`} />
              <span className={`mt-1 text-[10px] text-center max-w-[80px] leading-tight ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-primary" : "bg-muted"}`} />}
          </div>
        );
      })}
    </div>
  );
}
