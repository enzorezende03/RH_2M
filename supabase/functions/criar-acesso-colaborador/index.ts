import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOMINIO_POR_UNIDADE: Record<string, string> = {
  "2M Contabilidade": "@2mgrupo.com.br",
  "2M Saúde": "@2msaude.com",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: rolesData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id);
    const isAdmin = (rolesData ?? []).some((r: any) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Apenas administradores" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const nome = String(body?.nome ?? "").trim();
    const colaboradorId = body?.colaboradorId ? String(body.colaboradorId) : null;

    if (!email || !DOMINIOS_PERMITIDOS.some((d) => email.endsWith(d))) {
      return new Response(
        JSON.stringify({ error: "Email deve ser @2mgrupo.com.br ou @2msaude.com" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verifica se já existe usuário com esse email
    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const jaExiste = existing?.users?.find((u: any) => (u.email ?? "").toLowerCase() === email);

    let userId: string | null = jaExiste?.id ?? null;

    if (!jaExiste) {
      // Cria usuário com senha aleatória; email já confirmado.
      // Login será via "Primeiro acesso" (magic link) para definir senha.
      const senhaTemporaria = crypto.randomUUID() + "Aa1!";
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: senhaTemporaria,
        email_confirm: true,
        user_metadata: { nome },
      });
      if (createErr || !created.user) {
        return new Response(
          JSON.stringify({ error: createErr?.message ?? "Falha ao criar acesso" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      userId = created.user.id;

      // Garante primeiro_acesso = true para forçar definição de senha
      await admin.from("profiles").update({ primeiro_acesso: true }).eq("user_id", userId);
    }

    // Vincula o user_id ao registro do colaborador, se informado
    if (colaboradorId && userId) {
      await admin.from("colaboradores").update({ user_id: userId }).eq("id", colaboradorId);
    }

    return new Response(JSON.stringify({ ok: true, userId, jaExistia: !!jaExiste }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Erro" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
