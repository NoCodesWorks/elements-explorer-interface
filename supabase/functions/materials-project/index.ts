import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("MP_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "MP_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { material_ids, fields } = await req.json();

    if (!material_ids || !Array.isArray(material_ids) || material_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "material_ids array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit to 10 IDs per request for safety
    const ids = material_ids.slice(0, 10);

    const defaultFields = [
      "material_id",
      "formula_pretty",
      "structure",
      "symmetry",
      "band_gap",
      "is_metal",
      "is_magnetic",
      "ordering",
      "energy_per_atom",
      "formation_energy_per_atom",
      "energy_above_hull",
      "k_vrh",
      "g_vrh",
      "density",
      "theoretical",
    ];

    const requestedFields = fields && Array.isArray(fields) ? fields : defaultFields;

    const url = "https://api.materialsproject.org/materials/summary/";
    const body = {
      material_ids: ids,
      fields: requestedFields,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: `Materials Project API error: ${response.status}`, details: errText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
