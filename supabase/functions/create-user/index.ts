
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

    // Check if user already exists in auth.users by listing users with matching email
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email.eq.${email}`
    });
    
    let existingUserId = null;
    
    // Only consider it an existing user if we get valid data back with users
    if (existingAuthUsers && existingAuthUsers.users && existingAuthUsers.users.length > 0) {
      existingUserId = existingAuthUsers.users[0].id;
      
      // Check if a profile exists for this user
      const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", existingUserId)
        .maybeSingle();
      
      if (profileCheckError) {
        console.error("Error checking existing profile:", profileCheckError);
      }
      
      if (existingProfile) {
        return new Response(
          JSON.stringify({ 
            error: "User with this email already exists",
            user: {
              id: existingUserId,
              email,
              first_name,
              last_name,
              role,
              provider_id: provider_id || null,
              company_id: company_id || null,
            }
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      // If user exists in auth but not in profiles, create the profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: existingUserId,
          email,
          first_name,
          last_name,
          role,
          provider_id: provider_id || null,
          company_id: company_id || null,
        });
      
      if (profileError) {
        console.error("Error creating profile:", profileError);
        return new Response(
          JSON.stringify({ error: profileError.message }),
          { 
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User profile created successfully for existing auth user",
          user: {
            id: existingUserId,
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
    }

    // If no existing user found, double-check in profiles
    const { data: existingProfileCheck } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
      
    if (existingProfileCheck) {
      return new Response(
        JSON.stringify({ 
          error: "User with this email already exists in profiles but not in auth",
          user: existingProfileCheck
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
