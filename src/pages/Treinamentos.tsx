import { useState, useMemo } from "react";
import { Plus, Search, GraduationCap, Users, CheckCircle2, Clock, Bell, FileText, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Participante {
  id: string;
  nome: string;
  cargo: string;
  departamento: string;
  aprendizado?: string;
  registradoEm?: string;
}

interface Treinamento {
  id: string;
  assunto: string;
  resumo: string;
  aplicadoPor: string;
  data: string;
  participantes: Participante[];
}

// Lista mock de colaboradores disponíveis para selecionar
const colaboradoresMock = [
  { id: "1", nome: "Ana Silva", cargo: "Analista de RH", departamento: "Recursos Humanos" },
  { id: "2", nome: "Bruno Costa", cargo: "Desenvolvedor", departamento: "Tecnologia" },
  { id: "3", nome: "Carla Mendes", cargo: "Designer", departamento: "Marketing" },
  { id: "4", nome: "Daniel Souza", cargo: "Coordenador", departamento: "Operações" },
  { id: "5", nome: "Eduarda Lima", cargo: "Analista Financeiro", departamento: "Financeiro" },
  { id: "6", nome: "Felipe Rocha", cargo: "Vendedor", departamento: "Comercial" },
];

export default function Treinamentos() {
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [busca, setBusca] = useState("");
  const [openRegistrar, setOpenRegistrar] = useState(false);
  const [openSelecionarParticipantes, setOpenSelecionarParticipantes] = useState(false);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [openAprendizado, setOpenAprendizado] = useState(false);
  const [treinamentoSelecionado, setTreinamentoSelecionado] = useState<Treinamento | null>(null);
  const [participanteAtivo, setParticipanteAtivo] = useState<Participante | null>(null);

  // Form do treinamento
  const [assunto, setAssunto] = useState("");
  const [resumo, setResumo] = useState("");
  const [participantesSelecionados, setParticipantesSelecionados] = useState<string[]>([]);
  const [buscaParticipante, setBuscaParticipante] = useState("");

  // Aprendizado
  const [textoAprendizado, setTextoAprendizado] = useState("");

  const treinamentosFiltrados = useMemo(() => {
    if (!busca) return treinamentos;
    const t = busca.toLowerCase();
    return treinamentos.filter(
      (tr) => tr.assunto.toLowerCase().includes(t) || tr.resumo.toLowerCase().includes(t),
    );
  }, [treinamentos, busca]);

  const colaboradoresFiltrados = useMemo(() => {
    if (!buscaParticipante) return colaboradoresMock;
    const t = buscaParticipante.toLowerCase();
    return colaboradoresMock.filter(
      (c) => c.nome.toLowerCase().includes(t) || c.cargo.toLowerCase().includes(t),
    );
  }, [buscaParticipante]);

  const totalParticipantes = treinamentos.reduce((acc, t) => acc + t.participantes.length, 0);
  const totalRegistrados = treinamentos.reduce(
    (acc, t) => acc + t.participantes.filter((p) => p.aprendizado).length,
    0,
  );
  const pendentesAprendizado = totalParticipantes - totalRegistrados;

  function resetForm() {
    setAssunto("");
    setResumo("");
    setParticipantesSelecionados([]);
    setBuscaParticipante("");
  }

  function handleRegistrarTreinamento() {
    if (!assunto.trim() || !resumo.trim()) {
      toast.error("Preencha o assunto e o resumo do treinamento");
      return;
    }
    if (participantesSelecionados.length === 0) {
      toast.error("Selecione pelo menos um participante");
      return;
    }

    const participantes: Participante[] = colaboradoresMock
      .filter((c) => participantesSelecionados.includes(c.id))
      .map((c) => ({
        id: c.id,
        nome: c.nome,
        cargo: c.cargo,
        departamento: c.departamento,
      }));

    const novo: Treinamento = {
      id: crypto.randomUUID(),
      assunto,
      resumo,
      aplicadoPor: "Admin RH",
      data: new Date().toISOString(),
      participantes,
    };

    setTreinamentos([novo, ...treinamentos]);
    toast.success(`Treinamento registrado! ${participantes.length} participante(s) notificado(s).`);
    resetForm();
    setOpenRegistrar(false);
  }

  function abrirAprendizado(treinamento: Treinamento, participante: Participante) {
    setTreinamentoSelecionado(treinamento);
    setParticipanteAtivo(participante);
    setTextoAprendizado(participante.aprendizado || "");
    setOpenAprendizado(true);
  }

  function salvarAprendizado() {
    if (!textoAprendizado.trim()) {
      toast.error("Descreva o que você aprendeu");
      return;
    }
    if (!treinamentoSelecionado || !participanteAtivo) return;

    setTreinamentos((prev) =>
      prev.map((t) =>
        t.id === treinamentoSelecionado.id
          ? {
              ...t,
              participantes: t.participantes.map((p) =>
                p.id === participanteAtivo.id
                  ? { ...p, aprendizado: textoAprendizado, registradoEm: new Date().toISOString() }
                  : p,
              ),
            }
          : t,
      ),
    );

    // Atualizar treinamento selecionado se detalhe estiver aberto
    setTreinamentoSelecionado((prev) =>
      prev
        ? {
            ...prev,
            participantes: prev.participantes.map((p) =>
              p.id === participanteAtivo.id
                ? { ...p, aprendizado: textoAprendizado, registradoEm: new Date().toISOString() }
                : p,
            ),
          }
        : prev,
    );

    toast.success("Aprendizado registrado no PDI do colaborador!");
    setOpenAprendizado(false);
    setTextoAprendizado("");
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Treinamentos</h1>
          <p className="text-sm text-muted-foreground">
            Registre treinamentos aplicados e acompanhe o aprendizado dos participantes
          </p>
        </div>
        <Button onClick={() => setOpenRegistrar(true)}>
          <Plus className="h-4 w-4" />
          Registrar treinamento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Treinamentos</p>
              <p className="text-2xl font-semibold">{treinamentos.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Participantes</p>
              <p className="text-2xl font-semibold">{totalParticipantes}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Aprendizados registrados</p>
              <p className="text-2xl font-semibold">{totalRegistrados}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-semibold">{pendentesAprendizado}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por assunto ou conteúdo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista */}
      {treinamentosFiltrados.length === 0 ? (
        <Card className="p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-medium">Nenhum treinamento registrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Registre o primeiro treinamento aplicado pela equipe
          </p>
          <Button className="mt-4" onClick={() => setOpenRegistrar(true)}>
            <Plus className="h-4 w-4" />
            Registrar treinamento
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {treinamentosFiltrados.map((t) => {
            const registrados = t.participantes.filter((p) => p.aprendizado).length;
            return (
              <Card key={t.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{t.assunto}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(t.data), "dd/MM/yyyy", { locale: ptBR })}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.resumo}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Aplicado por {t.aplicadoPor}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {t.participantes.length} participante(s)
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        {registrados}/{t.participantes.length} registraram aprendizado
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTreinamentoSelecionado(t);
                      setOpenDetalhes(true);
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    Ver detalhes
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog: Registrar treinamento */}
      <Dialog open={openRegistrar} onOpenChange={setOpenRegistrar}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar treinamento aplicado</DialogTitle>
            <DialogDescription>
              Informe o assunto, resumo e selecione os participantes. Eles receberão uma notificação
              para registrar o que aprenderam.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Assunto do treinamento *</Label>
              <Input
                placeholder="Ex.: Atendimento ao cliente"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Resumo do treinamento *</Label>
              <Textarea
                placeholder="Descreva o conteúdo abordado, objetivos e principais pontos..."
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
                rows={5}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Participantes *</Label>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-md border p-2 min-h-[42px]">
                {participantesSelecionados.length === 0 ? (
                  <span className="text-sm text-muted-foreground">Nenhum selecionado</span>
                ) : (
                  colaboradoresMock
                    .filter((c) => participantesSelecionados.includes(c.id))
                    .map((c) => (
                      <Badge key={c.id} variant="secondary" className="gap-1">
                        {c.nome}
                        <button
                          onClick={() =>
                            setParticipantesSelecionados((prev) => prev.filter((id) => id !== c.id))
                          }
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenSelecionarParticipantes(true)}
                  className="ml-auto"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setOpenRegistrar(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleRegistrarTreinamento}>
              <Bell className="h-4 w-4" />
              Registrar e notificar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Selecionar participantes */}
      <Dialog open={openSelecionarParticipantes} onOpenChange={setOpenSelecionarParticipantes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar participantes</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar colaborador..."
              value={buscaParticipante}
              onChange={(e) => setBuscaParticipante(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-72">
            <div className="space-y-1">
              {colaboradoresFiltrados.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
                >
                  <Checkbox
                    checked={participantesSelecionados.includes(c.id)}
                    onCheckedChange={(checked) => {
                      setParticipantesSelecionados((prev) =>
                        checked ? [...prev, c.id] : prev.filter((id) => id !== c.id),
                      );
                    }}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {c.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.cargo} · {c.departamento}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setOpenSelecionarParticipantes(false)}>
              Confirmar ({participantesSelecionados.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Detalhes do treinamento */}
      <Dialog open={openDetalhes} onOpenChange={setOpenDetalhes}>
        <DialogContent className="max-w-2xl">
          {treinamentoSelecionado && (
            <>
              <DialogHeader>
                <DialogTitle>{treinamentoSelecionado.assunto}</DialogTitle>
                <DialogDescription>
                  Aplicado em{" "}
                  {format(new Date(treinamentoSelecionado.data), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}{" "}
                  por {treinamentoSelecionado.aplicadoPor}
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="participantes">
                    Participantes ({treinamentoSelecionado.participantes.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="resumo" className="mt-4">
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {treinamentoSelecionado.resumo}
                  </p>
                </TabsContent>
                <TabsContent value="participantes" className="mt-4">
                  <ScrollArea className="h-80">
                    <div className="space-y-2">
                      {treinamentoSelecionado.participantes.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-md border p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="text-xs">
                                  {p.nome
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{p.nome}</p>
                                <p className="text-xs text-muted-foreground">{p.cargo}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {p.aprendizado ? (
                                <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Registrado
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                  <Clock className="h-3 w-3" />
                                  Pendente
                                </Badge>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => abrirAprendizado(treinamentoSelecionado, p)}
                              >
                                {p.aprendizado ? "Ver/Editar" : "Registrar"}
                              </Button>
                            </div>
                          </div>
                          {p.aprendizado && (
                            <div className="mt-3 rounded-md bg-muted/50 p-3">
                              <p className="text-xs font-medium text-muted-foreground">
                                Aprendizado registrado:
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-sm">{p.aprendizado}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Registrar aprendizado (visão participante) */}
      <Dialog open={openAprendizado} onOpenChange={setOpenAprendizado}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar aprendizado</DialogTitle>
            <DialogDescription>
              {participanteAtivo?.nome} · {treinamentoSelecionado?.assunto}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>O que você aprendeu com esse treinamento?</Label>
            <Textarea
              placeholder="Descreva os principais aprendizados, como pretende aplicar no dia a dia..."
              value={textoAprendizado}
              onChange={(e) => setTextoAprendizado(e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Esse registro será salvo automaticamente no PDI do colaborador.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAprendizado(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarAprendizado}>Salvar no PDI</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
