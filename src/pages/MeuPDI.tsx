import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FilePlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorPlanoDialog, type Plano } from "@/components/PlanoDesenvolvimentoDialogs";

interface Membro {
  id: string;
  nome: string;
  cargo: string;
  tipo: "lider" | "equipe";
}

const equipeMock: Membro[] = [];

export default function MeuPDI() {
  const navigate = useNavigate();
  const [aba, setAba] = useState<"ativos" | "finalizados" | "expirados">("ativos");
  const [openEditor, setOpenEditor] = useState(false);
  const [planos, setPlanos] = useState<Plano[]>([]);

  const lideres = equipeMock.filter((m) => m.tipo === "lider");
  const equipe = equipeMock.filter((m) => m.tipo === "equipe");

  const planosFiltrados = planos.filter(() => aba === "ativos");

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
          <div className="flex-1 min-w-0 rounded-lg bg-muted/30 p-6 min-h-[400px] flex items-center justify-center">
            {planosFiltrados.length === 0 ? (
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
              <div className="w-full space-y-3">
                {planosFiltrados.map((p) => (
                  <div key={p.id} className="rounded-lg border bg-card p-4">
                    <p className="font-semibold text-card-foreground">{p.nome}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.tipo}</p>
                  </div>
                ))}
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
          onSave={(p) => setPlanos((prev) => [...prev, p])}
        />
      )}
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
