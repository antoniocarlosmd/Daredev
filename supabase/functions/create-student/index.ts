import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error("Missing env vars:", { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!serviceRoleKey, 
        hasAnonKey: !!anonKey 
      });
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, name, phone, cpf, birth_date, modality, plan_type, frequency, scheduled_days, scheduled_time_slots } = await req.json();

    // Create user with admin API
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, phone, cpf, birth_date, modality, plan_type, frequency },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = newUser?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Failed to create user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert profile data to ensure all fields are saved
    const profileData: Record<string, any> = {
      id: userId,
      name,
      email,
      phone,
      cpf,
      birth_date,
      modality,
      plan_type,
      frequency,
      scheduled_days,
    };
    
    // Remove undefined values
    Object.keys(profileData).forEach(key => {
      if (profileData[key] === undefined) {
        delete profileData[key];
      }
    });

    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(profileData);

    if (profileError) {
      console.error("Error upserting profile:", profileError);
    }

    // Assign student role
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({ user_id: userId, role: "student" });

    if (roleError) {
      console.error("Error inserting role:", roleError);
    }

    // Auto-book classes for each scheduled day+time
    if (scheduled_days && scheduled_time_slots) {
      const today = new Date();

      for (const dayOfWeek of scheduled_days) {
        const timeSlot = scheduled_time_slots[String(dayOfWeek)];
        if (!timeSlot) continue;

        const { data: classData } = await adminClient
          .from("classes")
          .select("id")
          .eq("day_of_week", dayOfWeek)
          .eq("time_slot", timeSlot)
          .single();

        if (classData) {
          const currentDow = today.getDay();
          let daysUntil = dayOfWeek - currentDow;
          if (daysUntil <= 0) daysUntil += 7;
          const nextDate = new Date(today);
          nextDate.setDate(today.getDate() + daysUntil);
          const bookingDate = nextDate.toISOString().split("T")[0];

          await adminClient.from("bookings").insert({
            user_id: userId,
            class_id: classData.id,
            booking_date: bookingDate,
            status: "confirmed",
          });
        }
      }
    }

    return new Response(JSON.stringify({ user: newUser }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
