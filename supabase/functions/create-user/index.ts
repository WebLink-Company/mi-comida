
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the request body
    const body = await req.json();
    
    const {
      email,
      first_name,
      last_name,
      role,
      provider_id,
      company_id,
      password
    } = body;

    console.log("Create user request received:", JSON.stringify({
      email,
      first_name,
      last_name,
      role,
      provider_id,
      company_id,
      password: "***REDACTED***"
    }));

    // Validate required fields
    if (!email || !first_name || !last_name || !role || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if user exists in auth.users by email
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error("Error listing auth users:", authUsersError);
      return new Response(
        JSON.stringify({ error: authUsersError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Find if user email already exists
    const existingAuthUser = authUsers.users.find(user => 
      user.email?.toLowerCase() === email.toLowerCase()
    );

    // Next, check if email exists in profiles table
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .ilike("email", email)
      .maybeSingle();
      
    if (profileCheckError) {
      console.error("Error checking existing profile:", profileCheckError);
    }
    
    // If user exists in either auth or profiles, return error
    if (existingAuthUser || existingProfile) {
      console.log("User already exists - Auth:", !!existingAuthUser, "Profile:", !!existingProfile);
      return new Response(
        JSON.stringify({ 
          error: "User with this email already exists",
          existingAuthUser: existingAuthUser ? true : false,
          existingProfile: existingProfile ? true : false
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create user in auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        role,
      },
    });

    if (userError) {
      console.error("Error creating auth user:", userError);
      return new Response(
        JSON.stringify({ error: userError.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Insert profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userData.user.id,
        email,
        first_name,
        last_name,
        role,
        provider_id: provider_id || null,
        company_id: company_id || null,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Try to delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User created successfully",
        user: {
          id: userData.user.id,
          email,
          first_name,
          last_name,
          role,
          provider_id: provider_id || null,
          company_id: company_id || null,
        } 
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
