import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const QUESITOS = [
  { code: "Q1", nome: "Qualidade" },
  { code: "Q2", nome: "Interesse pelo Trabalho" },
  { code: "Q3", nome: "Relacionamento com a Equipe" },
  { code: "Q4", nome: "Organização e Método" },
  { code: "Q5", nome: "Trabalho em Equipe" },
];

type Colaborador = { id: string; nome: string };
type Ocorrencia = {
  id: string;
  colaborador_id: string;
  data_ocorrencia: string;
  tipo: "Positiva" | "Negativa";
  quesito_codigo: string;
  etapa_referencia: string | null;
  descricao: string | null;
  created_at: string;
};

type Ciclo = { id: string; nome: string };

export default function Ocorrencias() {
  const { user } = useAuth();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroColab, setFiltroColab] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const anoAtual = new Date().getFullYear();
  const anosDisponiveis = Array.from({ length: 6 }, (_, i) => anoAtual - 2 + i);
  const emptyForm = {
    colaborador_id: "",
    data: new Date(),
    tipo: "Positiva" as "Positiva" | "Negativa",
    quesito_codigo: "",
    etapa_tipo: "",
    ano: String(anoAtual),
    descricao: "",
  };
  const [form, setForm] = useState(emptyForm);

  const ETAPAS_TIPO: { value: string; label: string }[] = [
    { value: "inicial_pdi", label: "Feedback Inicial / PDI" },
    { value: "ajuste_curso", label: "Feedback de Ajuste de Curso" },
    { value: "encerramento", label: "Feedback de Encerramento" },
  ];



  async function loadAll() {
    setLoading(true);
    const [{ data: colabs }, { data: ocs }, { data: cs }] = await Promise.all([
      supabase.from("colaboradores").select("id, nome_completo").order("nome_completo"),
      (supabase as any).from("ocorrencias").select("*").order("data_ocorrencia", { ascending: false }),
      (supabase as any).from("ciclos_avaliacao").select("id, nome").order("nome"),
    ]);
    setColaboradores(((colabs ?? []) as any[]).map((c) => ({ id: c.id, nome: c.nome_completo })));
    setOcorrencias((ocs ?? []) as Ocorrencia[]);
    setCiclos(((cs ?? []) as Ciclo[]));
    setLoading(false);
  }


  useEffect(() => { loadAll(); }, []);

  const nomeById = useMemo(() => {
    const m = new Map<string, string>();
    colaboradores.forEach((c) => m.set(c.id, c.nome));
    return m;
  }, [colaboradores]);

  const filtradas = useMemo(() => {
    return ocorrencias.filter((o) => {
      if (filtroColab !== "todos" && o.colaborador_id !== filtroColab) return false;
      if (filtroTipo !== "todos" && o.tipo !== filtroTipo) return false;
      return true;
    });
  }, [ocorrencias, filtroColab, filtroTipo]);

  async function salvar() {
    if (!form.colaborador_id || !form.quesito_codigo || !form.etapa_tipo || !form.ano) {
      toast({ title: "Preencha colaborador, quesito, etapa e ano", variant: "destructive" });
      return;
    }
    const etapaLabel = ETAPAS_TIPO.find((e) => e.value === form.etapa_tipo)?.label ?? "";
    setSaving(true);
    const payload = {
      colaborador_id: form.colaborador_id,
      data_ocorrencia: format(form.data, "yyyy-MM-dd"),
      tipo: form.tipo,
      quesito_codigo: form.quesito_codigo,
      etapa_referencia: `${etapaLabel} — ${form.ano}`,
      descricao: form.descricao || null,
    };
    const { error } = editingId
      ? await (supabase as any).from("ocorrencias").update(payload).eq("id", editingId)
      : await (supabase as any).from("ocorrencias").insert({ ...payload, registrado_por: user?.id ?? null });
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editingId ? "Ocorrência atualizada" : "Ocorrência registrada" });
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    loadAll();
  }

  function abrirNovo() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function abrirEdicao(o: Ocorrencia) {
    let etapa_tipo = "";
    let ano = String(anoAtual);
    if (o.etapa_referencia) {
      const match = ETAPAS_TIPO.find((e) => o.etapa_referencia!.startsWith(e.label));
      if (match) etapa_tipo = match.value;
      const anoMatch = o.etapa_referencia.match(/(\d{4})\s*$/);
      if (anoMatch) ano = anoMatch[1];
    }
    setEditingId(o.id);
    setForm({
      colaborador_id: o.colaborador_id,
      data: new Date(o.data_ocorrencia + "T00:00:00"),
      tipo: o.tipo,
      quesito_codigo: o.quesito_codigo,
      etapa_tipo,
      ano,
      descricao: o.descricao ?? "",
    });
    setOpen(true);
  }

  async function excluir() {
    if (!deleteId) return;
    const { error } = await (supabase as any).from("ocorrencias").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ocorrência excluída" });
      loadAll();
    }
    setDeleteId(null);
  }



  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-border p-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ocorrências</h1>
          <p className="text-muted-foreground mt-1">
            Registro de fatos positivos e negativos vinculados aos quesitos do PPR.
          </p>
        </div>
        <Button onClick={abrirNovo} className="gap-2">
          <Plus className="h-4 w-4" /> Registrar ocorrência
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Colaborador</Label>
            <Select value={filtroColab} onValueChange={setFiltroColab}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {colaboradores.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Positiva">Positiva</SelectItem>
                <SelectItem value="Negativa">Negativa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-10">Carregando…</div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-3 opacity-40" />
            <p>Nenhuma ocorrência registrada.</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtradas.map((o) => (
              <div key={o.id} className="py-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{nomeById.get(o.colaborador_id) ?? "—"}</span>
                    <Badge variant={o.tipo === "Positiva" ? "default" : "destructive"}>{o.tipo}</Badge>
                    <Badge variant="outline">{o.quesito_codigo}</Badge>
                    {o.etapa_referencia && <Badge variant="secondary">{o.etapa_referencia}</Badge>}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(o.data_ocorrencia + "T00:00:00"), "dd/MM/yyyy")}
                    </span>
                  </div>
                  {o.descricao && (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{o.descricao}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => abrirEdicao(o)} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(o.id)} title="Excluir">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Registrar ocorrência</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Colaborador</Label>
              <Select value={form.colaborador_id} onValueChange={(v) => setForm({ ...form, colaborador_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {colaboradores.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(form.data, "dd/MM/yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.data} onSelect={(d) => d && setForm({ ...form, data: d })} initialFocus className={cn("p-3 pointer-events-auto")} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v: "Positiva" | "Negativa") => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Positiva">Positiva</SelectItem>
                    <SelectItem value="Negativa">Negativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Quesito</Label>
              <Select value={form.quesito_codigo} onValueChange={(v) => setForm({ ...form, quesito_codigo: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {QUESITOS.map((q) => (
                    <SelectItem key={q.code} value={q.code}>{q.code} — {q.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Etapa</Label>
                <Select value={form.etapa_tipo} onValueChange={(v) => setForm({ ...form, etapa_tipo: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione a etapa" /></SelectTrigger>
                  <SelectContent>
                    {ETAPAS_TIPO.map((e) => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ano</Label>
                <Select value={form.ano} onValueChange={(v) => setForm({ ...form, ano: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {anosDisponiveis.map((a) => (
                      <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                rows={5}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Situação → Comportamento → Impacto"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={saving}>{saving ? "Salvando…" : "Registrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
