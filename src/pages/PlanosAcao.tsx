import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SlidersHorizontal,
  Smile,
  Check,
  AlertTriangle,
  Info,
  ArrowLeft,
  MoreVertical,
  Trash2,
  CalendarIcon,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface Acao {
  id: string;
  nome: string;
  prazo: string;
  responsavel: string;
  concluida: boolean;
}

interface PlanoAcao {
  id: string;
  dataInicial: string;
  dataFinal: string;
  nome: string;
  descricao: string;
  responsavel: string;
  origem: string;
  acoes: Acao[];
  concluido: boolean;
}

const responsaveisOptions = [
  "Ana Silva",
  "Carlos Santos",
  "Maria Oliveira",
  "João Pereira",
  "Fernanda Lima",
];

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

const PlanosAcao = () => {
  const [view, setView] = useState<"list" | "create">("list");
  const [planos, setPlanos] = useState<PlanoAcao[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Create/Edit form
  const [editingPlano, setEditingPlano] = useState<PlanoAcao | null>(null);
  const [formData, setFormData] = useState({
    dataInicial: "",
    dataFinal: "",
    nome: "",
    descricao: "",
    responsavel: "",
    origem: "",
  });
  const [acoes, setAcoes] = useState<Acao[]>([]);
  const [expandedAcoes, setExpandedAcoes] = useState<Set<string>>(new Set());

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [concluirDialogOpen, setConcluirDialogOpen] = useState(false);
  const [targetPlanoId, setTargetPlanoId] = useState<string | null>(null);

  // Expanded planos in list
  const [expandedPlanos, setExpandedPlanos] = useState<Set<string>>(new Set());

  // Stats
  const totalPlanos = planos.length;
  const concluidos = planos.filter((p) => p.concluido).length;
  const encaminhados = planos.filter(
    (p) => !p.concluido && p.acoes.length > 0
  ).length;
  const emAtraso = planos.filter((p) => {
    if (p.concluido) return false;
    const now = new Date().toISOString().split("T")[0];
    return p.dataFinal < now;
  }).length;

  const filtered = planos.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetForm = () => {
    setFormData({
      dataInicial: "",
      dataFinal: "",
      nome: "",
      descricao: "",
      responsavel: "",
      origem: "",
    });
    setAcoes([]);
    setEditingPlano(null);
    setExpandedAcoes(new Set());
  };

  const handleCreateNew = () => {
    resetForm();
    setView("create");
  };

  const handleEdit = (plano: PlanoAcao) => {
    setEditingPlano(plano);
    setFormData({
      dataInicial: plano.dataInicial,
      dataFinal: plano.dataFinal,
      nome: plano.nome,
      descricao: plano.descricao,
      responsavel: plano.responsavel,
      origem: plano.origem,
    });
    setAcoes([...plano.acoes]);
    setExpandedAcoes(new Set());
    setView("create");
  };

  const handleSave = () => {
    if (!formData.nome || !formData.dataInicial || !formData.dataFinal || !formData.responsavel) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (editingPlano) {
      setPlanos((prev) =>
        prev.map((p) =>
          p.id === editingPlano.id
            ? { ...p, ...formData, acoes }
            : p
        )
      );
      toast.success("Plano de Ação atualizado!");
    } else {
      const novo: PlanoAcao = {
        id: crypto.randomUUID(),
        ...formData,
        acoes,
        concluido: false,
      };
      setPlanos((prev) => [...prev, novo]);
      toast.success("Plano de Ação criado!");
    }
    resetForm();
    setView("list");
  };

  const addAcao = () => {
    const id = crypto.randomUUID();
    setAcoes((prev) => [
      ...prev,
      { id, nome: "", prazo: "", responsavel: "", concluida: false },
    ]);
    setExpandedAcoes((prev) => new Set(prev).add(id));
  };

  const removeAcao = (id: string) => {
    setAcoes((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAcao = (id: string, field: keyof Acao, value: string | boolean) => {
    setAcoes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const toggleExpandAcao = (id: string) => {
    setExpandedAcoes((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleDelete = (id: string) => {
    setTargetPlanoId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (targetPlanoId) {
      setPlanos((prev) => prev.filter((p) => p.id !== targetPlanoId));
      toast.success("Plano de Ação excluído!");
    }
    setDeleteDialogOpen(false);
    setTargetPlanoId(null);
  };

  const handleConcluir = (id: string) => {
    setTargetPlanoId(id);
    setConcluirDialogOpen(true);
  };

  const confirmConcluir = () => {
    if (targetPlanoId) {
      setPlanos((prev) =>
        prev.map((p) =>
          p.id === targetPlanoId ? { ...p, concluido: true } : p
        )
      );
      toast.success("Plano de Ação concluído!");
    }
    setConcluirDialogOpen(false);
    setTargetPlanoId(null);
  };

  const handleMarcarAcaoConcluida = (planoId: string, acaoId: string) => {
    setPlanos((prev) =>
      prev.map((p) =>
        p.id === planoId
          ? {
              ...p,
              acoes: p.acoes.map((a) =>
                a.id === acaoId ? { ...a, concluida: true } : a
              ),
            }
          : p
      )
    );
    toast.success("Ação marcada como concluída!");
  };

  const toggleExpandPlano = (id: string) => {
    setExpandedPlanos((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ─── CREATE / EDIT VIEW ─────────────────────────────────
  if (view === "create") {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                resetForm();
                setView("list");
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">
              {editingPlano ? "Editar plano de ação" : "Criar plano de ação"}
            </h1>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Informações básicas</h2>
              <p className="text-sm text-orange-600 mb-4">* Campos obrigatórios</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Data inicial do plano <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9"
                    value={formData.dataInicial}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, dataInicial: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Data final do plano <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9"
                    value={formData.dataFinal}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, dataFinal: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Nome do plano <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Nome do plano"
                maxLength={255}
                value={formData.nome}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, nome: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {formData.nome.length}/255
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Descrição do plano{" "}
                <span className="text-primary text-xs">(opcional)</span>
              </label>
              <Textarea
                placeholder="Descreva o plano"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, descricao: e.target.value }))
                }
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Responsáveis pelo plano <span className="text-destructive">*</span>
              </label>
              <Select
                value={formData.responsavel}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, responsavel: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveisOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Origem do plano{" "}
                <span className="text-primary text-xs">(opcional)</span>
                <Info className="inline h-3.5 w-3.5 ml-1 text-muted-foreground" />
              </label>
              <Input
                placeholder=""
                maxLength={255}
                value={formData.origem}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, origem: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {formData.origem.length}/255
              </p>
            </div>

            {/* Ações */}
            <div>
              <h2 className="text-lg font-semibold text-primary mb-2">Ações</h2>

              {acoes.length === 0 && (
                <p className="text-sm text-muted-foreground mb-3">
                  Nenhuma ação foi criada ainda. Clique no botão abaixo para
                  adicionar uma nova ação.
                </p>
              )}

              <div className="space-y-4 mb-4">
                {acoes.map((acao) => {
                  const expanded = expandedAcoes.has(acao.id);
                  return (
                    <Card key={acao.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {acao.nome || "Nova ação"}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive h-8 w-8"
                            onClick={() => removeAcao(acao.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleExpandAcao(acao.id)}
                          >
                            {expanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {expanded && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3">
                            <div>
                              <label className="text-sm font-medium mb-1 block">
                                Nome da ação <span className="text-destructive">*</span>
                              </label>
                              <Input
                                placeholder="Ex.: Envio de Feedback"
                                maxLength={255}
                                value={acao.nome}
                                onChange={(e) =>
                                  updateAcao(acao.id, "nome", e.target.value)
                                }
                              />
                              <p className="text-xs text-muted-foreground text-right mt-1">
                                {acao.nome.length}/255
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">
                                Prazo <span className="text-destructive">*</span>
                              </label>
                              <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="date"
                                  className="pl-9"
                                  value={acao.prazo}
                                  onChange={(e) =>
                                    updateAcao(acao.id, "prazo", e.target.value)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Responsáveis pela ação{" "}
                              <span className="text-destructive">*</span>
                            </label>
                            <Select
                              value={acao.responsavel}
                              onValueChange={(v) =>
                                updateAcao(acao.id, "responsavel", v)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {responsaveisOptions.map((r) => (
                                  <SelectItem key={r} value={r}>
                                    {r}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              <Button
                variant="outline"
                className="w-full bg-muted/50"
                onClick={addAcao}
              >
                + Nova ação
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-[#1a365d] hover:bg-[#1a365d]/90 text-white">
            Salvar Plano de Ação
          </Button>
        </div>
      </div>
    );
  }

  // ─── LIST VIEW ──────────────────────────────────────────
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Planos de ação</h1>
          <Button
            onClick={handleCreateNew}
            className="bg-[#1a365d] hover:bg-[#1a365d]/90 text-white"
          >
            Criar Plano de Ação
          </Button>
        </div>

        {/* Stats */}
        <p className="text-sm font-medium text-muted-foreground mb-2">
          Visão Geral
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{totalPlanos}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Planos de Ação <Info className="h-3.5 w-3.5" />
              </p>
            </div>
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{concluidos}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Concluídos <Info className="h-3.5 w-3.5" />
              </p>
            </div>
            <Smile className="h-5 w-5 text-muted-foreground" />
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{encaminhados}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Encaminhados <Info className="h-3.5 w-3.5" />
              </p>
            </div>
            <Check className="h-5 w-5 text-muted-foreground" />
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{emAtraso}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Em atraso <Info className="h-3.5 w-3.5" />
              </p>
            </div>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquise pelo nome do plano ou responsável"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* List */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-16 w-16 text-primary/30 mb-4" />
            <p className="text-muted-foreground">
              Ops! Não encontramos nenhum resultado para sua busca.
            </p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setSearchTerm("")}
            >
              Limpar busca
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paginated.map((plano) => {
              const expanded = expandedPlanos.has(plano.id);
              const acoesConcluidas = plano.acoes.filter((a) => a.concluida).length;
              return (
                <Card key={plano.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{plano.nome}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 text-sm text-muted-foreground mt-1">
                        <span>
                          · De {formatDate(plano.dataInicial)} até{" "}
                          {formatDate(plano.dataFinal)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {acoesConcluidas}/{plano.acoes.length} Ações finalizadas
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <CalendarIcon className="h-3.5 w-3.5" /> Período
                        </p>
                        <p>
                          {formatDate(plano.dataInicial)}
                          <br />
                          até {formatDate(plano.dataFinal)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">Responsáveis</p>
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold mx-auto mt-1">
                          {plano.responsavel.charAt(0)}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(plano)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          {!plano.concluido && (
                            <DropdownMenuItem
                              onClick={() => handleConcluir(plano.id)}
                            >
                              <Check className="h-4 w-4 mr-2" /> Marcar como
                              concluído
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(plano.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleExpandPlano(plano.id)}
                      >
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-4 border-t pt-4 space-y-3">
                      {plano.acoes.map((acao) => (
                        <div
                          key={acao.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                              {acao.responsavel.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{acao.nome}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Prazo {formatDate(acao.prazo)}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    acao.concluida
                                      ? "bg-green-100 text-green-700"
                                      : "bg-orange-100 text-orange-700"
                                  }`}
                                >
                                  {acao.concluida ? "Concluída" : "Em andamento"}
                                </span>
                              </div>
                            </div>
                          </div>
                          {!acao.concluida && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleMarcarAcaoConcluida(plano.id, acao.id)
                              }
                            >
                              <Check className="h-3.5 w-3.5 mr-1" /> Marcar como
                              concluído
                            </Button>
                          )}
                        </div>
                      ))}
                      {plano.acoes.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma ação cadastrada.
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between mt-6 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span>Itens por página:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(v) => {
                setItemsPerPage(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-muted-foreground">
            {filtered.length === 0
              ? "1 - 0 de 0 itens"
              : `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                  currentPage * itemsPerPage,
                  filtered.length
                )} de ${filtered.length} itens`}
          </span>
          <div className="flex items-center gap-2">
            <Select
              value={String(currentPage)}
              onValueChange={(v) => setCurrentPage(Number(v))}
            >
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">de {totalPages} páginas</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-destructive">◆</span> Excluir Plano de Ação?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>Isso resultará na remoção definitiva do Plano de Ação.</p>
            <p className="text-muted-foreground">
              Todos os responsáveis pelo plano e ações serão notificados por
              e-mail.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir Plano de Ação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Concluir Dialog */}
      <Dialog open={concluirDialogOpen} onOpenChange={setConcluirDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-yellow-500">⚠</span> Concluir Plano de Ação?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p className="font-medium">Existem ações pendentes neste plano.</p>
            <p className="text-muted-foreground">
              Ao marcá-lo como concluído, ele será finalizado e não será mais
              possível concluir ações pendentes. Deseja continuar?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConcluirDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmConcluir}
              className="bg-[#1a365d] hover:bg-[#1a365d]/90 text-white"
            >
              Concluir Plano de Ação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanosAcao;
