import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ModeloPermissao,
  PERMISSOES_VAZIAS,
  PermissoesTemplate,
  useModelosPermissao,
} from "@/stores/modelosPermissaoStore";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Permissões atuais do formulário — usadas ao "Salvar como novo modelo". */
  permissoesAtuais?: PermissoesTemplate;
};

const CAMPOS: { key: keyof PermissoesTemplate; label: string }[] = [
  { key: "permColaboradores", label: "Administrar Colaboradores e Cargos" },
  { key: "permColaboradoresAcesso", label: "Administrar Permissões de acesso" },
  { key: "permCelebracoes", label: "Administrar Celebrações" },
  { key: "permGamificacao", label: "Acessar Recompensas / Gamificação" },
  { key: "permComunicados", label: "Administrar Comunicados" },
  { key: "permOuvidoria", label: "Permissões de Ouvidor" },
  { key: "permReunioes", label: "Administrar Reuniões 1:1" },
];

const NIVEIS: ModeloPermissao["nivel"][] = [
  "Diretoria",
  "RH",
  "Coordenação",
  "Liderança",
  "Operacional",
  "Personalizado",
];

export default function GerenciarModelosPermissaoDialog({
  open,
  onOpenChange,
  permissoesAtuais,
}: Props) {
  const { modelos, criarModelo, atualizarModelo, excluirModelo, restaurarPadrao } =
    useModelosPermissao();
  const [editando, setEditando] = useState<ModeloPermissao | null>(null);
  const [modoNovo, setModoNovo] = useState(false);

  const iniciarNovo = (base?: PermissoesTemplate) => {
    setEditando({
      id: "",
      nome: "",
      nivel: "Personalizado",
      descricao: "",
      permissoes: base ? { ...base } : { ...PERMISSOES_VAZIAS },
    });
    setModoNovo(true);
  };

  const iniciarEdicao = (m: ModeloPermissao) => {
    setEditando({ ...m, permissoes: { ...m.permissoes } });
    setModoNovo(false);
  };

  const salvar = () => {
    if (!editando) return;
    if (!editando.nome.trim()) {
      toast("Informe um nome para o modelo.");
      return;
    }
    if (modoNovo) {
      criarModelo({
        nome: editando.nome.trim(),
        nivel: editando.nivel,
        descricao: editando.descricao,
        permissoes: editando.permissoes,
      });
      toast("Modelo criado com sucesso.");
    } else {
      atualizarModelo(editando.id, {
        nome: editando.nome.trim(),
        nivel: editando.nivel,
        descricao: editando.descricao,
        permissoes: editando.permissoes,
      });
      toast("Modelo atualizado.");
    }
    setEditando(null);
    setModoNovo(false);
  };

  const excluir = (m: ModeloPermissao) => {
    if (m.padrao) {
      toast("Modelos padrão não podem ser excluídos.");
      return;
    }
    if (!window.confirm(`Excluir o modelo "${m.nome}"?`)) return;
    excluirModelo(m.id);
    toast("Modelo excluído.");
  };

  const togglePerm = (key: keyof PermissoesTemplate, value: boolean) => {
    if (!editando) return;
    setEditando({
      ...editando,
      permissoes: { ...editando.permissoes, [key]: value },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modelos de permissão</DialogTitle>
        </DialogHeader>

        {!editando ? (
          <>
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-sm text-muted-foreground">
                Crie perfis reutilizáveis para aplicar em novos colaboradores com 1 clique.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={restaurarPadrao}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Restaurar padrão
                </Button>
                {permissoesAtuais && (
                  <Button size="sm" variant="outline" onClick={() => iniciarNovo(permissoesAtuais)}>
                    <Plus className="h-4 w-4 mr-1" /> Salvar atual como modelo
                  </Button>
                )}
                <Button size="sm" onClick={() => iniciarNovo()}>
                  <Plus className="h-4 w-4 mr-1" /> Novo modelo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {modelos.map((m) => {
                const ativos = CAMPOS.filter((c) => m.permissoes[c.key]).length;
                return (
                  <div
                    key={m.id}
                    className="flex items-start justify-between gap-3 p-3 border rounded-lg"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{m.nome}</span>
                        <Badge variant="secondary" className="text-[10px]">{m.nivel}</Badge>
                        {m.padrao && (
                          <Badge variant="outline" className="text-[10px]">Padrão</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {ativos} permissão(ões) ativa(s)
                        </span>
                      </div>
                      {m.descricao && (
                        <p className="text-xs text-muted-foreground mt-1">{m.descricao}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => iniciarEdicao(m)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!m.padrao && (
                        <Button size="icon" variant="ghost" onClick={() => excluir(m)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nome do modelo</Label>
                <Input
                  value={editando.nome}
                  onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                  placeholder="Ex: Supervisor de Loja"
                />
              </div>
              <div>
                <Label className="text-xs">Nível</Label>
                <Select
                  value={editando.nivel}
                  onValueChange={(v) =>
                    setEditando({ ...editando, nivel: v as ModeloPermissao["nivel"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NIVEIS.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Descrição</Label>
              <Textarea
                rows={2}
                value={editando.descricao ?? ""}
                onChange={(e) => setEditando({ ...editando, descricao: e.target.value })}
                placeholder="Curta descrição do que este modelo autoriza"
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Permissões concedidas</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CAMPOS.map((c) => (
                  <label
                    key={c.key}
                    className="flex items-start gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={!!editando.permissoes[c.key]}
                      onCheckedChange={(v) => togglePerm(c.key, !!v)}
                    />
                    <span className="text-xs">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {editando.padrao && (
              <p className="text-xs text-amber-700">
                Este é um modelo padrão. Suas alterações serão preservadas, mas você pode restaurar os
                valores originais pelo botão “Restaurar padrão”.
              </p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
              <Button onClick={salvar}>Salvar modelo</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
