import { User, Mail, Briefcase, Building2, Phone, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MeuPerfil() {
  const user = {
    nome: "Usuário RH",
    email: "rh@empresa.com",
    cargo: "Analista de RH",
    departamento: "Recursos Humanos",
    telefone: "(11) 99999-0000",
    admissao: "01/01/2023",
    iniciais: "RH",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Meu perfil</h1>
        <p className="text-sm text-muted-foreground">Visualize e gerencie suas informações pessoais</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
              {user.iniciais}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{user.nome}</h2>
            <p className="text-sm text-muted-foreground">{user.cargo} • {user.departamento}</p>
          </div>
          <Button variant="outline">Editar perfil</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Informações pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem icon={User} label="Nome completo" value={user.nome} />
          <InfoItem icon={Mail} label="E-mail" value={user.email} />
          <InfoItem icon={Phone} label="Telefone" value={user.telefone} />
          <InfoItem icon={Briefcase} label="Cargo" value={user.cargo} />
          <InfoItem icon={Building2} label="Departamento" value={user.departamento} />
          <InfoItem icon={Calendar} label="Data de admissão" value={user.admissao} />
        </div>
      </Card>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
