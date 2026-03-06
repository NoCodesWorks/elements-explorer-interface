import type { BinaryPhaseDiagramData, PhaseZone } from "@/data/binaryPhaseDiagrams";

export interface ConsistencyViolation {
  type: "boundary_crossing" | "phase_rule" | "non_physical";
  description: string;
  severity: "warning" | "error";
}

/**
 * Check if two line segments intersect (non-trivially)
 */
function segmentsIntersect(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number
): boolean {
  const d = (ax2 - ax1) * (by2 - by1) - (ay2 - ay1) * (bx2 - bx1);
  if (Math.abs(d) < 1e-10) return false;
  const t = ((bx1 - ax1) * (by2 - by1) - (by1 - ay1) * (bx2 - bx1)) / d;
  const u = ((bx1 - ax1) * (ay2 - ay1) - (by1 - ay1) * (ax2 - ax1)) / d;
  return t > 0.01 && t < 0.99 && u > 0.01 && u < 0.99;
}

/**
 * Validate a binary phase diagram for physical consistency using Gibbs phase rule.
 * For binary system (C=2) at fixed pressure: F = C - P + 1 = 3 - P
 * - Single phase regions (P=1): F=2 (area)
 * - Two-phase equilibria (P=2): F=1 (line/curve)  
 * - Three-phase equilibria (P=3): F=0 (invariant point/isotherm)
 * - P>3 is NOT allowed
 */
export function validatePhaseDiagram(data: BinaryPhaseDiagramData): ConsistencyViolation[] {
  const violations: ConsistencyViolation[] = [];

  // 1. Check for non-physical boundary crossings
  for (let i = 0; i < data.boundaries.length; i++) {
    for (let j = i + 1; j < data.boundaries.length; j++) {
      const bi = data.boundaries[i];
      const bj = data.boundaries[j];
      // Skip if one is an isotherm (dashed lines are expected to cross boundaries)
      if (bi.dashed || bj.dashed) continue;

      for (let pi = 0; pi < bi.points.length - 1; pi++) {
        for (let pj = 0; pj < bj.points.length - 1; pj++) {
          if (segmentsIntersect(
            bi.points[pi].x, bi.points[pi].T, bi.points[pi + 1].x, bi.points[pi + 1].T,
            bj.points[pj].x, bj.points[pj].T, bj.points[pj + 1].x, bj.points[pj + 1].T
          )) {
            violations.push({
              type: "boundary_crossing",
              description: `"${bi.label}" crosses "${bj.label}" — may indicate data inconsistency`,
              severity: "warning",
            });
          }
        }
      }
    }
  }

  // 2. Check for overlapping phase zones (>3 phases at a point)
  // Sample grid points
  const samplePoints = 20;
  const allT = data.zones.flatMap(z => z.polygon.map(([, T]) => T));
  const minT = Math.min(...allT);
  const maxT = Math.max(...allT);

  for (let xi = 0; xi <= samplePoints; xi++) {
    for (let ti = 0; ti <= samplePoints; ti++) {
      const x = xi / samplePoints;
      const T = minT + (ti / samplePoints) * (maxT - minT);
      const containingZones = data.zones.filter(z => pointInPolygonCheck(x, T, z.polygon));
      if (containingZones.length > 3) {
        violations.push({
          type: "phase_rule",
          description: `${containingZones.length} phases coexist at x=${(x * 100).toFixed(0)}%, T=${Math.round(T)} K — violates Gibbs phase rule (max 3 for binary)`,
          severity: "error",
        });
        // Only report once
        return violations;
      }
    }
  }

  return violations;
}

function pointInPolygonCheck(x: number, y: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}
