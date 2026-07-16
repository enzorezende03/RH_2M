export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admissao_links: {
        Row: {
          acessado_em: string | null
          admissao_id: string
          cargo: string | null
          concluido_em: string | null
          created_at: string
          criado_por: string | null
          dados: Json
          departamento: string | null
          documentos: Json
          email: string
          id: string
          nome: string
          prazo_entrega: string | null
          status: string
          tipo_vinculo: string | null
          token: string
          updated_at: string
        }
        Insert: {
          acessado_em?: string | null
          admissao_id: string
          cargo?: string | null
          concluido_em?: string | null
          created_at?: string
          criado_por?: string | null
          dados?: Json
          departamento?: string | null
          documentos?: Json
          email: string
          id?: string
          nome: string
          prazo_entrega?: string | null
          status?: string
          tipo_vinculo?: string | null
          token?: string
          updated_at?: string
        }
        Update: {
          acessado_em?: string | null
          admissao_id?: string
          cargo?: string | null
          concluido_em?: string | null
          created_at?: string
          criado_por?: string | null
          dados?: Json
          departamento?: string | null
          documentos?: Json
          email?: string
          id?: string
          nome?: string
          prazo_entrega?: string | null
          status?: string
          tipo_vinculo?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      atualizacoes_cadastro: {
        Row: {
          campos: Json
          colaborador_id: string
          created_at: string
          id: string
          motivo: string | null
          revisado_em: string | null
          revisado_por: string | null
          status: string
          updated_at: string
        }
        Insert: {
          campos?: Json
          colaborador_id: string
          created_at?: string
          id?: string
          motivo?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          campos?: Json
          colaborador_id?: string
          created_at?: string
          id?: string
          motivo?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atualizacoes_cadastro_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atualizacoes_cadastro_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          avaliador_id: string | null
          colaborador_id: string
          created_at: string
          data_avaliacao: string
          etapa_id: string
          id: string
          nota_media: number | null
          pct_desempenho: number | null
          q1_qualidade: number
          q2_interesse: number
          q3_relacionamento: number
          q4_organizacao: number
          q5_trabalho_equipe: number
          situacao: string | null
          status: string
          updated_at: string
        }
        Insert: {
          avaliador_id?: string | null
          colaborador_id: string
          created_at?: string
          data_avaliacao?: string
          etapa_id: string
          id?: string
          nota_media?: number | null
          pct_desempenho?: number | null
          q1_qualidade: number
          q2_interesse: number
          q3_relacionamento: number
          q4_organizacao: number
          q5_trabalho_equipe: number
          situacao?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          avaliador_id?: string | null
          colaborador_id?: string
          created_at?: string
          data_avaliacao?: string
          etapa_id?: string
          id?: string
          nota_media?: number | null
          pct_desempenho?: number | null
          q1_qualidade?: number
          q2_interesse?: number
          q3_relacionamento?: number
          q4_organizacao?: number
          q5_trabalho_equipe?: number
          situacao?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "avaliacoes_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_ciclo"
            referencedColumns: ["id"]
          },
        ]
      }
      cargos: {
        Row: {
          cargo_visivel: string | null
          cbo: string | null
          competencias_comportamentais: string | null
          competencias_organizacionais: string | null
          created_at: string
          departamento: string | null
          experiencia: string | null
          grupo_cargo: string | null
          id: string
          missao: string | null
          modelo_cargo: string | null
          nivel_hierarquico: string | null
          nivel_salarial: string | null
          nome: string
          requisitos_academicos: string | null
          responsabilidades: string | null
          salario: number | null
          sindicato: string | null
          unidade: string | null
          updated_at: string
        }
        Insert: {
          cargo_visivel?: string | null
          cbo?: string | null
          competencias_comportamentais?: string | null
          competencias_organizacionais?: string | null
          created_at?: string
          departamento?: string | null
          experiencia?: string | null
          grupo_cargo?: string | null
          id?: string
          missao?: string | null
          modelo_cargo?: string | null
          nivel_hierarquico?: string | null
          nivel_salarial?: string | null
          nome: string
          requisitos_academicos?: string | null
          responsabilidades?: string | null
          salario?: number | null
          sindicato?: string | null
          unidade?: string | null
          updated_at?: string
        }
        Update: {
          cargo_visivel?: string | null
          cbo?: string | null
          competencias_comportamentais?: string | null
          competencias_organizacionais?: string | null
          created_at?: string
          departamento?: string | null
          experiencia?: string | null
          grupo_cargo?: string | null
          id?: string
          missao?: string | null
          modelo_cargo?: string | null
          nivel_hierarquico?: string | null
          nivel_salarial?: string | null
          nome?: string
          requisitos_academicos?: string | null
          responsabilidades?: string | null
          salario?: number | null
          sindicato?: string | null
          unidade?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ciclos_avaliacao: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          periodo_apuracao_fim: string
          periodo_apuracao_inicio: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          periodo_apuracao_fim: string
          periodo_apuracao_inicio: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          periodo_apuracao_fim?: string
          periodo_apuracao_inicio?: string
        }
        Relationships: []
      }
      colaboradores: {
        Row: {
          cargo: string | null
          cargo_visivel: string | null
          created_at: string
          dados_completos: Json
          departamento: string | null
          email: string | null
          gestor_cargo: string | null
          gestor_direto: string | null
          gestor_id: string | null
          id: string
          lider: string | null
          nome_completo: string
          nome_visivel: string | null
          papel: string | null
          responsavel: string | null
          status: string | null
          tag: string | null
          unidade: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cargo?: string | null
          cargo_visivel?: string | null
          created_at?: string
          dados_completos?: Json
          departamento?: string | null
          email?: string | null
          gestor_cargo?: string | null
          gestor_direto?: string | null
          gestor_id?: string | null
          id?: string
          lider?: string | null
          nome_completo: string
          nome_visivel?: string | null
          papel?: string | null
          responsavel?: string | null
          status?: string | null
          tag?: string | null
          unidade?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cargo?: string | null
          cargo_visivel?: string | null
          created_at?: string
          dados_completos?: Json
          departamento?: string | null
          email?: string | null
          gestor_cargo?: string | null
          gestor_direto?: string | null
          gestor_id?: string | null
          id?: string
          lider?: string | null
          nome_completo?: string
          nome_visivel?: string | null
          papel?: string | null
          responsavel?: string | null
          status?: string | null
          tag?: string | null
          unidade?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      comunicados: {
        Row: {
          anexos: Json
          autor_id: string | null
          conteudo: string
          created_at: string
          destinatarios: Json
          etiquetas: string[] | null
          expira_em: string | null
          id: string
          publicado: boolean
          publicado_em: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          anexos?: Json
          autor_id?: string | null
          conteudo: string
          created_at?: string
          destinatarios?: Json
          etiquetas?: string[] | null
          expira_em?: string | null
          id?: string
          publicado?: boolean
          publicado_em?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          anexos?: Json
          autor_id?: string | null
          conteudo?: string
          created_at?: string
          destinatarios?: Json
          etiquetas?: string[] | null
          expira_em?: string | null
          id?: string
          publicado?: boolean
          publicado_em?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      comunicados_leituras: {
        Row: {
          colaborador_id: string
          comunicado_id: string
          id: string
          lido_em: string
        }
        Insert: {
          colaborador_id: string
          comunicado_id: string
          id?: string
          lido_em?: string
        }
        Update: {
          colaborador_id?: string
          comunicado_id?: string
          id?: string
          lido_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunicados_leituras_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicados_leituras_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "comunicados_leituras_comunicado_id_fkey"
            columns: ["comunicado_id"]
            isOneToOne: false
            referencedRelation: "comunicados"
            referencedColumns: ["id"]
          },
        ]
      }
      desligamentos: {
        Row: {
          colaborador_id: string | null
          created_at: string
          criado_por: string | null
          dados: Json
          data_desligamento: string
          id: string
          motivo: string | null
          status: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          colaborador_id?: string | null
          created_at?: string
          criado_por?: string | null
          dados?: Json
          data_desligamento: string
          id?: string
          motivo?: string | null
          status?: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          colaborador_id?: string | null
          created_at?: string
          criado_por?: string | null
          dados?: Json
          data_desligamento?: string
          id?: string
          motivo?: string | null
          status?: string
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "desligamentos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desligamentos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      etapas_ciclo: {
        Row: {
          ciclo_id: string
          created_at: string
          id: string
          janela_fim: string
          janela_inicio: string
          nome: string
          ordem: number
          tipo: string
        }
        Insert: {
          ciclo_id: string
          created_at?: string
          id?: string
          janela_fim: string
          janela_inicio: string
          nome: string
          ordem: number
          tipo: string
        }
        Update: {
          ciclo_id?: string
          created_at?: string
          id?: string
          janela_fim?: string
          janela_inicio?: string
          nome?: string
          ordem?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "etapas_ciclo_ciclo_id_fkey"
            columns: ["ciclo_id"]
            isOneToOne: false
            referencedRelation: "ciclos_avaliacao"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          autor_id: string | null
          conteudo: string
          created_at: string
          dados: Json
          destinatario_id: string | null
          id: string
          tipo: string
          updated_at: string
          visibilidade: string
        }
        Insert: {
          autor_id?: string | null
          conteudo: string
          created_at?: string
          dados?: Json
          destinatario_id?: string | null
          id?: string
          tipo?: string
          updated_at?: string
          visibilidade?: string
        }
        Update: {
          autor_id?: string | null
          conteudo?: string
          created_at?: string
          dados?: Json
          destinatario_id?: string | null
          id?: string
          tipo?: string
          updated_at?: string
          visibilidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "feedbacks_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedbacks_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      ferias_solicitacoes: {
        Row: {
          colaborador_id: string
          created_at: string
          dados: Json
          dias: number | null
          id: string
          observacoes: string | null
          periodo_fim: string
          periodo_inicio: string
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          dados?: Json
          dias?: number | null
          id?: string
          observacoes?: string | null
          periodo_fim: string
          periodo_inicio: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          dados?: Json
          dias?: number | null
          id?: string
          observacoes?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ferias_solicitacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ferias_solicitacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      holerites: {
        Row: {
          ano: number
          arquivo_path: string | null
          colaborador_id: string
          created_at: string
          dados: Json
          id: string
          mes: number
          tipo: string
          updated_at: string
          valor_liquido: number | null
        }
        Insert: {
          ano: number
          arquivo_path?: string | null
          colaborador_id: string
          created_at?: string
          dados?: Json
          id?: string
          mes: number
          tipo?: string
          updated_at?: string
          valor_liquido?: number | null
        }
        Update: {
          ano?: number
          arquivo_path?: string | null
          colaborador_id?: string
          created_at?: string
          dados?: Json
          id?: string
          mes?: number
          tipo?: string
          updated_at?: string
          valor_liquido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "holerites_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holerites_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      metas: {
        Row: {
          created_at: string
          criado_por: string | null
          dados: Json
          descricao: string | null
          id: string
          periodo_fim: string | null
          periodo_inicio: string | null
          privacidade: string
          progresso: number
          responsavel_id: string | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          dados?: Json
          descricao?: string | null
          id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          privacidade?: string
          progresso?: number
          responsavel_id?: string | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          dados?: Json
          descricao?: string | null
          id?: string
          periodo_fim?: string | null
          periodo_inicio?: string | null
          privacidade?: string
          progresso?: number
          responsavel_id?: string | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "metas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      metas_checkins: {
        Row: {
          autor_id: string | null
          comentario: string | null
          created_at: string
          id: string
          meta_id: string
          valor: number | null
        }
        Insert: {
          autor_id?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          meta_id: string
          valor?: number | null
        }
        Update: {
          autor_id?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          meta_id?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metas_checkins_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_checkins_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "metas_checkins_meta_id_fkey"
            columns: ["meta_id"]
            isOneToOne: false
            referencedRelation: "metas"
            referencedColumns: ["id"]
          },
        ]
      }
      ocorrencias: {
        Row: {
          colaborador_id: string
          created_at: string
          data_ocorrencia: string
          descricao: string | null
          etapa_referencia: string | null
          excluida_em: string | null
          excluida_por: string | null
          id: string
          quesito_codigo: string
          registrado_por: string | null
          tipo: string
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          data_ocorrencia?: string
          descricao?: string | null
          etapa_referencia?: string | null
          excluida_em?: string | null
          excluida_por?: string | null
          id?: string
          quesito_codigo: string
          registrado_por?: string | null
          tipo: string
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          data_ocorrencia?: string
          descricao?: string | null
          etapa_referencia?: string | null
          excluida_em?: string | null
          excluida_por?: string | null
          id?: string
          quesito_codigo?: string
          registrado_por?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocorrencias_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      ouvidoria_mensagens: {
        Row: {
          anonimo: boolean
          assunto: string
          autor_id: string | null
          categoria: string | null
          conteudo: string
          created_at: string
          id: string
          respondido_em: string | null
          respondido_por: string | null
          resposta: string | null
          status: string
          updated_at: string
        }
        Insert: {
          anonimo?: boolean
          assunto: string
          autor_id?: string | null
          categoria?: string | null
          conteudo: string
          created_at?: string
          id?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          anonimo?: boolean
          assunto?: string
          autor_id?: string | null
          categoria?: string | null
          conteudo?: string
          created_at?: string
          id?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ouvidoria_mensagens_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ouvidoria_mensagens_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      pdi: {
        Row: {
          ciclo_id: string
          colaborador_id: string
          created_at: string
          id: string
          pontos_desenvolvimento: string | null
          pontos_fortes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ciclo_id: string
          colaborador_id: string
          created_at?: string
          id?: string
          pontos_desenvolvimento?: string | null
          pontos_fortes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ciclo_id?: string
          colaborador_id?: string
          created_at?: string
          id?: string
          pontos_desenvolvimento?: string | null
          pontos_fortes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdi_ciclo_id_fkey"
            columns: ["ciclo_id"]
            isOneToOne: false
            referencedRelation: "ciclos_avaliacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdi_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdi_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      pdi_acoes: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          pdi_id: string
          prazo_revisao: string | null
          quesito_codigo: string | null
          status: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          pdi_id: string
          prazo_revisao?: string | null
          quesito_codigo?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          pdi_id?: string
          prazo_revisao?: string | null
          quesito_codigo?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdi_acoes_pdi_id_fkey"
            columns: ["pdi_id"]
            isOneToOne: false
            referencedRelation: "pdi"
            referencedColumns: ["id"]
          },
        ]
      }
      pdi_objetivos: {
        Row: {
          colaborador_id: string
          competencia: string | null
          created_at: string
          dados: Json
          descricao: string | null
          id: string
          prazo: string | null
          progresso: number
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          colaborador_id: string
          competencia?: string | null
          created_at?: string
          dados?: Json
          descricao?: string | null
          id?: string
          prazo?: string | null
          progresso?: number
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          colaborador_id?: string
          competencia?: string | null
          created_at?: string
          dados?: Json
          descricao?: string | null
          id?: string
          prazo?: string | null
          progresso?: number
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdi_objetivos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdi_objetivos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      pdi_revisoes: {
        Row: {
          ajustes: string | null
          created_at: string
          data_revisao: string
          etapa_id: string | null
          evolucao: string | null
          id: string
          novo_prazo: string | null
          pdi_id: string
          tipo: string | null
        }
        Insert: {
          ajustes?: string | null
          created_at?: string
          data_revisao?: string
          etapa_id?: string | null
          evolucao?: string | null
          id?: string
          novo_prazo?: string | null
          pdi_id: string
          tipo?: string | null
        }
        Update: {
          ajustes?: string | null
          created_at?: string
          data_revisao?: string
          etapa_id?: string | null
          evolucao?: string | null
          id?: string
          novo_prazo?: string | null
          pdi_id?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pdi_revisoes_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_ciclo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdi_revisoes_pdi_id_fkey"
            columns: ["pdi_id"]
            isOneToOne: false
            referencedRelation: "pdi"
            referencedColumns: ["id"]
          },
        ]
      }
      pesquisas: {
        Row: {
          anonima: boolean
          created_at: string
          criado_por: string | null
          dados: Json
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          anonima?: boolean
          created_at?: string
          criado_por?: string | null
          dados?: Json
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          anonima?: boolean
          created_at?: string
          criado_por?: string | null
          dados?: Json
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      pesquisas_perguntas: {
        Row: {
          created_at: string
          id: string
          obrigatoria: boolean
          opcoes: Json
          ordem: number
          pesquisa_id: string
          texto: string
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          obrigatoria?: boolean
          opcoes?: Json
          ordem?: number
          pesquisa_id: string
          texto: string
          tipo?: string
        }
        Update: {
          created_at?: string
          id?: string
          obrigatoria?: boolean
          opcoes?: Json
          ordem?: number
          pesquisa_id?: string
          texto?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pesquisas_perguntas_pesquisa_id_fkey"
            columns: ["pesquisa_id"]
            isOneToOne: false
            referencedRelation: "pesquisas"
            referencedColumns: ["id"]
          },
        ]
      }
      pesquisas_respostas: {
        Row: {
          created_at: string
          id: string
          pesquisa_id: string
          respondente_id: string | null
          respostas: Json
        }
        Insert: {
          created_at?: string
          id?: string
          pesquisa_id: string
          respondente_id?: string | null
          respostas?: Json
        }
        Update: {
          created_at?: string
          id?: string
          pesquisa_id?: string
          respondente_id?: string | null
          respostas?: Json
        }
        Relationships: [
          {
            foreignKeyName: "pesquisas_respostas_pesquisa_id_fkey"
            columns: ["pesquisa_id"]
            isOneToOne: false
            referencedRelation: "pesquisas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesquisas_respostas_respondente_id_fkey"
            columns: ["respondente_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesquisas_respostas_respondente_id_fkey"
            columns: ["respondente_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      planos_acao: {
        Row: {
          created_at: string
          criado_por: string | null
          dados: Json
          descricao: string | null
          id: string
          pesquisa_id: string | null
          prazo: string | null
          prioridade: string | null
          responsavel_id: string | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          dados?: Json
          descricao?: string | null
          id?: string
          pesquisa_id?: string | null
          prazo?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          dados?: Json
          descricao?: string | null
          id?: string
          pesquisa_id?: string | null
          prazo?: string | null
          prioridade?: string | null
          responsavel_id?: string | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_acao_pesquisa_id_fkey"
            columns: ["pesquisa_id"]
            isOneToOne: false
            referencedRelation: "pesquisas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_acao_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string | null
          primeiro_acesso: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome?: string | null
          primeiro_acesso?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string | null
          primeiro_acesso?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quesitos: {
        Row: {
          codigo: string
          created_at: string
          desc_nota_1: string | null
          desc_nota_2: string | null
          desc_nota_3: string | null
          desc_nota_4: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          codigo: string
          created_at?: string
          desc_nota_1?: string | null
          desc_nota_2?: string | null
          desc_nota_3?: string | null
          desc_nota_4?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem: number
        }
        Update: {
          codigo?: string
          created_at?: string
          desc_nota_1?: string | null
          desc_nota_2?: string | null
          desc_nota_3?: string | null
          desc_nota_4?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      recesso_solicitacoes: {
        Row: {
          colaborador_id: string
          created_at: string
          id: string
          motivo: string | null
          observacoes: string | null
          periodo_fim: string
          periodo_inicio: string
          status: string
          updated_at: string
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          id?: string
          motivo?: string | null
          observacoes?: string | null
          periodo_fim: string
          periodo_inicio: string
          status?: string
          updated_at?: string
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          id?: string
          motivo?: string | null
          observacoes?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recesso_solicitacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recesso_solicitacoes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      recrutamento_candidatos: {
        Row: {
          created_at: string
          dados: Json
          email: string | null
          fase: string
          id: string
          nome: string
          pontuacao: number | null
          telefone: string | null
          updated_at: string
          vaga_id: string | null
        }
        Insert: {
          created_at?: string
          dados?: Json
          email?: string | null
          fase?: string
          id?: string
          nome: string
          pontuacao?: number | null
          telefone?: string | null
          updated_at?: string
          vaga_id?: string | null
        }
        Update: {
          created_at?: string
          dados?: Json
          email?: string | null
          fase?: string
          id?: string
          nome?: string
          pontuacao?: number | null
          telefone?: string | null
          updated_at?: string
          vaga_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recrutamento_candidatos_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "recrutamento_vagas"
            referencedColumns: ["id"]
          },
        ]
      }
      recrutamento_vagas: {
        Row: {
          created_at: string
          criado_por: string | null
          dados: Json
          departamento: string | null
          descricao: string | null
          id: string
          requisitos: string | null
          status: string
          tipo_vinculo: string | null
          titulo: string
          unidade: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          dados?: Json
          departamento?: string | null
          descricao?: string | null
          id?: string
          requisitos?: string | null
          status?: string
          tipo_vinculo?: string | null
          titulo: string
          unidade?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          dados?: Json
          departamento?: string | null
          descricao?: string | null
          id?: string
          requisitos?: string | null
          status?: string
          tipo_vinculo?: string | null
          titulo?: string
          unidade?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reunioes_1a1: {
        Row: {
          colaborador_id: string
          created_at: string
          dados: Json
          data: string
          duracao: number | null
          id: string
          lider_id: string | null
          notas: string | null
          pauta: string | null
          status: string
          titulo: string | null
          updated_at: string
        }
        Insert: {
          colaborador_id: string
          created_at?: string
          dados?: Json
          data: string
          duracao?: number | null
          id?: string
          lider_id?: string | null
          notas?: string | null
          pauta?: string | null
          status?: string
          titulo?: string | null
          updated_at?: string
        }
        Update: {
          colaborador_id?: string
          created_at?: string
          dados?: Json
          data?: string
          duracao?: number | null
          id?: string
          lider_id?: string | null
          notas?: string | null
          pauta?: string | null
          status?: string
          titulo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reunioes_1a1_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reunioes_1a1_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "reunioes_1a1_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reunioes_1a1_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      treinamentos: {
        Row: {
          carga_horaria: number | null
          created_at: string
          criado_por: string | null
          dados: Json
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          instrutor: string | null
          local: string | null
          status: string
          tipo: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          carga_horaria?: number | null
          created_at?: string
          criado_por?: string | null
          dados?: Json
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          instrutor?: string | null
          local?: string | null
          status?: string
          tipo?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          carga_horaria?: number | null
          created_at?: string
          criado_por?: string | null
          dados?: Json
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          instrutor?: string | null
          local?: string | null
          status?: string
          tipo?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      treinamentos_participantes: {
        Row: {
          avaliacao: number | null
          colaborador_id: string
          created_at: string
          feedback: string | null
          id: string
          status: string
          treinamento_id: string
          updated_at: string
        }
        Insert: {
          avaliacao?: number | null
          colaborador_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          status?: string
          treinamento_id: string
          updated_at?: string
        }
        Update: {
          avaliacao?: number | null
          colaborador_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          status?: string
          treinamento_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinamentos_participantes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinamentos_participantes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_consolidado"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "treinamentos_participantes_treinamento_id_fkey"
            columns: ["treinamento_id"]
            isOneToOne: false
            referencedRelation: "treinamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_consolidado: {
        Row: {
          avaliador: string | null
          colaborador_id: string | null
          empresa: string | null
          media_pct: number | null
          nivel: string | null
          nome: string | null
          ocorrencias_negativas: number | null
          ocorrencias_positivas: number | null
          pct_etapa1: number | null
          pct_etapa2: number | null
          pct_etapa3: number | null
          situacao_final: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cargo_salarios: {
        Args: never
        Returns: {
          id: string
          salario: number
        }[]
      }
      eu_sou_colaborador: {
        Args: { _colaborador_id: string }
        Returns: boolean
      }
      excluir_ocorrencia: { Args: { _id: string }; Returns: boolean }
      get_admissao_link_by_token: {
        Args: { _token: string }
        Returns: {
          acessado_em: string
          admissao_id: string
          cargo: string
          concluido_em: string
          created_at: string
          dados: Json
          departamento: string
          documentos: Json
          email: string
          id: string
          nome: string
          prazo_entrega: string
          status: string
          tipo_vinculo: string
          token: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_gestor_de: { Args: { _colaborador_id: string }; Returns: boolean }
      meu_colaborador_id: { Args: never; Returns: string }
      meus_papeis: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      restaurar_ocorrencia: { Args: { _id: string }; Returns: boolean }
      salvar_admissao_publica: {
        Args: {
          _concluir?: boolean
          _dados: Json
          _documentos: Json
          _token: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "gestor" | "colaborador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "gestor", "colaborador"],
    },
  },
} as const
