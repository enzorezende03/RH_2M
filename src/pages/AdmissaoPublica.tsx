import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { CheckCircle2, FileText, Upload, Loader2, Briefcase, FileCheck, AlertCircle } from "lucide-react";

type LinkRow = {
  id: string;
  token: string;
  admissao_id: string;
  nome: string;
  email: string;
  cargo: string | null;
  departamento: string | null;
  tipo_vinculo: string | null;
  prazo_entrega: string | null;
  status: string;
  dados: Record<string, any>;
  documentos: { tipo: string; fileName?: string; uploadedAt?: string }[];
  concluido_em: string | null;
};

const DOCS_PADRAO = [
  "CPF", "RG", "Comprovante de Residência", "Carteira de Trabalho",
  "Título de Eleitor", "Certificados (Diplomas)", "Exame Admissional",
];

export default function AdmissaoPublica() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState<LinkRow | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [dados, setDados] = useState<Record<string, any>>({});
  const [documentos, setDocumentos] = useState<{ tipo: string; fileName?: string; uploadedAt?: string }[]>([]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data, error } = await supabase.rpc("get_admissao_link_by_token", { _token: token });
      if (error || !data || data.length === 0) {
        setErro("Link inválido ou expirado.");
        setLoading(false);
        return;
      }
      const row = data[0] as LinkRow;
      setLink(row);
      setDados((row.dados as any) || {});
      setDocumentos(
        Array.isArray(row.documentos) && row.documentos.length > 0
          ? row.documentos
          : DOCS_PADRAO.map((t) => ({ tipo: t }))
      );
      setLoading(false);
    })();
  }, [token]);

  const set = (k: string, v: any) => setDados((d) => ({ ...d, [k]: v }));

  const salvar = async (concluir: boolean) => {
    if (!token) return;
    setSaving(true);
    const { data, error } = await supabase.rpc("salvar_admissao_publica", {
      _token: token,
      _dados: dados,
      _documentos: documentos,
      _concluir: concluir,
    });
    setSaving(false);
    if (error || !data) {
      toast.error("Não foi possível salvar. Tente novamente.");
      return;
    }
    if (concluid_check(concluir)) {
      toast.success("Cadastro enviado com sucesso!");
      setLink((l) => (l ? { ...l, status: "concluido", concluido_em: new Date().toISOString() } : l));
    } else {
      toast.success("Progresso salvo");
    }
  };
  const concluid_check = (c: boolean) => c;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (erro || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Link inválido</h1>
          <p className="text-sm text-muted-foreground">{erro || "Não foi possível abrir este link."}</p>
        </Card>
      </div>
    );
  }

  const concluido = link.status === "concluido";

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Bem-vindo(a), {link.nome.split(" ")[0]}!</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Preencha os dados abaixo para concluir seu processo de admissão{link.cargo ? ` para ${link.cargo}` : ""}.
              </p>
            </div>
            <Badge className={concluido ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
              {concluido ? "Concluído" : "Em preenchimento"}
            </Badge>
          </div>
          {link.prazo_entrega && (
            <p className="text-xs text-muted-foreground mt-3">
              Prazo de entrega: <strong>{new Date(link.prazo_entrega).toLocaleDateString("pt-BR")}</strong>
            </p>
          )}
        </Card>

        {concluido && (
          <Card className="p-6 bg-emerald-50 border-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <div>
                <h2 className="font-semibold text-emerald-900">Cadastro enviado!</h2>
                <p className="text-sm text-emerald-700">
                  Seus dados foram recebidos pela equipe de RH. Você pode editar e reenviar caso necessário.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <Tabs defaultValue="identificacao">
            <TabsList>
              <TabsTrigger value="identificacao"><FileText className="h-4 w-4 mr-1" /> Identificação</TabsTrigger>
              <TabsTrigger value="contratacao"><Briefcase className="h-4 w-4 mr-1" /> Contratação</TabsTrigger>
              <TabsTrigger value="documentos"><FileCheck className="h-4 w-4 mr-1" /> Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="identificacao" className="space-y-6 mt-4">
              <section>
                <h3 className="font-semibold mb-3">Dados pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <F label="Nome completo *"><Input value={dados.nomeCompleto || link.nome} onChange={(e) => set("nomeCompleto", e.target.value)} /></F>
                  <F label="E-mail"><Input value={dados.email || link.email} onChange={(e) => set("email", e.target.value)} /></F>
                  <F label="Celular"><Input value={dados.celular || ""} onChange={(e) => set("celular", e.target.value)} placeholder="(99) 9 9999-9999" /></F>
                  <F label="CPF"><Input value={dados.cpf || ""} onChange={(e) => set("cpf", e.target.value)} /></F>
                  <F label="RG"><Input value={dados.rg || ""} onChange={(e) => set("rg", e.target.value)} /></F>
                  <F label="UF do RG"><Input value={dados.ufRg || ""} onChange={(e) => set("ufRg", e.target.value)} maxLength={2} /></F>
                  <F label="Nome da Mãe"><Input value={dados.nomeMae || ""} onChange={(e) => set("nomeMae", e.target.value)} /></F>
                  <F label="Sexo">
                    <Select value={dados.sexo || ""} onValueChange={(v) => set("sexo", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{["Masculino", "Feminino"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </F>
                  <F label="Grau de Instrução">
                    <Select value={dados.grauInstrucao || ""} onValueChange={(v) => set("grauInstrucao", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{["Fundamental","Médio completo","Superior incompleto","Superior completo","Pós-graduação"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </F>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Contato de emergência</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <F label="Nome"><Input value={dados.emergNome || ""} onChange={(e) => set("emergNome", e.target.value)} /></F>
                  <F label="Telefone"><Input value={dados.emergTelefone || ""} onChange={(e) => set("emergTelefone", e.target.value)} /></F>
                  <F label="Parentesco"><Input value={dados.emergTipo || ""} onChange={(e) => set("emergTipo", e.target.value)} /></F>
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3">Endereço residencial</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <F label="CEP"><Input value={dados.cep || ""} onChange={(e) => set("cep", e.target.value)} /></F>
                  <F label="Endereço"><Input value={dados.endereco || ""} onChange={(e) => set("endereco", e.target.value)} /></F>
                  <F label="Número"><Input value={dados.numero || ""} onChange={(e) => set("numero", e.target.value)} /></F>
                  <F label="Complemento"><Input value={dados.complemento || ""} onChange={(e) => set("complemento", e.target.value)} /></F>
                  <F label="Bairro"><Input value={dados.bairro || ""} onChange={(e) => set("bairro", e.target.value)} /></F>
                  <F label="Município"><Input value={dados.municipio || ""} onChange={(e) => set("municipio", e.target.value)} /></F>
                  <F label="UF"><Input value={dados.uf || ""} onChange={(e) => set("uf", e.target.value)} maxLength={2} /></F>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="contratacao" className="space-y-6 mt-4">
              <section>
                <h3 className="font-semibold mb-3">Dados bancários</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <F label="Banco"><Input value={dados.banco || ""} onChange={(e) => set("banco", e.target.value)} /></F>
                  <F label="Tipo de Conta">
                    <Select value={dados.tipoConta || ""} onValueChange={(v) => set("tipoConta", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{["Conta Corrente","Conta Poupança","Conta Salário"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </F>
                  <F label="Agência"><Input value={dados.numeroAgencia || ""} onChange={(e) => set("numeroAgencia", e.target.value)} /></F>
                  <F label="Número da Conta"><Input value={dados.numeroConta || ""} onChange={(e) => set("numeroConta", e.target.value)} /></F>
                  <F label="Dígito"><Input value={dados.digitoConta || ""} onChange={(e) => set("digitoConta", e.target.value)} /></F>
                  <F label="Chave Pix"><Input value={dados.chavePix || ""} onChange={(e) => set("chavePix", e.target.value)} /></F>
                </div>
              </section>

              {(link.tipo_vinculo === "CLT" || !link.tipo_vinculo) && (
                <section>
                  <h3 className="font-semibold mb-3">CLT</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <F label="Número da CTPS"><Input value={dados.ctps || ""} onChange={(e) => set("ctps", e.target.value)} /></F>
                    <F label="Série"><Input value={dados.ctpsSerie || ""} onChange={(e) => set("ctpsSerie", e.target.value)} /></F>
                    <F label="PIS/PASEP"><Input value={dados.pisPasep || ""} onChange={(e) => set("pisPasep", e.target.value)} /></F>
                  </div>
                </section>
              )}

              {link.tipo_vinculo === "PJ" && (
                <section>
                  <h3 className="font-semibold mb-3">PJ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <F label="Razão social"><Input value={dados.razaoSocial || ""} onChange={(e) => set("razaoSocial", e.target.value)} /></F>
                    <F label="CNPJ"><Input value={dados.cnpj || ""} onChange={(e) => set("cnpj", e.target.value)} /></F>
                    <F label="Nome fantasia"><Input value={dados.nomeFantasia || ""} onChange={(e) => set("nomeFantasia", e.target.value)} /></F>
                    <F label="Inscrição Municipal"><Input value={dados.inscricaoMunicipal || ""} onChange={(e) => set("inscricaoMunicipal", e.target.value)} /></F>
                  </div>
                </section>
              )}
            </TabsContent>

            <TabsContent value="documentos" className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Anexe os documentos solicitados. (Os arquivos são apenas registrados; a equipe de RH solicitará o envio físico ou por outro canal seguro.)
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentos.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-sm">{d.tipo}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {d.fileName ? d.fileName : <Badge variant="outline" className="bg-red-50 text-red-700">Pendente</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <label>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const next = [...documentos];
                              next[i] = { ...next[i], fileName: f.name, uploadedAt: new Date().toLocaleDateString("pt-BR") };
                              setDocumentos(next);
                            }}
                          />
                          <Button size="sm" variant="outline" asChild>
                            <span className="cursor-pointer"><Upload className="h-3.5 w-3.5 mr-1" /> Anexar</span>
                          </Button>
                        </label>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" disabled={saving} onClick={() => salvar(false)}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Salvar progresso
            </Button>
            <Button disabled={saving} onClick={() => salvar(true)}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
              Concluir e enviar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
