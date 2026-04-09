import { useState } from "react";
import { FileText, Edit, Download, Plus, MoreVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const predefinidos = [
  { title: "Colaboradores", description: "Informações de todos os colaboradores", file: "/planilhas/colaboradores.xlsx" },
  { title: "Dependentes", description: "Informações dos dependentes de todos os colaboradores", file: "/planilhas/dependentes.xlsx" },
  { title: "Educação e Habilidades", description: "Informações sobre educação e habilidades de todos os colaboradores", file: "/planilhas/educacao_e_habilidades.xlsx" },
  { title: "Permissões", description: "Informações dos colaboradores e suas permissões", file: "/planilhas/permissoes.xlsx" },
  { title: "Férias", description: "Informações sobre solicitações de férias", file: "/planilhas/relatorio_ferias.xlsx" },
  { title: "Períodos e Saldos de Férias", description: "Informações sobre os períodos e Saldos de Férias", file: "/planilhas/relatorio_saldo_ferias.xlsx" },
];

const personalizadosData = [
  { title: "Relação Colaboradoras" },
  { title: "Relatório função/grau instrução" },
  { title: "Data de admissão" },
];

const Relatorios = () => {
  const [activeTab, setActiveTab] = useState("predefinidos");

  const handleExportar = (title: string, file: string) => {
    const link = document.createElement("a");
    link.href = file;
    link.download = file.split("/").pop() || "relatorio.xlsx";
    link.click();
    toast.success(`Exportando relatório: ${title}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground mt-1">
          Exporte relatórios com informações dos seus colaboradores.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 gap-0">
          <TabsTrigger
            value="predefinidos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 pb-3 gap-2"
          >
            <FileText className="h-4 w-4" />
            Pré-definidos
          </TabsTrigger>
          <TabsTrigger
            value="personalizados"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 pb-3 gap-2"
          >
            <Edit className="h-4 w-4" />
            Personalizados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predefinidos" className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Pré-definidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinidos.map((item) => (
              <Card key={item.title} className="p-5 flex flex-col justify-between min-h-[140px]">
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleExportar(item.title, item.file)}
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="personalizados" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Personalizados</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo relatório
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalizadosData.map((item) => (
              <Card key={item.title} className="p-5 flex flex-col justify-between min-h-[120px]">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleExportar(item.title, "")}
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
