import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, MoreVertical, Edit, ArrowLeft, Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useCargos, type Cargo, type GrupoCargo } from "@/stores/cargosStore";
import { CBO_OPTIONS } from "@/data/cboOptions";
import {
  UNIDADE_OPTIONS, DEPARTAMENTO_OPTIONS, SINDICATO_OPTIONS,
} from "@/data/selectOptions";

const ITEMS_PER_PAGE = 10;

interface FormData {
  nome: string;
  cbo: string;
  unidade: string;
  sindicato: string;
  departamento: string;
  grupoCargo: string;
  missao: string;
  modeloCargo: "sem_nivel" | "com_nivel";
  salario: number;
  responsabilidades: string;
  requisitosAcademicos: string;
  competenciasComportamentais: string;
  competenciasOrganizacionais: string;
  experiencia: string;
}

const emptyForm: FormData = {
  nome: "", cbo: "", unidade: "", sindicato: "", departamento: "",
  grupoCargo: "", missao: "", modeloCargo: "sem_nivel", salario: 0,
  responsabilidades: "", requisitosAcademicos: "",
  competenciasComportamentais: "", competenciasOrganizacionais: "", experiencia: "",
};

function cargoToForm(cargo: Cargo): FormData {
  return {
    nome: cargo.nome,
    cbo: cargo.cbo === "-" ? "" : cargo.cbo,
    unidade: cargo.unidade === "-" ? "" : cargo.unidade,
    sindicato: cargo.sindicato === "-" ? "" : cargo.sindicato,
    departamento: cargo.departamento === "-" ? "" : cargo.departamento,
    grupoCargo: cargo.grupoCargo === "-" ? "" : cargo.grupoCargo,
    missao: cargo.missao === "-" ? "" : cargo.missao,
    modeloCargo: cargo.modeloCargo,
    salario: cargo.salario,
    responsabilidades: cargo.responsabilidades === "-" ? "" : cargo.responsabilidades,
    requisitosAcademicos: cargo.requisitosAcademicos === "-" ? "" : cargo.requisitosAcademicos,
    competenciasComportamentais: cargo.competenciasComportamentais === "-" ? "" : cargo.competenciasComportamentais,
    competenciasOrganizacionais: cargo.competenciasOrganizacionais === "-" ? "" : cargo.competenciasOrganizacionais,
    experiencia: cargo.experiencia === "-" ? "" : cargo.experiencia,
  };
}

function CargoForm({
  onBack,
  onSave,
  initialData,
  title,
  submitLabel,
}: {
  onBack: () => void;
  onSave: (data: FormData) => void;
  initialData?: FormData;
  title: string;
  submitLabel: string;
}) {
  const { grupos } = useCargos();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialData || emptyForm);
  const [cboOpen, setCboOpen] = useState(false);
  const [sindicatoOpen, setSindicatoOpen] = useState(false);

  const update = (field: keyof FormData, value: string | number) =>
    setForm((p) => ({ ...p, [field]: value }));

  const stepLabels = ["Informações gerais", "Modelo e Níveis", "Revisão"];
  const grupoOptions = grupos.map((g) => g.nome);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="rounded-full" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      </div>

      {/* Stepper */}
      <div className="flex border-b">
        {stepLabels.map((label, i) => {
          const s = i + 1;
          const active = step === s;
          const done = step > s;
          return (
            <button
              key={label}
              onClick={() => s < step && setStep(s)}
              className={`flex-1 flex items-center justify-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                active ? "border-primary text-primary" : done ? "border-transparent text-muted-foreground" : "border-transparent text-muted-foreground/60"
              }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {done ? <Check className="h-3 w-3" /> : s}
              </span>
              {label}
            </button>
          );
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold">Nome do cargo <span className="text-destructive">*</span></label>
              <Input placeholder="Ex: Assistente" value={form.nome} onChange={(e) => update("nome", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">CBO <span className="text-xs text-muted-foreground">(opcional)</span></label>
              <Popover open={cboOpen} onOpenChange={setCboOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={cboOpen} className="w-full justify-between font-normal">
                    {form.cbo ? CBO_OPTIONS.find((c) => `${c.code} - ${c.title}` === form.cbo)?.title || form.cbo : "Selecione o CBO do cargo"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Pesquisar CBO..." />
                    <CommandList>
                      <CommandEmpty>Nenhum CBO encontrado.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-auto">
                        {CBO_OPTIONS.map((cbo) => (
                          <CommandItem
                            key={`${cbo.code}-${cbo.title}`}
                            value={`${cbo.code} ${cbo.title}`}
                            onSelect={() => {
                              update("cbo", `${cbo.code} - ${cbo.title}`);
                              setCboOpen(false);
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${form.cbo === `${cbo.code} - ${cbo.title}` ? "opacity-100" : "opacity-0"}`} />
                            {cbo.code} - {cbo.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Unidade <span className="text-xs text-muted-foreground">(opcional)</span></label>
              <Select value={form.unidade} onValueChange={(v) => update("unidade", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {UNIDADE_OPTIONS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Sindicato <span className="text-xs text-muted-foreground">(opcional)</span></label>
              <Popover open={sindicatoOpen} onOpenChange={setSindicatoOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={sindicatoOpen} className="w-full justify-between font-normal text-left">
                    <span className="truncate">{form.sindicato || "Selecione"}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Pesquisar sindicato..." />
                    <CommandList>
                      <CommandEmpty>Nenhum sindicato encontrado.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-auto">
                        {SINDICATO_OPTIONS.map((s) => (
                          <CommandItem
                            key={s}
                            value={s}
                            onSelect={() => {
                              update("sindicato", s);
                              setSindicatoOpen(false);
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${form.sindicato === s ? "opacity-100" : "opacity-0"}`} />
                            {s}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Departamento <span className="text-xs text-muted-foreground">(opcional)</span></label>
              <Select value={form.departamento} onValueChange={(v) => update("departamento", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {DEPARTAMENTO_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Grupo de cargo <span className="text-xs text-muted-foreground">(opcional)</span></label>
              <Select value={form.grupoCargo} onValueChange={(v) => update("grupoCargo", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {grupoOptions.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">Missão do cargo <span className="text-xs text-muted-foreground">(opcional)</span></label>
            <Textarea placeholder="Insira qual é a missão deste cargo na empresa/departamento" value={form.missao} onChange={(e) => update("missao", e.target.value)} rows={4} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!form.nome.trim()}>Próximo</Button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Modelo do cargo</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "sem_nivel" as const, label: "Sem nível hierárquico", desc: "Cargo que não irá considerar desdobramentos EX: Júnior, Pleno ou Senior" },
                { value: "com_nivel" as const, label: "Com nível hierárquico", desc: "Cargo que irá possuir desdobramentos EX: Júnior, Pleno ou Senior" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => update("modeloCargo", opt.value)}
                  className={`rounded-lg border p-4 text-left transition-colors ${
                    form.modeloCargo === opt.value ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      form.modeloCargo === opt.value ? "border-primary" : "border-muted-foreground"
                    }`}>
                      {form.modeloCargo === opt.value && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm font-semibold">{opt.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Salário</h3>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Salário do cargo <span className="text-destructive">*</span></label>
              <Input type="number" value={form.salario} onChange={(e) => update("salario", Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Detalhes do cargo</h3>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-amber-600">Responsabilidades atribuídas <span className="text-xs text-muted-foreground">(opcional)</span></label>
              <Textarea placeholder="Detalhe as responsabilidades do cargo" value={form.responsabilidades} onChange={(e) => update("responsabilidades", e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-red-600">Requisitos acadêmicos <span className="text-xs text-muted-foreground">(opcional)</span></label>
                <Textarea placeholder="Detalhe os requisitos acadêmicos do cargo" value={form.requisitosAcademicos} onChange={(e) => update("requisitosAcademicos", e.target.value)} rows={3} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-red-600">Competências comportamentais <span className="text-xs text-muted-foreground">(opcional)</span></label>
                <Textarea placeholder="Detalhe as competências comportamentais acadêmicos do cargo" value={form.competenciasComportamentais} onChange={(e) => update("competenciasComportamentais", e.target.value)} rows={3} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-red-600">Competências organizacionais <span className="text-xs text-muted-foreground">(opcional)</span></label>
                <Textarea placeholder="Descreva as competências organizacionais do cargo" value={form.competenciasOrganizacionais} onChange={(e) => update("competenciasOrganizacionais", e.target.value)} rows={3} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-green-600">Experiência <span className="text-xs text-muted-foreground">(opcional)</span></label>
                <Textarea placeholder="Insira qual é a experiência deste cargo na empresa/departamento" value={form.experiencia} onChange={(e) => update("experiencia", e.target.value)} rows={3} />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
            <Button onClick={() => setStep(3)}>Próximo</Button>
          </div>
        </div>
      )}

      {/* Step 3 - Revisão */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold">Revisão</h3>
            <p className="text-sm text-muted-foreground">Revise as informações do cargo antes de salvá-lo</p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Informações gerais</h4>
            {[
              ["Nome do cargo", form.nome || "-"],
              ["CBO", form.cbo || "-"],
              ["Unidade", form.unidade || "-"],
              ["Sindicato", form.sindicato || "-"],
              ["Departamento", form.departamento || "-"],
              ["Grupo de cargo", form.grupoCargo || "-"],
              ["Missão do cargo", form.missao || "-"],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4 text-sm">
                <span className="font-semibold text-primary min-w-[180px]">{label}</span>
                <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Modelo e Níveis</h4>
            {[
              ["Modelo do cargo", form.modeloCargo === "sem_nivel" ? "Sem nível hierárquico" : "Com nível hierárquico"],
              ["Salário", `R$ ${form.salario.toFixed(2).replace(".", ",")}`],
              ["Responsabilidades atribuídas", form.responsabilidades || "-"],
              ["Requisitos acadêmicos", form.requisitosAcademicos || "-"],
              ["Competências comportamentais", form.competenciasComportamentais || "-"],
              ["Competências organizacionais", form.competenciasOrganizacionais || "-"],
              ["Experiência", form.experiencia || "-"],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4 text-sm">
                <span className="font-semibold text-primary min-w-[180px]">{label}</span>
                <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
            <Button onClick={() => onSave(form)}>{submitLabel}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── Grupo de Cargos Modal ───────── */
function GrupoModal({
  open,
  onClose,
  grupo,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  grupo?: GrupoCargo;
  onSave: (data: { nome: string; descricao: string; cargoIds: string[] }) => void;
  onDelete?: () => void;
}) {
  const { cargos } = useCargos();
  const [nome, setNome] = useState(grupo?.nome || "");
  const [descricao, setDescricao] = useState(grupo?.descricao || "");
  const [selectedCargos, setSelectedCargos] = useState<string[]>(grupo?.cargoIds || []);
  const [cargoSearch, setCargoSearch] = useState("");

  const filteredCargos = cargos.filter((c) =>
    c.nome.toLowerCase().includes(cargoSearch.toLowerCase())
  );

  const toggleCargo = (id: string) => {
    setSelectedCargos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{grupo ? "Editar grupo de cargos" : "Adicionar grupo de cargos"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">
              {grupo ? "Título" : "Nome do grupo de cargos"}<span className="text-destructive">*</span>
            </label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do grupo de cargos" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">Descrição <span className="text-xs text-muted-foreground">(opcional)</span></label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">Cargos vinculados <span className="text-xs text-muted-foreground">(opcional)</span></label>
            <Input placeholder="Buscar cargo" value={cargoSearch} onChange={(e) => setCargoSearch(e.target.value)} />
            {cargos.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Nenhum cargo cadastrado.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-auto mt-2">
                {filteredCargos.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={selectedCargos.includes(c.id)}
                      onCheckedChange={() => toggleCargo(c.id)}
                    />
                    <span className="truncate">{c.nome}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          {onDelete ? (
            <Button variant="link" className="text-destructive px-0" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Deletar
            </Button>
          ) : (
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
          )}
          <div className="flex gap-2">
            {onDelete && <Button variant="outline" onClick={onClose}>Cancelar</Button>}
            <Button disabled={!nome.trim()} onClick={() => onSave({ nome, descricao, cargoIds: selectedCargos })}>
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Ver Grupos de Cargos View ───────── */
function VerGruposCargos({ onBack }: { onBack: () => void }) {
  const { cargos, grupos, removeCargo, addGrupo, updateGrupo, removeGrupo } = useCargos();
  const [cargoSearch, setCargoSearch] = useState("");
  const [grupoSearch, setGrupoSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"documentos" | "cargos">("cargos");

  // Grupo modal state
  const [grupoModalOpen, setGrupoModalOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoCargo | undefined>();

  // For adding/editing cargo from this view
  const [cargoFormOpen, setCargoFormOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | undefined>();

  // Document types state
  const [tiposDocumento, setTiposDocumento] = useState([
    { id: "d1", nome: "Contrato" },
    { id: "d2", nome: "CPF" },
    { id: "d3", nome: "RG" },
    { id: "d4", nome: "Carteira de Trabalho" },
    { id: "d5", nome: "Exame Admissional" },
    { id: "d6", nome: "Título de Eleitor" },
    { id: "d7", nome: "Comprovante de Residência" },
    { id: "d8", nome: "Certificados (Diplomas)" },
  ]);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<{ id: string; nome: string } | undefined>();
  const [docNome, setDocNome] = useState("");

  const filteredCargos = cargos.filter((c) =>
    c.nome.toLowerCase().includes(cargoSearch.toLowerCase())
  );

  const filteredGrupos = grupos.filter((g) =>
    g.nome.toLowerCase().includes(grupoSearch.toLowerCase())
  );

  if (cargoFormOpen) {
    return (
      <CargoFormFromGrupos
        cargo={editingCargo}
        onBack={() => { setCargoFormOpen(false); setEditingCargo(undefined); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="rounded-full" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Grupos de Cargos</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["documentos", "cargos"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            {tab === "documentos" ? "Documentos" : "Cargos"}
          </button>
        ))}
      </div>

      {activeTab === "cargos" && (
        <div className="space-y-8">
          {/* Cargos section */}
          <div className="rounded-lg border border-border p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold">Cargos</h2>
              <p className="text-sm text-muted-foreground">Listagem geral dos cargos da empresa</p>
            </div>
            <p className="text-sm font-semibold text-primary">Pesquisar cargos ou colaboradores</p>
            <div className="flex items-center justify-between gap-4">
              <Input
                placeholder="Busque por um cargo ou colaborador"
                value={cargoSearch}
                onChange={(e) => setCargoSearch(e.target.value)}
                className="max-w-md"
              />
              <Button onClick={() => { setEditingCargo(undefined); setCargoFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar cargo
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-primary font-semibold">Nome do cargo</TableHead>
                  <TableHead className="text-primary font-semibold">↑ Descrição</TableHead>
                  <TableHead className="text-primary font-semibold">Grupos de cargos</TableHead>
                  <TableHead className="text-primary font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCargos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      Nenhum cargo cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCargos.map((cargo) => (
                    <TableRow key={cargo.id}>
                      <TableCell className="text-sm">{cargo.nome}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{cargo.missao !== "-" ? cargo.missao : ""}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{cargo.grupoCargo !== "-" ? cargo.grupoCargo : ""}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setEditingCargo(cargo); setCargoFormOpen(true); }}
                        >
                          <Edit className="h-3 w-3 mr-1" /> Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Grupos de cargos section */}
          <div className="rounded-lg border border-border p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold">Grupos de cargos</h2>
              <p className="text-sm text-muted-foreground">Listagem geral dos grupos de cargos da empresa</p>
            </div>
            <p className="text-sm font-semibold text-primary">Pesquisar grupo de cargos</p>
            <div className="flex items-center justify-between gap-4">
              <Input
                placeholder="Busque por um grupo de cargos"
                value={grupoSearch}
                onChange={(e) => setGrupoSearch(e.target.value)}
                className="max-w-md"
              />
              <Button onClick={() => { setEditingGrupo(undefined); setGrupoModalOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" /> Adicionar grupo
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-primary font-semibold">Nome do grupo de cargos</TableHead>
                  <TableHead className="text-primary font-semibold">↑ Descrição</TableHead>
                  <TableHead className="text-primary font-semibold">Total de cargos</TableHead>
                  <TableHead className="text-primary font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrupos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      Nenhum grupo cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGrupos.map((grupo) => {
                    const totalCargos = grupo.cargoIds.filter((id) => cargos.some((c) => c.id === id)).length;
                    return (
                      <TableRow key={grupo.id}>
                        <TableCell className="text-sm">{grupo.nome}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{grupo.descricao}</TableCell>
                        <TableCell className="text-sm text-primary font-medium">{totalCargos}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setEditingGrupo(grupo); setGrupoModalOpen(true); }}
                          >
                            <Edit className="h-3 w-3 mr-1" /> Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === "documentos" && (
        <div className="rounded-lg border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Configuração de Tipo de Documento</h2>
              <p className="text-sm text-muted-foreground">Gerencie os Tipos de Documentos que fazem parte do seu processo interno e da Admissão digital.</p>
            </div>
            <Button onClick={() => { setEditingDoc(undefined); setDocNome(""); setDocModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Criar Tipo de Documento
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-primary font-semibold">Tipo de Documento</TableHead>
                <TableHead className="text-primary font-semibold">Última Alteração</TableHead>
                <TableHead className="text-primary font-semibold">Alterado por</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiposDocumento.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="text-sm">{doc.nome}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">--</TableCell>
                  <TableCell className="text-sm text-muted-foreground">--</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        onClick={() => { setEditingDoc(doc); setDocNome(doc.nome); setDocModalOpen(true); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setTiposDocumento((prev) => prev.filter((d) => d.id !== doc.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Document Modal */}
      <Dialog open={docModalOpen} onOpenChange={(v) => !v && setDocModalOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDoc ? "Editar Tipo de Documento" : "Criar novo Tipo de Documento"}</DialogTitle>
            <p className="text-sm text-primary">{editingDoc ? "Edite o Tipo de Documento." : "Crie um novo tipo de documento."}</p>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Nome <span className="text-destructive">*</span></label>
            <p className="text-xs text-muted-foreground">Nome do Tipo de Documento</p>
            <Input
              placeholder="Ex: Carteira de vacinação"
              value={docNome}
              onChange={(e) => setDocNome(e.target.value)}
            />
            <p className="text-xs text-destructive">O nome do Tipo de Documento é obrigatório</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDocModalOpen(false)}>Cancelar</Button>
            <Button
              disabled={!docNome.trim()}
              onClick={() => {
                if (editingDoc) {
                  setTiposDocumento((prev) => prev.map((d) => d.id === editingDoc.id ? { ...d, nome: docNome } : d));
                } else {
                  setTiposDocumento((prev) => [...prev, { id: crypto.randomUUID(), nome: docNome }]);
                }
                setDocModalOpen(false);
                setEditingDoc(undefined);
                setDocNome("");
              }}
            >
              {editingDoc ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grupo Modal */}
      <GrupoModal
        open={grupoModalOpen}
        onClose={() => { setGrupoModalOpen(false); setEditingGrupo(undefined); }}
        grupo={editingGrupo}
        onSave={(data) => {
          if (editingGrupo) {
            updateGrupo(editingGrupo.id, data);
          } else {
            addGrupo(data);
          }
          setGrupoModalOpen(false);
          setEditingGrupo(undefined);
        }}
        onDelete={editingGrupo ? () => {
          removeGrupo(editingGrupo.id);
          setGrupoModalOpen(false);
          setEditingGrupo(undefined);
        } : undefined}
      />
    </div>
  );
}

/* Helper: CargoForm launched from VerGruposCargos */
function CargoFormFromGrupos({ cargo, onBack }: { cargo?: Cargo; onBack: () => void }) {
  const { addCargo, updateCargo } = useCargos();

  const handleSave = (data: FormData) => {
    const payload = {
      nome: data.nome,
      unidade: data.unidade || "-",
      departamento: data.departamento || "-",
      sindicato: data.sindicato || "-",
      cbo: data.cbo || "-",
      grupoCargo: data.grupoCargo || "-",
      missao: data.missao || "-",
      modeloCargo: data.modeloCargo,
      salario: data.salario,
      responsabilidades: data.responsabilidades || "-",
      requisitosAcademicos: data.requisitosAcademicos || "-",
      competenciasComportamentais: data.competenciasComportamentais || "-",
      competenciasOrganizacionais: data.competenciasOrganizacionais || "-",
      experiencia: data.experiencia || "-",
      nivelHierarquico: "-",
      nivelSalarial: "-",
    };
    if (cargo) {
      updateCargo(cargo.id, payload);
    } else {
      addCargo(payload);
    }
    onBack();
  };

  return (
    <CargoForm
      onBack={onBack}
      onSave={handleSave}
      initialData={cargo ? cargoToForm(cargo) : undefined}
      title={cargo ? "Editar cargo" : "Criação de cargo"}
      submitLabel={cargo ? "Salvar alterações" : "Criar cargo"}
    />
  );
}

/* ───────── Main Page ───────── */
export default function CargosESalarios() {
  const { cargos, addCargo, updateCargo, removeCargo } = useCargos();
  const [view, setView] = useState<"list" | "create" | "edit" | "grupos">("list");
  const [editingCargoId, setEditingCargoId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterUnidade, setFilterUnidade] = useState("all");
  const [filterDepartamento, setFilterDepartamento] = useState("all");
  const [filterSindicato, setFilterSindicato] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(
    () => cargos.filter((c) => {
      if (search && !c.nome.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterUnidade !== "all" && c.unidade !== filterUnidade) return false;
      if (filterDepartamento !== "all" && c.departamento !== filterDepartamento) return false;
      if (filterSindicato !== "all" && c.sindicato !== filterSindicato) return false;
      return true;
    }),
    [cargos, search, filterUnidade, filterDepartamento, filterSindicato]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSave = (data: FormData) => {
    const payload = {
      nome: data.nome,
      unidade: data.unidade || "-",
      departamento: data.departamento || "-",
      sindicato: data.sindicato || "-",
      cbo: data.cbo || "-",
      grupoCargo: data.grupoCargo || "-",
      missao: data.missao || "-",
      modeloCargo: data.modeloCargo,
      salario: data.salario,
      responsabilidades: data.responsabilidades || "-",
      requisitosAcademicos: data.requisitosAcademicos || "-",
      competenciasComportamentais: data.competenciasComportamentais || "-",
      competenciasOrganizacionais: data.competenciasOrganizacionais || "-",
      experiencia: data.experiencia || "-",
      nivelHierarquico: "-",
      nivelSalarial: "-",
    };
    if (view === "edit" && editingCargoId) {
      updateCargo(editingCargoId, payload);
    } else {
      addCargo(payload);
    }
    setView("list");
    setEditingCargoId(null);
  };

  if (view === "grupos") {
    return <VerGruposCargos onBack={() => setView("list")} />;
  }

  if (view === "create" || view === "edit") {
    const editingCargo = view === "edit" && editingCargoId ? cargos.find((c) => c.id === editingCargoId) : undefined;
    return (
      <CargoForm
        onBack={() => { setView("list"); setEditingCargoId(null); }}
        onSave={handleSave}
        initialData={editingCargo ? cargoToForm(editingCargo) : undefined}
        title={view === "edit" ? "Editar cargo" : "Criação de cargo"}
        submitLabel={view === "edit" ? "Salvar alterações" : "Criar cargo"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão Cargos e Salários</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie a estrutura de cargos e salários.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setView("create")}>Criar cargo</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setView("grupos")}>Ver grupos de cargos</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquise o cargo" className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <Select value={filterUnidade} onValueChange={(v) => { setFilterUnidade(v); setCurrentPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Unidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Unidades</SelectItem>
            {UNIDADE_OPTIONS.map((u) => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDepartamento} onValueChange={(v) => { setFilterDepartamento(v); setCurrentPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Departamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Departamentos</SelectItem>
            {DEPARTAMENTO_OPTIONS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSindicato} onValueChange={(v) => { setFilterSindicato(v); setCurrentPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Sindicato" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Sindicatos</SelectItem>
            {SINDICATO_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-primary font-semibold">Cargos</TableHead>
            <TableHead className="text-primary font-semibold">Unidade</TableHead>
            <TableHead className="text-primary font-semibold">Departamento</TableHead>
            <TableHead className="text-primary font-semibold">Nível hierárquico</TableHead>
            <TableHead className="text-primary font-semibold">Nível salarial</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Nenhum cargo cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((cargo) => (
              <TableRow key={cargo.id}>
                <TableCell className="text-sm">{cargo.nome}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{cargo.unidade}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{cargo.departamento}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{cargo.nivelHierarquico}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{cargo.nivelSalarial}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setEditingCargoId(cargo.id); setView("edit"); }}
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => removeCargo(cargo.id)}>
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <span>{currentPage} de {totalPages} páginas</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
