import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import { DEPARTAMENTO_OPTIONS } from "@/data/selectOptions";

interface PesquisaRapida {
  id: string;
  pergunta: string;
  descricao: string;
  dataCriacao: string;
  dataEncerramento: string;
  departamentos: string[];
  grupos: string[];
  respostas: number;
  media: number;
  status: boolean;
  tipoPesquisa: "anonima" | "aberta";
  tipoResposta: "texto" | "escala" | "multipla";
  imagem?: string;
  respostasDetalhadas: {
    data: string;
    resposta: string;
    colaborador: string;
    departamento: string;
  }[];
}

const gruposOptions = ["Todos os grupos"];

const mockPesquisas: PesquisaRapida[] = [
  {
    id: "1",
    pergunta: "Vem aí o 2M Move – Movimente saúde, movimente vida...",
    descricao: "Em clima de Outubro Rosa, a 2M Move convida você a viver uma manhã de energia, autocuidado e conexão.",
    dataCriacao: "16/10/25",
    dataEncerramento: "17/10/25",
    departamentos: ["Toda Empresa"],
    grupos: ["Todos os grupos"],
    respostas: 28,
    media: 0.0,
    status: false,
    tipoPesquisa: "aberta",
    tipoResposta: "texto",
    respostasDetalhadas: [
      { data: "17/10/2025", resposta: "Confirmado", colaborador: "SULAMITA BRAS DE OLIVEIRA MACHADO", departamento: "Diretoria" },
      { data: "17/10/2025", resposta: "Infelizmente não vou conseguir participar.", colaborador: "DANIELLE CAMPOS MILLIOR", departamento: "Contábil" },
      { data: "17/10/2025", resposta: "Agradeço muito pelo convite, mas infelizmente não poderei comparecer.", colaborador: "JESSYCA LOPES", departamento: "Fiscal" },
      { data: "17/10/2025", resposta: "Não poderei estar presente, já tenho compromisso na data", colaborador: "STEFANY MELGAÇO LAVINSKY", departamento: "Pessoal" },
      { data: "17/10/2025", resposta: "Não poderia participar, tenho aula nesse dia.", colaborador: "ALINE DAIENE GOULARTH BRANCO", departamento: "Contábil" },
      { data: "17/10/2025", resposta: "Não irei.", colaborador: "THALITA RODRIGUES GUEDES", departamento: "Contábil" },
      { data: "17/10/2025", resposta: "presença confirmada", colaborador: "LIVIA GARCIA XAVIER", departamento: "Coordenação" },
      { data: "17/10/2025", resposta: "Bom dia, eu vou ir sim", colaborador: "DÉBORA SILVA DOS SANTOS", departamento: "Contábil" },
      { data: "17/10/2025", resposta: "Infelizmente não vou poder comparecer :(", colaborador: "ANA LUIZA RIBEIRO", departamento: "Pessoal" },
      { data: "17/10/2025", resposta: "Não irei", colaborador: "LORENA CARDOSO DE OLIVEIRA", departamento: "Pessoal" },
      { data: "16/10/2025", resposta: "Eu vou!", colaborador: "ANA LUIZA CAETANO DE SOUZA", departamento: "Legalização de Empresas" },
      { data: "16/10/2025", resposta: "FERNANDA FABIANA DA SILVA, TÔ LÁ", colaborador: "FERNANDA FABIANA DA SILVA", departamento: "Legalização de Empresas" },
      { data: "16/10/2025", resposta: "Eu queria MUITO ir :( Mas vou estar de férias e ainda vou estar viajando nessa data.", colaborador: "GABRIELA CALDEIRA NUNES VERA", departamento: "Legalização de Empresas" },
      { data: "16/10/2025", resposta: "Eu vou ❤️", colaborador: "KAMILA ALMEIDA", departamento: "Pessoal" },
    ],
  },
  {
    id: "2",
    pergunta: "Pesquisa acadêmica – apoio à Fernanda",
    descricao: "",
    dataCriacao: "10/10/25",
    dataEncerramento: "17/10/25",
    departamentos: ["Toda Empresa"],
    grupos: ["Todos os grupos"],
    respostas: 22,
    media: 0.0,
    status: false,
    tipoPesquisa: "anonima",
    tipoResposta: "texto",
    respostasDetalhadas: [],
  },
  {
    id: "3",
    pergunta: "Após a mudança do pacote Office instalado para o O...",
    descricao: "",
    dataCriacao: "13/08/25",
    dataEncerramento: "15/08/25",
    departamentos: [],
    grupos: [],
    respostas: 25,
    media: 0.0,
    status: false,
    tipoPesquisa: "anonima",
    tipoResposta: "texto",
    respostasDetalhadas: [],
  },
  {
    id: "4",
    pergunta: "Você quer participar do Amigo Chocolate? 🍫🎅",
    descricao: "",
    dataCriacao: "31/03/25",
    dataEncerramento: "04/04/25",
    departamentos: ["Toda Empresa"],
    grupos: ["Todos os grupos"],
    respostas: 29,
    media: 0.0,
    status: false,
    tipoPesquisa: "anonima",
    tipoResposta: "texto",
    respostasDetalhadas: [],
  },
  {
    id: "5",
    pergunta: "🍹 Preferências de Bebidas para a Confraternização ...",
    descricao: "",
    dataCriacao: "02/12/24",
    dataEncerramento: "04/12/24",
    departamentos: ["Toda Empresa"],
    grupos: ["Todos os grupos"],
    respostas: 30,
    media: 0.0,
    status: false,
    tipoPesquisa: "anonima",
    tipoResposta: "texto",
    respostasDetalhadas: [],
  },
  {
    id: "6",
    pergunta: "Você vai participar da nossa confraternização de f...",
    descricao: "",
    dataCriacao: "26/11/24",
    dataEncerramento: "28/11/24",
    departamentos: ["Toda Empresa"],
    grupos: [],
    respostas: 32,
    media: 0.0,
    status: false,
    tipoPesquisa: "anonima",
    tipoResposta: "texto",
    respostasDetalhadas: [],
  },
  {
    id: "7",
    pergunta: "Descreva detalhadamente todos as suas responsabili...",
    descricao: "",
    dataCriacao: "10/09/24",
    dataEncerramento: "13/09/24",
    departamentos: ["Toda Empresa"],
    grupos: [],
    respostas: 28,
    media: 0.0,
    status: false,
    tipoPesquisa: "anonima",
    tipoResposta: "texto",
    respostasDetalhadas: [],
  },
  {
    id: "8",
    pergunta: "Quem deve vencer o concurso do Arraiá 2M!",
    descricao: "",
    dataCriacao: "29/07/24",
    dataEncerramento: "30/07/24",
    departamentos: ["Toda Empresa"],
    grupos: ["Todos os grupos"],
    respostas: 32,
    media: 0.0,
    status: false,
    tipoPesquisa: "anonima",
    tipoResposta: "texto",
    respostasDetalhadas: [],
  },
  {
    id: "9",
    pergunta: "Que tipo de produtos ou marcas você gostaria de ve...",
    descricao: "",
    dataCriacao: "24/04/24",
    dataEncerramento: "31/05/24",
    departamentos: ["Toda Empresa"],
    grupos: ["Todos os grupos"],
    respostas: 22,
    media: 0.0,
    status: false,
    tipoPesquisa: "anonima",
    tipoResposta: "texto",
    respostasDetalhadas: [],
  },
];

type View = "list" | "create" | "results";

const PesquisaRapidaPage = () => {
  const [pesquisas, setPesquisas] = useState<PesquisaRapida[]>(mockPesquisas);
  const [view, setView] = useState<View>("list");
  const [selectedPesquisa, setSelectedPesquisa] = useState<PesquisaRapida | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [pesquisaToDelete, setPesquisaToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage, setPerPage] = useState("10");

  // Create form state
  const [formPergunta, setFormPergunta] = useState("");
  const [formDescricao, setFormDescricao] = useState("");
  const [formDepartamento, setFormDepartamento] = useState("");
  const [formDataEncerramento, setFormDataEncerramento] = useState("");
  const [formGrupos, setFormGrupos] = useState("");
  const [formTipoPesquisa, setFormTipoPesquisa] = useState("anonima");
  const [formTipoResposta, setFormTipoResposta] = useState("texto");

  const handleDelete = () => {
    if (pesquisaToDelete) {
      setPesquisas(prev => prev.filter(p => p.id !== pesquisaToDelete));
      setPesquisaToDelete(null);
      setDeleteDialog(false);
    }
  };

  const handleCreate = () => {
    const nova: PesquisaRapida = {
      id: Date.now().toString(),
      pergunta: formPergunta,
      descricao: formDescricao,
      dataCriacao: new Date().toLocaleDateString("pt-BR"),
      dataEncerramento: formDataEncerramento ? new Date(formDataEncerramento).toLocaleDateString("pt-BR") : "",
      departamentos: formDepartamento ? [formDepartamento] : ["Toda Empresa"],
      grupos: formGrupos ? [formGrupos] : ["Todos os grupos"],
      respostas: 0,
      media: 0,
      status: true,
      tipoPesquisa: formTipoPesquisa as "anonima" | "aberta",
      tipoResposta: formTipoResposta as "texto" | "escala" | "multipla",
      respostasDetalhadas: [],
    };
    setPesquisas(prev => [nova, ...prev]);
    resetForm();
    setView("list");
  };

  const resetForm = () => {
    setFormPergunta("");
    setFormDescricao("");
    setFormDepartamento("");
    setFormDataEncerramento("");
    setFormGrupos("");
    setFormTipoPesquisa("anonima");
    setFormTipoResposta("texto");
  };

  const filteredPesquisas = pesquisas.filter(p =>
    p.pergunta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === "results" && selectedPesquisa) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[#2a7ac5] text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold">Detalhamento da pesquisa rápida</h1>
        </div>

        {/* Details card */}
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div className="space-y-1 text-sm">
            <p><strong>Criado por:</strong> ANA LUIZA GABRICH</p>
            <p><strong>Data de Início:</strong> {selectedPesquisa.dataCriacao}</p>
            <div className="flex items-center gap-2">
              <strong>Enviado para os departamentos:</strong>
              {selectedPesquisa.departamentos.map((d, i) => (
                <Badge key={i} className="bg-[#2a7ac5] text-white">{d}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <strong>Enviado para os grupos:</strong>
              {selectedPesquisa.grupos.length > 0 ? selectedPesquisa.grupos.map((g, i) => (
                <Badge key={i} className="bg-orange-500 text-white">{g}</Badge>
              )) : <span className="text-muted-foreground">—</span>}
            </div>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded space-y-1">
            <p className="font-semibold text-orange-800">Pergunta realizada: <span className="italic font-normal">"{selectedPesquisa.pergunta}"</span></p>
            {selectedPesquisa.descricao && (
              <p className="text-sm text-orange-700"><strong>Descrição da pergunta:</strong> {selectedPesquisa.descricao}</p>
            )}
          </div>

          <p className="text-sm font-semibold">
            Respostas <span className="text-[#2a7ac5]">{selectedPesquisa.respostasDetalhadas.length}/{selectedPesquisa.respostas + 14}</span>
          </p>
        </div>

        {/* Responses table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Data</TableHead>
                <TableHead className="font-semibold">Resposta</TableHead>
                <TableHead className="font-semibold">Colaborador</TableHead>
                <TableHead className="font-semibold">Departamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedPesquisa.respostasDetalhadas.length > 0 ? (
                selectedPesquisa.respostasDetalhadas.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{r.data}</TableCell>
                    <TableCell className="text-sm">{r.resposta}</TableCell>
                    <TableCell className="text-sm font-medium">{r.colaborador}</TableCell>
                    <TableCell className="text-sm">{r.departamento}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma resposta registrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Button variant="outline" onClick={() => { setView("list"); setSelectedPesquisa(null); }}>
          Voltar
        </Button>
      </div>
    );
  }

  if (view === "create") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-[#2a7ac5] text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold">Pesquisa Rápida</h1>
          <p className="text-sm mt-1 text-blue-100">
            Crie uma pesquisa rápida sobre qualquer coisa, desde o local da festa de encerramento da firma, até a nova máquina de café do refeitório. Você pode aproveitar também para divulgar internamente as principais notícias da empresa, só que em um formato mais inovador e interativo, através de rápidas pesquisas. Explore sua criatividade e divirta-se!
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border-2 border-[#2a7ac5] rounded-lg p-6 space-y-5">
          <div>
            <label className="block font-semibold mb-1">Defina a pergunta principal da pesquisa</label>
            <Input
              placeholder="Ex.: O que você achou da nova cafeteira que foi disponibilizada?"
              value={formPergunta}
              onChange={e => setFormPergunta(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Descreva em poucas palavras alguns detalhes sobre a pergunta</label>
            <Textarea
              value={formDescricao}
              onChange={e => setFormDescricao(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Selecione um departamento</label>
              <Select value={formDepartamento} onValueChange={setFormDepartamento}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Toda Empresa">Toda Empresa</SelectItem>
                  {DEPARTAMENTO_OPTIONS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Data de Encerramento</label>
              <Input
                type="date"
                value={formDataEncerramento}
                onChange={e => setFormDataEncerramento(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Insira uma imagem</label>
              <Input type="file" accept="image/*" />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Selecione os grupos desejados</label>
            <Select value={formGrupos} onValueChange={setFormGrupos}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {gruposOptions.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Tipo de Pesquisa</label>
              <Select value={formTipoPesquisa} onValueChange={setFormTipoPesquisa}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="anonima">Anônima (não serão identificados os colaboradores)</SelectItem>
                  <SelectItem value="aberta">Aberta (os colaboradores serão identificados)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Tipo de Resposta</label>
              <Select value={formTipoResposta} onValueChange={setFormTipoResposta}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="texto">Apenas Texto</SelectItem>
                  <SelectItem value="escala">Escala (1-5)</SelectItem>
                  <SelectItem value="multipla">Múltipla Escolha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { resetForm(); setView("list"); }}>Cancelar</Button>
              <Button className="bg-[#2a7ac5] hover:bg-[#1e5a94]" onClick={handleCreate}>Enviar Pesquisa</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#2a7ac5] text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Pesquisa Rápida</h1>
        <p className="text-sm mt-1 text-blue-100">
          A Pesquisa Rápida tem como objetivo estimular a interação com os colaboradores e tornar a comunicação na empresa mais integrada. Saber o que seus colaboradores acham é fundamental para que sua comunicação esteja alinhada ao propósito individual e coletivo.
        </p>
      </div>

      {/* Pesquisas Rápidas */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Pesquisas Rápidas</h2>
          <Button className="bg-[#2a7ac5] hover:bg-[#1e5a94]" onClick={() => setView("create")}>
            Nova Pesquisa
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span>Exibindo</span>
            <Select value={perPage} onValueChange={setPerPage}>
              <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>resultados por página</span>
          </div>
          <Input
            placeholder="Buscar..."
            className="w-48 h-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Pesquisa</TableHead>
              <TableHead className="font-semibold">Data Criação</TableHead>
              <TableHead className="font-semibold">Data Encerramento</TableHead>
              <TableHead className="font-semibold">Departamentos</TableHead>
              <TableHead className="font-semibold">Respostas</TableHead>
              <TableHead className="font-semibold">Média</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPesquisas.map(p => (
              <TableRow key={p.id}>
                <TableCell className="text-sm max-w-[200px] truncate">{p.pergunta}</TableCell>
                <TableCell className="text-sm">{p.dataCriacao}</TableCell>
                <TableCell className="text-sm">{p.dataEncerramento}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {p.departamentos.map((d, i) => (
                      <Badge key={i} className="bg-[#2a7ac5] text-white text-xs">{d}</Badge>
                    ))}
                    {p.grupos.map((g, i) => (
                      <Badge key={`g-${i}`} className="bg-orange-500 text-white text-xs">{g}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-center">{p.respostas}</TableCell>
                <TableCell className="text-sm text-center">{p.media.toFixed(1)}</TableCell>
                <TableCell>
                  <Switch
                    checked={p.status}
                    onCheckedChange={(checked) => {
                      setPesquisas(prev => prev.map(x => x.id === p.id ? { ...x, status: checked } : x));
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs">Ações ▾</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-1" align="end">
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded"
                        onClick={() => { setSelectedPesquisa(p); setView("results"); }}
                      >
                        Resultado
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded text-red-600"
                        onClick={() => { setPesquisaToDelete(p.id); setDeleteDialog(true); }}
                      >
                        Apagar
                      </button>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>Mostrando de 1 até {filteredPesquisas.length} de {filteredPesquisas.length} registros</span>
          <div className="flex gap-1">
            {["Primeiro", "Anterior"].map(l => (
              <Button key={l} variant="ghost" size="sm" className="text-xs" disabled>{l}</Button>
            ))}
            <Button variant="outline" size="sm" className="text-xs bg-[#2a7ac5] text-white">1</Button>
            {["Próximo", "Último"].map(l => (
              <Button key={l} variant="ghost" size="sm" className="text-xs" disabled>{l}</Button>
            ))}
          </div>
        </div>
      </div>

      {/* Pesquisas Rápidas dos Gestores */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">Pesquisas Rápidas dos Gestores</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span>Exibindo</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
              </SelectContent>
            </Select>
            <span>resultados por página</span>
          </div>
          <Input placeholder="Buscar..." className="w-48 h-8" />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Gestor</TableHead>
              <TableHead className="font-semibold">Pesquisa</TableHead>
              <TableHead className="font-semibold">Data Criação</TableHead>
              <TableHead className="font-semibold">Data Encerramento</TableHead>
              <TableHead className="font-semibold">Departamentos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                Nenhum registro encontrado
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>Mostrando 0 até 0 de 0 registros</span>
          <div className="flex gap-1">
            {["Primeiro", "Anterior", "Próximo", "Último"].map(l => (
              <Button key={l} variant="ghost" size="sm" className="text-xs" disabled>{l}</Button>
            ))}
          </div>
        </div>
      </div>

      {/* Delete dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-orange-400 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-orange-500">Atenção!</DialogTitle>
          <p className="text-muted-foreground">Essa pesquisa não poderá ser recuperada após a exclusão.</p>
          <p className="font-medium">Você deseja realmente deletar?</p>
          <DialogFooter className="flex justify-center gap-3 mt-4 sm:justify-center">
            <Button variant="outline" className="px-8" onClick={() => setDeleteDialog(false)}>Cancelar</Button>
            <Button className="bg-[#2a7ac5] hover:bg-[#1e5a94] px-8" onClick={handleDelete}>Apagar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PesquisaRapidaPage;
