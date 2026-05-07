import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const adminEmail = "automacoes@unosolucoes.com.br";
    const adminPassword = "S@mIA2026";

    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const adminExists = existingUsers?.users?.find((u) => u.email === adminEmail);

    if (adminExists) {
      // Ensure admin role exists
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: adminExists.id, role: "admin" },
        { onConflict: "user_id,role" }
      );
      // Ensure profile exists
      await supabaseAdmin.from("profiles").upsert(
        { id: adminExists.id, email: adminEmail },
        { onConflict: "id" }
      );
      return new Response(JSON.stringify({ message: "Admin already exists, role ensured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (createError) throw createError;

    // The trigger will create profile and 'user' role. Now add 'admin' role.
    await supabaseAdmin.from("user_roles").insert({
      user_id: newUser.user.id,
      role: "admin",
    });

    return new Response(JSON.stringify({ message: "Admin user created successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
