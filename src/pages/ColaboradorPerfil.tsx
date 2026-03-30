import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const colaboradorData = {
  id: 1,
  nome: "Ana Costa",
  cargo: "Analista de RH",
  setor: "Recursos Humanos",
  email: "ana.costa@grupo2m.com.br",
  telefone: "(11) 98765-4321",
  cidade: "São Paulo, SP",
  admissao: "15/03/2022",
  nascimento: "22/08/1995",
  status: "Ativo",
  initials: "AC",
  lider: "Fernanda Rocha",
  feedbacks: [
    { data: "25/03/2026", tipo: "Reconhecimento", de: "Carlos Silva", resumo: "Excelente condução do onboarding dos novos colaboradores." },
    { data: "10/02/2026", tipo: "Desenvolvimento", de: "Fernanda Rocha", resumo: "Buscar mais autonomia na tomada de decisões." },
  ],
  metas: [
    { nome: "Reduzir tempo de admissão", progresso: 80, prazo: "30/06/2026" },
    { nome: "Implementar pesquisa de clima Q2", progresso: 45, prazo: "15/05/2026" },
  ],
  timeline: [
    { data: "25/03/2026", evento: "Feedback recebido de Carlos Silva" },
    { data: "20/03/2026", evento: "Reunião 1:1 com Fernanda Rocha" },
    { data: "15/03/2026", evento: "Aniversário de empresa — 4 anos" },
    { data: "10/02/2026", evento: "Feedback recebido de Fernanda Rocha" },
    { data: "01/02/2026", evento: "Meta atualizada: Pesquisa de clima Q2" },
    { data: "15/01/2026", evento: "Treinamento concluído: Liderança Situacional" },
  ],
};

export default function ColaboradorPerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const c = colaboradorData;

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => navigate("/colaboradores")}>
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      {/* Header */}
      <div className="rounded-xl bg-card p-6 card-shadow">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              {c.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{c.nome}</h1>
                <p className="text-muted-foreground">{c.cargo} · {c.setor}</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {c.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{c.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{c.telefone}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{c.cidade}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Admissão: {c.admissao}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />Líder: {c.lider}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="bg-card">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
          <TabsTrigger value="metas">Metas</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          <TabsTrigger value="pdi">PDI</TabsTrigger>
          <TabsTrigger value="treinamentos">Treinamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <div className="rounded-xl bg-card p-5 card-shadow">
            <h2 className="text-sm font-semibold text-foreground mb-4">Histórico completo</h2>
            <div className="relative space-y-0">
              {c.timeline.map((item, i) => (
                <div key={i} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary shrink-0 mt-1" />
                    {i < c.timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{item.evento}</p>
                    <p className="text-xs text-muted-foreground">{item.data}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dados">
          <div className="rounded-xl bg-card p-5 card-shadow">
            <h2 className="text-sm font-semibold text-foreground mb-4">Dados pessoais e contratuais</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["Nome completo", c.nome],
                ["E-mail", c.email],
                ["Telefone", c.telefone],
                ["Data de nascimento", c.nascimento],
                ["Cidade", c.cidade],
                ["Cargo", c.cargo],
                ["Setor", c.setor],
                ["Data de admissão", c.admissao],
                ["Líder direto", c.lider],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="feedbacks">
          <div className="rounded-xl bg-card p-5 card-shadow space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Feedbacks recebidos</h2>
            {c.feedbacks.map((fb, i) => (
              <div key={i} className="rounded-lg bg-muted/50 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{fb.tipo}</Badge>
                  <span className="text-xs text-muted-foreground">{fb.data}</span>
                </div>
                <p className="text-sm text-foreground">{fb.resumo}</p>
                <p className="text-xs text-muted-foreground">De: {fb.de}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metas">
          <div className="rounded-xl bg-card p-5 card-shadow space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Metas ativas</h2>
            {c.metas.map((meta, i) => (
              <div key={i} className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{meta.nome}</p>
                  <span className="text-xs font-semibold text-primary">{meta.progresso}%</span>
                </div>
                <Progress value={meta.progresso} className="h-2" />
                <p className="text-xs text-muted-foreground">Prazo: {meta.prazo}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="avaliacoes">
          <div className="rounded-xl bg-card p-5 card-shadow">
            <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada ainda.</p>
          </div>
        </TabsContent>

        <TabsContent value="pdi">
          <div className="rounded-xl bg-card p-5 card-shadow">
            <p className="text-sm text-muted-foreground">Nenhum PDI registrado ainda.</p>
          </div>
        </TabsContent>

        <TabsContent value="treinamentos">
          <div className="rounded-xl bg-card p-5 card-shadow">
            <p className="text-sm text-muted-foreground">Nenhum treinamento registrado ainda.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
