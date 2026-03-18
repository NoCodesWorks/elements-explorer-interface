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

    // Query AFLOW AFLUX API with expanded property list
    const selectFields = [
      "compound",
      "ael_bulk_modulus_vrh",
      "ael_shear_modulus_vrh",
      "ael_youngs_modulus_vrh",
      "ael_poisson_ratio",
      "ael_debye_temperature",
      "ael_pughs_modulus_ratio",
      "ael_elastic_anisotropy",
      "ael_speed_sound_average",
      "ael_speed_sound_longitudinal",
      "ael_speed_sound_transverse",
      "agl_thermal_conductivity_300K",
      "agl_thermal_expansion_300K",
      "agl_debye",
      "agl_gruneisen",
      "agl_heat_capacity_Cp_300K",
      "agl_heat_capacity_Cv_300K",
      "Egap",
      "Egap_type",
      "energy_atom",
      "enthalpy_atom",
      "enthalpy_formation_atom",
      "density",
      "volume_atom",
      "spacegroup_relax",
      "lattice_system_relax",
      "Pearson_symbol_relax",
      "nspecies",
      "species",
    ].join(",");

    // Use AFLUX API (matchbook syntax) - species() uses comma-separated symbols
    const aflowUrl = `https://aflowlib.org/API/aflux/?species(${elementSymbol}),nspecies(1),paging(1),$select(${selectFields}),format(json)`;
    console.log("AFLOW URL:", aflowUrl);

    const aflowRes = await fetch(aflowUrl, {
      headers: { Accept: "application/json" },
    });

    let aflowData: any[] = [];
    if (aflowRes.ok) {
      const text = await aflowRes.text();
      console.log("AFLOW response length:", text.length, "preview:", text.substring(0, 200));
      try {
        aflowData = JSON.parse(text);
        if (!Array.isArray(aflowData)) aflowData = [];
      } catch {
        aflowData = [];
      }
    } else {
      console.log("AFLOW response status:", aflowRes.status);
    }

    const parseNum = (v: any) => (v != null && v !== "" && v !== "unavailable") ? parseFloat(v) : null;
    const parseStr = (v: any) => (v != null && v !== "" && v !== "unavailable") ? String(v) : null;

    // Process entries - prioritize those with elastic data
    const processed = aflowData
      .map((entry: any) => ({
        compound: entry.compound || elementSymbol,
        species: parseStr(entry.species),
        nspecies: parseNum(entry.nspecies),
        // AEL Elastic
        bulkModulus: parseNum(entry.ael_bulk_modulus_vrh),
        shearModulus: parseNum(entry.ael_shear_modulus_vrh),
        youngsModulus: parseNum(entry.ael_youngs_modulus_vrh),
        poissonRatio: parseNum(entry.ael_poisson_ratio),
        debyeTemperature: parseNum(entry.ael_debye_temperature),
        pughsRatio: parseNum(entry.ael_pughs_modulus_ratio),
        elasticAnisotropy: parseNum(entry.ael_elastic_anisotropy),
        speedSoundAvg: parseNum(entry.ael_speed_sound_average),
        speedSoundLong: parseNum(entry.ael_speed_sound_longitudinal),
        speedSoundTrans: parseNum(entry.ael_speed_sound_transverse),
        // AGL Thermal
        thermalConductivity: parseNum(entry.agl_thermal_conductivity_300K),
        thermalExpansion: parseNum(entry.agl_thermal_expansion_300K),
        aglDebye: parseNum(entry.agl_debye),
        gruneisen: parseNum(entry.agl_gruneisen),
        heatCapacityCp: parseNum(entry.agl_heat_capacity_Cp_300K),
        heatCapacityCv: parseNum(entry.agl_heat_capacity_Cv_300K),
        // Electronic
        bandGap: parseNum(entry.Egap),
        bandGapType: parseStr(entry.Egap_type),
        // Energetics
        energyPerAtom: parseNum(entry.energy_atom),
        enthalpy: parseNum(entry.enthalpy_atom),
        formationEnthalpy: parseNum(entry.enthalpy_formation_atom),
        // Structural
        density: parseNum(entry.density),
        volumePerAtom: parseNum(entry.volume_atom),
        spaceGroup: parseStr(entry.spacegroup_relax),
        latticeSystem: parseStr(entry.lattice_system_relax),
        pearsonSymbol: parseStr(entry.Pearson_symbol_relax),
      }))
      .sort((a: any, b: any) => {
        // Prioritize entries with more data
        const scoreA = [a.bulkModulus, a.shearModulus, a.youngsModulus, a.thermalConductivity, a.bandGap].filter(Boolean).length;
        const scoreB = [b.bulkModulus, b.shearModulus, b.youngsModulus, b.thermalConductivity, b.bandGap].filter(Boolean).length;
        return scoreB - scoreA;
      })
      .slice(0, 8);

    // Cache in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    if (processed.length > 0) {
      await supabase.from("element_properties_cache").upsert(
        {
          element_number: elementNumber,
          source: "aflow",
          property_type: "mechanical",
          data: processed,
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "element_number,source,property_type" }
      );
    }

    return new Response(
      JSON.stringify({
        element: elementSymbol,
        elementNumber,
        properties: processed,
        source: "AFLOW REST API",
        count: processed.length,
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
