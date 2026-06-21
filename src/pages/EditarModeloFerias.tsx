import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_POR_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const DIAS_DO_ANO = MESES.flatMap((mes, idx) =>
  Array.from({ length: DIAS_POR_MES[idx] }, (_, i) =>
    `${String(i + 1).padStart(2, "0")} de ${mes}`
  )
);

export default function EditarModeloFerias() {
  const navigate = useNavigate();
  const { tipo = "CLT" } = useParams();
  const tipoNome = useMemo(() => decodeURIComponent(tipo), [tipo]);

  // Orientações
  const [habilitarOrientacoes, setHabilitarOrientacoes] = useState(false);
  const [breveInstrucao, setBreveInstrucao] = useState("");
  const [linkPolitica, setLinkPolitica] = useState("");

  const tipoLower = tipoNome.toLowerCase();
  const isEstagio = tipoLower.startsWith("est");
  const isJovemAprendiz = tipoLower.includes("aprendiz");
  const isFreelancer = tipoLower.includes("freelancer");
  const semRadioContabilizacao = isEstagio || isJovemAprendiz;
  const nomenclaturaFixa = isJovemAprendiz;
  const mostrarFeriados = !isFreelancer;
  const diasVazios = isJovemAprendiz || isFreelancer;
  const togglesOff = isJovemAprendiz || isFreelancer;

  // Solicitação
  const [nomenclatura, setNomenclatura] = useState(isJovemAprendiz ? "Férias" : "Recesso");
  const [contabilizacao, setContabilizacao] = useState("corridos");
  const [diasInicio, setDiasInicio] = useState<string[]>(
    diasVazios ? [] : [...DIAS_SEMANA]
  );
  const [feriados, setFeriados] = useState<string[]>([]);
  const [buscaFeriados, setBuscaFeriados] = useState("");
  const [antecedencia, setAntecedencia] = useState(0);
  const [permitirVender, setPermitirVender] = useState(!togglesOff);
  const [permitirAdiantar13, setPermitirAdiantar13] = useState(!togglesOff);

  // Saldos
  const [tamanhoAquisitivo, setTamanhoAquisitivo] = useState<string>(isJovemAprendiz ? "365" : "");
  const [saldoAcumulado, setSaldoAcumulado] = useState<string>(isJovemAprendiz ? "30" : "");


  // Notificações
  const [habilitarEmails, setHabilitarEmails] = useState(!isFreelancer);


  const toggleDia = (d: string) => {
    setDiasInicio((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const toggleFeriado = (d: string) => {
    setFeriados((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

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

            <div className="space-y-1">
              <Label>
                Breve instrução sobre férias <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  placeholder="Ex: você poderá vender 1/3 das férias"
                  value={breveInstrucao}
                  maxLength={160}
                  disabled={!habilitarOrientacoes}
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
                disabled={!habilitarOrientacoes}
                onChange={(e) => setLinkPolitica(e.target.value)}
              />
            </div>
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
              <Select value={nomenclatura} onValueChange={setNomenclatura} disabled={nomenclaturaFixa}>
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

            {!semRadioContabilizacao && (
              <div className="space-y-2">
                <Label>Como o total de dias da solicitação deve ser contabilizado?</Label>
                <RadioGroup value={contabilizacao} onValueChange={setContabilizacao}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="corridos" id="corridos" />
                    <Label htmlFor="corridos" className="font-normal">Dias corridos</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="uteis" id="uteis" />
                    <Label htmlFor="uteis" className="font-normal">Dias úteis</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className="space-y-1">
              <Label>Quais dias da semana em que é possível iniciar férias?</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap gap-1">
                      {diasInicio.length === 0 && (
                        <span className="text-muted-foreground">Selecione</span>
                      )}
                      {diasInicio.map((d) => (
                        <Badge
                          key={d}
                          variant="outline"
                          className="rounded-full border-primary/40 text-primary gap-1"
                        >
                          {d}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDia(d);
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
                  {DIAS_SEMANA.map((d) => {
                    const sel = diasInicio.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDia(d)}
                        className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent ${sel ? "text-primary" : ""}`}
                      >
                        {d}
                        {sel && <span className="text-xs">✓</span>}
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>
            </div>

            {mostrarFeriados && (
              <div className="space-y-1">
                <Label>Feriados nacionais/regionais</Label>
                <p className="text-xs text-muted-foreground">
                  O colaborador não poderá solicitar férias para datas que estejam dentro do período de 2 dias antes das datas selecionadas, conforme a lei 13.467.
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <div className="flex flex-wrap gap-1">
                        {feriados.length === 0 && (
                          <span className="text-muted-foreground">Selecione</span>
                        )}
                        {feriados.map((d) => (
                          <Badge
                            key={d}
                            variant="outline"
                            className="rounded-full border-primary/40 text-primary gap-1"
                          >
                            {d}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFeriado(d);
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                    <Input
                      placeholder="Buscar data..."
                      value={buscaFeriados}
                      onChange={(e) => setBuscaFeriados(e.target.value)}
                      className="mb-2"
                    />
                    <div className="max-h-64 overflow-y-auto">
                      {DIAS_DO_ANO.filter((d) =>
                        d.toLowerCase().includes(buscaFeriados.toLowerCase())
                      ).map((d) => {
                        const sel = feriados.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleFeriado(d)}
                            className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent ${sel ? "text-primary" : ""}`}
                          >
                            {d}
                            {sel && <span className="text-xs">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}


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

              <div className="flex items-center gap-3">
                <Switch
                  checked={permitirVender}
                  onCheckedChange={setPermitirVender}
                  id="vender"
                />
                <Label htmlFor="vender" className="font-normal">Permitir Vender Férias</Label>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={permitirAdiantar13}
                  onCheckedChange={setPermitirAdiantar13}
                  id="adiantar"
                />
                <Label htmlFor="adiantar" className="font-normal">
                  Permitir Antecipar 1ª parcela do 13° salário
                </Label>
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
                placeholder="Ex: 365"
                value={tamanhoAquisitivo}
                onChange={(e) => setTamanhoAquisitivo(e.target.value)}
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
                placeholder="Ex: 30"
                value={saldoAcumulado}
                onChange={(e) => setSaldoAcumulado(e.target.value)}
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
                <Label htmlFor="emails" className="font-normal">Habilitar notificações de e-mails</Label>
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
