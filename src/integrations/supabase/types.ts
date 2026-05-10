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
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
