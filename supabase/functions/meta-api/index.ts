import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // Use service role to access full settings (including API keys)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user's Meta API credentials securely
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("settings")
      .select("meta_api_key, phone_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (settingsError) {
      console.error("Settings error:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to get settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings?.meta_api_key || !settings?.phone_id) {
      return new Response(
        JSON.stringify({ error: "Meta API not configured", configured: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { action, to, message, template_name, template_params } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Action is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const META_API_URL = `https://graph.facebook.com/v18.0/${settings.phone_id}`;

    let metaResponse;

    switch (action) {
      case "send_text": {
        if (!to || !message) {
          return new Response(
            JSON.stringify({ error: "to and message are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        metaResponse = await fetch(`${META_API_URL}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${settings.meta_api_key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to.replace(/\D/g, ""), // Remove non-digits
            type: "text",
            text: { body: message },
          }),
        });
        break;
      }

      case "send_template": {
        if (!to || !template_name) {
          return new Response(
            JSON.stringify({ error: "to and template_name are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        metaResponse = await fetch(`${META_API_URL}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${settings.meta_api_key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to.replace(/\D/g, ""),
            type: "template",
            template: {
              name: template_name,
              language: { code: "pt_BR" },
              components: template_params || [],
            },
          }),
        });
        break;
      }

      case "check_status": {
        // Just verify the API key works
        metaResponse = await fetch(`${META_API_URL}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${settings.meta_api_key}`,
          },
        });
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const metaData = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error("Meta API error:", metaData);
      return new Response(
        JSON.stringify({ error: "Meta API error", details: metaData }),
        { status: metaResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: metaData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
