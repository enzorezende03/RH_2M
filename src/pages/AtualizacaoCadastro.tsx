import { useState, ReactNode, useRef } from "react";
import { User, ChevronRight, FileText, MapPin, Users as UsersIcon, ClipboardList, Plus, Trash2, ChevronDown, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { toast } from "sonner";

const UF_OPTIONS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const SEXO_OPTIONS = ["Masculino", "Feminino", "Outro"];
const GENERO_OPTIONS = ["Homem cisgênero", "Mulher cisgênero", "Homem trans", "Mulher trans", "Não-binário", "Outro", "Prefiro não informar"];
const SEXUALIDADE_OPTIONS = ["Heterossexual", "Homossexual", "Bissexual", "Pansexual", "Assexual", "Outro", "Prefiro não informar"];
const ETNIA_OPTIONS = ["Branca", "Preta", "Parda", "Amarela", "Indígena", "Prefiro não informar"];
const ESTADO_CIVIL = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"];
const GRAU_INSTRUCAO = ["Fundamental incompleto", "Fundamental completo", "Ensino médio incompleto", "Ensino médio completo", "Superior incompleto", "Superior completo", "Pós-graduação", "Mestrado", "Doutorado"];
const TIPO_CONTATO_EMERGENCIA = ["Pai/Mãe", "Cônjuge", "Filho(a)", "Irmão(ã)", "Amigo(a)", "Outro"];
const TIPO_DEPENDENTE = ["Cônjuge", "Companheiro(a)", "Filho(a)", "Enteado(a)", "Pai/Mãe", "Outro"];
const TIPO_CONTA = ["Conta Corrente", "Conta Poupança", "Conta Salário"];
const TAMANHO_CAMISETA = ["PP", "P", "M", "G", "GG", "XGG"];
const PREF_ALIMENTAR = ["Carnista", "Vegetariano", "Vegano", "Sem restrição", "Outro"];

type SectionKey = "dados" | "residencia" | "dependentes" | "contratacao" | "adicionais";

interface Dependente {
  nome: string;
  cpf: string;
  dataNascimento: string;
  tipoDependente: string;
  deducaoIRRF: boolean;
  salarioFamilia: boolean;
  incapacidade: boolean;
  collapsed: boolean;
}

export default function AtualizacaoCadastro() {
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFotoUrl(ev.target?.result as string);
      toast.success("Foto atualizada");
    };
    reader.readAsDataURL(file);
  }

  // Dados pessoais
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomeVisivel, setNomeVisivel] = useState("");
  const [celular, setCelular] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [ufRg, setUfRg] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [nomeMae, setNomeMae] = useState("");
  const [sexo, setSexo] = useState("");
  const [genero, setGenero] = useState("");
  const [sexualidade, setSexualidade] = useState("");
  const [etnia, setEtnia] = useState("");
  const [grauInstrucao, setGrauInstrucao] = useState("");
  const [tipoContatoEmergencia, setTipoContatoEmergencia] = useState("");
  const [nomeContatoEmergencia, setNomeContatoEmergencia] = useState("");
  const [telContatoEmergencia, setTelContatoEmergencia] = useState("");

  // Residência
  const [cep, setCep] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [ufResidencia, setUfResidencia] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [semNumero, setSemNumero] = useState(false);
  const [bairro, setBairro] = useState("");
  const [complemento, setComplemento] = useState("");

  // Dependentes
  const [dependentes, setDependentes] = useState<Dependente[]>([]);

  // Contratação
  const [numeroCTPS, setNumeroCTPS] = useState("");
  const [serieCTPS, setSerieCTPS] = useState("");
  const [primeiroEmprego, setPrimeiroEmprego] = useState("nao");
  const [pisPasep, setPisPasep] = useState("");
  const [banco, setBanco] = useState("");
  const [tipoConta, setTipoConta] = useState("");
  const [numeroConta, setNumeroConta] = useState("");
  const [digitoConta, setDigitoConta] = useState("");
  const [numeroAgencia, setNumeroAgencia] = useState("");
  const [digitoAgencia, setDigitoAgencia] = useState("");
  const [chavePix, setChavePix] = useState("");

  // Informações adicionais
  const [tamanhoCamiseta, setTamanhoCamiseta] = useState("");
  const [prefAlimentar, setPrefAlimentar] = useState("");
  const [divideResidencia, setDivideResidencia] = useState("");

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
            {fotoUrl && <AvatarImage src={fotoUrl} alt="Foto do colaborador" />}
            <AvatarFallback className="bg-muted text-muted-foreground">
              <User className="h-9 w-9" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-wide">NOME DO COLABORADOR</h3>
            <p className="text-sm text-primary">CARGO</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFotoChange}
        />
        <button
          type="button"
          className="text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80 mb-6"
          onClick={() => fileInputRef.current?.click()}
        >
          {fotoUrl ? "Alterar Foto" : "Editar Foto"}
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
        title="Editar Dados Pessoais"
        onSave={handleSave}
      >
        <Aviso />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Field label="Nome completo" required>
            <Input value={nomeCompleto} onChange={e => setNomeCompleto(e.target.value)} placeholder="Nome completo" />
          </Field>
          <Field label="Nome visível" required hint="Esse nome ficará visível na plataforma e feeds">
            <Input value={nomeVisivel} onChange={e => setNomeVisivel(e.target.value)} placeholder="Nome de exibição" />
          </Field>
          <Field label="Celular" required>
            <Input value={celular} onChange={e => setCelular(e.target.value)} placeholder="(99) 9 9999-9999" />
          </Field>
          <Field label="CPF" required>
            <Input value={cpf} onChange={e => setCpf(e.target.value)} placeholder="999.999.999-99" />
          </Field>
          <Field label="RG" required>
            <Input value={rg} onChange={e => setRg(e.target.value)} placeholder="Nº do RG" />
          </Field>
          <Field label="UF do RG" required>
            <Select value={ufRg} onValueChange={setUfRg}>
              <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent>{UF_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Estado Civil" required>
            <Select value={estadoCivil} onValueChange={setEstadoCivil}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{ESTADO_CIVIL.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Data de Nascimento" required>
            <Input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} />
          </Field>
          <Field label="Nome da Mãe" required>
            <Input value={nomeMae} onChange={e => setNomeMae(e.target.value)} placeholder="Nome completo da mãe" />
          </Field>
          <Field label="Sexo" optional>
            <Select value={sexo} onValueChange={setSexo}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{SEXO_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Gênero" optional>
            <Select value={genero} onValueChange={setGenero}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{GENERO_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Sexualidade" optional>
            <Select value={sexualidade} onValueChange={setSexualidade}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{SEXUALIDADE_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Etnia" required>
            <Select value={etnia} onValueChange={setEtnia}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{ETNIA_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Grau de Instrução" required>
            <Select value={grauInstrucao} onValueChange={setGrauInstrucao}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{GRAU_INSTRUCAO.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Tipo do Contato de Emergência" optional>
            <Select value={tipoContatoEmergencia} onValueChange={setTipoContatoEmergencia}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{TIPO_CONTATO_EMERGENCIA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Nome do Contato de Emergência" optional>
            <Input value={nomeContatoEmergencia} onChange={e => setNomeContatoEmergencia(e.target.value)} placeholder="Nome do contato" />
          </Field>
          <Field label="Telefone do Contato de Emergência" optional>
            <Input value={telContatoEmergencia} onChange={e => setTelContatoEmergencia(e.target.value)} placeholder="(99) 9 9999-9999" />
          </Field>
        </div>
      </EditSheet>

      {/* Sheet: Residência */}
      <EditSheet
        open={openSection === "residencia"}
        onClose={() => setOpenSection(null)}
        title="Editar Residência"
        description="Informe os dados referentes a sua moradia."
        onSave={handleSave}
      >
        <Aviso />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Field label="CEP" required>
            <Input value={cep} onChange={e => setCep(e.target.value)} placeholder="99999-999" />
          </Field>
          <Field label="Município" required>
            <Input value={municipio} onChange={e => setMunicipio(e.target.value)} placeholder="Município" />
          </Field>
          <Field label="UF" required>
            <Select value={ufResidencia} onValueChange={setUfResidencia}>
              <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent>{UF_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Endereço" required>
            <Input value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, avenida..." />
          </Field>
          <Field label="Número" required className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Input value={numero} onChange={e => setNumero(e.target.value)} disabled={semNumero} placeholder="Número" />
              <label className="flex items-center gap-2 text-xs whitespace-nowrap">
                <Checkbox checked={semNumero} onCheckedChange={(c) => setSemNumero(!!c)} /> Sem número
              </label>
            </div>
          </Field>
          <Field label="Bairro" required>
            <Input value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Bairro" />
          </Field>
          <Field label="Complemento" optional className="md:col-span-2">
            <Input value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Apto, bloco..." />
          </Field>
        </div>
      </EditSheet>

      {/* Sheet: Dependentes */}
      <EditSheet
        open={openSection === "dependentes"}
        onClose={() => setOpenSection(null)}
        title="Editar Dependentes"
        onSave={handleSave}
        saveDisabled={dependentes.length === 0}
      >
        <Aviso />
        <div className="space-y-4 mt-4">
          {dependentes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum dependente cadastrado.</p>
          )}
          {dependentes.map((d, i) => (
            <div key={i} className="border rounded-xl p-4 bg-card">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Dependente</h4>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setDependentes(dependentes.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => { const nd = [...dependentes]; nd[i].collapsed = !nd[i].collapsed; setDependentes(nd); }}>
                    <ChevronDown className={`h-4 w-4 transition-transform ${d.collapsed ? "-rotate-90" : ""}`} />
                  </Button>
                </div>
              </div>
              {!d.collapsed && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Nome" required>
                      <Input value={d.nome} onChange={e => { const nd = [...dependentes]; nd[i].nome = e.target.value; setDependentes(nd); }} placeholder="Nome completo do dependente" />
                    </Field>
                    <Field label="CPF" optional>
                      <Input value={d.cpf} onChange={e => { const nd = [...dependentes]; nd[i].cpf = e.target.value; setDependentes(nd); }} placeholder="999.999.999-99" />
                    </Field>
                    <Field label="Data de Nascimento" optional>
                      <Input type="date" value={d.dataNascimento} onChange={e => { const nd = [...dependentes]; nd[i].dataNascimento = e.target.value; setDependentes(nd); }} />
                    </Field>
                    <Field label="Tipo de Dependente" optional>
                      <Select value={d.tipoDependente} onValueChange={v => { const nd = [...dependentes]; nd[i].tipoDependente = v; setDependentes(nd); }}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>{TIPO_DEPENDENTE.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <SimNao
                      label="Dedução IRRF"
                      value={d.deducaoIRRF}
                      onChange={(v) => { const nd = [...dependentes]; nd[i].deducaoIRRF = v; setDependentes(nd); }}
                      name={`irrf-${i}`}
                    />
                    <SimNao
                      label="Salário Família"
                      value={d.salarioFamilia}
                      onChange={(v) => { const nd = [...dependentes]; nd[i].salarioFamilia = v; setDependentes(nd); }}
                      name={`salFam-${i}`}
                    />
                    <SimNao
                      label="Incapacidade"
                      value={d.incapacidade}
                      onChange={(v) => { const nd = [...dependentes]; nd[i].incapacidade = v; setDependentes(nd); }}
                      name={`incap-${i}`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-center">
            <Button
              onClick={() => setDependentes([...dependentes, { nome: "", cpf: "", dataNascimento: "", tipoDependente: "", deducaoIRRF: false, salarioFamilia: false, incapacidade: false, collapsed: false }])}
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar Dependente
            </Button>
          </div>
        </div>
      </EditSheet>

      {/* Sheet: Contratação */}
      <EditSheet
        open={openSection === "contratacao"}
        onClose={() => setOpenSection(null)}
        title="Editar Contratação"
        onSave={handleSave}
      >
        <Aviso />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <Field label="Número da CTPS" required>
            <Input value={numeroCTPS} onChange={e => setNumeroCTPS(e.target.value)} placeholder="0000" />
          </Field>
          <Field label="Série da CTPS" required>
            <Input value={serieCTPS} onChange={e => setSerieCTPS(e.target.value)} placeholder="0000" />
          </Field>
          <Field label="Primeiro emprego?" required>
            <RadioGroup value={primeiroEmprego} onValueChange={setPrimeiroEmprego} className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <RadioGroupItem value="sim" id="pe-sim" /> Sim
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <RadioGroupItem value="nao" id="pe-nao" /> Não
              </label>
            </RadioGroup>
          </Field>
          <Field label="PIS/PASEP" required>
            <Input value={pisPasep} onChange={e => setPisPasep(e.target.value)} placeholder="PIS/PASEP" disabled={primeiroEmprego === "sim"} />
          </Field>

          <Field label="Banco" required className="md:col-span-2">
            <Input value={banco} onChange={e => setBanco(e.target.value)} placeholder="Ex.: 077 - Banco Inter S.A." />
          </Field>
          <Field label="Tipo de Conta" required className="md:col-span-2">
            <Select value={tipoConta} onValueChange={setTipoConta}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{TIPO_CONTA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>

          <Field label="Número da Conta" required>
            <Input value={numeroConta} onChange={e => setNumeroConta(e.target.value)} placeholder="Número" />
          </Field>
          <Field label="Dígito" required>
            <Input value={digitoConta} onChange={e => setDigitoConta(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Número da Agência" required>
            <Input value={numeroAgencia} onChange={e => setNumeroAgencia(e.target.value)} placeholder="0001" />
          </Field>
          <Field label="Dígito" optional>
            <Input value={digitoAgencia} onChange={e => setDigitoAgencia(e.target.value)} placeholder="Agência" />
          </Field>

          <Field label="Chave Pix" optional className="md:col-span-4">
            <Input value={chavePix} onChange={e => setChavePix(e.target.value)} placeholder="Chave Pix" />
          </Field>
        </div>
      </EditSheet>

      {/* Sheet: Informações adicionais */}
      <EditSheet
        open={openSection === "adicionais"}
        onClose={() => setOpenSection(null)}
        title="Editar Informações Adicionais"
        description="Preencha as opções abaixo."
        onSave={handleSave}
      >
        <Aviso />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Field label="Tamanho de Camiseta" required>
            <Select value={tamanhoCamiseta} onValueChange={setTamanhoCamiseta}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{TAMANHO_CAMISETA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Preferência Alimentar" required>
            <Select value={prefAlimentar} onValueChange={setPrefAlimentar}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{PREF_ALIMENTAR.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Divide a residência com:" required className="md:col-span-2">
            <Textarea
              value={divideResidencia}
              onChange={e => setDivideResidencia(e.target.value)}
              rows={5}
              placeholder="Indique nome, vínculo de parentesco e idade. Ex.: Maria Silva - Mãe; João Silva - Irmão."
            />
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
  open, onClose, title, description, children, onSave, saveDisabled,
}: {
  open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; onSave: () => void; saveDisabled?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="py-6">{children}</div>
        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSave} disabled={saveDisabled}>Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, required, optional, hint, children, className }: { label: string; required?: boolean; optional?: boolean; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
        {optional && <span className="text-[10px] font-normal text-primary">(opcional)</span>}
      </Label>
      {hint && <p className="text-[10px] text-muted-foreground mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function Aviso() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-300/40 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-900 dark:text-amber-200">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <p>Mantenha seus dados atualizados e preenchidos corretamente, pois eles são de sua responsabilidade.</p>
    </div>
  );
}

function SimNao({ label, value, onChange, name }: { label: string; value: boolean; onChange: (v: boolean) => void; name: string }) {
  return (
    <div>
      <Label className="text-xs font-semibold text-foreground mb-1.5 block">{label}</Label>
      <RadioGroup value={value ? "sim" : "nao"} onValueChange={(v) => onChange(v === "sim")} className="flex items-center gap-4 mt-2">
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <RadioGroupItem value="sim" id={`${name}-sim`} /> Sim
        </label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <RadioGroupItem value="nao" id={`${name}-nao`} /> Não
        </label>
      </RadioGroup>
    </div>
  );
}
