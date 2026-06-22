import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase, Check, Eye, Info, Trash2, Users, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useColaboradores } from "@/stores/colaboradoresStore";
import { useFeriasRecesso, type ColetivaUni, fmtISOtoBR } from "@/stores/feriasRecessoStore";

type FeriasColetiva = ColetivaUni;

type Step = 1 | 2 | 3;

export default function FeriasColetivas() {
  const { colaboradores } = useColaboradores();
  const { coletivas: lista, criarColetiva, excluirColetiva } = useFeriasRecesso();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [titulo, setTitulo] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [saldo, setSaldo] = useState("");

  // Step 2
  const [selDeptos, setSelDeptos] = useState<string[]>([]);
  // map departamento -> ids excluidos
  const [exclusoes, setExclusoes] = useState<Record<string, string[]>>({});
  const [tentouAvancar, setTentouAvancar] = useState(false);

  // Gerenciar dialog
  const [gerOpen, setGerOpen] = useState(false);
  const [gerDepto, setGerDepto] = useState<string>("");
  const [gerExcluidos, setGerExcluidos] = useState<string[]>([]);
  const [gerSelect, setGerSelect] = useState<string>("");

  // Visualizar
  const [verItem, setVerItem] = useState<FeriasColetiva | null>(null);

  const departamentos = useMemo(() => {
    const set = new Set<string>();
    colaboradores.forEach((c) => c.departamento && set.add(c.departamento));
    return Array.from(set).sort();
  }, [colaboradores]);

  const colabsPorDepto = useMemo(() => {
    const map: Record<string, typeof colaboradores> = {};
    colaboradores.forEach((c) => {
      if (!c.departamento) return;
      (map[c.departamento] ||= []).push(c);
    });
    return map;
  }, [colaboradores]);

  function colabsIncluidos(d: string) {
    const all = colabsPorDepto[d] || [];
    const ex = exclusoes[d] || [];
    return all.filter((c) => !ex.includes(c.id));
  }

  const totalColabs = selDeptos.reduce((a, d) => a + colabsIncluidos(d).length, 0);
  const totalExcluidos = selDeptos.reduce((a, d) => a + (exclusoes[d]?.length || 0), 0);

  function reset() {
    setStep(1);
    setTitulo(""); setInicio(""); setFim(""); setSaldo("");
    setSelDeptos([]); setExclusoes({}); setTentouAvancar(false);
  }
  function fechar() { setOpen(false); setTimeout(reset, 200); }

  const diasPeriodo = useMemo(() => {
    if (!inicio || !fim) return 0;
    const d1 = new Date(inicio); const d2 = new Date(fim);
    const diff = Math.floor((d2.getTime() - d1.getTime()) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  }, [inicio, fim]);
  const podeAvancar1 = !!titulo && !!inicio && !!fim && !!saldo && diasPeriodo >= 10 && Number(saldo) >= 10;

  function addDepto(d: string) {
    if (!d || selDeptos.includes(d)) return;
    setSelDeptos((s) => [...s, d]);
  }
  function removerDepto(d: string) {
    setSelDeptos((s) => s.filter((x) => x !== d));
    setExclusoes((e) => { const n = { ...e }; delete n[d]; return n; });
  }

  function abrirGerenciar(d: string) {
    setGerDepto(d);
    setGerExcluidos(exclusoes[d] || []);
    setGerSelect("");
    setGerOpen(true);
  }
  function salvarGerenciar() {
    setExclusoes((e) => ({ ...e, [gerDepto]: gerExcluidos }));
    setGerOpen(false);
  }

  function avancar() {
    if (step === 1 && podeAvancar1) { setStep(2); return; }
    if (step === 2) {
      if (selDeptos.length === 0) { setTentouAvancar(true); return; }
      setStep(3);
    }
  }

  function criar() {
    const incluidos: { id: string; nome: string; departamento: string }[] = [];
    const excluidos: { id: string; nome: string; departamento: string }[] = [];
    selDeptos.forEach((d) => {
      const ex = exclusoes[d] || [];
      (colabsPorDepto[d] || []).forEach((c) => {
        const item = { id: c.id, nome: c.nomeCompleto, departamento: d };
        if (ex.includes(c.id)) excluidos.push(item); else incluidos.push(item);
      });
    });
    criarColetiva({
      titulo,
      inicio,
      fim,
      saldo: Number(saldo),
      departamentos: selDeptos,
      totalColaboradores: totalColabs,
      colaboradoresIncluidos: incluidos,
      colaboradoresExcluidos: excluidos,
    });
    toast({ title: "Férias coletivas criada", description: `${incluidos.length} solicitações geradas automaticamente.` });
    fechar();
  }

  function excluir(id: string) {
    excluirColetiva(id);
  }

  const fmtData = (d: string) => fmtISOtoBR(d);

  const StepTab = ({ n, label }: { n: Step; label: string }) => {
    const active = step === n;
    const done = step > n;
    return (
      <div className="flex-1 flex items-center gap-2 pb-3 border-b-2 justify-center" style={{ borderColor: active ? "hsl(var(--primary))" : "transparent" }}>
        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${active || done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {done ? <Check className="h-3.5 w-3.5" /> : n}
        </div>
        <span className={`text-sm ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Férias Coletivas</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas solicitações de férias coletivas.</p>
          </div>
          <Button onClick={() => { reset(); setOpen(true); }}>Criar Férias coletivas</Button>
        </div>

        {lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-40 w-40 rounded-full bg-muted/40 flex items-center justify-center mb-4">
              <span className="text-5xl">📁</span>
            </div>
            <p className="text-base font-medium text-foreground">Nenhum registro de Férias coletivas</p>
            <p className="text-sm text-primary mt-1">Crie e gerencie registros de Férias coletivas dos colaboradores</p>
            <Button variant="outline" className="mt-4" onClick={() => { reset(); setOpen(true); }}>Criar Férias coletivas</Button>
          </div>
        ) : (
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Departamentos</TableHead>
                  <TableHead>Colaboradores</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.titulo}</TableCell>
                    <TableCell className="text-sm">{fmtData(f.inicio)} até {fmtData(f.fim)}</TableCell>
                    <TableCell className="text-sm">{f.departamentos.join(", ")}</TableCell>
                    <TableCell className="text-sm">{f.totalColaboradores}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Ativa</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setVerItem(f)}><Eye className="h-4 w-4 text-primary" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => excluir(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Wizard Criar Férias Coletivas */}
      <Dialog open={open} onOpenChange={(o) => { if (!o) fechar(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => step > 1 ? setStep((step - 1) as Step) : fechar()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span>Criar férias coletivas</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 mt-2 border-b">
            <StepTab n={1} label="Informações básicas" />
            <StepTab n={2} label="Selecionar departamentos" />
            <StepTab n={3} label="Revisão" />
          </div>

          {step === 1 && (
            <div className="space-y-4 py-4">
              <h3 className="font-semibold">Informações básicas</h3>
              <div>
                <Label>Título das férias coletivas *</Label>
                <Input placeholder="Ex.: Férias Coletivas Dezembro/2026" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Período das férias coletivas *</Label>
                  <div className="flex items-center gap-2">
                    <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                    <span className="text-sm text-muted-foreground">até</span>
                    <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
                  </div>
                  <p className={`text-xs mt-1 ${inicio && fim && diasPeriodo < 10 ? "text-destructive" : "text-muted-foreground"}`}>
                    Mínimo de 10 dias{inicio && fim ? ` (atual: ${diasPeriodo})` : ""}.
                  </p>
                </div>
                <div>
                  <Label>Saldo a descontar *</Label>
                  <Input type="number" min={10} placeholder="Ex.: 10" value={saldo} onChange={(e) => setSaldo(e.target.value)} />
                  <p className={`text-xs mt-1 ${saldo && Number(saldo) < 10 ? "text-destructive" : "text-muted-foreground"}`}>
                    Mínimo de 10 saldos a descontar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 py-4">
              {tentouAvancar && selDeptos.length === 0 && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-center gap-2">
                  <X className="h-4 w-4" /> Insira pelo menos 1 departamento para continuar.
                </div>
              )}
              <div>
                <Label>Selecione departamentos</Label>
                <Select value="" onValueChange={addDepto}>
                  <SelectTrigger><SelectValue placeholder="Buscar departamento" /></SelectTrigger>
                  <SelectContent>
                    {departamentos.filter((d) => !selDeptos.includes(d)).map((d) => (
                      <SelectItem key={d} value={d}>{d} ({colabsPorDepto[d]?.length || 0})</SelectItem>
                    ))}
                    {departamentos.filter((d) => !selDeptos.includes(d)).length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum departamento disponível</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-semibold">{selDeptos.length}</div>
                    <div className="text-xs text-muted-foreground">Departamentos selecionados</div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-semibold">{totalColabs}</div>
                    <div className="text-xs text-muted-foreground">Colaboradores selecionados</div>
                  </div>
                </div>
              </div>

              {selDeptos.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="h-24 w-24 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                    <Briefcase className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Nenhum departamento selecionado</p>
                  <p className="text-xs text-muted-foreground">Você ainda não adicionou nenhum departamento</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Departamentos selecionados</Label>
                  {selDeptos.map((d) => (
                    <div key={d} className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                      <div>
                        <div className="font-semibold text-sm">{d}</div>
                        <div className="text-xs text-muted-foreground">{colabsIncluidos(d).length} colaboradores</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => abrirGerenciar(d)}>Gerenciar</Button>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => removerDepto(d)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 py-4">
              <h3 className="font-semibold">Revisar férias coletivas</h3>
              <p className="text-sm text-muted-foreground">Confira os dados antes de confirmar. Todos os colaboradores dos departamentos selecionados serão incluídos automaticamente, exceto os excluídos manualmente.</p>

              <div className="border rounded-lg p-4">
                <div className="font-semibold mb-3">Dados básicos da ação</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><div className="text-xs text-muted-foreground">Título</div><div>{titulo}</div></div>
                  <div><div className="text-xs text-muted-foreground">Período das férias</div><div>{fmtData(inicio)} à {fmtData(fim)}</div></div>
                  <div><div className="text-xs text-muted-foreground">Total de dias</div><div>{saldo}</div></div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="font-semibold mb-3">Resumo</div>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  <li><b>{selDeptos.length}</b> departamentos</li>
                  <li><b>{totalColabs}</b> colaboradores incluídos</li>
                  <li><b>{totalExcluidos}</b> colaboradores excluídos</li>
                  <li><b>0</b> colaboradores em licença remunerada</li>
                  <li className="flex items-center gap-1"><b>{totalColabs}</b> colaboradores em período estendido <Info className="h-3 w-3 text-muted-foreground" /></li>
                </ul>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t mt-2">
            <Button variant="outline" onClick={fechar}>Cancelar</Button>
            <div className="flex gap-2">
              {step > 1 && <Button variant="outline" onClick={() => setStep((step - 1) as Step)}>Anterior</Button>}
              {step < 3 ? (
                <Button disabled={step === 1 && !podeAvancar1} onClick={avancar}>Próximo</Button>
              ) : (
                <Button onClick={criar}>Criar férias coletivas</Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gerenciar exceções do departamento */}
      <Dialog open={gerOpen} onOpenChange={setGerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerenciar exceções do departamento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            Todos os colaboradores deste departamento estão incluídos.<br />
            Use a busca para excluir colaboradores específicos, se necessário.
          </p>
          <div className="space-y-3">
            <div>
              <Label>Departamento de {gerDepto} <span className="text-xs text-primary">(opcional)</span></Label>
              <Select value={gerSelect} onValueChange={(v) => {
                setGerSelect(v);
                setGerExcluidos((arr) => arr.includes(v) ? arr : [...arr, v]);
              }}>
                <SelectTrigger><SelectValue placeholder="Buscar colaborador para excluir" /></SelectTrigger>
                <SelectContent>
                  {(colabsPorDepto[gerDepto] || []).filter((c) => !gerExcluidos.includes(c.id)).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nomeCompleto}</SelectItem>
                  ))}
                  {(colabsPorDepto[gerDepto] || []).filter((c) => !gerExcluidos.includes(c.id)).length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">Sem colaboradores disponíveis</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {gerExcluidos.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center text-sm text-muted-foreground">
                <Users className="h-8 w-8 mb-2" />
                Todos os colaboradores deste departamento participarão das férias coletivas.<br />
                Use a busca para excluir alguém, se necessário.
              </div>
            ) : (
              <div className="space-y-2">
                {gerExcluidos.map((id) => {
                  const c = colaboradores.find((x) => x.id === id);
                  if (!c) return null;
                  const cpf = (c.dadosCompletos as any)?.cpf || "";
                  return (
                    <div key={id} className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
                      <div>
                        <div className="font-semibold text-sm">{c.nomeCompleto}</div>
                        {cpf && <div className="text-xs text-muted-foreground">{cpf}</div>}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setGerExcluidos((arr) => arr.filter((x) => x !== id))}>
                        Reincluir
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setGerOpen(false)}>Cancelar</Button>
            <Button onClick={salvarGerenciar}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Visualizar férias coletivas */}
      <Dialog open={!!verItem} onOpenChange={(o) => { if (!o) setVerItem(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes das férias coletivas</DialogTitle>
          </DialogHeader>
          {verItem && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="font-semibold mb-3">Dados básicos</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><div className="text-xs text-muted-foreground">Título</div><div>{verItem.titulo}</div></div>
                  <div><div className="text-xs text-muted-foreground">Período</div><div>{fmtData(verItem.inicio)} à {fmtData(verItem.fim)}</div></div>
                  <div><div className="text-xs text-muted-foreground">Saldo a descontar</div><div>{verItem.saldo} dias</div></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="border rounded-lg p-3"><div className="text-2xl font-semibold">{verItem.departamentos.length}</div><div className="text-xs text-muted-foreground">Departamentos</div></div>
                <div className="border rounded-lg p-3"><div className="text-2xl font-semibold">{verItem.colaboradoresIncluidos.length}</div><div className="text-xs text-muted-foreground">Colaboradores incluídos</div></div>
                <div className="border rounded-lg p-3"><div className="text-2xl font-semibold">{verItem.colaboradoresExcluidos.length}</div><div className="text-xs text-muted-foreground">Colaboradores excluídos</div></div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="font-semibold mb-2">Departamentos</div>
                <div className="flex flex-wrap gap-2">
                  {verItem.departamentos.map((d) => (
                    <Badge key={d} variant="secondary">{d}</Badge>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="font-semibold mb-2">Colaboradores incluídos ({verItem.colaboradoresIncluidos.length})</div>
                {verItem.colaboradoresIncluidos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum colaborador.</p>
                ) : (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {verItem.colaboradoresIncluidos.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-sm rounded bg-muted/30 px-3 py-2">
                        <span>{c.nome}</span>
                        <span className="text-xs text-muted-foreground">{c.departamento}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {verItem.colaboradoresExcluidos.length > 0 && (
                <div className="border rounded-lg p-4">
                  <div className="font-semibold mb-2">Colaboradores excluídos ({verItem.colaboradoresExcluidos.length})</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {verItem.colaboradoresExcluidos.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-sm rounded bg-muted/30 px-3 py-2">
                        <span>{c.nome}</span>
                        <span className="text-xs text-muted-foreground">{c.departamento}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end pt-2 border-t">
            <Button onClick={() => setVerItem(null)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
