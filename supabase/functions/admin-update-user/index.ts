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

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    if (!caller) throw new Error("Not authenticated");

    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin");

    if (!callerRoles || callerRoles.length === 0) {
      throw new Error("Not authorized");
    }

    const { userId, email, name, password, sendResetEmail } = await req.json();
    if (!userId) throw new Error("userId required");

    // Check unique email
    if (email) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const emailTaken = existingUsers?.users?.some(
        (u) => u.email?.toLowerCase() === email.toLowerCase() && u.id !== userId
      );
      if (emailTaken) {
        throw new Error("Este e-mail já está em uso");
      }
    }

    // Update auth user (email/password)
    if (email || password) {
      const updateData: any = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData);
      if (error) throw error;
    }

    // Send password reset email
    if (sendResetEmail) {
      const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (targetUser?.user?.email) {
        const { error } = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: targetUser.user.email,
        });
        if (error) throw error;
      }
    }

    // Update profile (name/email)
    const profileUpdate: any = {};
    if (name !== undefined) profileUpdate.name = name;
    if (email) profileUpdate.email = email;
    if (Object.keys(profileUpdate).length > 0) {
      await supabaseAdmin.from("profiles").update(profileUpdate).eq("id", userId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
