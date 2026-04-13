import { useState } from "react";
import { Search, Plus, Filter, Users, ChevronDown, X, ArrowLeft, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UNIDADE_OPTIONS, DEPARTAMENTO_OPTIONS } from "@/data/selectOptions";
import { useCargos } from "@/stores/cargosStore";

const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const SEXO_OPTIONS = ["Masculino", "Feminino", "Outro", "Prefiro não informar"];
const GENERO_OPTIONS = ["Masculino", "Feminino", "Não-binário", "Outro", "Prefiro não informar"];
const ETNIA_OPTIONS = ["Branca", "Preta", "Parda", "Amarela", "Indígena", "Prefiro não informar"];
const SEXUALIDADE_OPTIONS = ["Heterossexual", "Homossexual", "Bissexual", "Outro", "Prefiro não informar"];
const GRAU_INSTRUCAO_OPTIONS = ["Ensino Fundamental", "Ensino Médio", "Superior Incompleto", "Superior Completo", "Pós-graduação", "Mestrado", "Doutorado"];
const ESTADO_CIVIL_OPTIONS = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"];
const TIPO_CONTATO_EMERGENCIA = ["Pai", "Mãe", "Cônjuge", "Irmão(ã)", "Amigo(a)", "Outro"];
const TIPO_VINCULO_OPTIONS = ["CLT", "Sócio", "Estágio", "PJ", "Cooperado", "Jovem Aprendiz"];
const NIVEL_HIERARQUICO_OPTIONS = ["Auxiliar", "Assistente", "Analista", "Coordenador", "Gerente", "Diretor"];
const NIVEL_SALARIAL_OPTIONS = ["Júnior", "Pleno", "Sênior"];
const BANCO_OPTIONS = ["Banco do Brasil", "Bradesco", "Caixa Econômica", "Itaú", "Santander", "Nubank", "Inter", "C6 Bank", "Sicoob", "Sicredi", "Outro"];
const TIPO_CONTA_OPTIONS = ["Conta Corrente", "Conta Poupança", "Conta Salário"];
const TAMANHO_CAMISETA = ["PP", "P", "M", "G", "GG", "XG"];
const PREF_ALIMENTAR = ["Sem restrição", "Vegetariano", "Vegano", "Intolerante à lactose", "Celíaco", "Outro"];

interface Colaborador {
  id: string;
  nomeCompleto: string;
  nomeVisivel: string;
  cargo: string;
  gestorDireto: string;
  gestorCargo: string;
  unidade: string;
  departamento: string;
  papel: string;
  status: string;
  tag?: string;
}

export default function Colaboradores() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [colaboradores] = useState<Colaborador[]>([]);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterPapel, setFilterPapel] = useState<string[]>([]);
  const [filterCargo, setFilterCargo] = useState("");
  const [filterDepartamento, setFilterDepartamento] = useState("");
  const [filterUnidade, setFilterUnidade] = useState("");
  const [filterGestor, setFilterGestor] = useState("");

  const counts = {
    ativos: colaboradores.filter(c => c.status === "Ativo").length,
    desativados: colaboradores.filter(c => c.status === "Desativado").length,
    desligados: colaboradores.filter(c => c.status === "Desligado").length,
    importados: colaboradores.filter(c => c.status === "Importado").length,
    visitantes: colaboradores.filter(c => c.papel === "Visitante").length,
  };

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const clearFilters = () => {
    setFilterStatus([]);
    setFilterPapel([]);
    setFilterCargo("");
    setFilterDepartamento("");
    setFilterUnidade("");
    setFilterGestor("");
  };

  const filtered = colaboradores.filter(c => {
    if (search && !c.nomeCompleto.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus.length && !filterStatus.includes(c.status)) return false;
    if (filterPapel.length && !filterPapel.includes(c.papel)) return false;
    if (filterUnidade && c.unidade !== filterUnidade) return false;
    if (filterDepartamento && c.departamento !== filterDepartamento) return false;
    return true;
  });

  if (showAddForm) {
    return <AddColaboradorForm onBack={() => setShowAddForm(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Colaboradores</h1>
          <p className="text-sm text-muted-foreground">Adicione e gerencie seus colaboradores dentro da plataforma.</p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">{counts.ativos}</span> Ativos • <span className="font-semibold text-foreground">{counts.desativados}</span> Desativados • <span className="font-semibold text-foreground">{counts.desligados}</span> Desligados • <span className="font-semibold text-foreground">{counts.importados}</span> Importado • <span className="font-semibold text-foreground">{counts.visitantes}</span> Visitante
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={() => setShowAddForm(true)}>
            Adicionar
          </Button>
          <Button variant="outline" className="gap-2">
            Importar <ChevronDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <span className="text-lg">⋮</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquise colaboradores pelo nome, e-mail, matrícula ou CPF"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Button variant="outline" className="gap-2 px-6" onClick={() => setShowFilters(true)}>
          Filtros <Filter className="h-4 w-4" />
        </Button>
      </div>

      {filtered.length > 0 ? (
        <div className="rounded-xl bg-card card-shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold italic">Colaborador</TableHead>
                <TableHead className="font-semibold italic">Gestor direto</TableHead>
                <TableHead className="font-semibold italic">Unidade</TableHead>
                <TableHead className="font-semibold italic">Departamento</TableHead>
                <TableHead className="font-semibold italic">Papel</TableHead>
                <TableHead className="font-semibold italic">Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-muted text-xs">{c.nomeCompleto.split(" ").map(n => n[0]).slice(0, 2).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{c.nomeCompleto}</p>
                        <p className="text-xs text-muted-foreground">{c.cargo}</p>
                        {c.tag && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.tag}</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{c.gestorDireto}</p>
                    <p className="text-xs text-muted-foreground">{c.gestorCargo}</p>
                  </TableCell>
                  <TableCell className="text-sm">{c.unidade || "-"}</TableCell>
                  <TableCell className="text-sm">{c.departamento}</TableCell>
                  <TableCell className="text-sm">{c.papel}</TableCell>
                  <TableCell className="text-sm">{c.status}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <span>⋮</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl bg-card p-16 card-shadow">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Nenhum colaborador cadastrado</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Adicione colaboradores para começar a gerenciar sua equipe.
          </p>
        </div>
      )}

      {/* Filters Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent className="w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            {/* Status */}
            <FilterSection title="Status">
              <div className="grid grid-cols-2 gap-3">
                {["Importado", "Desativado", "Ativo", "Desligado"].map(s => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={filterStatus.includes(s)} onCheckedChange={() => toggleFilter(filterStatus, s, setFilterStatus)} />
                    {s}
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Papel */}
            <FilterSection title="Papel">
              <div className="grid grid-cols-2 gap-3">
                {["Colaborador", "Gestor", "Admin", "Visitante"].map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={filterPapel.includes(p)} onCheckedChange={() => toggleFilter(filterPapel, p, setFilterPapel)} />
                    {p}
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Cargo */}
            <FilterSection title="Cargo">
              <Select value={filterCargo} onValueChange={setFilterCargo}>
                <SelectTrigger><SelectValue placeholder="Selecione os cargos desejados" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </FilterSection>

            {/* Departamento */}
            <FilterSection title="Departamento">
              <Select value={filterDepartamento} onValueChange={setFilterDepartamento}>
                <SelectTrigger><SelectValue placeholder="Selecione os departamentos desejados" /></SelectTrigger>
                <SelectContent>
                  {DEPARTAMENTO_OPTIONS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>

            {/* Unidade */}
            <FilterSection title="Unidade">
              <Select value={filterUnidade} onValueChange={setFilterUnidade}>
                <SelectTrigger><SelectValue placeholder="Selecione as unidades desejadas" /></SelectTrigger>
                <SelectContent>
                  {UNIDADE_OPTIONS.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterSection>

            {/* Gestor direto */}
            <FilterSection title="Gestor direto">
              <Select value={filterGestor} onValueChange={setFilterGestor}>
                <SelectTrigger><SelectValue placeholder="Selecione o gestor desejado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </FilterSection>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4 border-t">
            <Button variant="ghost" onClick={clearFilters}>Limpar filtros</Button>
            <Button onClick={() => setShowFilters(false)}>Aplicar</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="pl-1">{children}</div>
    </div>
  );
}

// =================== ADD COLABORADOR FORM ===================

function AddColaboradorForm({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("identificacao");
  const { cargos } = useCargos();

  // Header state
  const [status, setStatus] = useState("Ativo");
  const [importado, setImportado] = useState(false);
  const [ranking, setRanking] = useState(true);

  // Identificação
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomeVisivel, setNomeVisivel] = useState("");
  const [emailPessoal, setEmailPessoal] = useState("");
  const [celular, setCelular] = useState("");
  const [cpf, setCpf] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [rg, setRg] = useState("");
  const [ufRg, setUfRg] = useState("");
  const [sexo, setSexo] = useState("");
  const [genero, setGenero] = useState("");
  const [etnia, setEtnia] = useState("");
  const [sexualidade, setSexualidade] = useState("");
  const [grauInstrucao, setGrauInstrucao] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  // Contato emergência
  const [tipoContatoEmergencia, setTipoContatoEmergencia] = useState("");
  const [nomeContatoEmergencia, setNomeContatoEmergencia] = useState("");
  const [telContatoEmergencia, setTelContatoEmergencia] = useState("");

  // Residência
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [semNumero, setSemNumero] = useState(false);
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [ufResidencia, setUfResidencia] = useState("");

  // Dependentes
  const [dependentes, setDependentes] = useState<{nome: string; cpf: string; dataNascimento: string; tipoDependente: string; deducaoIRRF: boolean; salarioFamilia: boolean; incapacidade: boolean; collapsed: boolean}[]>([]);

  // Info adicionais
  const [tamanhoCamiseta, setTamanhoCamiseta] = useState("");
  const [prefAlimentar, setPrefAlimentar] = useState("");
  const [equipamentos, setEquipamentos] = useState("");
  const [divideResidencia, setDivideResidencia] = useState("");

  // Contratação
  const [email, setEmail] = useState("");
  const [dataAdmissao, setDataAdmissao] = useState("");
  const [matricula, setMatricula] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [jornadaTrabalho, setJornadaTrabalho] = useState("");

  // Cargo
  const [cargoNome, setCargoNome] = useState("");
  const [cargoVisivel, setCargoVisivel] = useState("");
  const [cargoCbo, setCargoCbo] = useState("");
  const [nivelHierarquico, setNivelHierarquico] = useState("");
  const [nivelSalarial, setNivelSalarial] = useState("");
  const [remuneracao, setRemuneracao] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [unidade, setUnidade] = useState("");
  const [gestorDireto, setGestorDireto] = useState("");
  const [grupos, setGrupos] = useState("");

  // CLT
  const [numeroCTPS, setNumeroCTPS] = useState("");
  const [serieCTPS, setSerieCTPS] = useState("");
  const [primeiroEmprego, setPrimeiroEmprego] = useState("nao");
  const [pisPasep, setPisPasep] = useState("");

  // PJ
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState("");
  const [cepPJ, setCepPJ] = useState("");
  const [enderecoPJ, setEnderecoPJ] = useState("");
  const [numeroPJ, setNumeroPJ] = useState("");
  const [semNumeroPJ, setSemNumeroPJ] = useState(false);
  const [complementoPJ, setComplementoPJ] = useState("");
  const [bairroPJ, setBairroPJ] = useState("");
  const [municipioPJ, setMunicipioPJ] = useState("");
  const [ufPJ, setUfPJ] = useState("");

  // Dados Bancários
  const [banco, setBanco] = useState("");
  const [tipoConta, setTipoConta] = useState("");
  const [numeroConta, setNumeroConta] = useState("");
  const [digitoConta, setDigitoConta] = useState("");
  const [numeroAgencia, setNumeroAgencia] = useState("");
  const [digitoAgencia, setDigitoAgencia] = useState("");
  const [chavePix, setChavePix] = useState("");

  // Papel
  const [papel, setPapel] = useState("Colaborador");

  // Permissões
  const [depGerenciados, setDepGerenciados] = useState("");
  const [unidadesGerenciadas, setUnidadesGerenciadas] = useState("");
  const [permTab, setPermTab] = useState("geral");

  // Permissões checkboxes
  const [permColaboradores, setPermColaboradores] = useState(false);
  const [permColaboradoresAcesso, setPermColaboradoresAcesso] = useState(false);
  const [permCelebracoes, setPermCelebracoes] = useState(false);
  const [permGamificacao, setPermGamificacao] = useState(false);
  const [permComunicados, setPermComunicados] = useState(false);
  const [permOuvidoria, setPermOuvidoria] = useState(false);
  const [permReunioes, setPermReunioes] = useState(false);
  const [reunioesScope, setReunioesScope] = useState("todas");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full border">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Adicionar colaborador</h1>
      </div>

      {/* Info bar */}
      <div className="bg-card rounded-xl p-4 card-shadow flex items-center gap-8">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-muted">NC</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">Novo Colaborador</p>
            <p className="text-xs text-muted-foreground">Desconhecido</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Gestor direto</p>
          <p className="text-sm font-medium">Desconhecido</p>
          <p className="text-xs text-muted-foreground">Gestor direto</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Status</p>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-1">
              <input type="radio" name="status" value="Ativo" checked={status === "Ativo"} onChange={() => setStatus("Ativo")} className="accent-primary" /> Ativo <Info className="h-3 w-3 text-muted-foreground" />
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="status" value="Desativado" checked={status === "Desativado"} onChange={() => setStatus("Desativado")} className="accent-primary" /> Desativado <Info className="h-3 w-3 text-muted-foreground" />
            </label>
          </div>
          <div className="flex items-center gap-3 text-sm mt-1">
            <label className="flex items-center gap-1">
              <input type="radio" name="importado" checked={importado} onChange={() => setImportado(!importado)} className="accent-primary" /> Importado <Info className="h-3 w-3 text-muted-foreground" />
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="status" value="Desligado" checked={status === "Desligado"} onChange={() => setStatus("Desligado")} className="accent-primary" /> Desligado <Info className="h-3 w-3 text-muted-foreground" />
            </label>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Participações</p>
          <div className="flex items-center gap-2">
            <Switch checked={ranking} onCheckedChange={setRanking} />
            <span className="text-sm">Ranking</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start gap-0 h-auto p-0">
          {[
            { value: "identificacao", label: "Identificação", icon: "📋" },
            { value: "contratacao", label: "Contratação", icon: "📄" },
            { value: "permissoes", label: "Permissões", icon: "🔒" },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ========== IDENTIFICAÇÃO ========== */}
        <TabsContent value="identificacao" className="space-y-8 mt-6">
          <section>
            <h2 className="text-lg font-semibold mb-4">Dados pessoais</h2>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Nome Completo" required>
                <Input placeholder="Nome Completo" value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Informação usada em relatórios</p>
              </FormField>
              <FormField label="Nome visível" required>
                <Input placeholder="Nome de exibição" value={nomeVisivel} onChange={e => setNomeVisivel(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Esse nome ficará visível na plataforma/feeds</p>
              </FormField>
              <FormField label="E-mail pessoal" optional>
                <Input placeholder="E-mail pessoal" value={emailPessoal} onChange={e => setEmailPessoal(e.target.value)} />
              </FormField>
              <FormField label="Celular" optional>
                <Input placeholder="(99) 9 9999-9999" value={celular} onChange={e => setCelular(e.target.value)} />
              </FormField>
              <FormField label="CPF" optional>
                <Input placeholder="CPF do colaborador" value={cpf} onChange={e => setCpf(e.target.value)} />
              </FormField>
              <FormField label="Nome da Mãe" optional>
                <Input placeholder="Nome completo da mãe" value={nomeMae} onChange={e => setNomeMae(e.target.value)} />
              </FormField>
            </div>
            <div className="grid grid-cols-6 gap-4 mt-4">
              <FormField label="RG" optional className="col-span-1">
                <Input placeholder="Nº do RG" value={rg} onChange={e => setRg(e.target.value)} />
              </FormField>
              <FormField label="UF do RG" optional className="col-span-1">
                <Select value={ufRg} onValueChange={setUfRg}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>{UF_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label="Sexo" optional className="col-span-2">
                <Select value={sexo} onValueChange={setSexo}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{SEXO_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label="Gênero" optional className="col-span-2">
                <Select value={genero} onValueChange={setGenero}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{GENERO_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <FormField label="Etnia" optional>
                <Select value={etnia} onValueChange={setEtnia}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{ETNIA_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label="Sexualidade" optional>
                <Select value={sexualidade} onValueChange={setSexualidade}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{SEXUALIDADE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label="Grau de Instrução" optional>
                <Select value={grauInstrucao} onValueChange={setGrauInstrucao}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{GRAU_INSTRUCAO_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label="Estado Civil" optional>
                <Select value={estadoCivil} onValueChange={setEstadoCivil}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{ESTADO_CIVIL_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label="Data de Nascimento" optional>
                <Input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Contato de emergência</h2>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Tipo do Contato de Emergência" optional>
                <Select value={tipoContatoEmergencia} onValueChange={setTipoContatoEmergencia}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{TIPO_CONTATO_EMERGENCIA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label="Nome do Contato de Emergência" optional>
                <Input placeholder="Nome do Contato de Emergência" value={nomeContatoEmergencia} onChange={e => setNomeContatoEmergencia(e.target.value)} />
              </FormField>
              <FormField label="Telefone do Contato de Emergência" optional>
                <Input placeholder="(99) 9 9999-9999" value={telContatoEmergencia} onChange={e => setTelContatoEmergencia(e.target.value)} />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Residência</h2>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="CEP" optional>
                <Input placeholder="99999-999" value={cep} onChange={e => setCep(e.target.value)} />
              </FormField>
              <FormField label="Endereço" optional>
                <Input placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} />
              </FormField>
              <FormField label="Número" optional>
                <div className="flex items-center gap-2">
                  <Input placeholder="Número" value={numero} onChange={e => setNumero(e.target.value)} disabled={semNumero} />
                  <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                    <Checkbox checked={semNumero} onCheckedChange={(c) => setSemNumero(!!c)} /> Sem número
                  </label>
                </div>
              </FormField>
              <FormField label="Complemento" optional>
                <Input placeholder="Complemento" value={complemento} onChange={e => setComplemento(e.target.value)} />
              </FormField>
              <FormField label="Bairro" optional>
                <Input placeholder="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} />
              </FormField>
              <FormField label="Município" optional>
                <Input placeholder="Município" value={municipio} onChange={e => setMunicipio(e.target.value)} />
              </FormField>
            </div>
            <div className="grid grid-cols-6 gap-4 mt-4">
              <FormField label="UF" optional className="col-span-1">
                <Select value={ufResidencia} onValueChange={setUfResidencia}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>{UF_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Dependentes</h2>
            <div className="space-y-4">
              {dependentes.map((d, i) => (
                <div key={i} className="border rounded-xl p-5 bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Dependente</h3>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDependentes(dependentes.filter((_, idx) => idx !== i))}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { const nd = [...dependentes]; nd[i] = { ...nd[i], collapsed: !nd[i].collapsed }; setDependentes(nd); }}>
                        <ChevronDown className={`h-4 w-4 transition-transform ${d.collapsed ? "-rotate-90" : ""}`} />
                      </Button>
                    </div>
                  </div>
                  {!d.collapsed && (
                    <>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <FormField label="Nome" required>
                          <Input placeholder="Nome Completo" value={d.nome} onChange={e => { const nd = [...dependentes]; nd[i].nome = e.target.value; setDependentes(nd); }} />
                        </FormField>
                        <FormField label="CPF" optional>
                          <Input placeholder="999.999.999-99" value={d.cpf} onChange={e => { const nd = [...dependentes]; nd[i].cpf = e.target.value; setDependentes(nd); }} />
                        </FormField>
                        <FormField label="Data de Nascimento" optional>
                          <Input type="date" value={d.dataNascimento} onChange={e => { const nd = [...dependentes]; nd[i].dataNascimento = e.target.value; setDependentes(nd); }} />
                        </FormField>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <FormField label="Tipo de Dependente" optional>
                          <Select value={d.tipoDependente} onValueChange={v => { const nd = [...dependentes]; nd[i].tipoDependente = v; setDependentes(nd); }}>
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                              {["Cônjuge", "Companheiro(a)", "Filho(a)", "Enteado(a)", "Pai/Mãe", "Avô/Avó", "Neto(a)", "Irmão(ã)", "Menor sob guarda", "Outro"].map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormField>
                        <FormField label="Dedução IRRF?">
                          <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-1 text-sm"><input type="radio" name={`irrf-${i}`} checked={d.deducaoIRRF} onChange={() => { const nd = [...dependentes]; nd[i].deducaoIRRF = true; setDependentes(nd); }} className="accent-primary" /> Sim</label>
                            <label className="flex items-center gap-1 text-sm"><input type="radio" name={`irrf-${i}`} checked={!d.deducaoIRRF} onChange={() => { const nd = [...dependentes]; nd[i].deducaoIRRF = false; setDependentes(nd); }} className="accent-primary" /> Não</label>
                          </div>
                        </FormField>
                        <FormField label="Salário Família?">
                          <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-1 text-sm"><input type="radio" name={`salFam-${i}`} checked={d.salarioFamilia} onChange={() => { const nd = [...dependentes]; nd[i].salarioFamilia = true; setDependentes(nd); }} className="accent-primary" /> Sim</label>
                            <label className="flex items-center gap-1 text-sm"><input type="radio" name={`salFam-${i}`} checked={!d.salarioFamilia} onChange={() => { const nd = [...dependentes]; nd[i].salarioFamilia = false; setDependentes(nd); }} className="accent-primary" /> Não</label>
                          </div>
                        </FormField>
                        <FormField label="Incapacidade?">
                          <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-1 text-sm"><input type="radio" name={`incap-${i}`} checked={d.incapacidade} onChange={() => { const nd = [...dependentes]; nd[i].incapacidade = true; setDependentes(nd); }} className="accent-primary" /> Sim</label>
                            <label className="flex items-center gap-1 text-sm"><input type="radio" name={`incap-${i}`} checked={!d.incapacidade} onChange={() => { const nd = [...dependentes]; nd[i].incapacidade = false; setDependentes(nd); }} className="accent-primary" /> Não</label>
                          </div>
                        </FormField>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div className="flex justify-center">
                <Button variant="default" size="sm" onClick={() => setDependentes([...dependentes, { nome: "", cpf: "", dataNascimento: "", tipoDependente: "", deducaoIRRF: false, salarioFamilia: false, incapacidade: false, collapsed: false }])}>
                  + Adicionar Dependente
                </Button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Informações Adicionais</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tamanho de Camiseta" optional>
                <Select value={tamanhoCamiseta} onValueChange={setTamanhoCamiseta}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{TAMANHO_CAMISETA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label="Preferência Alimentar" optional>
                <Select value={prefAlimentar} onValueChange={setPrefAlimentar}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{PREF_ALIMENTAR.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="mt-4">
              <FormField label="Equipamentos" optional>
                <Input placeholder="Selecione os equipamentos desejados" value={equipamentos} onChange={e => setEquipamentos(e.target.value)} />
              </FormField>
            </div>
            <div className="mt-4">
              <FormField label="Divide a residência com:" optional>
                <Textarea placeholder="Indique abaixo nome, vínculo de parentesco e idade se for criança ou adolescente, também vale bichinhos e plantas." value={divideResidencia} onChange={e => setDivideResidencia(e.target.value)} rows={4} />
              </FormField>
            </div>
          </section>
        </TabsContent>

        {/* ========== CONTRATAÇÃO ========== */}
        <TabsContent value="contratacao" className="space-y-8 mt-6">
          <section>
            <h2 className="text-lg font-semibold mb-4">Contrato</h2>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="E-mail" required>
                <Input placeholder="E-mail corporativo do colaborador" value={email} onChange={e => setEmail(e.target.value)} />
              </FormField>
              <FormField label="Data de admissão" optional>
                <Input type="date" value={dataAdmissao} onChange={e => setDataAdmissao(e.target.value)} />
              </FormField>
              <FormField label="Matrícula" optional>
                <Input placeholder="Matrícula" value={matricula} onChange={e => setMatricula(e.target.value)} />
              </FormField>
            </div>
            <div className="mt-4">
              <FormField label="Tipo de vínculo" optional>
                <Select value={tipoVinculo} onValueChange={setTipoVinculo}>
                  <SelectTrigger><SelectValue placeholder="Selecione o tipo de vínculo desejado" /></SelectTrigger>
                  <SelectContent>{TIPO_VINCULO_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormField label="Observações" optional>
                <Textarea placeholder="Aqui você pode anotar sobre descontos, adicionais ou que for importante sobre a contratação do colaborador." value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={5} />
              </FormField>
              <FormField label="Jornada de trabalho" optional>
                <Textarea placeholder="Descrição da jornada semanal contratual, contendo os dias da semana e os respectivos horários contratuais (entrada, saída e intervalo)." value={jornadaTrabalho} onChange={e => setJornadaTrabalho(e.target.value)} rows={5} />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Cargo</h2>
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Cargo" required>
                <Select value={cargoNome} onValueChange={setCargoNome}>
                  <SelectTrigger><SelectValue placeholder="Nome do cargo" /></SelectTrigger>
                  <SelectContent>
                    {cargos.map(c => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Informação interna para fins administrativos</p>
              </FormField>
              <FormField label="Cargo visível" optional>
                <Input placeholder="Cargo exibido na plataforma" value={cargoVisivel} onChange={e => setCargoVisivel(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Informação exibida publicamente na plataforma</p>
              </FormField>
              <FormField label="CBO" optional>
                <Input placeholder="CBO" value={cargoCbo} onChange={e => setCargoCbo(e.target.value)} />
              </FormField>
              <FormField label="Nível hierárquico" optional>
                <Select value={nivelHierarquico} onValueChange={setNivelHierarquico}>
                  <SelectTrigger><SelectValue placeholder="Nível hierárquico" /></SelectTrigger>
                  <SelectContent>{NIVEL_HIERARQUICO_OPTIONS.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Informação interna para fins administrativos</p>
              </FormField>
              <FormField label="Nível salarial" optional>
                <Select value={nivelSalarial} onValueChange={setNivelSalarial}>
                  <SelectTrigger><SelectValue placeholder="Nível salarial" /></SelectTrigger>
                  <SelectContent>{NIVEL_SALARIAL_OPTIONS.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Informação interna para fins administrativos</p>
              </FormField>
              <FormField label="Remuneração" optional>
                <Input placeholder="0" value={remuneracao} onChange={e => setRemuneracao(e.target.value)} />
              </FormField>
              <FormField label="Departamento" required>
                <Select value={departamento} onValueChange={setDepartamento}>
                  <SelectTrigger><SelectValue placeholder="Selecione o departamento desejado" /></SelectTrigger>
                  <SelectContent>{DEPARTAMENTO_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label="Unidade" optional>
                <Select value={unidade} onValueChange={setUnidade}>
                  <SelectTrigger><SelectValue placeholder="Selecione a unidade desejada" /></SelectTrigger>
                  <SelectContent>{UNIDADE_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label="Gestor direto" optional>
                <Select value={gestorDireto} onValueChange={setGestorDireto}>
                  <SelectTrigger><SelectValue placeholder="Selecione o gestor desejado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desconhecido">Desconhecido</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="mt-4">
              <FormField label="Grupos" optional>
                <Input placeholder="Selecione os grupos desejados" value={grupos} onChange={e => setGrupos(e.target.value)} />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">CLT - Celetista</h2>
            <div className="grid grid-cols-4 gap-4">
              <FormField label="Número da CTPS" optional>
                <Input placeholder="Nº da carteira de trabalho" value={numeroCTPS} onChange={e => setNumeroCTPS(e.target.value)} />
              </FormField>
              <FormField label="Série da CTPS" optional>
                <Input placeholder="Nº de Série" value={serieCTPS} onChange={e => setSerieCTPS(e.target.value)} />
              </FormField>
              <FormField label="Primeiro emprego?">
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-1 text-sm">
                    <input type="radio" name="primeiroEmprego" value="sim" checked={primeiroEmprego === "sim"} onChange={() => setPrimeiroEmprego("sim")} /> Sim
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input type="radio" name="primeiroEmprego" value="nao" checked={primeiroEmprego === "nao"} onChange={() => setPrimeiroEmprego("nao")} /> Não
                  </label>
                </div>
              </FormField>
              <FormField label="PIS/PASEP" optional>
                <Input placeholder="PIS/PASEP" value={pisPasep} onChange={e => setPisPasep(e.target.value)} />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">PJ - Pessoa Jurídica</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Razão social" optional>
                <Input placeholder="Razão social da empresa" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} />
              </FormField>
              <FormField label="CNPJ" optional>
                <Input placeholder="CNPJ" value={cnpj} onChange={e => setCnpj(e.target.value)} />
              </FormField>
              <FormField label="Nome fantasia" optional>
                <Input placeholder="Nome fantasia da empresa" value={nomeFantasia} onChange={e => setNomeFantasia(e.target.value)} />
              </FormField>
              <FormField label="Inscrição Municipal" optional>
                <Input placeholder="Inscrição Municipal da empresa" value={inscricaoMunicipal} onChange={e => setInscricaoMunicipal(e.target.value)} />
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <FormField label="CEP" optional>
                <Input placeholder="CEP" value={cepPJ} onChange={e => setCepPJ(e.target.value)} />
              </FormField>
              <FormField label="Endereço" optional>
                <Input placeholder="Endereço" value={enderecoPJ} onChange={e => setEnderecoPJ(e.target.value)} />
              </FormField>
              <FormField label="Número" optional>
                <div className="flex items-center gap-2">
                  <Input placeholder="Número" value={numeroPJ} onChange={e => setNumeroPJ(e.target.value)} disabled={semNumeroPJ} />
                  <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                    <Checkbox checked={semNumeroPJ} onCheckedChange={(c) => setSemNumeroPJ(!!c)} /> Sem número
                  </label>
                </div>
              </FormField>
              <FormField label="Complemento" optional>
                <Input placeholder="Complemento" value={complementoPJ} onChange={e => setComplementoPJ(e.target.value)} />
              </FormField>
              <FormField label="Bairro" optional>
                <Input placeholder="Bairro" value={bairroPJ} onChange={e => setBairroPJ(e.target.value)} />
              </FormField>
              <FormField label="Município" optional>
                <Input placeholder="Município" value={municipioPJ} onChange={e => setMunicipioPJ(e.target.value)} />
              </FormField>
            </div>
            <div className="grid grid-cols-6 gap-4 mt-4">
              <FormField label="UF" optional className="col-span-1">
                <Select value={ufPJ} onValueChange={setUfPJ}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>{UF_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Dados Bancários</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Banco" optional>
                <Select value={banco} onValueChange={setBanco}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{BANCO_OPTIONS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
              <FormField label="Tipo de Conta" optional>
                <Select value={tipoConta} onValueChange={setTipoConta}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{TIPO_CONTA_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <FormField label="Número da Conta" optional>
                <Input placeholder="Número da Conta" value={numeroConta} onChange={e => setNumeroConta(e.target.value)} />
              </FormField>
              <FormField label="Dígito" optional>
                <Input placeholder="Dígito" value={digitoConta} onChange={e => setDigitoConta(e.target.value)} />
              </FormField>
              <FormField label="Número da Agência" optional>
                <Input placeholder="Número da Agência" value={numeroAgencia} onChange={e => setNumeroAgencia(e.target.value)} />
              </FormField>
              <FormField label="Dígito" optional>
                <Input placeholder="Agência" value={digitoAgencia} onChange={e => setDigitoAgencia(e.target.value)} />
              </FormField>
            </div>
            <div className="mt-4">
              <FormField label="Chave Pix" optional>
                <Input placeholder="Nº da chave pix de qualquer Banco" value={chavePix} onChange={e => setChavePix(e.target.value)} />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Papel</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm text-amber-800">
              ⚠ Ao confirmar a mudança de papel, as permissões atualmente concedidas, serão removidas.
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "Visitante", label: "Visitante - Avaliação de Desempenho", desc: "Têm acesso apenas à Avaliação de Desempenho." },
                { value: "Gestor", label: "Gestor", desc: "Podem responder todas as pesquisas, visualizar dados sobre si mesmos e dados sobre seus liderados diretos e, em alguns casos, indiretos." },
                { value: "Colaborador", label: "Colaborador", desc: "Podem responder as pesquisas e visualizar dados sobre si mesmos." },
                { value: "Administrador", label: "Administrador", desc: "Tem acesso total às configurações da plataforma." },
              ].map(p => (
                <label key={p.value} className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${papel === p.value ? "border-primary bg-primary/5" : "border-border"} ${p.value === "Administrador" ? "opacity-50" : ""}`}>
                  <input type="radio" name="papel" value={p.value} checked={papel === p.value} onChange={() => setPapel(p.value)} disabled={p.value === "Administrador"} className="mt-1 accent-primary" />
                  <div>
                    <p className="font-medium text-sm">{p.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </TabsContent>

        {/* ========== PERMISSÕES ========== */}
        <TabsContent value="permissoes" className="space-y-8 mt-6">
          <section>
            <h2 className="text-lg font-semibold mb-1">Visualização dos departamentos gerenciados</h2>
            <p className="text-xs text-muted-foreground mb-3">Autoriza o usuário a visualizar dados dos departamentos selecionados.</p>
            <FormField label="Departamentos gerenciados" optional>
              <Select value={depGerenciados} onValueChange={setDepGerenciados}>
                <SelectTrigger><SelectValue placeholder="Selecione os departamentos desejados" /></SelectTrigger>
                <SelectContent>{DEPARTAMENTO_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">Visualização das unidades gerenciadas</h2>
            <p className="text-xs text-muted-foreground mb-3">Autoriza o usuário a visualizar dados de todos os departamentos das unidades selecionadas.</p>
            <FormField label="Unidades gerenciadas" optional>
              <Select value={unidadesGerenciadas} onValueChange={setUnidadesGerenciadas}>
                <SelectTrigger><SelectValue placeholder="Selecione as unidades desejadas" /></SelectTrigger>
                <SelectContent>{UNIDADE_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </FormField>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">Permissões</h2>
            <p className="text-xs text-muted-foreground mb-3">Define o tipo de permissão que esse usuário tem no Reedit.</p>

            <Tabs value={permTab} onValueChange={setPermTab}>
              <TabsList className="bg-transparent border-b rounded-none w-full justify-start gap-0 h-auto p-0">
                {["Geral", "Pesquisas", "Avaliação de desempenho", "Departamento Pessoal", "Incentivos", "Cargos e Salários"].map(tab => (
                  <TabsTrigger key={tab} value={tab.toLowerCase().replace(/ /g, "_")} className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2 text-xs">
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="geral" className="space-y-6 mt-4">
                <PermSection title="Colaboradores">
                  <PermCheck label="Permite administrar Colaboradores e Cargos" checked={permColaboradores} onChange={setPermColaboradores} />
                  <PermCheck label="Permite administrar Permissões de acesso" checked={permColaboradoresAcesso} onChange={setPermColaboradoresAcesso} />
                </PermSection>
                <PermSection title="Celebração">
                  <PermCheck label="Permite administrar celebrações" checked={permCelebracoes} onChange={setPermCelebracoes} />
                  <p className="text-xs text-muted-foreground ml-6">Autoriza exclusão de celebrações, comentários, respostas e exportar relatórios.</p>
                </PermSection>
                <PermSection title="Gamificação">
                  <PermCheck label="Permite acessar Recompensas e exportar relatório" checked={permGamificacao} onChange={setPermGamificacao} />
                </PermSection>
                <PermSection title="Comunicados">
                  <PermCheck label="Permite administrar comunicados" checked={permComunicados} onChange={setPermComunicados} />
                  <p className="text-xs text-muted-foreground ml-6">Autoriza o usuário a criar, duplicar, editar, arquivar, excluir, baixar relatório e visualizar detalhes dos comunicados de toda a empresa, além de acessar a lista de log de Comunicados.</p>
                </PermSection>
                <PermSection title="Ouvidoria">
                  <PermCheck label="Permissões de ouvidor" checked={permOuvidoria} onChange={setPermOuvidoria} />
                  <p className="text-xs text-muted-foreground ml-6">Ao ativar a permissão, os administradores serão notificados.</p>
                </PermSection>
                <PermSection title="Reuniões 1:1">
                  <PermCheck label="Permite administrar o histórico de 1:1" checked={permReunioes} onChange={setPermReunioes} />
                  <p className="text-xs text-muted-foreground ml-6">Autoriza acesso a exportação de informações do histórico de reuniões de 1:1.</p>
                  {permReunioes && (
                    <div className="ml-6 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800 mb-2">⚠ Recomendamos cautela ao conceder essa permissão devido à possível natureza sensível das informações contidas no histórico de 1:1</p>
                      <div className="space-y-2 mt-2">
                        <label className="flex items-center gap-2 text-xs">
                          <input type="radio" name="reunioesScope" value="todas" checked={reunioesScope === "todas"} onChange={() => setReunioesScope("todas")} /> Todas as reuniões 1:1 da empresa
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input type="radio" name="reunioesScope" value="somente" checked={reunioesScope === "somente"} onChange={() => setReunioesScope("somente")} /> Somente as reuniões de 1:1 dos:
                        </label>
                        {reunioesScope === "somente" && (
                          <div className="ml-6 space-y-1">
                            {["Colaboradores diretos", "Colaboradores indiretos", "Departamentos gerenciados", "Unidades gerenciadas"].map(opt => (
                              <label key={opt} className="flex items-center gap-2 text-xs">
                                <Checkbox defaultChecked /> {opt}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </PermSection>
              </TabsContent>

              {/* ===== PESQUISAS ===== */}
              <TabsContent value="pesquisas" className="space-y-6 mt-4">
                <PermSection title="Pesquisa de desligamento">
                  <PermToggle label="Permite administrar pesquisas" desc="Autoriza a criação, edição, exclusão e visualização de pesquisas." />
                </PermSection>
                <PermSection title="Planos de Ação">
                  <PermToggle label="Permite administrar Planos de Ação" desc="Autoriza a criação, exclusão e visualização de planos de ação." />
                  <div className="ml-6 mt-2 p-3 border rounded-lg bg-muted/30 space-y-2">
                    <label className="flex items-center gap-2 text-xs"><input type="radio" name="planosScope" defaultChecked className="accent-primary" /> Todos os Planos de Ação da empresa</label>
                    <label className="flex items-center gap-2 text-xs"><input type="radio" name="planosScope" className="accent-primary" /> Somente Planos de Ação de:</label>
                    <div className="ml-6 space-y-1">
                      {["Planos criados pelo colaborador", "Liderados diretos", "Liderados indiretos", "Departamentos gerenciados", "Unidades gerenciadas"].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-xs"><Checkbox /> {opt}</label>
                      ))}
                    </div>
                  </div>
                </PermSection>
                <PermSection title="Pesquisa de Engajamento">
                  <PermToggle label="Permite administrar pesquisas" desc="Autoriza a criação, exclusão, visualização de resultados (dashboard, comentários, análise de texto, mapa de calor e benchmark) e exportação de resultados de toda a empresa." />
                  <PermToggle label="Permite visualizar pesquisas dos departamentos gerenciados e unidades gerenciadas" desc="Autoriza a visualização de resultados (dashboard e comentários) e exportação de relatórios." />
                  <div className="ml-6 mt-2 p-3 border rounded-lg bg-muted/30 space-y-1">
                    <label className="flex items-center gap-2 text-xs"><Checkbox /> Dashboard (quadro)</label>
                    <label className="flex items-center gap-2 text-xs"><Checkbox /> Comentários</label>
                  </div>
                  <p className="text-xs text-primary ml-6 mt-1">Permite visualizar o resultado da Análise de Comentários.</p>
                  <p className="text-xs text-muted-foreground ml-6">Autoriza a visualização do resultado da Análise de Comentários de toda a empresa.</p>
                </PermSection>
                <PermSection title="Super Pesquisa">
                  <PermToggle label="Permite administrar pesquisas" />
                  <PermToggle label="Permite visualizar e responder comentários" />
                </PermSection>
                <PermSection title="Pesquisa de satisfação">
                  <PermToggle label="Permite administrar pesquisas" />
                </PermSection>
                <PermSection title="Pesquisa Rápida">
                  <PermToggle label="Permite administrar pesquisas" />
                </PermSection>
              </TabsContent>

              {/* ===== AVALIAÇÃO DE DESEMPENHO ===== */}
              <TabsContent value="avaliação_de_desempenho" className="space-y-6 mt-4">
                <PermSection title="Geral">
                  <PermToggle label="Permite administrar avaliações" desc="Dá ao usuário todas as permissões de acesso, visualizações e ações nas avaliações." />
                  <div className="ml-6 mt-2 p-3 border rounded-lg bg-muted/30 space-y-2">
                    <label className="flex items-center gap-2 text-xs"><input type="radio" name="avalScope" className="accent-primary" /> Todas avaliações</label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="radio" name="avalScope" className="accent-primary" /> Somente criadas pelo colaborador</label>
                  </div>
                  <PermToggle label="Permite visualizar avaliações" desc="Autoriza o acesso ao módulo de avaliação de desempenho possibilitando ao usuário visualizar a tela de detalhes, status e relatórios." />
                  <div className="ml-6 mt-2 p-3 border rounded-lg bg-muted/30 space-y-2">
                    <label className="flex items-center gap-2 text-xs"><input type="radio" name="avalVisScope" className="accent-primary" /> Todas as avaliações</label>
                    <label className="flex items-center gap-2 text-xs"><input type="radio" name="avalVisScope" className="accent-primary" /> Dentro da sua área de atuação</label>
                  </div>
                </PermSection>
              </TabsContent>

              {/* ===== DEPARTAMENTO PESSOAL ===== */}
              <TabsContent value="departamento_pessoal" className="space-y-6 mt-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" /> Ao alterar qualquer permissão abaixo, os administradores serão notificados.
                </div>
                <PermSection title="Admissão Digital">
                  <PermToggle label="Permite gerenciar a admissão digital" />
                </PermSection>
                <PermSection title="Documentos">
                  <PermToggle label="Permite gerenciar os documentos pessoais dos colaboradores" />
                  <PermToggle label="Permite enviar e gerenciar documentos de Assinatura Digital" />
                </PermSection>
                <PermSection title="Holerites">
                  <PermToggle label="Permite gerenciar holerites" />
                </PermSection>
                <PermSection title="Remuneração">
                  <PermToggle label="Permite a visualização do campo remuneração" />
                  <PermToggle label="Permite a visualização do histórico de remuneração na jornada do colaborador" />
                  <PermToggle label="Permite a exclusão do histórico de remuneração na jornada do colaborador" />
                  <PermToggle label="Permite a atualização do histórico de cargos e salários de toda a empresa" />
                  <PermToggle label="Permite a exportação do histórico de cargos e salários de toda a empresa" />
                </PermSection>
                <PermSection title="Férias">
                  <PermToggle label="Permite gerenciar férias como RH" />
                </PermSection>
                <PermSection title="Saúde Ocupacional (ASO)">
                  <PermToggle label="Permite gerenciar Saúde Ocupacional" />
                </PermSection>
              </TabsContent>

              {/* ===== INCENTIVOS ===== */}
              <TabsContent value="incentivos" className="space-y-6 mt-4">
                <PermSection title="Geral">
                  <PermToggle label="Permite administrar programas de incentivo" />
                </PermSection>
              </TabsContent>

              {/* ===== CARGOS E SALÁRIOS ===== */}
              <TabsContent value="cargos_e_salários" className="space-y-6 mt-4">
                <PermSection title="Cargos e Salários">
                  <PermToggle label="Permite administrar política de cargos e salários" />
                  <PermToggle label="Permite administrar Colaboradores e Cargos" />
                  <PermToggle label="Permite a visualização do campo remuneração" />
                  <p className="text-xs text-muted-foreground ml-6">Ao ativar a permissão, os administradores serão notificados.</p>
                </PermSection>
              </TabsContent>
            </Tabs>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormField({ label, required, optional, children, className }: { label: string; required?: boolean; optional?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold mb-1.5 block">
        {label} {required && <span className="text-destructive">*</span>}
        {optional && <span className="text-primary text-xs font-normal ml-1">(opcional)</span>}
      </Label>
      {children}
    </div>
  );
}

function PermSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-sm mb-2 border-b pb-1">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PermCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(!!c)} />
      {label}
    </label>
  );
}
