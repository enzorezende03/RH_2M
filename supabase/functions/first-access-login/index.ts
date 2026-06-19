import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, redirectTo } = await req.json();
    const emailLower = String(email ?? "").trim().toLowerCase();

    if (!emailLower || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      return json({ error: "Email inválido" }, 400);
    }
    if (!emailLower.endsWith("@2mgrupo.com.br") && !emailLower.endsWith("@2msaude.com")) {
      return json({ error: "Use seu email institucional" }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE);

    // Confirma que existe profile com primeiro_acesso = true
    const { data: profile } = await admin
      .from("profiles")
      .select("user_id, primeiro_acesso")
      .eq("email", emailLower)
      .maybeSingle();

    if (!profile || !profile.primeiro_acesso) {
      // Resposta genérica para não revelar existência da conta
      return json({ ok: true });
    }

    const safeRedirect = typeof redirectTo === "string" && redirectTo.startsWith("http")
      ? redirectTo
      : undefined;

    const { error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: emailLower,
      options: safeRedirect ? { redirectTo: safeRedirect } : undefined,
    });

    if (error) return json({ error: error.message }, 400);

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message ?? "Erro" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
