import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Send,
  BarChart3,
  GitBranch,
  Star,
  Smile,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

const radarData = [
  { item: "Alinhamento Cultural", recebidos: 0, media: 0 },
  { item: "Foco no Cliente", recebidos: 0, media: 0 },
  { item: "Erros Interno", recebidos: 0, media: 0 },
];

const companyItems = [
  {
    name: "Alinhamento Cultural",
    description: "Alinhamento com a cultura e valores da empresa",
  },
  {
    name: "Foco no Cliente",
    description: "Esforço e foco em entregar sucesso aos clientes",
  },
  {
    name: "Erros Interno",
    description: "Controle dos erros internos",
  },
];

export default function Feedbacks() {
  const [dataInicio, setDataInicio] = useState("02/01/2026");
  const [dataFinal, setDataFinal] = useState("02/04/2026");
  const [showSolicitar, setShowSolicitar] = useState(false);
  const [showEnviar, setShowEnviar] = useState(false);
  const [activeTab, setActiveTab] = useState("recebidos");
  const [filtro, setFiltro] = useState("");

  // Solicitar state
  const [solColaborador, setSolColaborador] = useState("");
  const [solMensagem, setSolMensagem] = useState("");

  // Enviar state
  const [envColaborador, setEnvColaborador] = useState("");
  const [envModelo, setEnvModelo] = useState("");
  const [envDescricao, setEnvDescricao] = useState("");
  const [envPresencial, setEnvPresencial] = useState(false);
  const [envAnotacoes, setEnvAnotacoes] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handleRating = (item: string, value: number) => {
    setRatings((prev) => ({ ...prev, [item]: value }));
  };

  const resetSolicitar = () => {
    setSolColaborador("");
    setSolMensagem("");
  };

  const resetEnviar = () => {
    setEnvColaborador("");
    setEnvModelo("");
    setEnvDescricao("");
    setEnvPresencial(false);
    setEnvAnotacoes("");
    setRatings({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedbacks</h1>
          <p className="text-sm text-muted-foreground">
            Dê, solicite e receba feedbacks precisos de uma maneira confidencial
            e construtiva
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              resetSolicitar();
              setShowSolicitar(true);
            }}
          >
            Solicitar Feedback
          </Button>
          <Button
            onClick={() => {
              resetEnviar();
              setShowEnviar(true);
            }}
          >
            Enviar Feedback
          </Button>
        </div>
      </div>

      {/* Date filters */}
      <div className="flex items-center gap-4">
        <div>
          <Label className="text-xs text-muted-foreground">Data início</Label>
          <Input
            className="w-36 bg-card"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Data final</Label>
          <Input
            className="w-36 bg-card"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
          />
        </div>
        <div className="flex items-end gap-2 ml-auto">
          <Button variant="ghost" size="sm">
            Limpar
          </Button>
          <Button size="sm">Filtrar</Button>
        </div>
      </div>

      {/* Dados do período */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Dados do período</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Dados relacionados aos seus feedbacks enviados e recebidos no período
          filtrado
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feedbacks recebidos */}
          <div className="rounded-xl bg-card p-5 card-shadow border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">
                Feedbacks recebidos
              </span>
              <Download className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">0</span>
          </div>

          {/* Feedbacks enviados */}
          <div className="rounded-xl bg-card p-5 card-shadow border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary">
                Feedbacks enviados
              </span>
              <Send className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-3xl font-bold text-foreground">0</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar chart */}
        <div className="rounded-xl bg-card p-5 card-shadow border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">
              Resumo por item
            </span>
            <GitBranch className="h-5 w-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="item" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              <Radar
                name="Feedbacks Recebidos"
                dataKey="recebidos"
                stroke="hsl(40, 80%, 55%)"
                fill="hsl(40, 80%, 55%)"
                fillOpacity={0.3}
              />
              <Radar
                name="Média da Companhia"
                dataKey="media"
                stroke="hsl(210, 70%, 50%)"
                fill="hsl(210, 70%, 50%)"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly summary */}
        <div className="rounded-xl bg-card p-5 card-shadow border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">
              Resumo mensal de feedbacks enviados e recebidos
            </span>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-primary">
            Sem feedbacks o suficiente para fazer a análise
          </p>
        </div>
      </div>

      {/* Feedbacks do período */}
      <div>
        <h2 className="text-lg font-bold text-foreground">
          Feedbacks do período
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Listagem do seus feedbacks e solicitações no período filtrado
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent gap-4 p-0 h-auto">
            <TabsTrigger
              value="recebidos"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2 text-sm data-[state=active]:shadow-none bg-transparent"
            >
              Recebidos (0)
            </TabsTrigger>
            <TabsTrigger
              value="enviados"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2 text-sm data-[state=active]:shadow-none bg-transparent"
            >
              Enviados (0)
            </TabsTrigger>
            <TabsTrigger
              value="solicitacoes-recebidas"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2 text-sm data-[state=active]:shadow-none bg-transparent"
            >
              Solicitações Recebidas (0)
            </TabsTrigger>
            <TabsTrigger
              value="solicitacoes-enviadas"
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2 text-sm data-[state=active]:shadow-none bg-transparent"
            >
              Solicitações Enviadas (0)
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <Input
              placeholder="Filtrar"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-md bg-card border-primary/30 placeholder:text-primary/50"
            />
          </div>

          <TabsContent value="recebidos" className="mt-4">
            <div className="flex flex-col items-center py-8">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Não encontramos nada por aqui <Smile className="h-4 w-4" />
              </p>
            </div>
          </TabsContent>
          <TabsContent value="enviados" className="mt-4">
            <div className="flex flex-col items-center py-8">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Não encontramos nada por aqui <Smile className="h-4 w-4" />
              </p>
            </div>
          </TabsContent>
          <TabsContent value="solicitacoes-recebidas" className="mt-4">
            <div className="flex flex-col items-center py-8">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Não encontramos nada por aqui <Smile className="h-4 w-4" />
              </p>
            </div>
          </TabsContent>
          <TabsContent value="solicitacoes-enviadas" className="mt-4">
            <div className="flex flex-col items-center py-8">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Não encontramos nada por aqui <Smile className="h-4 w-4" />
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t border-border mt-4 pt-6">
          <p className="text-sm text-primary text-center">
            Nenhum feedback selecionado
          </p>
        </div>
      </div>

      {/* Modal: Solicitar Feedback */}
      <Dialog open={showSolicitar} onOpenChange={setShowSolicitar}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitação de Feedback</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Solicite um feedback para algum colaborador
            </p>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="font-semibold">Colaborador</Label>
              <Select value={solColaborador} onValueChange={setSolColaborador}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Selecione um colaborador para enviar a solicitação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>
                    Nenhum colaborador cadastrado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Mensagem</Label>
              <Textarea
                placeholder="Ex.: Fulano, você pode me dar um feedback sobre a última reunião que apresentei? Obrigado!"
                value={solMensagem}
                onChange={(e) => setSolMensagem(e.target.value)}
                className="min-h-[100px] bg-card"
              />
            </div>
            <div className="flex justify-end">
              <Button>Enviar solicitação</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Enviar Feedback */}
      <Dialog open={showEnviar} onOpenChange={setShowEnviar}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enviar Feedback</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Selecione um colaborador para enviar um feedback sobre desempenho
            </p>
          </DialogHeader>
          <div className="space-y-6 mt-2">
            {/* Selecione colaborador */}
            <div className="space-y-2">
              <Label className="font-semibold">Selecione um colaborador</Label>
              <Select value={envColaborador} onValueChange={setEnvColaborador}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>
                    Nenhum colaborador cadastrado
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Itens da empresa */}
            <div className="space-y-2">
              <Label className="font-semibold">Itens da empresa</Label>
              <p className="text-xs text-muted-foreground">
                Atribua um ou mais itens da empresa a esse feedback
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {companyItems.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-lg border border-primary/30 p-4 text-center"
                  >
                    <p className="font-semibold text-sm text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRating(item.name, star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              (ratings[item.name] || 0) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-yellow-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modelo de feedback */}
            <div className="space-y-2">
              <Label className="font-semibold">
                Escolha um modelo de Feedback
              </Label>
              <Select value={envModelo} onValueChange={setEnvModelo}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Nenhum modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum modelo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label className="font-semibold">Descreva seu feedback</Label>
              <p className="text-xs text-muted-foreground">
                ⚠ Não é possível adicionar imagens.
              </p>
              <Textarea
                placeholder="Escreva seu feedback aqui..."
                value={envDescricao}
                onChange={(e) => setEnvDescricao(e.target.value)}
                className="min-h-[150px] bg-card"
              />
            </div>

            {/* Presencial */}
            <div className="space-y-1">
              <Label className="font-semibold">Feedback presencial</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="presencial"
                  checked={envPresencial}
                  onCheckedChange={(v) => setEnvPresencial(v === true)}
                />
                <label htmlFor="presencial" className="text-sm text-muted-foreground">
                  Este feedback foi dado presencialmente
                </label>
              </div>
            </div>

            {/* Anotações internas */}
            <div className="space-y-2">
              <Label className="font-semibold">Anotações Internas</Label>
              <p className="text-xs text-muted-foreground">
                Essas anotações são suas. São privadas e aparecerão apenas para
                você.
              </p>
              <Textarea
                value={envAnotacoes}
                onChange={(e) => setEnvAnotacoes(e.target.value)}
                className="min-h-[100px] bg-card"
              />
            </div>

            <div className="flex justify-end">
              <Button>Enviar feedback</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
