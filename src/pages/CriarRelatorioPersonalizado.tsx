import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";

const statusOptions = ["Ativos", "Desligados", "Desativados", "Importados"];

type Secao = { id: string; titulo: string; campos: string[] };

const secoes: Secao[] = [
  {
    id: "dados-pessoais",
    titulo: "Dados Pessoais",
    campos: [
      "Nome completo",
      "Nome",
      "E-mail pessoal",
      "Celular",
      "CPF",
      "Nome da mãe",
      "RG",
      "UF do RG",
      "Sexo",
      "Gênero",
      "Etnia",
      "Sexualidade",
      "Grau de instrução",
      "Estado civil",
      "Data de cadastro",
      "Data de nascimento",
      "Participa da gamificação",
      "Biografia",
      "Idioma",
      "Papel",
    ],
  },
  {
    id: "contato-emergencia",
    titulo: "Contato de Emergência",
    campos: [
      "Tipo do Contato de Emergência",
      "Nome do Contato de Emergência",
      "Telefone do Contato de Emergência",
    ],
  },
  {
    id: "residencia",
    titulo: "Residência",
    campos: [
      "CEP",
      "Endereço",
      "Número",
      "Sem Número",
      "Complemento",
      "Bairro",
      "Município",
      "UF",
    ],
  },
  {
    id: "informacoes-adicionais",
    titulo: "Informações Adicionais",
    campos: [
      "Tamanho da Camiseta",
      "Preferência Alimentar",
      "Equipamentos",
      "Divide a residência com",
    ],
  },
  {
    id: "contrato",
    titulo: "Contrato",
    campos: [
      "E-mail",
      "Data de admissão",
      "Matrícula",
      "Cargo",
      "Cargo visível",
      "Remuneração",
      "Tipo de vínculo",
      "CBO",
      "Observações",
      "Jornada de trabalho",
    ],
  },
  {
    id: "cargo",
    titulo: "Cargo",
    campos: ["Gestor direto", "Departamento", "Unidade", "Grupos"],
  },
  {
    id: "clt",
    titulo: "CLT - Celetista",
    campos: ["Número da CTPS", "Série da CTPS", "Primeiro emprego", "PIS/PASEP"],
  },
  {
    id: "pj",
    titulo: "PJ",
    campos: [
      "Razão social",
      "CNPJ",
      "Nome fantasia",
      "Inscrição Municipal",
      "CEP",
      "Endereço",
      "Número",
      "Sem Número",
      "Complemento",
      "Bairro",
      "Município",
      "UF",
    ],
  },
  {
    id: "dados-bancarios",
    titulo: "Dados Bancários",
    campos: [
      "Banco",
      "Tipo de Conta",
      "Número da Conta",
      "Dígito",
      "Número da Agência",
      "Dígito da Agência",
      "Chave Pix",
    ],
  },
];

export default function CriarRelatorioPersonalizado() {
  const navigate = useNavigate();
  const [statusSel, setStatusSel] = useState<string[]>(["Ativos"]);
  const todosCampos = useMemo(
    () => secoes.flatMap((s) => s.campos.map((c) => `${s.id}::${c}`)),
    []
  );
  const [camposSel, setCamposSel] = useState<string[]>(todosCampos);

  const toggleStatus = (s: string) =>
    setStatusSel((prev) =>
      prev.includes(s) ? prev.filter((p) => p !== s) : [...prev, s]
    );

  const toggleCampo = (key: string) =>
    setCamposSel((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );

  const toggleSecao = (secao: Secao) => {
    const keys = secao.campos.map((c) => `${secao.id}::${c}`);
    const allSel = keys.every((k) => camposSel.includes(k));
    setCamposSel((prev) =>
      allSel ? prev.filter((p) => !keys.includes(p)) : Array.from(new Set([...prev, ...keys]))
    );
  };

  const isSecaoChecked = (secao: Secao) => {
    const keys = secao.campos.map((c) => `${secao.id}::${c}`);
    return keys.every((k) => camposSel.includes(k));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/relatorios">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Criar relatório personalizado</h1>
          <p className="text-sm text-muted-foreground">
            Defina as variáveis e dados que serão exportados no seu relatório personalizado
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Defina as variáveis</h2>

        <div className="border-b pb-6 mb-6">
          <h3 className="text-base font-medium mb-3">Gerais</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Status dos colaboradores*
          </p>
          <div className="flex flex-wrap gap-6">
            {statusOptions.map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={statusSel.includes(s)}
                  onCheckedChange={() => toggleStatus(s)}
                />
                <span className="text-sm">{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium">Dados</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Selecione os campos que serão incluídos no relatório para exportação
          </p>

          <div className="space-y-3">
            {secoes.map((secao) => (
              <Collapsible key={secao.id} defaultOpen>
                <Card className="overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 bg-muted/30 border-b cursor-pointer hover:bg-muted/50">
                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSecaoChecked(secao)}
                          onCheckedChange={() => toggleSecao(secao)}
                        />
                        <span className="font-medium text-sm">{secao.titulo}</span>
                      </label>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=closed]:-rotate-90" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                      {secao.campos.map((campo) => {
                        const key = `${secao.id}::${campo}`;
                        return (
                          <label
                            key={key}
                            className="flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <Checkbox
                              checked={camposSel.includes(key)}
                              onCheckedChange={() => toggleCampo(key)}
                            />
                            <span>{campo}</span>
                          </label>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast.success("Modelo salvo")}
          >
            <Save className="h-4 w-4" />
            Salvar modelo
          </Button>
          <Button
            className="gap-2"
            onClick={() => {
              toast.success("Exportando relatório personalizado");
              navigate("/relatorios");
            }}
          >
            <Download className="h-4 w-4" />
            Exportar relatório
          </Button>
        </div>
      </div>
    </div>
  );
}
