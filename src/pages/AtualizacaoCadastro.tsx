import { useState, ReactNode } from "react";
import { User, ChevronRight, FileText, MapPin, Users as UsersIcon, ClipboardList, Plus, X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const SEXO_OPTIONS = ["Masculino", "Feminino", "Outro"];
const ESTADO_CIVIL = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"];
const GRAU_INSTRUCAO = ["Fundamental", "Médio", "Técnico", "Superior", "Pós-graduação", "Mestrado", "Doutorado"];
const TIPO_VINCULO = ["CLT", "PJ", "Estágio", "Aprendiz", "Temporário"];
const TIPO_DEPENDENTE = ["Cônjuge", "Companheiro(a)", "Filho(a)", "Enteado(a)", "Pai/Mãe", "Outro"];

type SectionKey = "dados" | "residencia" | "dependentes" | "contratacao" | "adicionais";

export default function AtualizacaoCadastro() {
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  // Dados pessoais
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomeVisivel, setNomeVisivel] = useState("");
  const [emailPessoal, setEmailPessoal] = useState("");
  const [celular, setCelular] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [ufRg, setUfRg] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [grauInstrucao, setGrauInstrucao] = useState("");

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
  const [dependentes, setDependentes] = useState<{ nome: string; cpf: string; dataNascimento: string; tipoDependente: string; collapsed: boolean }[]>([]);

  // Contratação
  const [emailCorp, setEmailCorp] = useState("");
  const [matricula, setMatricula] = useState("");
  const [dataAdmissao, setDataAdmissao] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState("");
  const [jornadaTrabalho, setJornadaTrabalho] = useState("");

  // Informações adicionais
  const [tamanhoCamiseta, setTamanhoCamiseta] = useState("");
  const [prefAlimentar, setPrefAlimentar] = useState("");
  const [equipamentos, setEquipamentos] = useState("");
  const [observacoes, setObservacoes] = useState("");

  function handleSave() {
    setOpenSection(null);
    toast.success("Informações atualizadas");
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Atualização de cadastro</h1>
        <p className="text-sm text-muted-foreground">
          Atualize seus dados cadastrais. Mantenha suas informações sempre atualizadas.
        </p>
      </div>

      <Card className="p-6 md:p-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Atualizar dados cadastrais</h2>

        <div className="flex items-center gap-4 mb-2">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-muted text-muted-foreground">
              <User className="h-9 w-9" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-wide">NOME DO COLABORADOR</h3>
            <p className="text-sm text-primary">CARGO</p>
          </div>
        </div>

        <button
          type="button"
          className="text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80 mb-6"
          onClick={() => toast.info("Funcionalidade de edição de foto em breve")}
        >
          Editar Foto
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard icon={User} label="Dados pessoais" onClick={() => setOpenSection("dados")} />
          <SectionCard icon={FileText} label="Contratação" onClick={() => setOpenSection("contratacao")} />
          <SectionCard icon={MapPin} label="Residência" onClick={() => setOpenSection("residencia")} />
          <SectionCard icon={ClipboardList} label="Informações Adicionais" onClick={() => setOpenSection("adicionais")} />
          <SectionCard icon={UsersIcon} label="Dependentes" optional onClick={() => setOpenSection("dependentes")} />
        </div>
      </Card>

      {/* Sheet: Dados pessoais */}
      <EditSheet
        open={openSection === "dados"}
        onClose={() => setOpenSection(null)}
        title="Dados pessoais"
        description="Atualize suas informações pessoais"
        onSave={handleSave}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome completo">
            <Input value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} placeholder="Nome completo" />
          </Field>
          <Field label="Nome visível">
            <Input value={nomeVisivel} onChange={e => setNomeVisivel(e.target.value)} placeholder="Nome de exibição" />
          </Field>
          <Field label="E-mail pessoal">
            <Input value={emailPessoal} onChange={e => setEmailPessoal(e.target.value)} placeholder="email@exemplo.com" />
          </Field>
          <Field label="Celular">
            <Input value={celular} onChange={e => setCelular(e.target.value)} placeholder="(99) 9 9999-9999" />
          </Field>
          <Field label="CPF">
            <Input value={cpf} onChange={e => setCpf(e.target.value)} placeholder="999.999.999-99" />
          </Field>
          <Field label="Data de nascimento">
            <Input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} />
          </Field>
          <Field label="RG">
            <Input value={rg} onChange={e => setRg(e.target.value)} placeholder="Nº do RG" />
          </Field>
          <Field label="UF do RG">
            <Select value={ufRg} onValueChange={setUfRg}>
              <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent>{UF_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Sexo">
            <Select value={sexo} onValueChange={setSexo}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{SEXO_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Estado civil">
            <Select value={estadoCivil} onValueChange={setEstadoCivil}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{ESTADO_CIVIL.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Grau de instrução" className="md:col-span-2">
            <Select value={grauInstrucao} onValueChange={setGrauInstrucao}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{GRAU_INSTRUCAO.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
      </EditSheet>

      {/* Sheet: Residência */}
      <EditSheet
        open={openSection === "residencia"}
        onClose={() => setOpenSection(null)}
        title="Residência"
        description="Atualize seu endereço"
        onSave={handleSave}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="CEP">
            <Input value={cep} onChange={e => setCep(e.target.value)} placeholder="99999-999" />
          </Field>
          <Field label="Endereço">
            <Input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, avenida..." />
          </Field>
          <Field label="Número">
            <div className="flex items-center gap-2">
              <Input value={numero} onChange={e => setNumero(e.target.value)} disabled={semNumero} placeholder="Número" />
              <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                <Checkbox checked={semNumero} onCheckedChange={(c) => setSemNumero(!!c)} /> Sem nº
              </label>
            </div>
          </Field>
          <Field label="Complemento">
            <Input value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Apto, bloco..." />
          </Field>
          <Field label="Bairro">
            <Input value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" />
          </Field>
          <Field label="Município">
            <Input value={municipio} onChange={e => setMunicipio(e.target.value)} placeholder="Município" />
          </Field>
          <Field label="UF">
            <Select value={ufResidencia} onValueChange={setUfResidencia}>
              <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent>{UF_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
      </EditSheet>

      {/* Sheet: Dependentes */}
      <EditSheet
        open={openSection === "dependentes"}
        onClose={() => setOpenSection(null)}
        title="Dependentes"
        description="Cadastre seus dependentes"
        onSave={handleSave}
      >
        <div className="space-y-4">
          {dependentes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum dependente cadastrado.</p>
          )}
          {dependentes.map((d, i) => (
            <div key={i} className="border rounded-xl p-4 bg-card">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Dependente {i + 1}</h4>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDependentes(dependentes.filter((_, idx) => idx !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { const nd = [...dependentes]; nd[i].collapsed = !nd[i].collapsed; setDependentes(nd); }}>
                    <ChevronDown className={`h-4 w-4 transition-transform ${d.collapsed ? "-rotate-90" : ""}`} />
                  </Button>
                </div>
              </div>
              {!d.collapsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Nome">
                    <Input value={d.nome} onChange={e => { const nd = [...dependentes]; nd[i].nome = e.target.value; setDependentes(nd); }} />
                  </Field>
                  <Field label="CPF">
                    <Input value={d.cpf} onChange={e => { const nd = [...dependentes]; nd[i].cpf = e.target.value; setDependentes(nd); }} placeholder="999.999.999-99" />
                  </Field>
                  <Field label="Data de nascimento">
                    <Input type="date" value={d.dataNascimento} onChange={e => { const nd = [...dependentes]; nd[i].dataNascimento = e.target.value; setDependentes(nd); }} />
                  </Field>
                  <Field label="Tipo">
                    <Select value={d.tipoDependente} onValueChange={v => { const nd = [...dependentes]; nd[i].tipoDependente = v; setDependentes(nd); }}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{TIPO_DEPENDENTE.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                </div>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setDependentes([...dependentes, { nome: "", cpf: "", dataNascimento: "", tipoDependente: "", collapsed: false }])}
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar dependente
          </Button>
        </div>
      </EditSheet>

      {/* Sheet: Contratação */}
      <EditSheet
        open={openSection === "contratacao"}
        onClose={() => setOpenSection(null)}
        title="Contratação"
        description="Informações contratuais"
        onSave={handleSave}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="E-mail corporativo">
            <Input value={emailCorp} onChange={e => setEmailCorp(e.target.value)} placeholder="email@empresa.com" />
          </Field>
          <Field label="Matrícula">
            <Input value={matricula} onChange={e => setMatricula(e.target.value)} placeholder="Matrícula" />
          </Field>
          <Field label="Data de admissão">
            <Input type="date" value={dataAdmissao} onChange={e => setDataAdmissao(e.target.value)} />
          </Field>
          <Field label="Tipo de vínculo">
            <Select value={tipoVinculo} onValueChange={setTipoVinculo}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{TIPO_VINCULO.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Jornada de trabalho" className="md:col-span-2">
            <Input value={jornadaTrabalho} onChange={e => setJornadaTrabalho(e.target.value)} placeholder="Ex.: 40h semanais" />
          </Field>
        </div>
      </EditSheet>

      {/* Sheet: Informações adicionais */}
      <EditSheet
        open={openSection === "adicionais"}
        onClose={() => setOpenSection(null)}
        title="Informações Adicionais"
        description="Preferências e observações"
        onSave={handleSave}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tamanho de camiseta">
            <Select value={tamanhoCamiseta} onValueChange={setTamanhoCamiseta}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{["PP","P","M","G","GG","XGG"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Preferência alimentar">
            <Input value={prefAlimentar} onChange={e => setPrefAlimentar(e.target.value)} placeholder="Ex.: vegetariano" />
          </Field>
          <Field label="Equipamentos" className="md:col-span-2">
            <Input value={equipamentos} onChange={e => setEquipamentos(e.target.value)} placeholder="Equipamentos desejados" />
          </Field>
          <Field label="Observações" className="md:col-span-2">
            <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={4} placeholder="Outras informações relevantes" />
          </Field>
        </div>
      </EditSheet>
    </div>
  );
}

function SectionCard({ icon: Icon, label, optional, onClick }: { icon: any; label: string; optional?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:bg-accent hover:border-primary/40"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Icon className="h-5 w-5 text-primary shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">
          {label}
          {optional && <span className="ml-1 text-xs font-normal text-muted-foreground">(Opcional)</span>}
        </span>
      </div>
      <ChevronRight className="h-5 w-5 text-primary shrink-0 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function EditSheet({
  open, onClose, title, description, children, onSave,
}: {
  open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; onSave: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="py-6">{children}</div>
        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSave}>Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
