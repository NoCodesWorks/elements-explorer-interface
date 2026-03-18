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

    // AFLUX API: property keywords are comma-separated at top level
    // Use ael_bulk_modulus_vrh,Egap,density etc. as separate matchbook keywords
    const propertyFields = [
      "ael_bulk_modulus_vrh",
      "ael_shear_modulus_vrh",
      "ael_youngs_modulus_vrh",
      "ael_poisson_ratio",
      "ael_debye_temperature",
      "ael_pughs_modulus_ratio",
      "ael_elastic_anisotropy",
      "ael_speed_sound_average",
      "agl_thermal_conductivity_300K",
      "agl_thermal_expansion_300K",
      "agl_debye",
      "agl_gruneisen",
      "agl_heat_capacity_Cp_300K",
      "agl_heat_capacity_Cv_300K",
      "Egap",
      "Egap_type",
      "enthalpy_atom",
      "enthalpy_formation_atom",
      "density",
      "volume_atom",
      "lattice_system_relax",
    ];

    // Query 1: entries with elastic data
    const elasticUrl = `https://aflowlib.org/API/aflux/?species(${elementSymbol}),nspecies(1),ael_bulk_modulus_vrh(*),${propertyFields.join(",")},paging(1),format(json)`;
    // Query 2: all entries (fallback for non-elastic data)
    const generalUrl = `https://aflowlib.org/API/aflux/?species(${elementSymbol}),nspecies(1),${propertyFields.join(",")},paging(1),format(json)`;

    console.log("AFLOW elastic URL:", elasticUrl);

    // Fetch both in parallel
    const [elasticRes, generalRes] = await Promise.all([
      fetch(elasticUrl, { headers: { Accept: "application/json" } }),
      fetch(generalUrl, { headers: { Accept: "application/json" } }),
    ]);

    const parseAflowResponse = async (res: Response): Promise<any[]> => {
      if (!res.ok) return [];
      const text = await res.text();
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
        // AFLUX returns object with "N of M" keys
        if (typeof parsed === "object" && parsed !== null) {
          return Object.values(parsed);
        }
        return [];
      } catch {
        return [];
      }
    };

    const [elasticData, generalData] = await Promise.all([
      parseAflowResponse(elasticRes),
      parseAflowResponse(generalRes),
    ]);

    console.log("Elastic entries:", elasticData.length, "General entries:", generalData.length);

    // Merge: elastic entries first, then general entries not already included
    const seenAuids = new Set<string>();
    const allEntries: any[] = [];
    for (const entry of [...elasticData, ...generalData]) {
      const auid = entry.auid || entry.compound;
      if (!seenAuids.has(auid)) {
        seenAuids.add(auid);
        allEntries.push(entry);
      }
    }

    const parseNum = (v: any) => (v != null && v !== "" && v !== "unavailable" && !isNaN(Number(v))) ? parseFloat(v) : null;
    const parseStr = (v: any) => (v != null && v !== "" && v !== "unavailable") ? String(v) : null;

    const processed = allEntries
      .map((entry: any) => ({
        compound: entry.compound || elementSymbol,
        species: parseStr(Array.isArray(entry.species) ? entry.species.join(",") : entry.species),
        nspecies: parseNum(entry.nspecies),
        bulkModulus: parseNum(entry.ael_bulk_modulus_vrh),
        shearModulus: parseNum(entry.ael_shear_modulus_vrh),
        youngsModulus: parseNum(entry.ael_youngs_modulus_vrh),
        poissonRatio: parseNum(entry.ael_poisson_ratio),
        debyeTemperature: parseNum(entry.ael_debye_temperature),
        pughsRatio: parseNum(entry.ael_pughs_modulus_ratio),
        elasticAnisotropy: parseNum(entry.ael_elastic_anisotropy),
        speedSoundAvg: parseNum(entry.ael_speed_sound_average),
        speedSoundLong: null,
        speedSoundTrans: null,
        thermalConductivity: parseNum(entry.agl_thermal_conductivity_300K),
        thermalExpansion: parseNum(entry.agl_thermal_expansion_300K),
        aglDebye: parseNum(entry.agl_debye),
        gruneisen: parseNum(entry.agl_gruneisen),
        heatCapacityCp: parseNum(entry.agl_heat_capacity_Cp_300K),
        heatCapacityCv: parseNum(entry.agl_heat_capacity_Cv_300K),
        bandGap: parseNum(entry.Egap),
        bandGapType: parseStr(entry.Egap_type),
        energyPerAtom: null,
        enthalpy: parseNum(entry.enthalpy_atom),
        formationEnthalpy: parseNum(entry.enthalpy_formation_atom),
        density: parseNum(entry.density),
        volumePerAtom: parseNum(entry.volume_atom),
        spaceGroup: parseStr(entry.spacegroup_relax),
        latticeSystem: parseStr(entry.lattice_system_relax),
        pearsonSymbol: parseStr(entry.Pearson_symbol_relax),
      }))
      .sort((a: any, b: any) => {
        const scoreA = [a.bulkModulus, a.shearModulus, a.youngsModulus, a.thermalConductivity, a.bandGap, a.density].filter(v => v != null).length;
        const scoreB = [b.bulkModulus, b.shearModulus, b.youngsModulus, b.thermalConductivity, b.bandGap, b.density].filter(v => v != null).length;
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
