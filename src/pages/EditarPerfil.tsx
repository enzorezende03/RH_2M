import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Plus, Trash2, Pencil, ArrowLeft, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Contato { tipo: string; valor: string; }
interface LinkPerfil { titulo: string; url: string; }
interface Educacao {
  id: string;
  instituicao: string;
  formacao: string;
  area: string;
  dataInicio: string;
  dataTermino: string;
  diploma: string;
}

export default function EditarPerfil() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [foto, setFoto] = useState<string | null>(null);

  // Perfil
  const [nome, setNome] = useState("ENZO REZENDE PAOLUCCI");
  const [cargoVisivel] = useState("Estagiário");
  const [email] = useState("enzo.paolucci@2mgrupo.com.br");
  const [idioma, setIdioma] = useState("pt-BR");
  const [contatos, setContatos] = useState<Contato[]>([
    { tipo: "whatsapp", valor: "(31) 97518-9844" },
    { tipo: "whatsapp", valor: "" },
  ]);

  // Informações
  const [biografia, setBiografia] = useState("");
  const [habilidades, setHabilidades] = useState("");
  const [links, setLinks] = useState<LinkPerfil[]>([
    { titulo: "GitHub", url: "https://github.com/enzorezende03" },
    { titulo: "LinkedIn", url: "https://www.linkedin.com/in/enzo-r-paolucci-5b66b5330" },
    { titulo: "", url: "" },
  ]);

  // Educação
  const [educacoes, setEducacoes] = useState<Educacao[]>([
    { id: "1", titulo: "Ensino Médio Técnico, Técnico em Informática", instituicao: "Colégio e Faculdade COTEMIG", periodo: "02/2023 - 11/2025" },
  ]);

  // Configuração
  const [imagemFundo, setImagemFundo] = useState("/assets/images/degrade.png");
  const [corFundo, setCorFundo] = useState("");

  // Notificações
  const [notif, setNotif] = useState({
    celebracao: true, okr: true, novaCelebracao: true, novoFeedback: true, novoObjetivo: true,
  });

  // Senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const iniciais = nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const salvar = () => toast.success("Alterações salvas com sucesso!");

  return (
    <div className="space-y-4 max-w-7xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/meu-perfil")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Editar perfil</h1>
          <p className="text-sm text-muted-foreground">Atualize suas informações, preferências e segurança</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Foto */}
        <Card className="p-6 h-fit">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFoto} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative mx-auto block h-36 w-36 rounded-full overflow-hidden border-4 border-background ring-1 ring-border hover:ring-primary transition"
            aria-label="Alterar foto de perfil"
          >
            {foto ? (
              <img src={foto} alt="Foto de perfil" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center text-3xl font-semibold text-primary">
                {iniciais}
              </div>
            )}
            <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Camera className="h-8 w-8 text-background" />
            </div>
          </button>
          <p className="text-center text-sm text-muted-foreground mt-3 font-medium">
            Clique na foto para alterar
          </p>
        </Card>

        {/* Tabs */}
        <Card className="p-6">
          <Tabs defaultValue="perfil" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-1 overflow-x-auto">
              {[
                ["perfil", "Perfil"],
                ["informacoes", "Informações"],
                ["educacao", "Educação"],
                ["configuracao", "Configuração"],
                ["notificacoes", "Notificações"],
                ["senha", "Senha e Segurança"],
              ].map(([v, l]) => (
                <TabsTrigger
                  key={v}
                  value={v}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent rounded-none px-4 py-2"
                >
                  {l}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Perfil */}
            <TabsContent value="perfil" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cargo visível</Label>
                <Input value={cargoVisivel} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={idioma} onValueChange={setIdioma}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português - Brasil</SelectItem>
                    <SelectItem value="en-US">English - US</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-lg font-semibold">Contatos</h3>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  {contatos.map((c, i) => {
                    const isLinkedin = c.tipo === "linkedin";
                    const isFacebook = c.tipo === "facebook";
                    const prefix = isLinkedin
                      ? "https://www.linkedin.com/in/"
                      : isFacebook
                      ? "https://www.facebook.com/"
                      : null;
                    const placeholder = isLinkedin || isFacebook
                      ? "nome-de-usuario"
                      : "(99) 99999-9999";
                    return (
                      <div key={i} className="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-2">
                        <Select value={c.tipo} onValueChange={(v) => {
                          const n = [...contatos]; n[i].tipo = v; n[i].valor = ""; setContatos(n);
                        }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                          </SelectContent>
                        </Select>
                        {prefix ? (
                          <div className="flex h-10 w-full rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background">
                            <span className="flex items-center px-3 text-sm text-muted-foreground bg-muted border-r border-input whitespace-nowrap">
                              {prefix}
                            </span>
                            <input
                              type="text"
                              placeholder={placeholder}
                              value={c.valor}
                              onChange={(e) => { const n = [...contatos]; n[i].valor = e.target.value; setContatos(n); }}
                              className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                            />
                          </div>
                        ) : (
                          <Input
                            placeholder={placeholder}
                            value={c.valor}
                            onChange={(e) => { const n = [...contatos]; n[i].valor = e.target.value; setContatos(n); }}
                          />
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setContatos(contatos.filter((_, idx) => idx !== i))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end mt-3">
                  <Button variant="outline" size="sm" onClick={() => setContatos([...contatos, { tipo: "whatsapp", valor: "" }])}>
                    <Plus className="h-4 w-4 mr-1" /> Adicionar novo
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-2"><Button onClick={salvar}>Salvar</Button></div>
            </TabsContent>

            {/* Informações */}
            <TabsContent value="informacoes" className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold">Perfil de Colaborador</h3>
              <div className="space-y-2">
                <Label>Biografia</Label>
                <Textarea rows={4} value={biografia} onChange={(e) => setBiografia(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Habilidades</Label>
                <Input placeholder="Ex: React, Liderança, Comunicação" value={habilidades} onChange={(e) => setHabilidades(e.target.value)} />
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">Links no Perfil</h3>
                <div className="space-y-3">
                  {links.map((l, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Título do Link</Label>
                        <Input
                          placeholder="Escreva aqui o que você quer colocar como atalho"
                          value={l.titulo}
                          onChange={(e) => { const n = [...links]; n[i].titulo = e.target.value; setLinks(n); }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Endereço (URL) do Link</Label>
                        <Input
                          placeholder="http://www.mysite.com"
                          value={l.url}
                          onChange={(e) => { const n = [...links]; n[i].url = e.target.value; setLinks(n); }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3">
                  <Button variant="outline" size="sm" onClick={() => setLinks([...links, { titulo: "", url: "" }])}>
                    <Plus className="h-4 w-4 mr-1" /> Adicionar link
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-2"><Button onClick={salvar}>Salvar</Button></div>
            </TabsContent>

            {/* Educação */}
            <TabsContent value="educacao" className="space-y-4 mt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Educação</h3>
                  <p className="text-sm text-muted-foreground">Adicione as suas formações acadêmicas e certificados.</p>
                </div>
                <Button onClick={() => setEducacoes([...educacoes, { id: crypto.randomUUID(), titulo: "Nova formação", instituicao: "", periodo: "" }])}>
                  Adicionar novo
                </Button>
              </div>
              <div className="divide-y border rounded-md">
                {educacoes.map((ed) => (
                  <div key={ed.id} className="flex items-start justify-between p-4 gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{ed.titulo}</p>
                      <p className="text-sm text-primary">{ed.instituicao}</p>
                      <p className="text-sm text-muted-foreground">{ed.periodo}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => toast.info("Editar formação")}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setEducacoes(educacoes.filter((e) => e.id !== ed.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {educacoes.length === 0 && (
                  <p className="p-6 text-sm text-muted-foreground text-center">Nenhuma formação cadastrada.</p>
                )}
              </div>
            </TabsContent>

            {/* Configuração */}
            <TabsContent value="configuracao" className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold">Configurações Gerais</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Imagem de Fundo</Label>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  <button className="text-xs text-primary hover:underline" onClick={() => setImagemFundo("/assets/images/degrade.png")}>
                    Imagem Original
                  </button>
                </div>
                <Input value={imagemFundo} onChange={(e) => setImagemFundo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Cor de Fundo</Label>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  <button className="text-xs text-primary hover:underline" onClick={() => setCorFundo("")}>
                    Cor Original
                  </button>
                </div>
                <Input placeholder="Código da cor html" value={corFundo} onChange={(e) => setCorFundo(e.target.value)} />
              </div>
              <div className="flex justify-end pt-2"><Button onClick={salvar}>Salvar</Button></div>
            </TabsContent>

            {/* Notificações */}
            <TabsContent value="notificacoes" className="space-y-2 mt-6">
              <div className="grid grid-cols-[1fr_auto] gap-4 pb-3 border-b">
                <p className="text-sm font-semibold">Descrição</p>
                <p className="text-sm font-semibold">Notificação por E-mail</p>
              </div>
              {[
                ["celebracao", "Lembrete de Celebração", "E-mail enviado para lembrar de celebrar com o time"],
                ["okr", "Atualizações de OKR", "E-mail enviado para avisar de atualizações nos OKRs"],
                ["novaCelebracao", "Nova celebração recebida", "E-mail notificando uma nova celebração recebida"],
                ["novoFeedback", "Novo feedback recebido", "E-mail notificando um novo feedback recebido"],
                ["novoObjetivo", "Novo objetivo criado", "E-mail notificando um novo objetivo criado e definido você como dono deste objetivo"],
              ].map(([key, titulo, desc]) => (
                <div key={key} className="grid grid-cols-[1fr_auto] gap-4 py-3 border-b items-center">
                  <div>
                    <p className="font-medium text-foreground">{titulo}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={(notif as any)[key]}
                    onCheckedChange={(v) => setNotif({ ...notif, [key]: v })}
                  />
                </div>
              ))}
              <div className="flex justify-end pt-4"><Button onClick={salvar}>Salvar</Button></div>
            </TabsContent>

            {/* Senha */}
            <TabsContent value="senha" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg font-semibold">Alterar senha</h3>
                <p className="text-sm text-muted-foreground">Para alterar a senha, digite sua senha atual e a nova senha desejada</p>
              </div>
              <div className="space-y-2">
                <Label>Senha atual</Label>
                <Input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nova senha</Label>
                <Input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  A senha deve ter oito ou mais caracteres e pelo menos um número, uma letra minúscula, uma letra maiúscula e um símbolo
                </p>
              </div>
              <div className="flex justify-end pt-2"><Button onClick={salvar}>Salvar</Button></div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
