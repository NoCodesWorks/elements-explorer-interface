import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { elementSymbol, elementNumber } = await req.json();
    if (!elementSymbol || !elementNumber) {
      return new Response(JSON.stringify({ error: "elementSymbol and elementNumber required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Query AFLOW API for the element
    const aflowUrl = `https://aflowlib.org/API/apropos/?species=${elementSymbol}&format=json&paging(1)&$select(compound,Bvoigt,Gvoigt,enthalpy_atom,Egap,density)`;

    const aflowRes = await fetch(aflowUrl, {
      headers: { Accept: "application/json" },
    });

    let aflowData: any[] = [];
    if (aflowRes.ok) {
      const text = await aflowRes.text();
      try {
        aflowData = JSON.parse(text);
        if (!Array.isArray(aflowData)) aflowData = [];
      } catch {
        aflowData = [];
      }
    }

    // Extract best mechanical/thermal properties
    const mechanicalProps = aflowData
      .filter((entry: any) => entry.Bvoigt || entry.Gvoigt)
      .slice(0, 5)
      .map((entry: any) => ({
        compound: entry.compound || elementSymbol,
        bulkModulus: entry.Bvoigt ? parseFloat(entry.Bvoigt) : null,
        shearModulus: entry.Gvoigt ? parseFloat(entry.Gvoigt) : null,
        enthalpy: entry.enthalpy_atom ? parseFloat(entry.enthalpy_atom) : null,
        bandGap: entry.Egap ? parseFloat(entry.Egap) : null,
        density: entry.density ? parseFloat(entry.density) : null,
      }));

    // Cache in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    if (mechanicalProps.length > 0) {
      await supabase.from("element_properties_cache").upsert(
        {
          element_number: elementNumber,
          source: "aflow",
          property_type: "mechanical",
          data: mechanicalProps,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "element_number,source,property_type" }
      );
    }

    return new Response(
      JSON.stringify({
        element: elementSymbol,
        elementNumber,
        properties: mechanicalProps,
        source: "AFLOW REST API",
        count: mechanicalProps.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
