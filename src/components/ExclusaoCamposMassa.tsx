import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CAMPOS = [
  { id: "cpf", label: "CPF", desc: "Esse é o número do documento de Cadastro de Pessoa Física do colaborador." },
  { id: "dataAdmissao", label: "Data de Admissão", desc: "Essa é a data que a pessoa entrou na empresa." },
  { id: "dataNascimento", label: "Data de Nascimento", desc: "Essa é a data que a pessoa nasceu." },
  { id: "cargoVisivel", label: "Cargo Visível", desc: "Nesse campo é colocado o cargo da pessoa, ele fica visível para todos os usuários da empresa." },
  { id: "etnia", label: "Etnia", desc: "Nesse campo é preenchida a etnia da pessoa, as opções são: Branca, parda, preta, amarela e indígena." },
  { id: "sexo", label: "Sexo", desc: "Nesse campo é preenchido o sexo da pessoa, as opções são: Masculino, feminino, não definido e sem dados." },
  { id: "gestorDireto", label: "Gestor direto", desc: "Esse é o gestor direto do colaborador. Ele precisa ter o papel de gestor ou administrator na Feedz para ser um gestor direto." },
  { id: "grupos", label: "Grupos", desc: "Nesse campo são preenchidos os grupos aos quais essa pessoa pertence." },
  { id: "remuneracao", label: "Remuneração", desc: "Nesse campo é preenchido o salário dessa pessoa." },
  {
    id: "tipoVinculo",
    label: "Tipo de vínculo",
    desc: "Nesse campo é preenchido o tipo de vínculo dessa pessoa, as opções são: CLT, PJ, Estágio, Sócio, Cooperado e Jovem Aprendiz.",
    warning: "Ao remover o tipo de vínculo, o saldo de férias deixará de ser calculado, bem como os dados de saldo existentes para este colaborador serão apagados. Solicitações de férias serão mantidas.",
  },
];

interface MockPessoa {
  id: string;
  nome: string;
  email: string;
  dataAdmissao: string;
}

const MOCK_PESSOAS: MockPessoa[] = [];

export default function ExclusaoCamposMassa({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [tab, setTab] = useState<"campos" | "pessoas">("campos");
  const [selectedCampos, setSelectedCampos] = useState<string[]>([]);
  const [selectedPessoas, setSelectedPessoas] = useState<string[]>([]);
  const [searchPessoa, setSearchPessoa] = useState("");
  const [perPage, setPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const toggleCampo = (id: string) => {
    setSelectedCampos((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const togglePessoa = (id: string) => {
    setSelectedPessoas((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const filteredPessoas = MOCK_PESSOAS.filter(
    (p) => !searchPessoa || p.nome.toLowerCase().includes(searchPessoa.toLowerCase()) || p.email.toLowerCase().includes(searchPessoa.toLowerCase())
  );

  const itemsPerPage = parseInt(perPage);
  const totalPages = Math.ceil(filteredPessoas.length / itemsPerPage);
  const paginatedPessoas = filteredPessoas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedCamposLabels = CAMPOS.filter((c) => selectedCampos.includes(c.id)).map((c) => c.label).join(", ");

  const handleContinuar = () => {
    if (selectedCampos.length === 0) {
      toast.error("Selecione pelo menos um campo.");
      return;
    }
    setTab("pessoas");
  };

  const handleLimpar = () => {
    if (selectedPessoas.length === 0) {
      toast.error("Selecione pelo menos uma pessoa.");
      return;
    }
    toast.success(`Campos "${selectedCamposLabels}" limpos para ${selectedPessoas.length} colaborador(es).`);
    setSelectedCampos([]);
    setSelectedPessoas([]);
    setTab("campos");
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedCampos([]);
    setSelectedPessoas([]);
    setTab("campos");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Exclusão de campos em massa</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Aqui você pode <strong>excluir</strong> os dados de vários colaboradores de uma só vez. Primeiro selecione os campos que deseja apagar, depois é só escolher em quais pessoas você quer aplicar essa ação.
          </p>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              tab === "campos" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setTab("campos")}
          >
            ① Escolha os campos
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              tab === "pessoas" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => selectedCampos.length > 0 && setTab("pessoas")}
          >
            ② Escolha as pessoas
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {tab === "campos" && (
            <div className="space-y-1 py-2">
              <p className="text-sm text-muted-foreground mb-3">Selecione os campos que você deseja apagar</p>
              {CAMPOS.map((campo) => (
                <label
                  key={campo.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedCampos.includes(campo.id)}
                    onCheckedChange={() => toggleCampo(campo.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-medium text-sm">{campo.label}</span>
                    <span className="text-sm text-muted-foreground ml-3">{campo.desc}</span>
                    {campo.warning && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{campo.warning}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {tab === "pessoas" && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Agora selecione para quais pessoas você deseja apagar esses campos: <strong>{selectedCamposLabels}</strong>.
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span>Exibindo</span>
                  <Select value={perPage} onValueChange={(v) => { setPerPage(v); setCurrentPage(1); }}>
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>resultados por página</span>
                </div>
                <div className="relative w-48">
                  <Input
                    placeholder="Buscar..."
                    value={searchPessoa}
                    onChange={(e) => { setSearchPessoa(e.target.value); setCurrentPage(1); }}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="grid grid-cols-[auto_1fr_1fr] gap-4 px-4 py-2 border-b bg-muted/30">
                  <div className="w-5" />
                  <span className="text-sm font-medium">Colaborador</span>
                  <span className="text-sm font-medium">Data de Admissão</span>
                </div>
                {paginatedPessoas.map((p) => (
                  <label
                    key={p.id}
                    className="grid grid-cols-[auto_1fr_1fr] gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-accent/30 cursor-pointer items-center"
                  >
                    <Checkbox
                      checked={selectedPessoas.includes(p.id)}
                      onCheckedChange={() => togglePessoa(p.id)}
                    />
                    <div>
                      <p className="text-sm font-medium text-primary">{p.nome}</p>
                      <p className="text-xs text-primary/70">{p.email}</p>
                    </div>
                    <span className="text-sm">{p.dataAdmissao}</span>
                  </label>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  {totalPages > 5 && (
                    <>
                      <span className="flex items-center px-1 text-muted-foreground">...</span>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(totalPages)}>
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          {tab === "campos" ? (
            <>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleContinuar} disabled={selectedCampos.length === 0}>Continuar</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setTab("campos")}>Voltar</Button>
              <Button variant="destructive" onClick={handleLimpar} disabled={selectedPessoas.length === 0}>Limpar campos</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
