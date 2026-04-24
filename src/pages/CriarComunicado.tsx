import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CriarComunicado() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { comunicado?: any; mode?: "edit" | "duplicate" } | null) || null;
  const editing = state?.mode === "edit";
  const initial = state?.comunicado;

  const [assunto, setAssunto] = useState(initial?.assunto ?? "");
  const [enviarEmail, setEnviarEmail] = useState(initial?.emailNotif ?? false);
  const [apenasLiderados, setApenasLiderados] = useState(false);
  const [publicacao, setPublicacao] = useState("imediatamente");
  const [destaque, setDestaque] = useState(initial?.destaque ?? false);
  const [comentarios, setComentarios] = useState(false);
  const [conteudo, setConteudo] = useState(initial?.conteudo ?? "");

  return (
    <div className="flex-1 overflow-auto bg-muted/30">
      <div className="bg-background rounded-lg m-6 p-8 space-y-8 border">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/comunicados")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Criar Comunicado</h1>
        </div>

        {/* Informações básicas */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary border-b pb-2">Informações básicas</h2>

          <div className="space-y-2">
            <Label>
              Assunto <span className="text-muted-foreground">(Opcional)</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Identifique seu comunicado. Este assunto será usado também no e-mail de notificação.
            </p>
            <Input
              placeholder="Escreva aqui o título do seu comunicado"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value.slice(0, 915))}
              maxLength={915}
            />
            <div className="text-right text-xs text-muted-foreground">{assunto.length}/915</div>
          </div>

          <div className="flex items-start gap-3">
            <Switch checked={enviarEmail} onCheckedChange={setEnviarEmail} />
            <div>
              <Label>Enviar e-mail de notificação</Label>
              <p className="text-xs text-muted-foreground">
                Caso não tenha adicionado nenhum assunto, atribuiremos um assunto padrão.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Etiquetas <span className="text-muted-foreground">(Opcional)</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Adicione etiquetas para organizar seus comunicados.
            </p>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione as etiquetas para ajudar a identificar o comunicado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">#manual</SelectItem>
                <SelectItem value="uniforme">#uniforme</SelectItem>
                <SelectItem value="calendario">#calendario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Conteúdo <span className="text-red-500">*</span>
            </Label>
            <div className="border rounded-md">
              <div className="flex gap-3 px-3 py-2 border-b bg-muted/50 text-xs">
                <button className="hover:text-primary">Formato</button>
                <button className="hover:text-primary">Tabela</button>
                <button className="hover:text-primary">Inserir</button>
                <button className="hover:text-primary">Editar</button>
                <button className="hover:text-primary">Mídia</button>
              </div>
              <Textarea
                placeholder="Escreva aqui o conteúdo para o comunicado"
                className="border-0 min-h-[200px] focus-visible:ring-0 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Postagem */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary border-b pb-2">Postagem</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 space-y-3">
              <div>
                <Label>
                  Publicação <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Escolha em qual momento o comunicado será enviado.
                </p>
              </div>
              <RadioGroup value={publicacao} onValueChange={setPublicacao} className="flex gap-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="imediatamente" id="imediatamente" />
                  <Label htmlFor="imediatamente" className="font-normal">Imediatamente</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="agendada" id="agendada" />
                  <Label htmlFor="agendada" className="font-normal">Agendada</Label>
                </div>
              </RadioGroup>
              {publicacao === "agendada" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Data <span className="text-red-500">*</span></Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Hora <span className="text-red-500">*</span></Label>
                    <Input type="time" />
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div>
                <Label>Expiração</Label>
                <p className="text-xs text-muted-foreground">
                  Momento em que o comunicado sai do feed inicial, podendo ser acessado através da lista de comunicados.
                </p>
              </div>
              <Input type="date" placeholder="dd/mm/aaaa" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="destaque" checked={destaque} onCheckedChange={(v) => setDestaque(!!v)} />
              <Label htmlFor="destaque" className="font-normal text-sm">
                Publicar como comunicado em destaque
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="comentarios" checked={comentarios} onCheckedChange={(v) => setComentarios(!!v)} />
              <Label htmlFor="comentarios" className="font-normal text-sm">
                Exibir barra de comentários (disponível apenas para a exibição desktop)
              </Label>
            </div>
          </div>
        </section>

        {/* Destinatários */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary border-b pb-2">Destinatários</h2>

          <div className="flex items-center gap-3">
            <Switch checked={apenasLiderados} onCheckedChange={setApenasLiderados} />
            <Label className="font-normal text-sm">Apenas para liderados diretos</Label>
          </div>

          <div className="space-y-2">
            <Label>
              Departamentos <span className="text-red-500">*</span>
            </Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione os departamentos que devem receber o comunicado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rh">RH</SelectItem>
                <SelectItem value="ti">TI</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Papel <span className="text-muted-foreground">(Opcional)</span>
            </Label>
            <div className="border rounded-md p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="todos-col" />
                <Label htmlFor="todos-col" className="font-normal text-sm">Todos colaboradores</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="todos-gest" />
                <Label htmlFor="todos-gest" className="font-normal text-sm">Todos gestores</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="todos-adm" />
                <Label htmlFor="todos-adm" className="font-normal text-sm">Todos administradores</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Unidades <span className="text-muted-foreground">(Opcional)</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Informe quais unidades terão acesso a esse comunicado.
            </p>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione as unidades que devem receber o comunicado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matriz">Matriz</SelectItem>
                <SelectItem value="filial">Filial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Grupos <span className="text-muted-foreground">(Opcional)</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Informe quais grupos terão acesso a esse comunicado.
            </p>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Selecione os grupos que devem receber o comunicado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g1">Grupo 1</SelectItem>
                <SelectItem value="g2">Grupo 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
      </div>

      {/* Footer ações */}
      <div className="sticky bottom-0 bg-background border-t px-8 py-4 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/comunicados")}>
          Cancelar
        </Button>
        <div className="flex gap-3">
          <Button variant="outline">Salvar como rascunho</Button>
          <Button>Revisar para publicar</Button>
        </div>
      </div>
    </div>
  );
}
