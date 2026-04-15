import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ChevronDown, GripVertical, Plus, Trash2, ArrowLeft } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface Pergunta {
  id: number;
  dimensao: string;
  texto: string;
  tipoResposta: string;
  obrigatoria: string;
}

interface SuperPesquisaItem {
  id: number;
  titulo: string;
  dataCriacao: string;
  dataEncerramento: string;
  participantes: number;
  respondentes: number;
  status: string;
  descricao: string;
  tiposPesquisa: string;
  habilitarVoltar: string;
  perguntas: Pergunta[];
}

type View = "list" | "create" | "edit" | "results";

const COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

const mockPesquisas: SuperPesquisaItem[] = [
  {
    id: 1,
    titulo: "Bazar do Bem – Pesquisa de Interesse",
    dataCriacao: "02/04/26",
    dataEncerramento: "07/04/26",
    participantes: 48,
    respondentes: 34,
    status: "Inativo",
    descricao: "Descrição: Pessoal, queremos ouvir a opinião de vocês sobre uma ideia 🌟 Estamos pensando em organizar um bazar interno aqui no escritório...",
    tiposPesquisa: "Anônima",
    habilitarVoltar: "Sim",
    perguntas: [
      { id: 1, dimensao: "Geral", texto: "Vocês gostariam de participar de algo assim?", tipoResposta: "Sim/Não", obrigatoria: "Sim" },
      { id: 2, dimensao: "Geral", texto: "Teriam interesse em vender, trocar ou comprar?", tipoResposta: "Múltipla Escolha", obrigatoria: "Sim" },
      { id: 3, dimensao: "Geral", texto: "Acham válida a ideia da doação?", tipoResposta: "Sim/Não", obrigatoria: "Sim" },
      { id: 4, dimensao: "Geral", texto: "Alguma sugestão para melhorar essa iniciativa?", tipoResposta: "Texto", obrigatoria: "Não" },
    ],
  },
];

const mockResultados = {
  pergunta1: [
    { name: "Sim", value: 87.1 },
    { name: "Não", value: 12.9 },
  ],
  pergunta2: [
    { name: "Todas as alternativas", value: 52.6 },
    { name: "Comprar", value: 21.1 },
    { name: "Vender", value: 10.5 },
    { name: "Trocar", value: 15.8 },
  ],
  pergunta3: [
    { name: "Sim", value: 100 },
  ],
  respostasTexto: [
    { colaborador: "ANA CAROLINA BRAGA DE MOURA", departamento: "Diretoria", resposta: "Não tenho" },
    { colaborador: "JANAINA MARIANI", departamento: "Pessoal", resposta: "Interessante destinar todo o dinheiro para compra das cestas." },
    { colaborador: "Nayara Rocha", departamento: "Pessoal", resposta: "Ajudar o próximo é ajudar a nós mesmos a ser..." },
  ],
};

export default function SuperPesquisa() {
  const [view, setView] = useState<View>("list");
  const [pesquisas, setPesquisas] = useState<SuperPesquisaItem[]>(mockPesquisas);
  const [selectedPesquisa, setSelectedPesquisa] = useState<SuperPesquisaItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<SuperPesquisaItem | null>(null);
  const [perPage, setPerPage] = useState("10");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Form state for create/edit
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    dataEncerramento: "",
    tipoPesquisa: "",
    habilitarVoltar: "Sim",
    papel: "",
    unidade: "",
    departamento: "",
    grupo: "",
    dataAdmissaoInicial: "",
    dataAdmissaoFinal: "",
    lideranca: "",
    lideradosDiretos: false,
    lideradosIndiretos: false,
    colaborador: "",
  });
  const [perguntas, setPerguntas] = useState<Pergunta[]>([
    { id: 1, dimensao: "", texto: "", tipoResposta: "Texto", obrigatoria: "Sim" },
  ]);

  const filteredPesquisas = pesquisas.filter((p) =>
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setFormData({
      titulo: "", descricao: "", dataEncerramento: "", tipoPesquisa: "", habilitarVoltar: "Sim",
      papel: "", unidade: "", departamento: "", grupo: "", dataAdmissaoInicial: "", dataAdmissaoFinal: "",
      lideranca: "", lideradosDiretos: false, lideradosIndiretos: false, colaborador: "",
    });
    setPerguntas([{ id: 1, dimensao: "", texto: "", tipoResposta: "Texto", obrigatoria: "Sim" }]);
    setView("create");
  };

  const handleEdit = (pesquisa: SuperPesquisaItem) => {
    setSelectedPesquisa(pesquisa);
    setFormData({
      titulo: pesquisa.titulo,
      descricao: pesquisa.descricao,
      dataEncerramento: "",
      tipoPesquisa: pesquisa.tiposPesquisa,
      habilitarVoltar: pesquisa.habilitarVoltar,
      papel: "", unidade: "", departamento: "", grupo: "", dataAdmissaoInicial: "", dataAdmissaoFinal: "",
      lideranca: "", lideradosDiretos: false, lideradosIndiretos: false, colaborador: "",
    });
    setPerguntas(pesquisa.perguntas);
    setView("edit");
  };

  const handleSave = () => {
    if (!formData.titulo) {
      toast({ title: "Erro", description: "Preencha o título da pesquisa.", variant: "destructive" });
      return;
    }
    if (view === "edit" && selectedPesquisa) {
      setPesquisas(pesquisas.map((p) =>
        p.id === selectedPesquisa.id ? { ...p, titulo: formData.titulo, descricao: formData.descricao, perguntas } : p
      ));
    } else {
      const nova: SuperPesquisaItem = {
        id: Date.now(),
        titulo: formData.titulo,
        dataCriacao: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }),
        dataEncerramento: formData.dataEncerramento || "-",
        participantes: 0,
        respondentes: 0,
        status: "Ativo",
        descricao: formData.descricao,
        tiposPesquisa: formData.tipoPesquisa,
        habilitarVoltar: formData.habilitarVoltar,
        perguntas,
      };
      setPesquisas([...pesquisas, nova]);
    }
    toast({ title: "Sucesso", description: "Pesquisa salva com sucesso!" });
    setView("list");
  };

  const handleDelete = () => {
    if (deleteTarget !== null) {
      setPesquisas(pesquisas.filter((p) => p.id !== deleteTarget));
      toast({ title: "Excluída", description: "Pesquisa deletada com sucesso." });
    }
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  const handleDuplicate = () => {
    if (duplicateTarget) {
      const nova: SuperPesquisaItem = {
        ...duplicateTarget,
        id: Date.now(),
        titulo: `${duplicateTarget.titulo} (Cópia)`,
        dataCriacao: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }),
        respondentes: 0,
        status: "Inativo",
      };
      setPesquisas([...pesquisas, nova]);
      toast({ title: "Duplicada", description: "Pesquisa duplicada com sucesso!" });
    }
    setShowDuplicateDialog(false);
    setDuplicateTarget(null);
  };

  const addPergunta = () => {
    setPerguntas([...perguntas, { id: perguntas.length + 1, dimensao: "", texto: "", tipoResposta: "Texto", obrigatoria: "Sim" }]);
  };

  const removePergunta = (id: number) => {
    if (perguntas.length > 1) {
      setPerguntas(perguntas.filter((p) => p.id !== id));
    }
  };

  // ==================== RESULTS VIEW ====================
  if (view === "results" && selectedPesquisa) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setView("list")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#2a5298]">Super Pesquisa</h1>
        </div>

        {/* Header */}
        <Card className="border-[#2a5298] border-2">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">
                  Resultado da Super Pesquisa <strong>{selectedPesquisa.titulo}</strong> criada por <strong>ANA CAROLINA BRAGA DE MOURA</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-2">{selectedPesquisa.descricao}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-[#2a5298]">{selectedPesquisa.respondentes}/{selectedPesquisa.participantes}</span>
                <p className="text-sm text-muted-foreground">Respondentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Gerais */}
        <Card className="border-[#2a5298] border-2">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg underline mb-3">Informações Gerais:</h3>
            <div className="space-y-2 text-sm">
              <p>Data de Início: <strong>{selectedPesquisa.dataCriacao}</strong></p>
              <p>Data de Término: <strong>{selectedPesquisa.dataEncerramento}</strong></p>
              <p>Enviado para os papéis: <Badge className="bg-[#2a5298]">Todos os papéis</Badge></p>
              <p>Enviado para as unidades: <Badge className="bg-[#2a5298]">Escritório</Badge></p>
              <p>Enviado para os departamentos: <Badge className="bg-[#2a5298]">Escritório</Badge></p>
              <p>Enviado para os colaboradores: <Badge className="bg-[#2a5298]">Escritório</Badge></p>
              <p>Data de admissão inicial: <Badge className="bg-[#2a5298]">Escritório</Badge></p>
              <p>Data de admissão final: <Badge className="bg-amber-500">01/01/2028</Badge></p>
            </div>
            <div className="flex justify-end mt-4">
              <Button className="bg-[#2a5298] hover:bg-[#1e3d6f]">Enviar Lembrete</Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtros Colaboradores */}
        <Card className="border-[#2a5298] border-2">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Colaboradores</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-xs">Papel</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione o papel" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select>
              </div>
              <div>
                <Label className="text-xs">Unidades</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger><SelectContent><SelectItem value="todas">Todas</SelectItem></SelectContent></Select>
              </div>
              <div>
                <Label className="text-xs">Departamentos</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione o departamento" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-xs">Grupos</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione o grupo" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select>
              </div>
              <div>
                <Label className="text-xs">Data admissão inicial</Label>
                <Input type="date" />
              </div>
              <div>
                <Label className="text-xs">Data admissão final</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-xs">Liderança</Label>
                <Select><SelectTrigger><SelectValue placeholder="Selecione a liderança" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent></Select>
              </div>
              <div className="flex items-end gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox id="diretos-r" />
                  <Label htmlFor="diretos-r" className="text-sm">Liderados diretos</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="indiretos-r" />
                  <Label htmlFor="indiretos-r" className="text-sm">Liderados indiretos</Label>
                </div>
              </div>
            </div>
            <Button className="bg-[#2a5298] hover:bg-[#1e3d6f]">Filtrar</Button>
          </CardContent>
        </Card>

        {/* Gráficos das perguntas */}
        <div className="grid grid-cols-2 gap-6">
          {/* Pergunta 1 */}
          <Card className="border-[#2a5298] border-2">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground mb-1">Pergunta #1</p>
              <h4 className="font-bold mb-4">Vocês gostariam de participar de algo assim?</h4>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie data={mockResultados.pergunta1} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={({ value }) => `${value}%`}>
                      {mockResultados.pergunta1.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1">
                  {mockResultados.pergunta1.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pergunta 2 */}
          <Card className="border-[#2a5298] border-2">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground mb-1">Pergunta #2</p>
              <h4 className="font-bold mb-4">Teriam interesse em vender, trocar ou comprar?</h4>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie data={mockResultados.pergunta2} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={({ value }) => `${value}%`}>
                      {mockResultados.pergunta2.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1">
                  {mockResultados.pergunta2.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pergunta 3 */}
          <Card className="border-[#2a5298] border-2">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground mb-1">Pergunta #3</p>
              <h4 className="font-bold mb-4">Acham válida a ideia da doação?</h4>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie data={mockResultados.pergunta3} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={({ value }) => `${value}%`}>
                      {mockResultados.pergunta3.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1">
                  {mockResultados.pergunta3.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pergunta 4 - Texto */}
          <Card className="border-[#2a5298] border-2">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pergunta #4</p>
                  <h4 className="font-bold">Alguma sugestão para melhorar essa iniciativa?</h4>
                </div>
                <Button variant="link" className="text-[#2a5298] text-xs p-0">Expandir</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Colaborador</TableHead>
                    <TableHead className="text-xs">Departamento</TableHead>
                    <TableHead className="text-xs">Resposta</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockResultados.respostasTexto.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{r.colaborador}</TableCell>
                      <TableCell className="text-xs">{r.departamento}</TableCell>
                      <TableCell className="text-xs">{r.resposta}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Exportar */}
        <div className="flex justify-end">
          <Button className="bg-[#2a5298] hover:bg-[#1e3d6f]">Exportar</Button>
        </div>
      </div>
    );
  }

  // ==================== CREATE / EDIT VIEW ====================
  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setView("list")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#2a5298]">Super Pesquisa</h1>
            <p className="text-sm text-muted-foreground">Crie e analise pesquisas completas de forma muito fácil e rápida!</p>
          </div>
        </div>

        {/* Participantes */}
        <Card className="border-[#2a5298] border-2">
          <CardHeader>
            <CardTitle className="text-lg">Participantes</CardTitle>
            <p className="text-sm text-muted-foreground">Selecione os colaboradores que irão receber a Super Pesquisa</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Papel</Label>
                <Select value={formData.papel} onValueChange={(v) => setFormData({ ...formData, papel: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o papel" /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="gestor">Gestor</SelectItem><SelectItem value="colaborador">Colaborador</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Unidades</Label>
                <Select value={formData.unidade} onValueChange={(v) => setFormData({ ...formData, unidade: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                  <SelectContent><SelectItem value="escritorio">Escritório</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Departamentos ℹ</Label>
                <Select value={formData.departamento} onValueChange={(v) => setFormData({ ...formData, departamento: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o departamento" /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="ti">TI</SelectItem><SelectItem value="rh">RH</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Grupos</Label>
                <Select value={formData.grupo} onValueChange={(v) => setFormData({ ...formData, grupo: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o grupo" /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Data admissão inicial ℹ</Label>
                <Input type="date" value={formData.dataAdmissaoInicial} onChange={(e) => setFormData({ ...formData, dataAdmissaoInicial: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Data admissão final ℹ</Label>
                <Input type="date" value={formData.dataAdmissaoFinal} onChange={(e) => setFormData({ ...formData, dataAdmissaoFinal: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Lideranças</Label>
                <Select value={formData.lideranca} onValueChange={(v) => setFormData({ ...formData, lideranca: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione a liderança" /></SelectTrigger>
                  <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox id="diretos" checked={formData.lideradosDiretos} onCheckedChange={(c) => setFormData({ ...formData, lideradosDiretos: !!c })} />
                  <Label htmlFor="diretos" className="text-sm">Liderados diretos</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="indiretos" checked={formData.lideradosIndiretos} onCheckedChange={(c) => setFormData({ ...formData, lideradosIndiretos: !!c })} />
                  <Label htmlFor="indiretos" className="text-sm">Liderados indiretos</Label>
                </div>
              </div>
            </div>

            {/* Outros Participantes */}
            <div className="border-t pt-4">
              <h4 className="font-bold mb-2">Outros Participantes</h4>
              <Label className="text-xs">Colaboradores</Label>
              <Select value={formData.colaborador} onValueChange={(v) => setFormData({ ...formData, colaborador: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o colaborador" /></SelectTrigger>
                <SelectContent><SelectItem value="todos">Todos</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Pesquisa */}
        <Card className="border-[#2a5298] border-2">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-xs font-bold">Título da Pesquisa</Label>
              <Input placeholder="Ex.: Pesquisa de final de ano" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs font-bold">Informações sobre a pesquisa</Label>
              <Textarea placeholder="A ideia dessa pesquisa é entendermos como podemos fazer a melhor festa de final de ano!" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-bold">Data de Encerramento</Label>
                <Input type="date" value={formData.dataEncerramento} onChange={(e) => setFormData({ ...formData, dataEncerramento: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-bold">Tipo de Pesquisa</Label>
                <Select value={formData.tipoPesquisa} onValueChange={(v) => setFormData({ ...formData, tipoPesquisa: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anonima">Anônima (não serão identificados os colaboradores)</SelectItem>
                    <SelectItem value="aberta">Aberta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-bold">Habilitar botão voltar?</Label>
                <Select value={formData.habilitarVoltar} onValueChange={(v) => setFormData({ ...formData, habilitarVoltar: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Perguntas */}
        <Card className="border-[#2a5298] border-2">
          <CardContent className="p-6 space-y-4">
            {perguntas.map((pergunta, index) => (
              <div key={pergunta.id} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <div className="w-28">
                  <Label className="text-xs">Dimensão ℹ</Label>
                  <Input placeholder="" value={pergunta.dimensao} onChange={(e) => {
                    const updated = [...perguntas];
                    updated[index].dimensao = e.target.value;
                    setPerguntas(updated);
                  }} className="h-8 text-sm" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Pergunta #{index + 1}</Label>
                  <Input placeholder="" value={pergunta.texto} onChange={(e) => {
                    const updated = [...perguntas];
                    updated[index].texto = e.target.value;
                    setPerguntas(updated);
                  }} className="h-8 text-sm" />
                </div>
                <div className="w-36">
                  <Label className="text-xs">Tipo de Resposta</Label>
                  <Select value={pergunta.tipoResposta} onValueChange={(v) => {
                    const updated = [...perguntas];
                    updated[index].tipoResposta = v;
                    setPerguntas(updated);
                  }}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Texto">Texto</SelectItem>
                      <SelectItem value="Sim/Não">Sim/Não</SelectItem>
                      <SelectItem value="Múltipla Escolha">Múltipla Escolha</SelectItem>
                      <SelectItem value="Escala 1-5">Escala 1-5</SelectItem>
                      <SelectItem value="Escala 1-10">Escala 1-10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-28">
                  <Label className="text-xs">Obrigatório?</Label>
                  <Select value={pergunta.obrigatoria} onValueChange={(v) => {
                    const updated = [...perguntas];
                    updated[index].obrigatoria = v;
                    setPerguntas(updated);
                  }}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive mt-4" onClick={() => removePergunta(pergunta.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="border-[#2a5298] text-[#2a5298]" onClick={addPergunta}>
                Adicionar Pergunta
              </Button>
              <Button className="bg-[#2a5298] hover:bg-[#1e3d6f]" onClick={handleSave}>
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== LIST VIEW ====================
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#2a5298] border-2">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-[#2a5298]">Super Pesquisa</h1>
              <p className="text-sm text-muted-foreground">Crie e analise pesquisas completas de forma muito fácil e rápida!</p>
              <a href="#" className="text-sm text-[#2a5298] underline mt-1 inline-block">Dicas incríveis para criação da pesquisa clicando aqui.</a>
            </div>
            <span className="text-4xl">📋✅</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-[#2a5298] hover:bg-[#1e3d6f] border border-[#2a5298]" onClick={handleCreate}>
          Nova Pesquisa
        </Button>
      </div>

      {/* Tabela */}
      <Card className="border-[#2a5298] border-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Super Pesquisa</CardTitle>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm">
              Exibindo
              <Select value={perPage} onValueChange={setPerPage}>
                <SelectTrigger className="w-16 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              resultados por página
            </div>
            <Input placeholder="Buscar..." className="w-48 h-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="text-center">Data Criação</TableHead>
                <TableHead className="text-center">Data Encerramento</TableHead>
                <TableHead className="text-center">Participantes</TableHead>
                <TableHead className="text-center">Respondentes</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Opções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPesquisas.map((pesquisa) => (
                <TableRow key={pesquisa.id}>
                  <TableCell>{pesquisa.titulo}</TableCell>
                  <TableCell className="text-center">{pesquisa.dataCriacao}</TableCell>
                  <TableCell className="text-center">{pesquisa.dataEncerramento}</TableCell>
                  <TableCell className="text-center">{pesquisa.participantes}</TableCell>
                  <TableCell className="text-center">{pesquisa.respondentes}</TableCell>
                  <TableCell className="text-center">{pesquisa.status}</TableCell>
                  <TableCell className="text-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button className="bg-[#2a5298] hover:bg-[#1e3d6f] text-white text-sm">
                          Detalhes <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-1" align="end">
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded" onClick={() => handleEdit(pesquisa)}>Editar</button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded text-[#2a5298]" onClick={() => { setSelectedPesquisa(pesquisa); setView("results"); }}>Ver resultado</button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded text-amber-600" onClick={() => { setDuplicateTarget(pesquisa); setShowDuplicateDialog(true); }}>Duplicar</button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded text-destructive" onClick={() => { setDeleteTarget(pesquisa.id); setShowDeleteDialog(true); }}>Deletar</button>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPesquisas.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma pesquisa encontrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
            <span>Mostrando de 1 até {filteredPesquisas.length} de {filteredPesquisas.length} registros</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled>Primeiro</Button>
              <Button variant="ghost" size="sm" disabled>Anterior</Button>
              <Button variant="outline" size="sm" className="bg-muted">1</Button>
              <Button variant="ghost" size="sm" disabled>Próximo</Button>
              <Button variant="ghost" size="sm" disabled>Último</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full border-2 border-amber-500 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#2a5298] mb-2">Atenção!</h2>
            <p className="text-muted-foreground mb-1">Essa pesquisa não poderá ser revertida após a exclusão.</p>
            <p className="text-muted-foreground">Você deseja realmente deletar?</p>
          </div>
          <DialogFooter className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button className="bg-[#2a5298] hover:bg-[#1e3d6f]" onClick={handleDelete}>Deletar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full border-2 border-amber-500 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#2a5298] mb-2">Atenção!</h2>
            <p className="text-muted-foreground">Você realmente deseja duplicar essa super pesquisa?</p>
          </div>
          <DialogFooter className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>Cancelar</Button>
            <Button className="bg-[#2a5298] hover:bg-[#1e3d6f]" onClick={handleDuplicate}>Duplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
