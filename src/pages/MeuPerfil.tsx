import { useNavigate } from "react-router-dom";
import { User, Mail, Briefcase, Building2, Phone, Calendar, MapPin, IdCard, Cake, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentColaborador } from "@/hooks/useCurrentColaborador";

function fmtDate(v: any): string {
  if (!v) return "—";
  const d = typeof v === "number"
    ? new Date(Math.round((v - 25569) * 86400 * 1000))
    : new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("pt-BR");
}

export default function MeuPerfil() {
  const navigate = useNavigate();
  const { colaborador, nome, iniciais, email } = useCurrentColaborador();
  const d = colaborador?.dadosCompletos ?? {};

  const cargo = colaborador?.cargo || d["Cargo"] || "—";
  const departamento = colaborador?.departamento || d["Departamento"] || "—";
  const unidade = colaborador?.unidade || d["Unidade"] || "—";
  const telefone = d["Celular"] || "—";
  const admissao = fmtDate(d["Data Admissão"]);
  const nascimento = fmtDate(d["Data de Nascimento"]);
  const cpf = d["CPF"] || "—";
  const rg = d["RG"] || "—";
  const matricula = d["Matrícula"] || "—";
  const tipoVinculo = d["Tipo de Vínculo"] || "—";
  const estadoCivil = d["Estado Civil"] || "—";
  const grauInstrucao = d["Grau de Instrução"] || "—";
  const enderecoLinhas = [
    d["Residência - Endereço"],
    d["Residência - Número"],
    d["Residência - Bairro"],
    d["Residência - Município"] && d["Residência - UF"] ? `${d["Residência - Município"]}/${d["Residência - UF"]}` : d["Residência - Município"],
    d["Residência - CEP"],
  ].filter(Boolean).join(", ") || "—";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu perfil</h1>
        <p className="text-sm text-muted-foreground">Visualize e gerencie suas informações pessoais</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
              {iniciais || <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate">{nome}</h2>
            <p className="text-sm text-muted-foreground truncate">
              {cargo} {departamento !== "—" && `• ${departamento}`} {unidade !== "—" && `• ${unidade}`}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/meu-perfil/editar")}>Editar perfil</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Informações pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem icon={User} label="Nome completo" value={nome} />
          <InfoItem icon={Mail} label="E-mail" value={email || "—"} />
          <InfoItem icon={Phone} label="Telefone" value={String(telefone)} />
          <InfoItem icon={Cake} label="Data de nascimento" value={nascimento} />
          <InfoItem icon={IdCard} label="CPF" value={String(cpf)} />
          <InfoItem icon={IdCard} label="RG" value={String(rg)} />
          <InfoItem icon={IdCard} label="Matrícula" value={String(matricula)} />
          <InfoItem icon={User} label="Estado civil" value={String(estadoCivil)} />
          <InfoItem icon={User} label="Grau de instrução" value={String(grauInstrucao)} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Informações profissionais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem icon={Briefcase} label="Cargo" value={cargo} />
          <InfoItem icon={Building2} label="Departamento" value={departamento} />
          <InfoItem icon={Building2} label="Unidade" value={unidade} />
          <InfoItem icon={Briefcase} label="Tipo de vínculo" value={String(tipoVinculo)} />
          <InfoItem icon={Calendar} label="Data de admissão" value={admissao} />
          <InfoItem icon={User} label="Gestor direto" value={colaborador?.gestorDireto || "—"} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Endereço</h3>
        <div className="grid grid-cols-1 gap-4">
          <InfoItem icon={Home} label="Residência" value={enderecoLinhas} />
        </div>
      </Card>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  const empty = !value || value === "—";
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium truncate ${empty ? "text-muted-foreground" : "text-foreground"}`}>{value || "—"}</p>
      </div>
    </div>
  );
}
