import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AflowProperty {
  compound: string;
  species: string | null;
  nspecies: number | null;
  // AEL Elastic
  bulkModulus: number | null;
  shearModulus: number | null;
  youngsModulus: number | null;
  poissonRatio: number | null;
  debyeTemperature: number | null;
  pughsRatio: number | null;
  elasticAnisotropy: number | null;
  speedSoundAvg: number | null;
  speedSoundLong: number | null;
  speedSoundTrans: number | null;
  // AGL Thermal
  thermalConductivity: number | null;
  thermalExpansion: number | null;
  aglDebye: number | null;
  gruneisen: number | null;
  heatCapacityCp: number | null;
  heatCapacityCv: number | null;
  // Electronic
  bandGap: number | null;
  bandGapType: string | null;
  // Energetics
  energyPerAtom: number | null;
  enthalpy: number | null;
  formationEnthalpy: number | null;
  // Structural
  density: number | null;
  volumePerAtom: number | null;
  spaceGroup: string | null;
  latticeSystem: string | null;
  pearsonSymbol: string | null;
}

export interface OrchestratorResult {
  properties: AflowProperty[];
  source: string;
  fromCache: boolean;
}

export function useDataOrchestrator(elementNumber: number, elementSymbol: string) {
  const [data, setData] = useState<OrchestratorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryAflow = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Check local cache first
      const { data: cached } = await supabase
        .from("element_properties_cache")
        .select("data, fetched_at")
        .eq("element_number", elementNumber)
        .eq("source", "aflow")
        .eq("property_type", "mechanical")
        .maybeSingle();

      if (cached?.data) {
        const fetchedAt = new Date(cached.fetched_at);
        const hoursSince = (Date.now() - fetchedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 24) {
          setData({
            properties: cached.data as unknown as AflowProperty[],
            source: "AFLOW (cached)",
            fromCache: true,
          });
          setLoading(false);
          return;
        }
      }

      // 2. Fetch from AFLOW via edge function
      const { data: result, error: fnError } = await supabase.functions.invoke("aflow-proxy", {
        body: { elementSymbol, elementNumber },
      });

      if (fnError) throw new Error(fnError.message);

      setData({
        properties: result.properties || [],
        source: result.source || "AFLOW",
        fromCache: false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch AFLOW data");
    } finally {
      setLoading(false);
    }
  }, [elementNumber, elementSymbol]);

  // Auto-fetch on mount
  useEffect(() => {
    queryAflow();
  }, [queryAflow]);

  return { data, loading, error, queryAflow };
}
