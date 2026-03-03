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
    const { elementA, elementB, symbolA, symbolB } = await req.json();

    if (!elementA || !elementB || !symbolA || !symbolB) {
      return new Response(
        JSON.stringify({ error: "elementA, elementB, symbolA, symbolB are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const mpApiKey = Deno.env.get("MP_API_KEY");
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    // Step 1: Fetch Materials Project data for the binary system
    let mpData: any = null;
    if (mpApiKey) {
      try {
        // Search for compounds containing both elements
        const chemsys = [symbolA, symbolB].sort().join("-");
        const url = `https://api.materialsproject.org/materials/summary/?chemsys=${chemsys}&_fields=material_id,formula_pretty,formation_energy_per_atom,energy_above_hull,band_gap,is_metal,density,symmetry,k_vrh,g_vrh&_limit=20`;

        const mpResponse = await fetch(url, {
          headers: { "X-API-KEY": mpApiKey },
        });

        if (mpResponse.ok) {
          const raw = await mpResponse.json();
          mpData = raw.data || [];
        } else {
          console.error("MP API error:", mpResponse.status, await mpResponse.text());
        }
      } catch (e) {
        console.error("MP fetch error:", e);
      }
    }

    // Step 2: AI-powered phase analysis using Lovable AI
    let aiAnalysis: string | null = null;
    if (lovableApiKey) {
      try {
        const mpSummary = mpData && mpData.length > 0
          ? `Materials Project data for ${symbolA}-${symbolB} system:\n${JSON.stringify(
              mpData.slice(0, 10).map((d: any) => ({
                formula: d.formula_pretty,
                formation_energy: d.formation_energy_per_atom,
                energy_above_hull: d.energy_above_hull,
                band_gap: d.band_gap,
                is_metal: d.is_metal,
                density: d.density,
                symmetry: d.symmetry?.symbol,
              })),
              null,
              2,
            )}`
          : `No Materials Project data available for this system.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are a materials science expert. Provide a concise phase analysis for binary alloy systems. Include:
1. Key phases and crystal structures present
2. Important phase transformations and their temperatures
3. Engineering applications and significance
4. Any notable thermodynamic properties

Keep the response under 200 words. Use scientific terminology. Format with markdown.`,
              },
              {
                role: "user",
                content: `Analyze the ${symbolA}–${symbolB} binary phase system.\n\n${mpSummary}`,
              },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiAnalysis = aiData.choices?.[0]?.message?.content || null;
        } else {
          const status = aiResponse.status;
          const text = await aiResponse.text();
          console.error("AI gateway error:", status, text);
          if (status === 429) {
            aiAnalysis = "_Rate limit exceeded. Please try again shortly._";
          } else if (status === 402) {
            aiAnalysis = "_AI credits exhausted. Analysis unavailable._";
          }
        }
      } catch (e) {
        console.error("AI analysis error:", e);
      }
    }

    // Format MP compounds for the frontend
    const compounds = mpData
      ? mpData.map((d: any) => ({
          formula: d.formula_pretty,
          materialId: d.material_id,
          formationEnergy: d.formation_energy_per_atom,
          energyAboveHull: d.energy_above_hull,
          bandGap: d.band_gap,
          isMetal: d.is_metal,
          density: d.density,
          spaceGroup: d.symmetry?.symbol,
          bulkModulus: d.k_vrh,
          shearModulus: d.g_vrh,
        }))
      : [];

    return new Response(
      JSON.stringify({
        system: `${symbolA}–${symbolB}`,
        compounds,
        aiAnalysis,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("binary-simulation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
