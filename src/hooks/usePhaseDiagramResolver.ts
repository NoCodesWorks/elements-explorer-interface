import { useState, useCallback } from "react";
import { getBinaryDiagram, type BinaryPhaseDiagramData, type DataSource } from "@/data/binaryPhaseDiagrams";
import { interpolatePhaseDiagram } from "@/lib/boundaryInterpolation";
import { supabase } from "@/integrations/supabase/client";
import type { Element } from "@/data/elements";

export type TierStatus = "pending" | "checking" | "found" | "not_found" | "error";

export interface ResolverState {
  tier1: TierStatus;
  tier2: TierStatus;
  tier3: TierStatus;
  currentTier: 1 | 2 | 3 | null;
  diagram: BinaryPhaseDiagramData | null;
  dataSource: DataSource | null;
  error: string | null;
  resolving: boolean;
  confidence: string | null;
  reasoning: string | null;
}

const initialState: ResolverState = {
  tier1: "pending",
  tier2: "pending",
  tier3: "pending",
  currentTier: null,
  diagram: null,
  dataSource: null,
  error: null,
  resolving: false,
  confidence: null,
  reasoning: null,
};

export function usePhaseDiagramResolver() {
  const [state, setState] = useState<ResolverState>(initialState);

  const resolve = useCallback(async (elementA: Element, elementB: Element) => {
    setState({ ...initialState, resolving: true, tier1: "checking", currentTier: 1 });

    // --- Tier 1: CALPHAD local data ---
    const calphad = getBinaryDiagram(elementA.number, elementB.number);
    if (calphad) {
      setState(s => ({
        ...s,
        tier1: "found",
        diagram: { ...calphad, dataSource: "calphad" },
        dataSource: "calphad",
        resolving: false,
      }));
      return;
    }
    setState(s => ({ ...s, tier1: "not_found", tier2: "checking", currentTier: 2 }));

    // --- Tier 2: Materials Project via binary-simulation ---
    try {
      const { data: mpData, error: mpError } = await supabase.functions.invoke("binary-simulation", {
        body: {
          elementA: elementA.number,
          elementB: elementB.number,
          symbolA: elementA.symbol,
          symbolB: elementB.symbol,
        },
      });

      if (!mpError && mpData?.compounds?.length > 0) {
        // Build approximate diagram from MP formation energies
        const stableCompounds = mpData.compounds.filter(
          (c: any) => c.energyAboveHull !== null && c.energyAboveHull <= 0.05
        );

        if (stableCompounds.length > 0) {
          const mpA = elementA.meltingPoint ?? 1000;
          const mpB = elementB.meltingPoint ?? 1000;

          // Estimate liquidus from compound stability
          const liquidusPoints = [
            { x: 0, T: mpA, type: "liquidus" as const },
            ...stableCompounds.slice(0, 5).map((c: any, i: number) => ({
              x: (i + 1) / (stableCompounds.length + 1),
              T: Math.min(mpA, mpB) * (0.7 + Math.abs(c.formationEnergy || 0) * 0.5),
              type: "liquidus" as const,
            })),
            { x: 1, T: mpB, type: "liquidus" as const },
          ];

          const predictedPhases = stableCompounds.slice(0, 3).map((c: any, i: number) => ({
            name: c.formula || `Phase ${i + 1}`,
            type: "intermetallic" as const,
            compositionRange: [
              Math.max(0, (i + 0.5) / (stableCompounds.length + 1)),
              Math.min(1, (i + 1.5) / (stableCompounds.length + 1)),
            ] as [number, number],
            temperatureRange: [300, Math.min(mpA, mpB) * 0.9] as [number, number],
          }));

          const diagram = interpolatePhaseDiagram({
            elementA: elementA.symbol,
            elementB: elementB.symbol,
            elementANumber: elementA.number,
            elementBNumber: elementB.number,
            meltingPointA: mpA,
            meltingPointB: mpB,
            sparsePoints: liquidusPoints,
            predictedPhases,
            invariants: [],
            dataSource: "materials_project",
          });

          setState(s => ({
            ...s,
            tier2: "found",
            diagram,
            dataSource: "materials_project",
            resolving: false,
          }));
          return;
        }
      }
    } catch (e) {
      console.error("Tier 2 error:", e);
    }

    setState(s => ({ ...s, tier2: "not_found", tier3: "checking", currentTier: 3 }));

    // --- Tier 3: ML Prediction ---
    try {
      const { data: mlData, error: mlError } = await supabase.functions.invoke("ml-phase-predict", {
        body: {
          symbolA: elementA.symbol,
          symbolB: elementB.symbol,
          propertiesA: {
            electronegativity: elementA.electronegativity,
            atomicRadius: elementA.atomicRadius,
            meltingPoint: elementA.meltingPoint,
            density: elementA.density,
            category: elementA.category,
          },
          propertiesB: {
            electronegativity: elementB.electronegativity,
            atomicRadius: elementB.atomicRadius,
            meltingPoint: elementB.meltingPoint,
            density: elementB.density,
            category: elementB.category,
          },
        },
      });

      if (mlError) throw new Error(mlError.message);

      const pred = mlData.prediction;
      if (!pred) throw new Error("No prediction returned");

      const mpA = elementA.meltingPoint ?? 1000;
      const mpB = elementB.meltingPoint ?? 1000;

      const sparsePoints = [
        ...(pred.liquidusPoints || []).map((p: any) => ({ ...p, type: "liquidus" as const })),
        ...(pred.solidusPoints || []).map((p: any) => ({ ...p, type: "solidus" as const })),
      ];

      const predictedPhases = (pred.phases || []).map((p: any) => ({
        name: p.name,
        type: p.phaseType as "terminal_ss" | "intermetallic" | "liquid",
        compositionRange: [p.compositionMin, p.compositionMax] as [number, number],
        temperatureRange: [p.tempMin, p.tempMax] as [number, number],
      }));

      const invariants = (pred.invariantReactions || []).map((inv: any) => ({
        type: inv.type,
        T: inv.temperature,
        x: inv.composition,
        description: inv.description,
      }));

      const diagram = interpolatePhaseDiagram({
        elementA: elementA.symbol,
        elementB: elementB.symbol,
        elementANumber: elementA.number,
        elementBNumber: elementB.number,
        meltingPointA: mpA,
        meltingPointB: mpB,
        sparsePoints,
        predictedPhases,
        invariants,
        dataSource: "ml_predicted",
      });

      setState(s => ({
        ...s,
        tier3: "found",
        diagram,
        dataSource: "ml_predicted",
        confidence: pred.confidence || null,
        reasoning: pred.reasoning || null,
        resolving: false,
      }));
    } catch (e: any) {
      console.error("Tier 3 error:", e);
      setState(s => ({
        ...s,
        tier3: "error",
        error: `All data tiers exhausted: ${e.message}`,
        resolving: false,
      }));
    }
  }, []);

  const reset = useCallback(() => setState(initialState), []);

  return { state, resolve, reset };
}
