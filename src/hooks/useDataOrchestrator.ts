import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AflowProperty {
  compound: string;
  bulkModulus: number | null;
  shearModulus: number | null;
  enthalpy: number | null;
  bandGap: number | null;
  density: number | null;
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
        // Use cache if less than 24 hours old
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

  return { data, loading, error, queryAflow };
}
