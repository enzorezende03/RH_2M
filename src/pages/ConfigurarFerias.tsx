import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Info, AlertCircle, SquarePen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TIPOS_CONTRATO = [
  "CLT",
  "PJ",
  "Estágio",
  "Sócio",
  "Cooperado",
  "Jovem Aprendiz",
  "Freelancer",
];

interface RegraTipo {
  podeVender: boolean;
  podeAdiantar13: boolean;
  diasMaxVenda: number;
}

const DEFAULT_REGRA: RegraTipo = {
  podeVender: true,
  podeAdiantar13: true,
  diasMaxVenda: 10,
};

export default function ConfigurarFerias() {
  const navigate = useNavigate();
  const [regras, setRegras] = useState<Record<string, RegraTipo>>(
    Object.fromEntries(TIPOS_CONTRATO.map((t) => [t, { ...DEFAULT_REGRA }]))
  );
  const [editando, setEditando] = useState<string | null>(null);

  const atual = editando ? regras[editando] : null;

  const salvar = (novo: RegraTipo) => {
    if (!editando) return;
    setRegras((prev) => ({ ...prev, [editando]: novo }));
    setEditando(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          Configurar Férias
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-primary" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Defina, por tipo de contrato, as regras de venda de férias e
                adiantamento do 13º.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h1>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
            <p>
              Existem <strong>1 colaboradores</strong> sem tipo de vínculo.
              Preencha o cadastro, para que o fluxo de solicitações siga as
              regras que você definiu.
              <br />
              Eles, por padrão, podem vender férias e adiantar o 13º.
            </p>
          </div>
          <a
            href="/planilhas/Colaboradores_sem_vinculo_definido.xlsx"
            download="Colaboradores_sem_vinculo_definido.xlsx"
            className="text-primary underline shrink-0"
          >
            Baixar lista
          </a>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2">
            Configuração do tipo de contrato
          </h2>
          <div className="divide-y border-t border-b">
            {TIPOS_CONTRATO.map((tipo) => (
              <div
                key={tipo}
                className="flex items-center justify-between px-2 py-3"
              >
                <span className="text-sm">{tipo}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/configurar-ferias/editar/${encodeURIComponent(tipo)}`)}
                  aria-label={`Editar ${tipo}`}
                >
                  <SquarePen className="h-4 w-4 text-primary" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Dialog open={!!editando} onOpenChange={(o) => !o && setEditando(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar {editando}</DialogTitle>
            <DialogDescription>
              Defina as regras de férias para colaboradores do tipo {editando}.
            </DialogDescription>
          </DialogHeader>
          {atual && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="vender">Pode vender férias</Label>
                <Switch
                  id="vender"
                  checked={atual.podeVender}
                  onCheckedChange={(v) =>
                    setRegras((p) => ({
                      ...p,
                      [editando!]: { ...atual, podeVender: v },
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dias">Dias máximos de venda</Label>
                <Input
                  id="dias"
                  type="number"
                  min={0}
                  max={20}
                  value={atual.diasMaxVenda}
                  disabled={!atual.podeVender}
                  onChange={(e) =>
                    setRegras((p) => ({
                      ...p,
                      [editando!]: {
                        ...atual,
                        diasMaxVenda: Number(e.target.value) || 0,
                      },
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="adiantar">Pode adiantar 1ª parcela do 13º</Label>
                <Switch
                  id="adiantar"
                  checked={atual.podeAdiantar13}
                  onCheckedChange={(v) =>
                    setRegras((p) => ({
                      ...p,
                      [editando!]: { ...atual, podeAdiantar13: v },
                    }))
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
            <Button onClick={() => atual && salvar(atual)}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
