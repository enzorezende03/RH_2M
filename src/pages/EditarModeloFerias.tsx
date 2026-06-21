import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Info } from "lucide-react";
import { toast } from "sonner";

const DIAS_SEMANA = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

export default function EditarModeloFerias() {
  const navigate = useNavigate();
  const { tipo = "CLT" } = useParams();
  const tipoNome = useMemo(() => decodeURIComponent(tipo), [tipo]);

  // Orientações
  const [habilitarOrientacoes, setHabilitarOrientacoes] = useState(true);
  const [breveInstrucao, setBreveInstrucao] = useState(
    "Solicitação de férias mínima de 5 dias."
  );
  const [linkPolitica, setLinkPolitica] = useState("");

  // Solicitação
  const [nomenclatura, setNomenclatura] = useState("Férias");
  const [diasInicio, setDiasInicio] = useState<string>("");
  const [feriados, setFeriados] = useState<string>("");
  const [antecedencia, setAntecedencia] = useState(15);
  const [permitirVender, setPermitirVender] = useState(true);
  const [permitirAdiantar13, setPermitirAdiantar13] = useState(true);

  // Saldos
  const [tamanhoAquisitivo, setTamanhoAquisitivo] = useState(365);
  const [saldoAcumulado, setSaldoAcumulado] = useState(30);

  // Notificações
  const [habilitarEmails, setHabilitarEmails] = useState(true);

  const salvar = () => {
    toast.success(`Modelo ${tipoNome} salvo com sucesso`);
    navigate(-1);
  };

  return (
    <div className="p-6">
      <Card className="p-6 space-y-6">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Editar Modelo {tipoNome}</h1>
            <p className="text-sm text-muted-foreground">
              Configure quais informações devem ser exibidas na Solicitação de
              Férias.
            </p>
          </div>
        </div>

        <Tabs defaultValue="orientacoes" className="w-full">
          <TabsList className="w-full justify-start h-auto bg-muted/40 p-1">
            <TabsTrigger value="orientacoes">Orientações</TabsTrigger>
            <TabsTrigger value="solicitacao">Solicitação de Férias</TabsTrigger>
            <TabsTrigger value="saldos">Saldos</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          </TabsList>

          {/* Orientações */}
          <TabsContent value="orientacoes" className="space-y-5 pt-4">
            <h2 className="text-lg font-semibold border-b pb-2">
              Orientações ao Colaborador
            </h2>

            <div className="flex items-center gap-3">
              <Switch
                id="habOri"
                checked={habilitarOrientacoes}
                onCheckedChange={setHabilitarOrientacoes}
              />
              <Label htmlFor="habOri">Habilitar orientações ao colaborador</Label>
            </div>

            {habilitarOrientacoes && (
              <>
                <div className="space-y-1">
                  <Label>
                    Breve instrução sobre férias <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      value={breveInstrucao}
                      maxLength={160}
                      onChange={(e) => setBreveInstrucao(e.target.value)}
                    />
                    <span className="absolute right-2 -bottom-5 text-xs text-muted-foreground">
                      {breveInstrucao.length}/160
                    </span>
                  </div>
                </div>

                <div className="space-y-1 pt-3">
                  <Label>
                    Link para o colaborador acessar a política de férias{" "}
                    <span className="text-primary text-xs">(opcional)</span>
                  </Label>
                  <Input
                    placeholder="Link da sua política de férias"
                    value={linkPolitica}
                    onChange={(e) => setLinkPolitica(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">
                    Pré-visualização para o colaborador
                  </Label>
                  <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-900">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>{breveInstrucao || "—"}</span>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Solicitação de Férias */}
          <TabsContent value="solicitacao" className="space-y-5 pt-4">
            <h2 className="text-lg font-semibold border-b pb-2">
              Configurar Solicitação de Férias
            </h2>

            <div className="space-y-1">
              <Label>Qual nomenclatura deseja usar?</Label>
              <p className="text-xs text-muted-foreground">
                Este termo será exibido para o colaborador no sistema e e-mails.
              </p>
              <Select value={nomenclatura} onValueChange={setNomenclatura}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Férias">Férias</SelectItem>
                  <SelectItem value="Recesso">Recesso</SelectItem>
                  <SelectItem value="Descanso">Descanso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Quais dias da semana em que é possível iniciar férias?</Label>
              <Select value={diasInicio} onValueChange={setDiasInicio}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Feriados nacionais/regionais</Label>
              <p className="text-xs text-muted-foreground">
                O colaborador não poderá solicitar férias para datas que estejam
                dentro do período de 2 dias antes das datas selecionadas, conforme
                a lei 13.467.
              </p>
              <Select value={feriados} onValueChange={setFeriados}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nacionais">Nacionais</SelectItem>
                  <SelectItem value="regionais">Regionais</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 max-w-[160px]">
              <Label>
                Com quantos dias de antecedência as férias devem ser solicitadas?
              </Label>
              <Input
                type="number"
                min={0}
                value={antecedencia}
                onChange={(e) => setAntecedencia(Number(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Permissões da solicitação</h3>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={permitirVender}
                    onCheckedChange={setPermitirVender}
                    id="vender"
                  />
                  <Label htmlFor="vender">Permitir Vender Férias</Label>
                </div>
                <p className="text-xs text-muted-foreground pl-12">
                  Art. 143 - É facultado ao empregado converter 1/3 (um terço) do
                  período de férias a que tiver direito em abono pecuniário, no
                  valor da remuneração que lhe seria devida nos dias
                  correspondentes.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={permitirAdiantar13}
                    onCheckedChange={setPermitirAdiantar13}
                    id="adiantar"
                  />
                  <Label htmlFor="adiantar">
                    Permitir Antecipar 1ª parcela do 13° salário
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground pl-12">
                  A lei 4.749/1965 que é responsável do décimo terceiro salário
                  prevê a possibilidade de adiantamento do pagamento da primeira
                  parcela do salário extra conjuntamente ao pagamento do período
                  de descanso anual.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Saldos */}
          <TabsContent value="saldos" className="space-y-5 pt-4">
            <h2 className="text-lg font-semibold border-b pb-2">
              Configurar regras de saldos
            </h2>

            <div className="space-y-1 max-w-sm">
              <Label>
                Tamanho do período aquisitivo <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Dias a serem exercidos para acumular o saldo
              </p>
              <Input
                type="number"
                min={1}
                value={tamanhoAquisitivo}
                onChange={(e) =>
                  setTamanhoAquisitivo(Number(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-1 max-w-sm">
              <Label>
                Saldo acumulado do período <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Dias acumulados após o fim de um período aquisitivo
              </p>
              <Input
                type="number"
                min={0}
                value={saldoAcumulado}
                onChange={(e) => setSaldoAcumulado(Number(e.target.value) || 0)}
              />
            </div>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notificacoes" className="space-y-5 pt-4">
            <h2 className="text-lg font-semibold border-b pb-2">
              Configurar notificações
            </h2>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Switch
                  checked={habilitarEmails}
                  onCheckedChange={setHabilitarEmails}
                  id="emails"
                />
                <Label htmlFor="emails">Habilitar notificações de e-mails</Label>
              </div>
              <p className="text-xs text-muted-foreground pl-12">
                Ativar notificações de e-mail sobre solicitações de férias e
                alertas de saldo para Colaboradores, Gestores e RH.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button onClick={salvar}>Salvar</Button>
      </div>
    </div>
  );
}
