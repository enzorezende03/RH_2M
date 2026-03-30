import { useState } from "react";
import { Search, Plus, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const colaboradores = [
  { id: 1, nome: "Ana Costa", cargo: "Analista de RH", setor: "Recursos Humanos", status: "Ativo", admissao: "15/03/2022", initials: "AC" },
  { id: 2, nome: "Carlos Silva", cargo: "Desenvolvedor Sr.", setor: "Tecnologia", status: "Ativo", admissao: "02/01/2021", initials: "CS" },
  { id: 3, nome: "Maria Souza", cargo: "Gerente Comercial", setor: "Comercial", status: "Ativo", admissao: "10/06/2020", initials: "MS" },
  { id: 4, nome: "Pedro Lima", cargo: "Coordenador de Projetos", setor: "Operações", status: "Ativo", admissao: "18/09/2023", initials: "PL" },
  { id: 5, nome: "Julia Santos", cargo: "Designer UX", setor: "Tecnologia", status: "Ativo", admissao: "05/02/2024", initials: "JS" },
  { id: 6, nome: "Rafael Oliveira", cargo: "Analista Financeiro", setor: "Financeiro", status: "Férias", admissao: "20/07/2021", initials: "RO" },
  { id: 7, nome: "Beatriz Ferreira", cargo: "Assistente Administrativo", setor: "Administrativo", status: "Ativo", admissao: "12/11/2022", initials: "BF" },
  { id: 8, nome: "Lucas Mendes", cargo: "Engenheiro de Dados", setor: "Tecnologia", status: "Ativo", admissao: "30/04/2023", initials: "LM" },
];

const statusColors: Record<string, string> = {
  Ativo: "bg-success/10 text-success border-success/20",
  Férias: "bg-warning/10 text-warning border-warning/20",
  Afastado: "bg-muted text-muted-foreground",
  Desligado: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Colaboradores() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = colaboradores.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cargo.toLowerCase().includes(search.toLowerCase()) ||
      c.setor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Colaboradores</h1>
          <p className="text-sm text-muted-foreground">{colaboradores.length} colaboradores cadastrados</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo colaborador
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, cargo ou setor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-xl bg-card card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colaborador</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cargo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Setor</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admissão</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => navigate(`/colaboradores/${c.id}`)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {c.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{c.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{c.cargo}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{c.setor}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{c.admissao}</td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className={statusColors[c.status]}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
