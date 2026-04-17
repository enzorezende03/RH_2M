import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FilePlus, User, ChevronDown, ChevronUp, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EditorPlanoDialog, type Plano } from "@/components/PlanoDesenvolvimentoDialogs";
import { cn } from "@/lib/utils";

interface Membro {
  id: string;
  nome: string;
  cargo: string;
  tipo: "lider" | "equipe";
}

interface TarefaFin {
  id: string;
  titulo: string;
  data: string;
  concluida?: boolean;
  aprendizados?: string;
}
interface BlocoFin {
  id: string;
  titulo: string;
  descricao?: string;
  tarefas: TarefaFin[];
}
interface PlanoFinalizado {
  id: string;
  nome: string;
  colaborador: string;
  cargo: string;
  inicio: string;
  expiraEm?: string; // ISO date
  blocos: BlocoFin[];
}

const equipeMock: Membro[] = [];

const planosFinalizadosMock: PlanoFinalizado[] = [];

export default function MeuPDI() {
  const navigate = useNavigate();
  const [aba, setAba] = useState<"ativos" | "finalizados" | "expirados">("ativos");
  const [openEditor, setOpenEditor] = useState(false);
  const [planosFin, setPlanosFin] = useState<PlanoFinalizado[]>(planosFinalizadosMock);
  const [blocosExp, setBlocosExp] = useState<Record<string, boolean>>({});
  const [tarefaDetalhe, setTarefaDetalhe] = useState<{ planoId: string; blocoId: string; tarefa: TarefaFin } | null>(null);

  const lideres = equipeMock.filter((m) => m.tipo === "lider");
  const equipe = equipeMock.filter((m) => m.tipo === "equipe");

  const getStatus = (p: PlanoFinalizado): "ativos" | "finalizados" | "expirados" => {
    const total = p.blocos.reduce((s, b) => s + b.tarefas.length, 0);
    const concluidas = p.blocos.reduce(
      (s, b) => s + b.tarefas.filter((t) => t.concluida).length,
      0
    );
    if (total > 0 && concluidas === total) return "finalizados";
    if (p.expiraEm && new Date(p.expiraEm) < new Date()) return "expirados";
    return "ativos";
  };

  const planosExibidos = planosFin.filter((p) => getStatus(p) === aba);
  const mostrarVazio = planosExibidos.length === 0;

  const cores = {
    ativos: {
      barra: "bg-muted-foreground/40",
      texto: "text-muted-foreground",
      tarefaBg: "bg-muted/40 hover:bg-muted/60",
      tarefaTexto: "text-foreground",
      icone: "text-muted-foreground",
      risco: false,
    },
    finalizados: {
      barra: "bg-emerald-500",
      texto: "text-emerald-600",
      tarefaBg: "bg-emerald-50/50 hover:bg-emerald-50",
      tarefaTexto: "text-muted-foreground line-through",
      icone: "text-emerald-600",
      risco: true,
    },
    expirados: {
      barra: "bg-destructive",
      texto: "text-destructive",
      tarefaBg: "bg-destructive/5 hover:bg-destructive/10",
      tarefaTexto: "text-muted-foreground line-through",
      icone: "text-destructive",
      risco: true,
    },
  }[aba];

  const salvarAprendizados = (texto: string, progresso: string) => {
    if (!tarefaDetalhe) return;
    setPlanosFin((prev) =>
      prev.map((p) =>
        p.id !== tarefaDetalhe.planoId
          ? p
          : {
              ...p,
              blocos: p.blocos.map((b) =>
                b.id !== tarefaDetalhe.blocoId
                  ? b
                  : {
                      ...b,
                      tarefas: b.tarefas.map((t) =>
                        t.id === tarefaDetalhe.tarefa.id ? { ...t, aprendizados: texto } : t
                      ),
                    }
              ),
            }
      )
    );
    setTarefaDetalhe(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl p-6 card-shadow">
        <h2 className="text-lg font-semibold text-card-foreground">Meu Desenvolvimento</h2>
      </div>

      <div className="bg-card rounded-xl p-6 card-shadow">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2">
            {(["ativos", "finalizados", "expirados"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAba(a)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md border ${
                  aba === a
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
          <Button className="gap-2" onClick={() => setOpenEditor(true)}>
            <FilePlus className="h-4 w-4" /> Criar um plano
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Planos */}
          <div className={cn(
            "flex-1 min-w-0 rounded-lg bg-muted/30 p-6 min-h-[400px]",
            mostrarVazio && "flex items-center justify-center"
          )}>
            {mostrarVazio ? (
              <div className="text-center">
                <div className="flex justify-center gap-3 mb-4 opacity-60">
                  <div className="h-12 w-20 rounded bg-card border" />
                  <div className="h-10 w-16 rounded bg-card border mt-1" />
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold">Nenhum</span> plano {aba} no momento
                </p>
              </div>
            ) : (
              <div className="w-full space-y-4">
                {planosExibidos.map((plano) => {
                  const totalTarefas = plano.blocos.reduce((s, b) => s + b.tarefas.length, 0);
                  return (
                    <div key={plano.id} className="rounded-lg border bg-card p-4 space-y-3">
                      <div>
                        <p className="font-semibold text-primary">{plano.nome}</p>
                        <p className="text-[11px] uppercase text-muted-foreground">ESTAGIÁRIO(A)</p>
                        <p className="text-[11px] text-primary uppercase">{plano.cargo}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Início em {plano.inicio}</p>
                        <div className="flex items-center justify-between mt-2 gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full", cores.barra)} style={{ width: "100%" }} />
                          </div>
                          <span className={cn("text-xs font-semibold", cores.texto)}>100%</span>
                          <span className="text-xs text-muted-foreground">{totalTarefas} de {totalTarefas} tarefas</span>
                        </div>
                      </div>

                      {plano.blocos.map((b) => {
                        const key = `${plano.id}-${b.id}`;
                        const expanded = blocosExp[key] ?? true;
                        return (
                          <div key={b.id} className="border rounded-lg">
                            <button
                              onClick={() => setBlocosExp((s) => ({ ...s, [key]: !expanded }))}
                              className="w-full flex items-center justify-between p-3"
                            >
                              <div className="text-left">
                                <p className="font-semibold text-sm">{b.titulo}</p>
                                {b.descricao && (
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{b.descricao}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  <div className="w-40 h-1 rounded-full bg-muted overflow-hidden">
                                    <div className={cn("h-full", cores.barra)} style={{ width: "100%" }} />
                                  </div>
                                  <span className={cn("text-[11px] font-semibold", cores.texto)}>100%</span>
                                  <span className="text-[11px] text-muted-foreground">{b.tarefas.length} de {b.tarefas.length} tarefas</span>
                                </div>
                              </div>
                              {expanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                            </button>
                            {expanded && (
                              <div className="px-3 pb-3 space-y-1">
                                {b.tarefas.map((t) => (
                                  <button
                                    key={t.id}
                                    onClick={() => setTarefaDetalhe({ planoId: plano.id, blocoId: b.id, tarefa: t })}
                                    className={cn("w-full flex items-center gap-2 rounded-md border px-3 py-2 text-left", cores.tarefaBg)}
                                  >
                                    <span className={cn("flex-1 text-xs", cores.tarefaTexto)}>{t.titulo}</span>
                                    <span className="text-[11px] text-muted-foreground">{t.data}</span>
                                    <CheckCircle2 className={cn("h-4 w-4", cores.icone)} />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Minha equipe */}
          <div className="lg:w-80 shrink-0 space-y-4">
            <div>
              <p className="font-semibold text-card-foreground mb-1">Minha equipe</p>
              <p className="text-xs font-medium text-muted-foreground mb-2">Líder</p>
              <div className="space-y-2">
                {lideres.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Nenhum líder cadastrado</p>
                )}
                {lideres.map((l) => (
                  <MembroCard key={l.id} membro={l} onView={() => navigate(`/colaboradores/${l.id}`)} />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Equipe</p>
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {equipe.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Nenhum membro na equipe</p>
                )}
                {equipe.map((m) => (
                  <MembroCard key={m.id} membro={m} onView={() => navigate(`/colaboradores/${m.id}`)} />
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="font-semibold text-card-foreground mb-1">Mapa de objetivos</p>
              <p className="text-xs text-muted-foreground mb-3">
                Descubra os objetivos de sua equipe que ainda estão vigentes e os concluídos no último período
              </p>
              <Button variant="outline" className="w-full border-primary text-primary" onClick={() => navigate("/metas")}>
                Ver todos os objetivos
              </Button>
            </div>
          </div>
        </div>
      </div>

      {openEditor && (
        <EditorPlanoDialog
          open={openEditor}
          onOpenChange={setOpenEditor}
          plano={{ colaborador: "Você", cargo: "—", nome: "Plano de Desenvolvimento (PDI)" }}
          onSave={(p) => {
            const factor = p.unidade === "Dias" ? 1 : p.unidade === "Semanas" ? 7 : 30;
            const expira = new Date(p.dataInicio);
            expira.setDate(expira.getDate() + p.duracao * factor);
            const novo: PlanoFinalizado = {
              id: p.id,
              nome: p.nome,
              colaborador: p.colaborador,
              cargo: p.cargo,
              inicio: p.dataInicio.toLocaleDateString("pt-BR"),
              expiraEm: expira.toISOString(),
              blocos: p.blocos.map((b) => ({
                id: b.id,
                titulo: b.titulo,
                descricao: b.descricao,
                tarefas: b.tarefas.map((t) => ({
                  id: t.id,
                  titulo: t.titulo,
                  data: p.dataInicio.toLocaleDateString("pt-BR"),
                  concluida: t.concluida,
                  aprendizados: t.aprendizados,
                })),
              })),
            };
            setPlanosFin((prev) => [...prev, novo]);
          }}
        />
      )}

      <TarefaDetalheDialog
        item={tarefaDetalhe}
        onClose={() => setTarefaDetalhe(null)}
        onSave={salvarAprendizados}
      />
    </div>
  );
}

function MembroCard({ membro, onView }: { membro: Membro; onView: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
        <User className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-card-foreground uppercase truncate">{membro.nome}</p>
        <p className="text-[11px] text-primary truncate">{membro.cargo}</p>
      </div>
      <Button variant="outline" size="icon" className="h-8 w-8 border-primary text-primary shrink-0" onClick={onView}>
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}

function TarefaDetalheDialog({
  item,
  onClose,
  onSave,
}: {
  item: { planoId: string; blocoId: string; tarefa: TarefaFin } | null;
  onClose: () => void;
  onSave: (texto: string, progresso: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [progresso, setProgresso] = useState("concluido");

  return (
    <Dialog
      open={!!item}
      onOpenChange={(v) => {
        if (!v) onClose();
        else {
          setTexto(item?.tarefa.aprendizados || "");
          setProgresso("concluido");
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">{item?.tarefa.titulo}</DialogTitle>
        </DialogHeader>

        <div className="border-2 border-dashed border-primary/40 rounded-lg p-6 text-center bg-muted/20">
          <p className="text-xs text-primary mb-3">Clique aqui para baixar</p>
          <p className="font-semibold text-lg mb-3">Material do treinamento</p>
          <p className="text-sm text-destructive font-medium">O arquivo solicitado não existe.</p>
          <p className="text-xs text-muted-foreground mt-1">Verifique se a URL está correta e se o arquivo existe.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Progresso</label>
          <Select value={progresso} onValueChange={setProgresso}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nao_iniciado">Não iniciado</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Conte seus maiores aprendizados</label>
          <Textarea
            placeholder="Aprendizados"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="min-h-[140px]"
          />
        </div>

        <div className="flex justify-start">
          <Button variant="outline" className="border-primary text-primary" onClick={() => onSave(texto, progresso)}>
            Voltar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
