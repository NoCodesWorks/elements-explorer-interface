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
    const { symbolA, symbolB, propertiesA, propertiesB } = await req.json();

    if (!symbolA || !symbolB) {
      return new Response(
        JSON.stringify({ error: "symbolA and symbolB are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a materials science expert specializing in phase diagrams and thermodynamics. Given two elements and their properties, predict the binary phase diagram characteristics using your knowledge of metallurgy, Hume-Rothery rules, and thermodynamic principles.

Analyze factors like:
- Electronegativity difference (>0.4 suggests compound formation)
- Atomic radius ratio (within 15% favors solid solution)
- Crystal structure compatibility
- Valence electron similarity

Return predictions using the provided tool.`;

    const userPrompt = `Predict the binary phase diagram for ${symbolA}–${symbolB}.

Element A (${symbolA}):
- Electronegativity: ${propertiesA?.electronegativity ?? "unknown"}
- Atomic radius: ${propertiesA?.atomicRadius ?? "unknown"} pm
- Melting point: ${propertiesA?.meltingPoint ?? "unknown"} K
- Density: ${propertiesA?.density ?? "unknown"} g/cm³
- Crystal structure category: ${propertiesA?.category ?? "unknown"}

Element B (${symbolB}):
- Electronegativity: ${propertiesB?.electronegativity ?? "unknown"}
- Atomic radius: ${propertiesB?.atomicRadius ?? "unknown"} pm
- Melting point: ${propertiesB?.meltingPoint ?? "unknown"} K
- Density: ${propertiesB?.density ?? "unknown"} g/cm³
- Crystal structure category: ${propertiesB?.category ?? "unknown"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "predict_phase_diagram",
              description: "Return predicted binary phase diagram data including phase types, invariant reactions, and boundary points.",
              parameters: {
                type: "object",
                properties: {
                  diagramType: {
                    type: "string",
                    enum: ["eutectic", "peritectic", "isomorphous", "monotectic", "complex"],
                    description: "Primary type of phase diagram"
                  },
                  phases: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Phase name e.g. 'α (FCC)'" },
                        phaseType: { type: "string", enum: ["terminal_ss", "intermetallic", "liquid"] },
                        compositionMin: { type: "number", description: "Min composition (0-1)" },
                        compositionMax: { type: "number", description: "Max composition (0-1)" },
                        tempMin: { type: "number", description: "Min temperature K" },
                        tempMax: { type: "number", description: "Max temperature K" },
                      },
                      required: ["name", "phaseType", "compositionMin", "compositionMax", "tempMin", "tempMax"],
                      additionalProperties: false,
                    },
                  },
                  invariantReactions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["eutectic", "peritectic", "eutectoid", "peritectoid", "congruent"] },
                        temperature: { type: "number", description: "Temperature in K" },
                        composition: { type: "number", description: "Composition (0-1)" },
                        description: { type: "string", description: "Reaction equation e.g. 'L → α + β'" },
                      },
                      required: ["type", "temperature", "composition", "description"],
                      additionalProperties: false,
                    },
                  },
                  liquidusPoints: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        x: { type: "number" },
                        T: { type: "number" },
                      },
                      required: ["x", "T"],
                      additionalProperties: false,
                    },
                    description: "Key points on the liquidus curve"
                  },
                  solidusPoints: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        x: { type: "number" },
                        T: { type: "number" },
                      },
                      required: ["x", "T"],
                      additionalProperties: false,
                    },
                    description: "Key points on the solidus curve"
                  },
                  confidence: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                    description: "Confidence in prediction"
                  },
                  reasoning: {
                    type: "string",
                    description: "Brief explanation of prediction basis"
                  },
                },
                required: ["diagramType", "phases", "invariantReactions", "liquidusPoints", "solidusPoints", "confidence", "reasoning"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "predict_phase_diagram" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call response from AI");
    }

    const prediction = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        prediction,
        system: `${symbolA}–${symbolB}`,
        dataSource: "ml_predicted",
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ml-phase-predict error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
