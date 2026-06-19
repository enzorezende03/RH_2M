import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Search, Folder, Pencil, Trash2, ArrowLeft, MoreVertical, Upload, Download,
  Eye, FileUp, X, FileText,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { downloadFile } from "@/lib/download";

type Modalidade = "data_nome" | "cpf";
interface Periodo {
  id: string;
  periodoMes: string; // YYYY-MM
  descricao: string;
  modalidade: Modalidade;
}
interface HoleriteRow {
  id: string;
  colaborador_id: string;
  arquivo_path: string | null;
  dados: any;
}

const STORE_KEY = "holerites_periodos_v1";
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function periodoLabel(p: Periodo) {
  if (!p.periodoMes) return "—";
  const [y, m] = p.periodoMes.split("-");
  return `${MESES[Number(m) - 1]} ${y}`;
}

function loadPeriodos(): Periodo[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}
function savePeriodos(list: Periodo[]) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

const SEED: Periodo[] = [
  { id: "seed-1", periodoMes: "2026-06", descricao: "Férias", modalidade: "data_nome" },
  { id: "seed-2", periodoMes: "2026-05", descricao: "Salário 05/2026", modalidade: "data_nome" },
  { id: "seed-3", periodoMes: "2026-05", descricao: "Férias", modalidade: "data_nome" },
  { id: "seed-4", periodoMes: "2026-04", descricao: "salário 04/2026", modalidade: "data_nome" },
  { id: "seed-5", periodoMes: "2026-03", descricao: "Salário 03/2026", modalidade: "data_nome" },
  { id: "seed-6", periodoMes: "2026-03", descricao: "Férias", modalidade: "data_nome" },
  { id: "seed-7", periodoMes: "2026-02", descricao: "salário 02/2026", modalidade: "data_nome" },
  { id: "seed-8", periodoMes: "2026-02", descricao: "Informe de Rendimentos 2025", modalidade: "data_nome" },
  { id: "seed-9", periodoMes: "2026-02", descricao: "Férias", modalidade: "data_nome" },
  { id: "seed-10", periodoMes: "2026-02", descricao: "1ª parcela 13º", modalidade: "data_nome" },
  { id: "seed-11", periodoMes: "2026-01", descricao: "1ª parcela 13º", modalidade: "data_nome" },
  { id: "seed-12", periodoMes: "2026-01", descricao: "Salário 01/2026", modalidade: "data_nome" },
  { id: "seed-13", periodoMes: "2025-12", descricao: "salário 12/2025", modalidade: "data_nome" },
  { id: "seed-14", periodoMes: "2025-12", descricao: "Férias coletivas", modalidade: "data_nome" },
  { id: "seed-15", periodoMes: "2025-12", descricao: "13º Salário", modalidade: "data_nome" },
];

export default function HoleritesRH() {
  const [lista, setLista] = useState<Periodo[]>(() => {
    const saved = loadPeriodos();
    return saved.length ? saved : SEED;
  });
  const [busca, setBusca] = useState("");
  const [pInicial, setPInicial] = useState("");
  const [pFinal, setPFinal] = useState("");
  const [aberto, setAberto] = useState<Periodo | null>(null);


  // dialogs
  const [novoOpen, setNovoOpen] = useState(false);
  const [editing, setEditing] = useState<Periodo | null>(null);
  const [form, setForm] = useState<{ periodoMes: string; descricao: string; modalidade: Modalidade | "" }>({
    periodoMes: "", descricao: "", modalidade: "",
  });

  useEffect(() => { savePeriodos(lista); }, [lista]);

  const filtrada = useMemo(() => {
    return lista.filter((p) => {
      if (busca && !(p.descricao.toLowerCase().includes(busca.toLowerCase()) || periodoLabel(p).toLowerCase().includes(busca.toLowerCase()))) return false;
      if (pInicial && p.periodoMes < pInicial) return false;
      if (pFinal && p.periodoMes > pFinal) return false;
      return true;
    });
  }, [lista, busca, pInicial, pFinal]);

  function abrirNovo() {
    setEditing(null);
    setForm({ periodoMes: "", descricao: "", modalidade: "" });
    setNovoOpen(true);
  }
  function abrirEdicao(p: Periodo) {
    setEditing(p);
    setForm({ periodoMes: p.periodoMes, descricao: p.descricao, modalidade: p.modalidade });
    setNovoOpen(true);
  }
  function salvar() {
    if (!form.periodoMes) { toast({ title: "O período é obrigatório", variant: "destructive" }); return; }
    if (editing) {
      setLista((l) => l.map((p) => p.id === editing.id ? { ...editing, ...form, modalidade: (form.modalidade || "data_nome") as Modalidade } : p));
      toast({ title: "Período atualizado" });
    } else {
      setLista((l) => [{ id: crypto.randomUUID(), periodoMes: form.periodoMes, descricao: form.descricao, modalidade: (form.modalidade || "data_nome") as Modalidade }, ...l]);
      toast({ title: "Período criado" });
    }
    setNovoOpen(false);
  }
  function excluirPeriodo(id: string) {
    if (!confirm("Excluir este período?")) return;
    setLista((l) => l.filter((p) => p.id !== id));
    toast({ title: "Período excluído" });
  }
  function excluirTodos() {
    if (!confirm("Excluir TODOS os holerites? Esta ação não pode ser desfeita.")) return;
    setLista([]);
    toast({ title: "Todos os holerites foram excluídos" });
  }

  if (aberto) {
    return <PeriodoDetalhe periodo={aberto} onBack={() => setAberto(null)} />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Holerites</h1>
            <p className="text-sm text-muted-foreground">
              Escolha ou crie um novo período para enviar os holerites dos colaboradores da empresa
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={abrirNovo}>Novo Período</Button>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <Label className="text-sm font-semibold">Descrição do período</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquise pela descrição do período" className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Período inicial</Label>
            <Input type="month" value={pInicial} onChange={(e) => setPInicial(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-sm font-semibold">Período final</Label>
            <Input type="month" value={pFinal} onChange={(e) => setPFinal(e.target.value)} className="mt-1" />
          </div>
        </div>

        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Descrição do Período</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrada.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      <span>{periodoLabel(p)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{p.descricao || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-3">
                      <button className="text-primary text-sm hover:underline" onClick={() => setAberto(p)}>Abrir</button>
                      <Button variant="ghost" size="icon" onClick={() => abrirEdicao(p)} title="Editar período">
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => excluirPeriodo(p.id)} title="Excluir período">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtrada.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">
                    Nenhum período encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar período" : "Novo período"}</DialogTitle>
            <DialogDescription>Selecione um mês para {editing ? "editar" : "adicionar"} um período.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Período <span className="text-destructive">*</span></Label>
              <Input type="month" value={form.periodoMes} onChange={(e) => setForm({ ...form, periodoMes: e.target.value })} className="mt-1" />
              {!form.periodoMes && <p className="text-xs text-destructive mt-1">O período é obrigatório</p>}
            </div>
            <div>
              <Label>Descrição do Período <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input maxLength={60} placeholder="Ex: 1ª parcela 13º" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} className="mt-1" />
              <p className="text-xs text-muted-foreground text-right">{form.descricao.length}/60</p>
            </div>
            <div>
              <Label>Modalidade de distribuição</Label>
              <p className="text-xs text-muted-foreground mb-2">O documento será distribuído para os colaboradores de acordo com a opção abaixo</p>
              <RadioGroup value={form.modalidade} onValueChange={(v) => setForm({ ...form, modalidade: v as Modalidade })}>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="data_nome" id="m1" />
                  <Label htmlFor="m1" className="font-normal">Data de admissão + Nome Completo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cpf" id="m2" />
                  <Label htmlFor="m2" className="font-normal">CPF</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={!form.periodoMes}>{editing ? "Salvar" : "Adicionar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================================================== */

function PeriodoDetalhe({ periodo, onBack }: { periodo: Periodo; onBack: () => void }) {
  const { colaboradores, loading: loadingColabs } = useColaboradores();
  const [busca, setBusca] = useState("");
  const [statusColab, setStatusColab] = useState<string>("todos");
  const [departamento, setDepartamento] = useState<string>("todos");
  const [statusDoc, setStatusDoc] = useState<string>("todos");
  const [rows, setRows] = useState<HoleriteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [importTarget, setImportTarget] = useState<string | null>(null); // colaborador_id; null = all
  const [viewing, setViewing] = useState<{ url: string; nome: string } | null>(null);

  const [mes, ano] = periodo.periodoMes ? periodo.periodoMes.split("-").map(Number) : [0, 0];

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("holerites").select("*")
      .eq("mes", mes).eq("ano", ano).eq("tipo", periodo.id);
    setRows((data ?? []) as any);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [periodo.id]);

  const rowByColab = useMemo(() => {
    const m = new Map<string, HoleriteRow>();
    rows.forEach((r) => m.set(r.colaborador_id, r));
    return m;
  }, [rows]);

  const departamentos = useMemo(() => Array.from(new Set(colaboradores.map((c) => c.departamento).filter(Boolean))), [colaboradores]);

  const filtered = useMemo(() => {
    return colaboradores.filter((c) => {
      if (busca && !c.nomeCompleto.toLowerCase().includes(busca.toLowerCase())) return false;
      if (statusColab === "ocultar_desligados" && c.status === "Desligado") return false;
      if (["Ativo","Desativado","Desligado"].includes(statusColab) && c.status !== statusColab) return false;
      if (departamento !== "todos" && c.departamento !== departamento) return false;
      if (statusDoc !== "todos") {
        const r = rowByColab.get(c.id);
        const enviado = !!r?.arquivo_path;
        if (statusDoc === "enviado" && !enviado) return false;
        if (statusDoc === "sem_arquivo" && enviado) return false;
        if (statusDoc === "pronto" && !enviado) return false; // simple mapping
      }
      return true;
    });
  }, [colaboradores, busca, statusColab, departamento, statusDoc, rowByColab]);

  const handleUpload = async (file: File, colaboradorId: string | null) => {
    const targets = colaboradorId ? [colaboradorId] : filtered.map((c) => c.id);
    for (const cid of targets) {
      const path = `${periodo.id}/${cid}.pdf`;
      const { error: upErr } = await supabase.storage.from("holerites").upload(path, file, { upsert: true, contentType: file.type || "application/pdf" });
      if (upErr) { toast({ title: "Erro no upload", description: upErr.message, variant: "destructive" }); continue; }
      const payload = {
        colaborador_id: cid,
        mes, ano, tipo: periodo.id,
        arquivo_path: path,
        dados: { periodo_id: periodo.id, periodo_nome: periodoLabel(periodo), descricao: periodo.descricao, modalidade: periodo.modalidade },
      };
      const existing = rowByColab.get(cid);
      if (existing) {
        await supabase.from("holerites").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("holerites").insert(payload);
      }
    }
    toast({ title: "Holerite importado com sucesso" });
    setImportOpen(false);
    setImportTarget(null);
    load();
  };

  const handleView = async (path: string) => {
    const { data, error } = await supabase.storage.from("holerites").createSignedUrl(path, 300);
    if (error || !data) { toast({ title: "Erro ao abrir", description: error?.message, variant: "destructive" }); return; }
    setViewing({ url: data.signedUrl, nome: path.split("/").pop() || "holerite.pdf" });
  };
  const handleDownload = async (path: string) => {
    const { data, error } = await supabase.storage.from("holerites").createSignedUrl(path, 60);
    if (error || !data) { toast({ title: "Erro", description: error?.message, variant: "destructive" }); return; }
    await downloadFile(data.signedUrl, path.split("/").pop() || "holerite.pdf");
  };
  const handleDelete = async (row: HoleriteRow) => {
    if (!confirm("Excluir o holerite deste colaborador?")) return;
    if (row.arquivo_path) await supabase.storage.from("holerites").remove([row.arquivo_path]);
    await supabase.from("holerites").delete().eq("id", row.id);
    toast({ title: "Holerite excluído" });
    load();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-2xl font-bold">Holerites de {periodoLabel(periodo)}</h1>
              <p className="text-sm text-muted-foreground">{periodo.descricao || "—"}</p>
              <Badge variant="secondary" className="mt-2">Modalidade: {periodo.modalidade === "cpf" ? "CPF" : "Data + Nome"}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => { setImportTarget(null); setImportOpen(true); }}>
              <Upload className="h-4 w-4 mr-2" /> Importar Holerites
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-destructive" onClick={async () => {
                  if (!confirm("Excluir todos os holerites deste período?")) return;
                  for (const r of rows) {
                    if (r.arquivo_path) await supabase.storage.from("holerites").remove([r.arquivo_path]);
                    await supabase.from("holerites").delete().eq("id", r.id);
                  }
                  toast({ title: "Holerites excluídos" });
                  load();
                }}>Excluir todos os holerites</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div>
            <Label className="text-sm font-semibold">Colaborador</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquise colaboradores" className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Status do Colaborador</Label>
            <div className="relative mt-1">
              <Select value={statusColab} onValueChange={setStatusColab}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Desativado">Desativado</SelectItem>
                  <SelectItem value="Desligado">Desligado</SelectItem>
                  <SelectItem value="ocultar_desligados">Ocultar Desligados</SelectItem>
                </SelectContent>
              </Select>
              {statusColab !== "ocultar_desligados" && (
                <button className="absolute right-9 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setStatusColab("ocultar_desligados")}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Departamento</Label>
            <Select value={departamento} onValueChange={setDepartamento}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {departamentos.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-semibold">Status do Documento</Label>
            <Select value={statusDoc} onValueChange={setStatusDoc}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sem_arquivo">Sem arquivo</SelectItem>
                <SelectItem value="pronto">Pronto para envio</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Data de Admissão</TableHead>
                <TableHead>Status do documento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(loading || loadingColabs) && (
                <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">Carregando…</TableCell></TableRow>
              )}
              {!loading && !loadingColabs && filtered.map((c) => {
                const r = rowByColab.get(c.id);
                const enviado = !!r?.arquivo_path;
                const dc = (c.dadosCompletos as any) || {};
                const admRaw = dc["Data Admissão"] || dc["Data de Admissão"] || dc.data_admissao || dc.dataAdmissao || "";
                const adm = typeof admRaw === "string" && admRaw.toLowerCase().includes("colaborador sem data de admissão")
                  ? "—"
                  : (typeof admRaw === "string" && admRaw.includes(" ") ? admRaw.split(" ")[0] : (admRaw || "—"));

                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.nomeCompleto}</div>
                      <div className="text-xs text-muted-foreground">{c.cargo}</div>
                    </TableCell>
                    <TableCell>{adm}</TableCell>
                    <TableCell>
                      {enviado
                        ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Enviado</Badge>
                        : <Badge variant="secondary">Sem arquivo</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button variant="ghost" size="icon" disabled={!enviado} onClick={() => r && handleView(r.arquivo_path!)} title="Visualizar">
                          <Eye className={"h-4 w-4 " + (enviado ? "text-primary" : "text-muted-foreground")} />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={!enviado} onClick={() => r && handleDownload(r.arquivo_path!)} title="Baixar">
                          <Download className={"h-4 w-4 " + (enviado ? "text-primary" : "text-muted-foreground")} />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={enviado} onClick={() => { setImportTarget(c.id); setImportOpen(true); }} title="Importar">
                          <FileUp className={"h-4 w-4 " + (enviado ? "text-muted-foreground" : "text-primary")} />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={!enviado} onClick={() => r && handleDelete(r)} title="Excluir">
                          <Trash2 className={"h-4 w-4 " + (enviado ? "text-destructive" : "text-muted-foreground")} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loading && !loadingColabs && filtered.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">Nenhum colaborador encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <ImportDialog
        open={importOpen}
        onOpenChange={(o) => { setImportOpen(o); if (!o) setImportTarget(null); }}
        onConfirm={(f) => handleUpload(f, importTarget)}
      />

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{viewing?.nome}</DialogTitle>
          </DialogHeader>
          {viewing && <iframe src={viewing.url} className="w-full h-full" title="Holerite" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ImportDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: (f: File) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!open) setFile(null); }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Holerites</DialogTitle>
          <DialogDescription>Faça o upload do arquivo contendo os holerites dos colaboradores</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="font-semibold">O que você precisa saber antes de iniciar uma importação?</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>O holerite precisa conter <strong>CPF</strong> dos colaboradores e eles devem corresponder exatamente como estão cadastrados.</li>
            <li>Deve ser um <strong>único arquivo PDF</strong> contendo todos os holerites separados em páginas.</li>
            <li>Tamanho máximo do arquivo <strong>15MB</strong>.</li>
          </ul>

          <div
            className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/30"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
          >
            <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
            {file
              ? <p className="text-foreground font-medium">{file.name}</p>
              : <p className="text-primary">Clique aqui ou arraste e solte o arquivo nesta área para realizar o upload</p>}
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!file || (file && file.size > 15 * 1024 * 1024)} onClick={() => file && onConfirm(file)}>Importar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
