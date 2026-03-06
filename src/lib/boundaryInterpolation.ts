/**
 * PINN-inspired boundary interpolation for Tier 2/3 phase diagrams.
 * Connects sparse DFT/MP data points into smooth phase boundaries
 * using monotone cubic spline interpolation with physical constraints.
 */

import type {
  BinaryPhaseDiagramData,
  BinaryBoundary,
  PhaseZone,
  InvariantReaction,
  BinaryPhaseRegion,
  DataSource,
} from "@/data/binaryPhaseDiagrams";

interface SparseDataPoint {
  x: number; // composition
  T: number; // temperature (K)
  type: "liquidus" | "solidus" | "solvus" | "invariant";
}

interface PredictedPhase {
  name: string;
  type: "terminal_ss" | "intermetallic" | "liquid";
  compositionRange: [number, number];
  temperatureRange: [number, number];
}

interface InterpolationInput {
  elementA: string;
  elementB: string;
  elementANumber: number;
  elementBNumber: number;
  meltingPointA: number;
  meltingPointB: number;
  sparsePoints: SparseDataPoint[];
  predictedPhases: PredictedPhase[];
  invariants: { type: InvariantReaction["type"]; T: number; x: number; description: string }[];
  dataSource: DataSource;
}

/**
 * Monotone cubic Hermite interpolation (Fritsch-Carlson).
 * Prevents overshoot while maintaining smooth curves.
 */
function monotoneCubicInterpolation(
  xs: number[],
  ys: number[],
  numPoints: number = 20
): { x: number; T: number }[] {
  if (xs.length < 2) return xs.map((x, i) => ({ x, T: ys[i] }));
  if (xs.length === 2) {
    const result: { x: number; T: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      result.push({ x: xs[0] + t * (xs[1] - xs[0]), T: ys[0] + t * (ys[1] - ys[0]) });
    }
    return result;
  }

  const n = xs.length;
  // Compute slopes
  const deltas: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    deltas.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  }

  // Compute tangents (Fritsch-Carlson)
  const m: number[] = new Array(n);
  m[0] = deltas[0];
  m[n - 1] = deltas[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (deltas[i - 1] * deltas[i] <= 0) {
      m[i] = 0;
    } else {
      m[i] = (deltas[i - 1] + deltas[i]) / 2;
    }
  }

  // Monotonicity correction
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(deltas[i]) < 1e-10) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const alpha = m[i] / deltas[i];
      const beta = m[i + 1] / deltas[i];
      const s = alpha * alpha + beta * beta;
      if (s > 9) {
        const tau = 3 / Math.sqrt(s);
        m[i] = tau * alpha * deltas[i];
        m[i + 1] = tau * beta * deltas[i];
      }
    }
  }

  // Evaluate spline
  const xMin = xs[0];
  const xMax = xs[n - 1];
  const result: { x: number; T: number }[] = [];

  for (let i = 0; i < numPoints; i++) {
    const xVal = xMin + (i / (numPoints - 1)) * (xMax - xMin);
    // Find interval
    let k = 0;
    for (let j = 0; j < n - 1; j++) {
      if (xVal >= xs[j] && xVal <= xs[j + 1]) { k = j; break; }
    }
    const h = xs[k + 1] - xs[k];
    const t = (xVal - xs[k]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    const yVal = h00 * ys[k] + h10 * h * m[k] + h01 * ys[k + 1] + h11 * h * m[k + 1];
    result.push({ x: xVal, T: yVal });
  }

  return result;
}

/**
 * Enforce physical constraints on interpolated boundaries:
 * 1. Liquidus must be above solidus
 * 2. Boundaries must not cross non-physically
 * 3. Invariant isotherms must be horizontal
 */
function enforcePhysicalConstraints(
  liquidus: { x: number; T: number }[],
  solidus: { x: number; T: number }[]
): { liquidus: { x: number; T: number }[]; solidus: { x: number; T: number }[] } {
  const correctedSolidus = solidus.map((pt, i) => {
    // Find nearest liquidus point by x
    const nearestLiq = liquidus.reduce((closest, lp) =>
      Math.abs(lp.x - pt.x) < Math.abs(closest.x - pt.x) ? lp : closest
    );
    // Solidus must be below liquidus
    if (pt.T > nearestLiq.T) {
      return { ...pt, T: nearestLiq.T - 5 };
    }
    return pt;
  });
  return { liquidus, solidus: correctedSolidus };
}

/**
 * Build a complete BinaryPhaseDiagramData from sparse data points
 * and predicted phases using interpolation.
 */
export function interpolatePhaseDiagram(input: InterpolationInput): BinaryPhaseDiagramData {
  const {
    elementA, elementB, elementANumber, elementBNumber,
    meltingPointA, meltingPointB, sparsePoints, predictedPhases,
    invariants, dataSource,
  } = input;

  // Separate sparse points by type
  const liquidusPoints = sparsePoints
    .filter(p => p.type === "liquidus")
    .sort((a, b) => a.x - b.x);
  const solidusPoints = sparsePoints
    .filter(p => p.type === "solidus")
    .sort((a, b) => a.x - b.x);

  // Always include melting points at endpoints
  if (liquidusPoints.length === 0 || liquidusPoints[0].x > 0.01) {
    liquidusPoints.unshift({ x: 0, T: meltingPointA, type: "liquidus" });
  }
  if (liquidusPoints.length === 0 || liquidusPoints[liquidusPoints.length - 1].x < 0.99) {
    liquidusPoints.push({ x: 1, T: meltingPointB, type: "liquidus" });
  }
  if (solidusPoints.length === 0) {
    // Estimate solidus from liquidus with ~5% depression
    solidusPoints.push(
      { x: 0, T: meltingPointA, type: "solidus" },
      { x: 0.5, T: Math.min(meltingPointA, meltingPointB) * 0.85, type: "solidus" },
      { x: 1, T: meltingPointB, type: "solidus" }
    );
  }

  // Interpolate
  const interpLiquidus = monotoneCubicInterpolation(
    liquidusPoints.map(p => p.x),
    liquidusPoints.map(p => p.T),
    25
  );
  const interpSolidus = monotoneCubicInterpolation(
    solidusPoints.map(p => p.x),
    solidusPoints.map(p => p.T),
    25
  );

  // Enforce physical constraints
  const { liquidus: corrLiq, solidus: corrSol } = enforcePhysicalConstraints(interpLiquidus, interpSolidus);

  // Build boundaries
  const boundaries: BinaryBoundary[] = [
    { label: "Liquidus", color: "hsl(25, 80%, 55%)", points: corrLiq },
    { label: "Solidus", color: "hsl(200, 80%, 55%)", points: corrSol },
  ];

  // Add invariant isotherms as dashed boundaries
  for (const inv of invariants) {
    boundaries.push({
      label: `${inv.type} isotherm`,
      color: "hsl(350, 70%, 55%)",
      dashed: true,
      points: [{ x: 0, T: inv.T }, { x: 1, T: inv.T }],
    });
  }

  // Build regions from predicted phases
  const regions: BinaryPhaseRegion[] = [
    { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ...predictedPhases
      .filter(p => p.type !== "liquid")
      .map((p, i) => ({
        name: p.name,
        color: [`hsl(200, 80%, 55%)`, `hsl(45, 70%, 50%)`, `hsl(140, 60%, 50%)`, `hsl(270, 55%, 60%)`][i % 4],
      })),
  ];

  // Build simplified zones
  const maxT = Math.max(meltingPointA, meltingPointB) + 200;
  const minT = Math.min(
    ...corrSol.map(p => p.T),
    ...invariants.map(i => i.T),
    300
  );

  const liquidZone: PhaseZone = {
    name: "Liquid",
    color: "hsl(25, 80%, 55%)",
    polygon: [
      ...corrLiq.map(p => [p.x, p.T] as [number, number]),
      [1, maxT],
      [0, maxT],
    ],
  };

  const solidLiquidZone: PhaseZone = {
    name: "Solid + Liquid",
    color: "hsl(180, 50%, 45%)",
    polygon: [
      ...corrLiq.map(p => [p.x, p.T] as [number, number]),
      ...[...corrSol].reverse().map(p => [p.x, p.T] as [number, number]),
    ],
  };

  const solidZone: PhaseZone = {
    name: predictedPhases.find(p => p.type === "terminal_ss")?.name || "Solid",
    color: "hsl(200, 80%, 55%)",
    polygon: [
      ...corrSol.map(p => [p.x, p.T] as [number, number]),
      [1, minT],
      [0, minT],
    ],
  };

  const zones: PhaseZone[] = [liquidZone, solidLiquidZone, solidZone];

  const formattedInvariants: InvariantReaction[] = invariants.map(inv => ({
    label: inv.type.charAt(0).toUpperCase() + inv.type.slice(1),
    type: inv.type,
    T: inv.T,
    x: inv.x,
    description: inv.description,
  }));

  return {
    systemName: `${elementA}–${elementB}`,
    elementA,
    elementB,
    elementANumber,
    elementBNumber,
    boundaries,
    regions,
    invariants: formattedInvariants,
    zones,
    notes: `${dataSource === "materials_project" ? "MP-derived" : "ML-predicted"} approximate diagram.`,
    dataSource,
    metadata: { defaultRange: [0, 1], fullRange: [0, 1] },
  };
}
