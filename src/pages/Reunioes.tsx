import { useState } from "react";
import { Plus, Search, CalendarCheck, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Reunioes() {
  const [criarOpen, setCriarOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [topicos, setTopicos] = useState<string[]>([]);
  const [novoTopico, setNovoTopico] = useState("");

  const addTopico = () => {
    if (novoTopico.trim()) {
      setTopicos([...topicos, novoTopico.trim()]);
      setNovoTopico("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reuniões 1:1</h1>
          <p className="text-sm text-muted-foreground">Realize e gerencie reuniões 1:1 com as pessoas da sua empresa</p>
        </div>
        <Button className="gap-2" onClick={() => setCriarOpen(true)}>
          <Plus className="h-4 w-4" /> Criar reunião 1:1
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Colaborador</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Buscar colaborador com 1:1 existente" /></SelectTrigger>
            <SelectContent><SelectItem value="none">Nenhum</SelectItem></SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Status do Colaborador</Label>
          <Select defaultValue="ativos">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativos">Ativos</SelectItem>
              <SelectItem value="desligados">Desligados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Categoria</Label>
          <Select defaultValue="todas">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="sem">Sem Categoria</SelectItem>
              <SelectItem value="metas">Planejamento de Metas</SelectItem>
              <SelectItem value="desenvolvimento">Desenvolvimento do Colaborador</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Frequência</Label>
          <Select defaultValue="todas">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="boa">Boa</SelectItem>
              <SelectItem value="ruim">Ruim</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table area */}
        <div className="lg:col-span-2 rounded-xl bg-card card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left p-3 font-semibold text-foreground">
                    <span className="inline-flex items-center gap-1">Nome do Colaborador <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></span>
                  </th>
                  <th className="text-left p-3 font-semibold text-foreground">
                    <span className="inline-flex items-center gap-1">Última Reunião <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></span>
                  </th>
                  <th className="text-left p-3 font-semibold text-foreground">
                    <span className="inline-flex items-center gap-1">Próxima Reunião <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></span>
                  </th>
                  <th className="text-left p-3 font-semibold text-foreground">
                    <span className="inline-flex items-center gap-1">Frequência <ArrowUpDown className="h-3 w-3 text-muted-foreground" /></span>
                  </th>
                </tr>
              </thead>
              <tbody />
            </table>
          </div>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Nenhum colaborador encontrado com<br />quem você já tenha feito reuniões</p>
            <p className="text-xs text-muted-foreground/70 mt-1">tente outros filtros para aprimorar sua busca</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="rounded-xl bg-card card-shadow p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold text-foreground mb-6">Em Breve</h3>
          <CalendarCheck className="h-12 w-12 text-primary/30 mb-4" />
          <p className="text-sm font-medium text-primary">Sem reuniões agendadas,</p>
          <p className="text-xs text-muted-foreground mb-4">aproveite para tomar um cafezinho<br />ou criar uma 1:1</p>
          <Button variant="outline" onClick={() => setCriarOpen(true)}>Criar reunião</Button>
        </div>
      </div>

      {/* Dialog Criar Reunião */}
      <Dialog open={criarOpen} onOpenChange={setCriarOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Reunião</DialogTitle>
            <p className="text-xs text-muted-foreground">*Campos Obrigatórios</p>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Colaborador */}
            <div>
              <Label className="text-sm font-medium">Colaborador <span className="text-destructive">*</span></Label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent><SelectItem value="none">Nenhum colaborador</SelectItem></SelectContent>
              </Select>
            </div>

            {/* Data / Início / Fim */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-sm font-medium">Data <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full mt-1 justify-start text-left font-normal text-sm", !date && "text-muted-foreground")}>
                      {date ? format(date, "dd/MM/yyyy") : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} locale={ptBR} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-sm font-medium">Início <span className="text-destructive">*</span></Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="08:45" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, h) => [`${String(h).padStart(2, "0")}:00`, `${String(h).padStart(2, "0")}:15`, `${String(h).padStart(2, "0")}:30`, `${String(h).padStart(2, "0")}:45`]).flat().map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Fim <span className="text-destructive">*</span></Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="09:15" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, h) => [`${String(h).padStart(2, "0")}:00`, `${String(h).padStart(2, "0")}:15`, `${String(h).padStart(2, "0")}:30`, `${String(h).padStart(2, "0")}:45`]).flat().map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Categoria */}
            <div>
              <Label className="text-sm font-medium">Categoria <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Select>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem">Sem Categoria</SelectItem>
                  <SelectItem value="metas">Planejamento de Metas</SelectItem>
                  <SelectItem value="desenvolvimento">Desenvolvimento do Colaborador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pauta */}
            <div>
              <Label className="text-sm font-medium">Pauta da Reunião <span className="text-destructive">*</span></Label>
              <div className="mt-1 border rounded-lg p-3 space-y-2">
                <Select>
                  <SelectTrigger><SelectValue placeholder="Adicione um tópico sugerido na pauta" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="metas">Metas</SelectItem>
                    <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                    <SelectItem value="carreira">Carreira</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input placeholder="Adicione um novo tópico na pauta" value={novoTopico} onChange={e => setNovoTopico(e.target.value)} onKeyDown={e => e.key === "Enter" && addTopico()} />
                  <Button size="icon" variant="outline" onClick={addTopico}><Plus className="h-4 w-4" /></Button>
                </div>
                {topicos.length > 0 ? (
                  <ul className="text-sm space-y-1">{topicos.map((t, i) => <li key={i} className="bg-muted rounded px-2 py-1">{t}</li>)}</ul>
                ) : (
                  <div className="flex flex-col items-center py-3 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/30 mb-1" />
                    <p className="text-xs text-muted-foreground">sem tópicos adicionados,<br />adicione pelo menos um para<br />criar a reunião</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recorrência */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1">📅 Recorrência</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Adicione uma recorrência para fazer com que essa reunião se repita no intervalo definido. A categoria e tópicos serão repetidos em todas as reuniões.</p>
              <Select defaultValue="sem">
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem">Sem Recorrência</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="quinzenal">Quinzenal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button>Criar Reunião</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
