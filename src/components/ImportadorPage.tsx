import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Upload, FileSpreadsheet, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DicaItem {
  titulo: string;
  conteudo: string;
}

interface ImportadorPageProps {
  titulo: string;
  descricao: string;
  dicas: DicaItem[];
  onBack: () => void;
  templateUrl?: string;
}

export default function ImportadorPage({ titulo, descricao, dicas, onBack, templateUrl }: ImportadorPageProps) {
  const [showInstrucoes, setShowInstrucoes] = useState(true);
  const [expandedDica, setExpandedDica] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="flex items-center justify-center h-9 w-9 rounded-full bg-card border hover:bg-accent transition">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{titulo}</h1>
            <p className="text-sm text-muted-foreground">{descricao}</p>
          </div>
        </div>
      </div>

      {/* Instruções colapsáveis */}
      <div className="rounded-xl bg-card border p-5">
        <button className="flex items-center justify-between w-full text-left" onClick={() => setShowInstrucoes(!showInstrucoes)}>
          <span className="font-semibold text-foreground">Antes de realizar a importação, confira as instruções!</span>
          {showInstrucoes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showInstrucoes && (
          <div className="mt-4 grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="font-semibold text-blue-600 flex items-center gap-1 mb-2">ℹ️ Baixe a planilha modelo!</p>
              <p className="text-muted-foreground">Sempre baixe a planilha modelo, ela é constantemente atualizada.</p>
            </div>
            <div>
              <p className="font-semibold text-green-600 flex items-center gap-1 mb-2">✅ Recomendamos</p>
              <ul className="text-muted-foreground list-disc ml-4 space-y-1">
                <li>Utilizar o google spreadsheet</li>
                <li>Utilizar o formato de datas dd/mm/aaaa</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-red-600 flex items-center gap-1 mb-2">❌ O que não fazer</p>
              <ul className="text-muted-foreground list-disc ml-4 space-y-1">
                <li>Não adicione fórmulas</li>
                <li>Não edite os textos do cabeçalho</li>
                <li>Não adicione filtros</li>
                <li>Não crie ou exclua abas</li>
                <li>Não utilize macros</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Content: Dicas + Upload */}
      <div className="grid grid-cols-2 gap-6">
        {/* Dicas de formatação */}
        <div>
          <h3 className="font-semibold text-foreground mb-1">Dicas de formatação da planilha.</h3>
          <p className="text-sm text-muted-foreground mb-4">Algumas regras de preenchimento de cada coluna da planilha modelo.</p>
          <div className="max-h-[420px] overflow-y-auto pr-2 space-y-1 scrollbar-thin">
            {dicas.map((dica, i) => (
              <div key={i} className="border rounded-lg">
                <button
                  className="flex items-center justify-between w-full px-4 py-3 text-sm text-left hover:bg-accent/50 transition"
                  onClick={() => setExpandedDica(expandedDica === i ? null : i)}
                >
                  <span className={dica.titulo.includes("Obrigatório") ? "text-primary font-medium" : "text-foreground"}>
                    {dica.titulo}
                  </span>
                  {expandedDica === i ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
                </button>
                {expandedDica === i && (
                  <div className="px-4 pb-3 text-sm text-muted-foreground whitespace-pre-line border-t pt-3">
                    {dica.conteudo}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Adicionar planilha */}
        <div>
          <h3 className="font-semibold text-foreground mb-1">Adicionar planilha</h3>
          <p className="text-sm text-muted-foreground mb-4">Selecione o arquivo com as informações e importe para a plataforma.</p>
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); toast.info("Arquivo recebido!"); }}
          >
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="font-medium text-foreground mb-1">Arraste sua planilha aqui</p>
            <button className="text-sm text-primary hover:underline" onClick={() => toast.info("Abrir seletor de arquivo")}>
              Localize o arquivo em seu computador
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              A extensão do arquivo deve ser .XLS ou .XLSX e pode ter até 1000 registros. O nome do arquivo não pode conter caracteres especiais e não pode ultrapassar 50 caracteres.
            </p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" className="gap-2" onClick={() => toast.info("Download da planilha modelo")}>
              <FileSpreadsheet className="h-4 w-4" /> Planilha Modelo
            </Button>
            <Button disabled>Importar</Button>
          </div>
        </div>
      </div>

      {/* Histórico de Importações */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Histórico de Importações</h3>
        <p className="text-sm text-muted-foreground mb-4">Aqui está a listagem das atividades relacionadas à importação.</p>
        <div className="rounded-xl bg-card border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold">Nome do usuário</th>
                <th className="text-left px-4 py-3 font-semibold">Nome da planilha</th>
                <th className="text-left px-4 py-3 font-semibold">Data e hora</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="text-center py-12">
                  <Search className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-muted-foreground font-medium">Nenhum resultado encontrado</p>
                  <p className="text-xs text-muted-foreground">Tente outras combinações de filtros para aprimorar sua busca.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
