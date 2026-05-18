# Plano: Segurança + Backend completo para todos os módulos

Trabalho grande, executado em **fases** com aprovação de migração em cada uma. Cada fase entrega valor sozinha — você pode pausar entre fases.

## Modelo de papéis (base de tudo)

3 papéis: `admin`, `gestor`, `colaborador`.

- **admin** — acesso total a todos os módulos e registros
- **gestor** — vê/edita dados do próprio time + os seus
- **colaborador** — vê/edita apenas os próprios dados

Implementação segura: tabela `user_roles` separada + função `has_role()` SECURITY DEFINER (evita recursão em RLS). Helper `is_gestor_de(colaborador_id)` para escopo de time.

---

## Fase 1 — Fundação de segurança

- Criar enum `app_role` e tabela `user_roles`
- Função `has_role(_user_id, _role)` SECURITY DEFINER
- Função `is_gestor_de(_colaborador_id)` usando hierarquia em `colaboradores.gestor_direto`
- Reescrever RLS das 4 tabelas existentes (`colaboradores`, `cargos`, `admissao_links`, `profiles`) por papel
- Ativar HIBP (proteção contra senhas vazadas)
- Restringir execução pública de funções SECURITY DEFINER
- UI: tela mínima para admin atribuir papéis (em `/colaboradores/:id`)

## Fase 2 — Gestão de pessoas (já parcialmente integrada)

Tabelas novas: `desligamentos`, `ferias_solicitacoes`, `recrutamento_vagas`, `recrutamento_candidatos`.
Refatorar: `Desligamentos`, `FeriasSolicitacoes`, `RecrutamentoSelecao`, `Relatorios` (queries reais).

## Fase 3 — Gestão de desempenho

Tabelas: `feedbacks`, `reunioes_1a1`, `reunioes_pautas`, `metas`, `metas_checkins`, `avaliacoes`, `avaliacoes_respostas`, `pdi_objetivos`, `pdi_acoes`, `treinamentos`, `treinamentos_participantes`.
Refatorar: `Feedbacks`, `Reunioes`, `Metas`, `Avaliacoes`, `PDI`, `MeuPDI`, `Treinamentos`.

## Fase 4 — Pesquisas e Insights

Tabelas: `pesquisas` (com `tipo`: satisfacao/rapida/super/engajamento/desligamento), `pesquisas_perguntas`, `pesquisas_respostas`, `planos_acao`, `ouvidoria_mensagens`.
Refatorar: 6 páginas de pesquisa, `PlanosAcao`, `Ouvidoria`.

## Fase 5 — Comunicação e Área do colaborador

Tabelas: `comunicados`, `comunicados_leituras`, `holerites` (+ storage bucket `holerites`), `atualizacoes_cadastro`, `recesso_solicitacoes`.
Refatorar: `Comunicados`, `CriarComunicado`, `Holerites`, `AtualizacaoCadastro`, `MeuRecesso`, `MinhaCarreira`, `MeuPerfil`, `EditarPerfil`, `Organograma`.

---

## Detalhes técnicos

- Cada fase = 1 migração SQL (você aprova) + edição dos arquivos correspondentes
- RLS padrão: `SELECT` por escopo de papel; `INSERT/UPDATE/DELETE` restritos (admin sempre; gestor/colaborador conforme o domínio)
- Dados mockados atuais serão substituídos por hooks React Query (`useQuery`/`useMutation`)
- `storage.buckets` criados quando necessário (ex: holerites, anexos de comunicados) com policies por dono
- Tipos do Supabase regerados automaticamente após cada migração

## Estimativa

~5 migrações grandes, ~25 tabelas novas, ~30 arquivos refatorados. Trabalho de várias rodadas.

## Como começamos

Aprovando este plano, eu inicio pela **Fase 1** (segurança), que é pré-requisito para todas as outras. Ao terminar a Fase 1, sigo direto para a Fase 2 (sem nova aprovação de plano, só aprovação de cada migração SQL).
