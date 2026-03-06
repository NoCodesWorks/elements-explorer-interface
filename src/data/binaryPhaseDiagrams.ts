// Pre-computed CALPHAD binary phase diagram data at 1 atm
// Sources: ASM Alloy Phase Diagrams, CALPHAD assessments

export interface BinaryPhaseRegion {
  name: string;
  color: string;
}

export interface BinaryBoundaryPoint {
  x: number; // composition (atomic fraction of element B, 0–1)
  T: number; // temperature in K
}

export interface BinaryBoundary {
  label: string;
  points: BinaryBoundaryPoint[];
  color: string;
  dashed?: boolean;
}

export interface InvariantReaction {
  label: string;
  type: "eutectic" | "peritectic" | "eutectoid" | "peritectoid" | "congruent";
  T: number;
  x: number;
  description: string;
}

export interface PhaseZone {
  name: string;
  color: string;
  // Polygon vertices as [x, T] pairs defining the zone boundary
  polygon: [number, number][];
}

export interface BinaryPhaseDiagramData {
  systemName: string;
  elementA: string;
  elementB: string;
  elementANumber: number;
  elementBNumber: number;
  boundaries: BinaryBoundary[];
  regions: BinaryPhaseRegion[];
  invariants: InvariantReaction[];
  zones: PhaseZone[];
  notes: string;
  maxComposition?: number; // Max x-axis value (defaults to 1.0)
}

function makeKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function getBinaryDiagram(a: number, b: number): BinaryPhaseDiagramData | null {
  const key = makeKey(a, b);
  const diagram = binaryDiagrams[key] ?? null;
  if (!diagram) return null;
  // If the user selected in reversed order, flip the diagram
  if (a > b && diagram.elementANumber !== a) return diagram;
  if (a < b && diagram.elementANumber !== a) {
    // Flip composition axis
    return {
      ...diagram,
      elementA: diagram.elementB,
      elementB: diagram.elementA,
      elementANumber: diagram.elementBNumber,
      elementBNumber: diagram.elementANumber,
      boundaries: diagram.boundaries.map((bd) => ({
        ...bd,
        points: bd.points.map((p) => ({ ...p, x: 1 - p.x })),
      })),
      invariants: diagram.invariants.map((inv) => ({ ...inv, x: 1 - inv.x })),
      zones: diagram.zones.map((z) => ({
        ...z,
        polygon: z.polygon.map(([x, T]) => [1 - x, T] as [number, number]),
      })),
    };
  }
  return diagram;
}

export function getAvailableSystems(): string[] {
  return Object.keys(binaryDiagrams);
}

// Curated CALPHAD phase diagrams
const binaryDiagrams: Record<string, BinaryPhaseDiagramData> = {
  // Fe-C (Iron-Carbon)
  "6-26": {
    systemName: "Fe–C",
    elementA: "Fe",
    elementB: "C",
    elementANumber: 26,
    elementBNumber: 6,
    maxComposition: 0.25, // Cementite region — full view; zoom to 0.0667 for steel region
    notes: "Metastable Fe–Fe₃C system at 1 atm. Classic steel phase diagram.",
    regions: [
      { name: "α-Fe (Ferrite)", color: "hsl(200, 80%, 55%)" },
      { name: "γ-Fe (Austenite)", color: "hsl(45, 70%, 50%)" },
      { name: "δ-Fe", color: "hsl(270, 55%, 60%)" },
      { name: "Fe₃C (Cementite)", color: "hsl(350, 70%, 55%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 1811 }, { x: 0.01, T: 1800 }, { x: 0.02, T: 1780 },
          { x: 0.04, T: 1750 }, { x: 0.08, T: 1700 }, { x: 0.10, T: 1650 },
          { x: 0.15, T: 1550 }, { x: 0.17, T: 1420 },
        ],
      },
      {
        label: "Liquidus (C-rich)",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0.17, T: 1420 }, { x: 0.20, T: 1500 }, { x: 0.25, T: 1700 },
        ],
      },
      {
        label: "Solidus (δ)",
        color: "hsl(270, 55%, 60%)",
        points: [
          { x: 0, T: 1811 }, { x: 0.003, T: 1800 }, { x: 0.005, T: 1768 },
        ],
      },
      {
        label: "γ upper (Austenite)",
        color: "hsl(45, 70%, 50%)",
        points: [
          { x: 0, T: 1668 }, { x: 0.005, T: 1700 }, { x: 0.01, T: 1750 },
          { x: 0.02, T: 1768 },
        ],
      },
      {
        label: "γ solvus",
        color: "hsl(45, 70%, 50%)",
        points: [
          { x: 0, T: 1185 }, { x: 0.01, T: 1200 }, { x: 0.02, T: 1250 },
          { x: 0.04, T: 1350 }, { x: 0.08, T: 1420 },
        ],
      },
      {
        label: "α solvus",
        color: "hsl(200, 80%, 55%)",
        points: [
          { x: 0, T: 1185 }, { x: 0.001, T: 1100 }, { x: 0.002, T: 1000 },
          { x: 0.003, T: 900 }, { x: 0.004, T: 800 }, { x: 0.005, T: 727 },
        ],
      },
      {
        label: "Eutectoid isotherm",
        color: "hsl(350, 70%, 55%)",
        dashed: true,
        points: [
          { x: 0.005, T: 727 }, { x: 0.034, T: 727 }, { x: 0.25, T: 727 },
        ],
      },
      {
        label: "Eutectic isotherm",
        color: "hsl(350, 70%, 55%)",
        dashed: true,
        points: [
          { x: 0.08, T: 1420 }, { x: 0.17, T: 1420 }, { x: 0.25, T: 1420 },
        ],
      },
    ],
    invariants: [
      { label: "Eutectic", type: "eutectic", T: 1420, x: 0.17, description: "L → γ + Fe₃C" },
      { label: "Eutectoid", type: "eutectoid", T: 727, x: 0.034, description: "γ → α + Fe₃C (Pearlite)" },
      { label: "Peritectic", type: "peritectic", T: 1768, x: 0.02, description: "L + δ → γ" },
    ],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 1811], [0.01, 1800], [0.02, 1780], [0.04, 1750], [0.08, 1700], [0.10, 1650], [0.15, 1550], [0.17, 1420], [0.20, 1500], [0.25, 1700], [0.25, 2100], [0, 2100]] },
      { name: "δ-Fe", color: "hsl(270, 55%, 60%)", polygon: [[0, 1811], [0.003, 1800], [0.005, 1768], [0.02, 1768], [0.01, 1750], [0.005, 1700], [0, 1668], [0, 1811]] },
      { name: "γ-Fe (Austenite)", color: "hsl(45, 70%, 50%)", polygon: [[0, 1668], [0.005, 1700], [0.01, 1750], [0.02, 1768], [0.04, 1750], [0.08, 1700], [0.10, 1650], [0.15, 1550], [0.17, 1420], [0.08, 1420], [0.04, 1350], [0.02, 1250], [0.01, 1200], [0, 1185]] },
      { name: "α-Fe (Ferrite)", color: "hsl(200, 80%, 55%)", polygon: [[0, 1185], [0.001, 1100], [0.002, 1000], [0.003, 900], [0.004, 800], [0.005, 727], [0, 727], [0, 300], [0, 300]] },
      { name: "α + Fe₃C", color: "hsl(350, 70%, 55%)", polygon: [[0.005, 727], [0.034, 727], [0.25, 727], [0.25, 300], [0, 300], [0, 727], [0.005, 727]] },
      { name: "γ + Fe₃C", color: "hsl(320, 50%, 45%)", polygon: [[0.08, 1420], [0.17, 1420], [0.25, 1420], [0.25, 727], [0.034, 727], [0.04, 1350], [0.08, 1420]] },
    ],
  },
  "29-30": {
    systemName: "Cu–Zn",
    elementA: "Cu",
    elementB: "Zn",
    elementANumber: 29,
    elementBNumber: 30,
    notes: "Brass system at 1 atm. Multiple intermediate phases (β, γ, δ, ε).",
    regions: [
      { name: "α (FCC Cu)", color: "hsl(200, 80%, 55%)" },
      { name: "β (BCC)", color: "hsl(45, 70%, 50%)" },
      { name: "γ (Complex cubic)", color: "hsl(140, 60%, 50%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 1358 }, { x: 0.1, T: 1300 }, { x: 0.2, T: 1230 },
          { x: 0.3, T: 1170 }, { x: 0.35, T: 1180 }, { x: 0.4, T: 1150 },
          { x: 0.5, T: 1100 }, { x: 0.6, T: 970 }, { x: 0.7, T: 870 },
          { x: 0.8, T: 800 }, { x: 0.9, T: 750 }, { x: 1.0, T: 693 },
        ],
      },
      {
        label: "α solvus",
        color: "hsl(200, 80%, 55%)",
        points: [
          { x: 0.32, T: 1230 }, { x: 0.35, T: 1100 }, { x: 0.37, T: 900 },
          { x: 0.38, T: 700 }, { x: 0.39, T: 500 },
        ],
      },
      {
        label: "β phase",
        color: "hsl(45, 70%, 50%)",
        points: [
          { x: 0.37, T: 1230 }, { x: 0.40, T: 1100 }, { x: 0.45, T: 900 },
          { x: 0.48, T: 700 }, { x: 0.50, T: 500 },
        ],
      },
      {
        label: "γ phase",
        color: "hsl(140, 60%, 50%)",
        points: [
          { x: 0.58, T: 970 }, { x: 0.60, T: 900 }, { x: 0.63, T: 800 },
          { x: 0.65, T: 700 }, { x: 0.67, T: 500 },
        ],
      },
    ],
    invariants: [
      { label: "Peritectic", type: "peritectic", T: 1175, x: 0.37, description: "L + α → β" },
      { label: "Peritectic", type: "peritectic", T: 970, x: 0.60, description: "L + β → γ" },
    ],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 1358], [0.1, 1300], [0.2, 1230], [0.3, 1170], [0.35, 1180], [0.4, 1150], [0.5, 1100], [0.6, 970], [0.7, 870], [0.8, 800], [0.9, 750], [1.0, 693], [1.0, 1500], [0, 1500]] },
      { name: "α (FCC Cu)", color: "hsl(200, 80%, 55%)", polygon: [[0, 1358], [0.32, 1230], [0.35, 1100], [0.37, 900], [0.38, 700], [0.39, 500], [0.39, 300], [0, 300], [0, 1358]] },
      { name: "β (BCC)", color: "hsl(45, 70%, 50%)", polygon: [[0.37, 1230], [0.40, 1100], [0.45, 900], [0.48, 700], [0.50, 500], [0.50, 300], [0.39, 300], [0.39, 500], [0.38, 700], [0.37, 900], [0.35, 1100], [0.32, 1230]] },
      { name: "γ (Complex cubic)", color: "hsl(140, 60%, 50%)", polygon: [[0.58, 970], [0.60, 900], [0.63, 800], [0.65, 700], [0.67, 500], [0.67, 300], [0.50, 300], [0.50, 500], [0.48, 700], [0.45, 900], [0.40, 1100], [0.5, 1100], [0.58, 970]] },
    ],
  },
  "13-29": {
    systemName: "Al–Cu",
    elementA: "Al",
    elementB: "Cu",
    elementANumber: 13,
    elementBNumber: 29,
    notes: "Classic age-hardening system (2xxx series alloys) at 1 atm.",
    regions: [
      { name: "α (FCC Al)", color: "hsl(200, 80%, 55%)" },
      { name: "θ (Al₂Cu)", color: "hsl(45, 70%, 50%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 933 }, { x: 0.05, T: 920 }, { x: 0.10, T: 890 },
          { x: 0.15, T: 850 }, { x: 0.17, T: 821 },
        ],
      },
      {
        label: "Liquidus (Cu-rich)",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0.17, T: 821 }, { x: 0.25, T: 900 }, { x: 0.33, T: 1050 },
          { x: 0.50, T: 1200 }, { x: 0.75, T: 1300 }, { x: 1.0, T: 1358 },
        ],
      },
      {
        label: "α solvus",
        color: "hsl(200, 80%, 55%)",
        points: [
          { x: 0.025, T: 821 }, { x: 0.02, T: 700 }, { x: 0.015, T: 600 },
          { x: 0.01, T: 500 }, { x: 0.005, T: 400 }, { x: 0.002, T: 300 },
        ],
      },
      {
        label: "Eutectic isotherm",
        color: "hsl(350, 70%, 55%)",
        dashed: true,
        points: [
          { x: 0.025, T: 821 }, { x: 0.17, T: 821 }, { x: 0.33, T: 821 },
        ],
      },
    ],
    invariants: [
      { label: "Eutectic", type: "eutectic", T: 821, x: 0.17, description: "L → α + θ (Al₂Cu)" },
    ],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 933], [0.05, 920], [0.10, 890], [0.15, 850], [0.17, 821], [0.25, 900], [0.33, 1050], [0.50, 1200], [0.75, 1300], [1.0, 1358], [1.0, 1500], [0, 1500]] },
      { name: "α (FCC Al)", color: "hsl(200, 80%, 55%)", polygon: [[0, 933], [0.025, 821], [0.02, 700], [0.015, 600], [0.01, 500], [0.005, 400], [0.002, 300], [0, 300]] },
      { name: "α + θ", color: "hsl(45, 70%, 50%)", polygon: [[0.025, 821], [0.17, 821], [0.33, 821], [0.33, 300], [0.002, 300], [0.005, 400], [0.01, 500], [0.015, 600], [0.02, 700], [0.025, 821]] },
      { name: "θ (Al₂Cu) + Liquid", color: "hsl(350, 70%, 55%)", polygon: [[0.17, 821], [0.25, 900], [0.33, 1050], [0.33, 821]] },
    ],
  },
  "13-22": {
    systemName: "Ti–Al",
    elementA: "Ti",
    elementB: "Al",
    elementANumber: 22,
    elementBNumber: 13,
    notes: "Intermetallic system for aerospace alloys. γ-TiAl is key structural material.",
    regions: [
      { name: "α-Ti (HCP)", color: "hsl(200, 80%, 55%)" },
      { name: "β-Ti (BCC)", color: "hsl(270, 55%, 60%)" },
      { name: "α₂ (Ti₃Al)", color: "hsl(140, 60%, 50%)" },
      { name: "γ (TiAl)", color: "hsl(45, 70%, 50%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 1941 }, { x: 0.1, T: 1900 }, { x: 0.2, T: 1850 },
          { x: 0.3, T: 1800 }, { x: 0.4, T: 1750 }, { x: 0.5, T: 1730 },
          { x: 0.6, T: 1700 }, { x: 0.7, T: 1600 }, { x: 0.8, T: 1400 },
          { x: 0.9, T: 1100 }, { x: 1.0, T: 933 },
        ],
      },
      {
        label: "β transus",
        color: "hsl(270, 55%, 60%)",
        points: [
          { x: 0, T: 1155 }, { x: 0.05, T: 1180 }, { x: 0.10, T: 1200 },
          { x: 0.15, T: 1250 }, { x: 0.20, T: 1300 }, { x: 0.25, T: 1350 },
        ],
      },
      {
        label: "α₂ boundary",
        color: "hsl(140, 60%, 50%)",
        points: [
          { x: 0.22, T: 1450 }, { x: 0.25, T: 1350 }, { x: 0.28, T: 1250 },
          { x: 0.30, T: 1180 }, { x: 0.33, T: 1100 },
        ],
      },
      {
        label: "γ (TiAl) boundary",
        color: "hsl(45, 70%, 50%)",
        points: [
          { x: 0.35, T: 1450 }, { x: 0.40, T: 1400 }, { x: 0.48, T: 1440 },
          { x: 0.50, T: 1730 },
        ],
      },
    ],
    invariants: [
      { label: "Peritectic", type: "peritectic", T: 1730, x: 0.50, description: "L + β → γ-TiAl" },
    ],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 1941], [0.1, 1900], [0.2, 1850], [0.3, 1800], [0.4, 1750], [0.5, 1730], [0.6, 1700], [0.7, 1600], [0.8, 1400], [0.9, 1100], [1.0, 933], [1.0, 2100], [0, 2100]] },
      { name: "β-Ti (BCC)", color: "hsl(270, 55%, 60%)", polygon: [[0, 1941], [0, 1155], [0.05, 1180], [0.10, 1200], [0.15, 1250], [0.20, 1300], [0.25, 1350], [0.3, 1800], [0.2, 1850], [0.1, 1900]] },
      { name: "α-Ti (HCP)", color: "hsl(200, 80%, 55%)", polygon: [[0, 1155], [0, 300], [0.22, 300], [0.22, 1450], [0.25, 1350], [0.20, 1300], [0.15, 1250], [0.10, 1200], [0.05, 1180]] },
      { name: "α₂ (Ti₃Al)", color: "hsl(140, 60%, 50%)", polygon: [[0.22, 1450], [0.25, 1350], [0.28, 1250], [0.30, 1180], [0.33, 1100], [0.33, 300], [0.22, 300]] },
      { name: "γ (TiAl)", color: "hsl(45, 70%, 50%)", polygon: [[0.35, 1450], [0.40, 1400], [0.48, 1440], [0.50, 1730], [0.50, 300], [0.33, 300], [0.33, 1100], [0.35, 1450]] },
    ],
  },
  "13-28": {
    systemName: "Ni–Al",
    elementA: "Ni",
    elementB: "Al",
    elementANumber: 28,
    elementBNumber: 13,
    notes: "Superalloy system. γ' (Ni₃Al) precipitates provide high-temperature strength.",
    regions: [
      { name: "γ (FCC Ni)", color: "hsl(200, 80%, 55%)" },
      { name: "γ' (Ni₃Al)", color: "hsl(45, 70%, 50%)" },
      { name: "β (NiAl)", color: "hsl(140, 60%, 50%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 1728 }, { x: 0.1, T: 1680 }, { x: 0.15, T: 1640 },
          { x: 0.25, T: 1638 }, { x: 0.35, T: 1700 }, { x: 0.50, T: 1911 },
          { x: 0.60, T: 1800 }, { x: 0.75, T: 1400 }, { x: 1.0, T: 933 },
        ],
      },
      {
        label: "γ' solvus",
        color: "hsl(45, 70%, 50%)",
        points: [
          { x: 0.14, T: 1638 }, { x: 0.18, T: 1500 }, { x: 0.22, T: 1350 },
          { x: 0.25, T: 1200 },
        ],
      },
      {
        label: "β (NiAl) boundaries",
        color: "hsl(140, 60%, 50%)",
        points: [
          { x: 0.35, T: 1700 }, { x: 0.40, T: 1600 }, { x: 0.50, T: 1911 },
          { x: 0.60, T: 1800 }, { x: 0.58, T: 1400 },
        ],
      },
    ],
    invariants: [
      { label: "Eutectic", type: "eutectic", T: 1638, x: 0.25, description: "L → γ + γ' (Ni₃Al)" },
    ],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 1728], [0.1, 1680], [0.15, 1640], [0.25, 1638], [0.35, 1700], [0.50, 1911], [0.60, 1800], [0.75, 1400], [1.0, 933], [1.0, 2100], [0, 2100]] },
      { name: "γ (FCC Ni)", color: "hsl(200, 80%, 55%)", polygon: [[0, 1728], [0, 300], [0.14, 300], [0.14, 1638], [0.1, 1680]] },
      { name: "γ' (Ni₃Al)", color: "hsl(45, 70%, 50%)", polygon: [[0.14, 1638], [0.18, 1500], [0.22, 1350], [0.25, 1200], [0.25, 300], [0.14, 300]] },
      { name: "β (NiAl)", color: "hsl(140, 60%, 50%)", polygon: [[0.35, 1700], [0.40, 1600], [0.50, 1911], [0.60, 1800], [0.58, 1400], [0.58, 300], [0.25, 300], [0.25, 1200], [0.35, 1700]] },
    ],
  },
  "50-82": {
    systemName: "Pb–Sn",
    elementA: "Pb",
    elementB: "Sn",
    elementANumber: 82,
    elementBNumber: 50,
    notes: "Classic eutectic solder system at 1 atm.",
    regions: [
      { name: "α (FCC Pb)", color: "hsl(200, 80%, 55%)" },
      { name: "β (BCT Sn)", color: "hsl(45, 70%, 50%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus (Pb-rich)",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 600 }, { x: 0.1, T: 580 }, { x: 0.2, T: 550 },
          { x: 0.3, T: 510 }, { x: 0.38, T: 456 },
        ],
      },
      {
        label: "Liquidus (Sn-rich)",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0.38, T: 456 }, { x: 0.5, T: 470 }, { x: 0.6, T: 480 },
          { x: 0.7, T: 490 }, { x: 0.8, T: 495 }, { x: 0.9, T: 500 },
          { x: 1.0, T: 505 },
        ],
      },
      {
        label: "α solvus",
        color: "hsl(200, 80%, 55%)",
        points: [
          { x: 0.02, T: 456 }, { x: 0.015, T: 400 }, { x: 0.01, T: 350 },
          { x: 0.005, T: 300 },
        ],
      },
      {
        label: "β solvus",
        color: "hsl(45, 70%, 50%)",
        points: [
          { x: 0.97, T: 456 }, { x: 0.975, T: 400 }, { x: 0.98, T: 350 },
          { x: 0.985, T: 300 },
        ],
      },
      {
        label: "Eutectic isotherm",
        color: "hsl(350, 70%, 55%)",
        dashed: true,
        points: [
          { x: 0.02, T: 456 }, { x: 0.38, T: 456 }, { x: 0.97, T: 456 },
        ],
      },
    ],
    invariants: [
      { label: "Eutectic", type: "eutectic", T: 456, x: 0.38, description: "L → α + β (61.9% Sn)" },
    ],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 600], [0.1, 580], [0.2, 550], [0.3, 510], [0.38, 456], [0.5, 470], [0.6, 480], [0.7, 490], [0.8, 495], [0.9, 500], [1.0, 505], [1.0, 700], [0, 700]] },
      { name: "α (FCC Pb)", color: "hsl(200, 80%, 55%)", polygon: [[0, 600], [0.02, 456], [0.015, 400], [0.01, 350], [0.005, 300], [0, 300]] },
      { name: "α + β", color: "hsl(180, 50%, 45%)", polygon: [[0.02, 456], [0.38, 456], [0.97, 456], [0.985, 300], [0.005, 300], [0.01, 350], [0.015, 400]] },
      { name: "β (BCT Sn)", color: "hsl(45, 70%, 50%)", polygon: [[1.0, 505], [0.97, 456], [0.975, 400], [0.98, 350], [0.985, 300], [1.0, 300]] },
    ],
  },
  "14-32": {
    systemName: "Si–Ge",
    elementA: "Si",
    elementB: "Ge",
    elementANumber: 14,
    elementBNumber: 32,
    notes: "Complete solid solution (isomorphous) system at 1 atm. Used in SiGe semiconductors.",
    regions: [
      { name: "Solid solution (Diamond)", color: "hsl(200, 80%, 55%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 1687 }, { x: 0.1, T: 1620 }, { x: 0.2, T: 1560 },
          { x: 0.3, T: 1500 }, { x: 0.4, T: 1450 }, { x: 0.5, T: 1400 },
          { x: 0.6, T: 1350 }, { x: 0.7, T: 1300 }, { x: 0.8, T: 1260 },
          { x: 0.9, T: 1230 }, { x: 1.0, T: 1211 },
        ],
      },
      {
        label: "Solidus",
        color: "hsl(200, 80%, 55%)",
        points: [
          { x: 0, T: 1687 }, { x: 0.1, T: 1570 }, { x: 0.2, T: 1480 },
          { x: 0.3, T: 1410 }, { x: 0.4, T: 1360 }, { x: 0.5, T: 1320 },
          { x: 0.6, T: 1285 }, { x: 0.7, T: 1260 }, { x: 0.8, T: 1240 },
          { x: 0.9, T: 1225 }, { x: 1.0, T: 1211 },
        ],
      },
    ],
    invariants: [],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 1687], [0.1, 1620], [0.2, 1560], [0.3, 1500], [0.4, 1450], [0.5, 1400], [0.6, 1350], [0.7, 1300], [0.8, 1260], [0.9, 1230], [1.0, 1211], [1.0, 1800], [0, 1800]] },
      { name: "Solid + Liquid", color: "hsl(180, 50%, 45%)", polygon: [[0, 1687], [0.1, 1620], [0.2, 1560], [0.3, 1500], [0.4, 1450], [0.5, 1400], [0.6, 1350], [0.7, 1300], [0.8, 1260], [0.9, 1230], [1.0, 1211], [1.0, 1211], [0.9, 1225], [0.8, 1240], [0.7, 1260], [0.6, 1285], [0.5, 1320], [0.4, 1360], [0.3, 1410], [0.2, 1480], [0.1, 1570], [0, 1687]] },
      { name: "Solid solution (Diamond)", color: "hsl(200, 80%, 55%)", polygon: [[0, 1687], [0.1, 1570], [0.2, 1480], [0.3, 1410], [0.4, 1360], [0.5, 1320], [0.6, 1285], [0.7, 1260], [0.8, 1240], [0.9, 1225], [1.0, 1211], [1.0, 1000], [0, 1000]] },
    ],
  },
  "29-79": {
    systemName: "Au–Cu",
    elementA: "Cu",
    elementB: "Au",
    elementANumber: 29,
    elementBNumber: 79,
    notes: "Ordering system at 1 atm. AuCu and AuCu₃ ordered phases.",
    regions: [
      { name: "FCC solid solution", color: "hsl(200, 80%, 55%)" },
      { name: "AuCu (L1₀)", color: "hsl(45, 70%, 50%)" },
      { name: "AuCu₃ (L1₂)", color: "hsl(140, 60%, 50%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 1358 }, { x: 0.1, T: 1300 }, { x: 0.2, T: 1240 },
          { x: 0.3, T: 1190 }, { x: 0.4, T: 1160 }, { x: 0.5, T: 1150 },
          { x: 0.6, T: 1160 }, { x: 0.7, T: 1190 }, { x: 0.8, T: 1230 },
          { x: 0.9, T: 1280 }, { x: 1.0, T: 1337 },
        ],
      },
      {
        label: "Solidus",
        color: "hsl(200, 80%, 55%)",
        points: [
          { x: 0, T: 1358 }, { x: 0.1, T: 1270 }, { x: 0.2, T: 1200 },
          { x: 0.3, T: 1150 }, { x: 0.4, T: 1120 }, { x: 0.5, T: 1100 },
          { x: 0.6, T: 1110 }, { x: 0.7, T: 1140 }, { x: 0.8, T: 1180 },
          { x: 0.9, T: 1240 }, { x: 1.0, T: 1337 },
        ],
      },
      {
        label: "Order–disorder (AuCu₃)",
        color: "hsl(140, 60%, 50%)",
        dashed: true,
        points: [
          { x: 0.20, T: 523 }, { x: 0.25, T: 663 }, { x: 0.30, T: 523 },
        ],
      },
      {
        label: "Order–disorder (AuCu)",
        color: "hsl(45, 70%, 50%)",
        dashed: true,
        points: [
          { x: 0.40, T: 583 }, { x: 0.50, T: 683 }, { x: 0.60, T: 583 },
        ],
      },
    ],
    invariants: [
      { label: "Minimum", type: "congruent", T: 1100, x: 0.50, description: "Solidus minimum at Au₅₀Cu₅₀" },
    ],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 1358], [0.1, 1300], [0.2, 1240], [0.3, 1190], [0.4, 1160], [0.5, 1150], [0.6, 1160], [0.7, 1190], [0.8, 1230], [0.9, 1280], [1.0, 1337], [1.0, 1500], [0, 1500]] },
      { name: "Solid + Liquid", color: "hsl(180, 50%, 45%)", polygon: [[0, 1358], [0.1, 1300], [0.2, 1240], [0.3, 1190], [0.4, 1160], [0.5, 1150], [0.6, 1160], [0.7, 1190], [0.8, 1230], [0.9, 1280], [1.0, 1337], [1.0, 1337], [0.9, 1240], [0.8, 1180], [0.7, 1140], [0.6, 1110], [0.5, 1100], [0.4, 1120], [0.3, 1150], [0.2, 1200], [0.1, 1270], [0, 1358]] },
      { name: "FCC solid solution", color: "hsl(200, 80%, 55%)", polygon: [[0, 1358], [0.1, 1270], [0.2, 1200], [0.3, 1150], [0.4, 1120], [0.5, 1100], [0.6, 1110], [0.7, 1140], [0.8, 1180], [0.9, 1240], [1.0, 1337], [1.0, 400], [0, 400]] },
      { name: "AuCu₃ (L1₂)", color: "hsl(140, 60%, 50%)", polygon: [[0.20, 523], [0.25, 663], [0.30, 523], [0.30, 400], [0.20, 400]] },
      { name: "AuCu (L1₀)", color: "hsl(45, 70%, 50%)", polygon: [[0.40, 583], [0.50, 683], [0.60, 583], [0.60, 400], [0.40, 400]] },
    ],
  },
  // Fe-Ni (Iron-Nickel)
  "26-28": {
    systemName: "Fe–Ni",
    elementA: "Fe",
    elementB: "Ni",
    elementANumber: 26,
    elementBNumber: 28,
    notes: "Complete γ solid solution at high T. FeNi₃ ordering at low T. Invar/permalloy alloys.",
    regions: [
      { name: "α-Fe (BCC)", color: "hsl(200, 80%, 55%)" },
      { name: "γ (FCC)", color: "hsl(45, 70%, 50%)" },
      { name: "FeNi₃ (L1₂)", color: "hsl(140, 60%, 50%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 1811 }, { x: 0.1, T: 1790 }, { x: 0.2, T: 1770 },
          { x: 0.3, T: 1750 }, { x: 0.4, T: 1735 }, { x: 0.5, T: 1720 },
          { x: 0.6, T: 1710 }, { x: 0.7, T: 1700 }, { x: 0.8, T: 1710 },
          { x: 0.9, T: 1720 }, { x: 1.0, T: 1728 },
        ],
      },
      {
        label: "Solidus",
        color: "hsl(45, 70%, 50%)",
        points: [
          { x: 0, T: 1811 }, { x: 0.1, T: 1780 }, { x: 0.2, T: 1750 },
          { x: 0.3, T: 1720 }, { x: 0.4, T: 1700 }, { x: 0.5, T: 1690 },
          { x: 0.6, T: 1685 }, { x: 0.7, T: 1690 }, { x: 0.8, T: 1700 },
          { x: 0.9, T: 1712 }, { x: 1.0, T: 1728 },
        ],
      },
      {
        label: "γ/(α+γ) boundary",
        color: "hsl(200, 80%, 55%)",
        points: [
          { x: 0, T: 1185 }, { x: 0.03, T: 1200 }, { x: 0.05, T: 1300 },
          { x: 0.06, T: 1400 }, { x: 0.04, T: 1500 }, { x: 0.02, T: 1700 },
          { x: 0, T: 1811 },
        ],
      },
      {
        label: "α/(α+γ) boundary",
        color: "hsl(200, 80%, 55%)",
        dashed: true,
        points: [
          { x: 0, T: 1185 }, { x: 0.01, T: 1100 }, { x: 0.02, T: 1000 },
          { x: 0.03, T: 900 }, { x: 0.04, T: 800 }, { x: 0.05, T: 700 },
        ],
      },
      {
        label: "FeNi₃ ordering",
        color: "hsl(140, 60%, 50%)",
        dashed: true,
        points: [
          { x: 0.60, T: 773 }, { x: 0.70, T: 790 }, { x: 0.75, T: 793 },
          { x: 0.80, T: 790 }, { x: 0.85, T: 773 },
        ],
      },
    ],
    invariants: [],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 1811], [0.1, 1790], [0.2, 1770], [0.3, 1750], [0.4, 1735], [0.5, 1720], [0.6, 1710], [0.7, 1700], [0.8, 1710], [0.9, 1720], [1.0, 1728], [1.0, 1900], [0, 1900]] },
      { name: "Solid + Liquid", color: "hsl(180, 50%, 45%)", polygon: [[0, 1811], [0.1, 1790], [0.2, 1770], [0.3, 1750], [0.4, 1735], [0.5, 1720], [0.6, 1710], [0.7, 1700], [0.8, 1710], [0.9, 1720], [1.0, 1728], [1.0, 1728], [0.9, 1712], [0.8, 1700], [0.7, 1690], [0.6, 1685], [0.5, 1690], [0.4, 1700], [0.3, 1720], [0.2, 1750], [0.1, 1780], [0, 1811]] },
      { name: "γ (FCC)", color: "hsl(45, 70%, 50%)", polygon: [[0.06, 1400], [0.05, 1300], [0.03, 1200], [0, 1185], [0.01, 1100], [0.02, 1000], [0.03, 900], [0.04, 800], [0.05, 700], [0.05, 500], [1.0, 500], [1.0, 1728], [0.9, 1712], [0.8, 1700], [0.7, 1690], [0.6, 1685], [0.5, 1690], [0.4, 1700], [0.3, 1720], [0.2, 1750], [0.1, 1780], [0, 1811], [0.02, 1700], [0.04, 1500]] },
      { name: "α-Fe (BCC)", color: "hsl(200, 80%, 55%)", polygon: [[0, 1185], [0, 500], [0.05, 500], [0.05, 700], [0.04, 800], [0.03, 900], [0.02, 1000], [0.01, 1100], [0, 1185]] },
      { name: "FeNi₃ (L1₂)", color: "hsl(140, 60%, 50%)", polygon: [[0.60, 773], [0.70, 790], [0.75, 793], [0.80, 790], [0.85, 773], [0.85, 500], [0.60, 500]] },
    ],
  },
  // Cu-Sn (Copper-Tin) — Bronze system
  "29-50": {
    systemName: "Cu–Sn",
    elementA: "Cu",
    elementB: "Sn",
    elementANumber: 29,
    elementBNumber: 50,
    notes: "Bronze system at 1 atm. Multiple peritectic reactions.",
    regions: [
      { name: "α (FCC Cu)", color: "hsl(200, 80%, 55%)" },
      { name: "β", color: "hsl(270, 55%, 60%)" },
      { name: "δ (Cu₄₁Sn₁₁)", color: "hsl(140, 60%, 50%)" },
      { name: "ε (Cu₃Sn)", color: "hsl(45, 70%, 50%)" },
      { name: "η (Cu₆Sn₅)", color: "hsl(350, 70%, 55%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 1358 }, { x: 0.05, T: 1300 }, { x: 0.10, T: 1240 },
          { x: 0.13, T: 1071 }, { x: 0.15, T: 1029 }, { x: 0.17, T: 1002 },
          { x: 0.20, T: 960 }, { x: 0.25, T: 900 }, { x: 0.30, T: 840 },
          { x: 0.35, T: 780 }, { x: 0.40, T: 715 }, { x: 0.45, T: 640 },
          { x: 0.50, T: 580 }, { x: 0.60, T: 550 }, { x: 0.70, T: 530 },
          { x: 0.80, T: 510 }, { x: 0.90, T: 505 }, { x: 1.0, T: 505 },
        ],
      },
      {
        label: "α solvus",
        color: "hsl(200, 80%, 55%)",
        points: [
          { x: 0.10, T: 1071 }, { x: 0.12, T: 900 }, { x: 0.14, T: 798 },
          { x: 0.15, T: 700 }, { x: 0.155, T: 600 }, { x: 0.16, T: 500 },
        ],
      },
      {
        label: "β phase",
        color: "hsl(270, 55%, 60%)",
        points: [
          { x: 0.14, T: 1071 }, { x: 0.20, T: 960 }, { x: 0.22, T: 798 },
        ],
      },
      {
        label: "δ phase boundary",
        color: "hsl(140, 60%, 50%)",
        points: [
          { x: 0.20, T: 798 }, { x: 0.22, T: 700 }, { x: 0.24, T: 600 },
          { x: 0.25, T: 500 },
        ],
      },
      {
        label: "ε (Cu₃Sn) boundary",
        color: "hsl(45, 70%, 50%)",
        points: [
          { x: 0.25, T: 676 }, { x: 0.27, T: 600 }, { x: 0.28, T: 500 },
        ],
      },
      {
        label: "Peritectic 798 K",
        color: "hsl(350, 70%, 55%)",
        dashed: true,
        points: [
          { x: 0.14, T: 798 }, { x: 0.22, T: 798 },
        ],
      },
    ],
    invariants: [
      { label: "Peritectic", type: "peritectic", T: 1071, x: 0.13, description: "L + α → β" },
      { label: "Peritectic", type: "peritectic", T: 798, x: 0.20, description: "α + β → δ" },
      { label: "Peritectic", type: "peritectic", T: 676, x: 0.25, description: "δ → ε (Cu₃Sn)" },
      { label: "Eutectic", type: "eutectic", T: 500, x: 0.45, description: "L → η + β-Sn" },
    ],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 1358], [0.05, 1300], [0.10, 1240], [0.13, 1071], [0.15, 1029], [0.20, 960], [0.25, 900], [0.30, 840], [0.35, 780], [0.40, 715], [0.45, 640], [0.50, 580], [0.60, 550], [0.70, 530], [0.80, 510], [0.90, 505], [1.0, 505], [1.0, 1500], [0, 1500]] },
      { name: "α (FCC Cu)", color: "hsl(200, 80%, 55%)", polygon: [[0, 1358], [0.10, 1071], [0.12, 900], [0.14, 798], [0.15, 700], [0.155, 600], [0.16, 500], [0.16, 400], [0, 400]] },
      { name: "β", color: "hsl(270, 55%, 60%)", polygon: [[0.10, 1071], [0.14, 1071], [0.20, 960], [0.22, 798], [0.14, 798], [0.12, 900]] },
      { name: "δ (Cu₄₁Sn₁₁)", color: "hsl(140, 60%, 50%)", polygon: [[0.14, 798], [0.22, 798], [0.22, 700], [0.24, 600], [0.25, 500], [0.25, 400], [0.16, 400], [0.16, 500], [0.155, 600], [0.15, 700]] },
      { name: "ε (Cu₃Sn)", color: "hsl(45, 70%, 50%)", polygon: [[0.25, 676], [0.27, 600], [0.28, 500], [0.28, 400], [0.25, 400], [0.25, 500], [0.24, 600], [0.25, 676]] },
      { name: "η (Cu₆Sn₅)", color: "hsl(350, 70%, 55%)", polygon: [[0.28, 500], [0.45, 500], [0.45, 400], [0.28, 400]] },
    ],
  },
  // Al-Si (Aluminum-Silicon)
  "13-14": {
    systemName: "Al–Si",
    elementA: "Al",
    elementB: "Si",
    elementANumber: 13,
    elementBNumber: 14,
    notes: "Simple eutectic system at 1 atm. Foundry alloy basis (A356, 4xxx series).",
    regions: [
      { name: "α (FCC Al)", color: "hsl(200, 80%, 55%)" },
      { name: "Si (Diamond)", color: "hsl(140, 60%, 50%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus (Al-rich)",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 933 }, { x: 0.02, T: 925 }, { x: 0.05, T: 910 },
          { x: 0.08, T: 890 }, { x: 0.10, T: 870 }, { x: 0.12, T: 850 },
        ],
      },
      {
        label: "Liquidus (Si-rich)",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0.12, T: 850 }, { x: 0.20, T: 950 }, { x: 0.30, T: 1100 },
          { x: 0.40, T: 1200 }, { x: 0.50, T: 1300 }, { x: 0.60, T: 1380 },
          { x: 0.70, T: 1440 }, { x: 0.80, T: 1520 }, { x: 0.90, T: 1600 },
          { x: 1.0, T: 1687 },
        ],
      },
      {
        label: "α solvus",
        color: "hsl(200, 80%, 55%)",
        points: [
          { x: 0.016, T: 850 }, { x: 0.012, T: 800 }, { x: 0.008, T: 700 },
          { x: 0.005, T: 600 }, { x: 0.002, T: 500 },
        ],
      },
      {
        label: "Eutectic isotherm",
        color: "hsl(350, 70%, 55%)",
        dashed: true,
        points: [
          { x: 0.016, T: 850 }, { x: 0.12, T: 850 }, { x: 0.98, T: 850 },
        ],
      },
    ],
    invariants: [
      { label: "Eutectic", type: "eutectic", T: 850, x: 0.12, description: "L → α-Al + Si (12.6 at.% Si)" },
    ],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 933], [0.02, 925], [0.05, 910], [0.08, 890], [0.10, 870], [0.12, 850], [0.20, 950], [0.30, 1100], [0.40, 1200], [0.50, 1300], [0.60, 1380], [0.70, 1440], [0.80, 1520], [0.90, 1600], [1.0, 1687], [1.0, 1800], [0, 1800]] },
      { name: "α (FCC Al)", color: "hsl(200, 80%, 55%)", polygon: [[0, 933], [0.016, 850], [0.012, 800], [0.008, 700], [0.005, 600], [0.002, 500], [0, 500]] },
      { name: "α + Si", color: "hsl(180, 50%, 45%)", polygon: [[0.016, 850], [0.12, 850], [0.98, 850], [0.98, 500], [0.002, 500], [0.005, 600], [0.008, 700], [0.012, 800]] },
      { name: "Si (Diamond)", color: "hsl(140, 60%, 50%)", polygon: [[1.0, 1687], [0.98, 850], [0.98, 500], [1.0, 500]] },
      { name: "Liquid + Si", color: "hsl(45, 70%, 50%)", polygon: [[0.12, 850], [0.20, 950], [0.30, 1100], [0.40, 1200], [0.50, 1300], [0.60, 1380], [0.70, 1440], [0.80, 1520], [0.90, 1600], [1.0, 1687], [0.98, 850]] },
    ],
  },
  // Ag-Cu (Silver-Copper)
  "29-47": {
    systemName: "Ag–Cu",
    elementA: "Cu",
    elementB: "Ag",
    elementANumber: 29,
    elementBNumber: 47,
    notes: "Simple eutectic system at 1 atm. Sterling silver, brazing alloys.",
    regions: [
      { name: "α (FCC Cu)", color: "hsl(200, 80%, 55%)" },
      { name: "β (FCC Ag)", color: "hsl(270, 55%, 60%)" },
      { name: "Liquid", color: "hsl(25, 80%, 55%)" },
    ],
    boundaries: [
      {
        label: "Liquidus (Cu-rich)",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0, T: 1358 }, { x: 0.05, T: 1330 }, { x: 0.10, T: 1280 },
          { x: 0.15, T: 1220 }, { x: 0.20, T: 1150 }, { x: 0.25, T: 1080 },
          { x: 0.30, T: 1020 }, { x: 0.40, T: 1053 },
        ],
      },
      {
        label: "Liquidus (Ag-rich)",
        color: "hsl(25, 80%, 55%)",
        points: [
          { x: 0.40, T: 1053 }, { x: 0.50, T: 1060 }, { x: 0.60, T: 1080 },
          { x: 0.70, T: 1120 }, { x: 0.80, T: 1170 }, { x: 0.90, T: 1220 },
          { x: 1.0, T: 1235 },
        ],
      },
      {
        label: "α solvus",
        color: "hsl(200, 80%, 55%)",
        points: [
          { x: 0.05, T: 1053 }, { x: 0.04, T: 900 }, { x: 0.03, T: 800 },
          { x: 0.02, T: 700 }, { x: 0.015, T: 600 },
        ],
      },
      {
        label: "β solvus",
        color: "hsl(270, 55%, 60%)",
        points: [
          { x: 0.86, T: 1053 }, { x: 0.88, T: 900 }, { x: 0.90, T: 800 },
          { x: 0.92, T: 700 }, { x: 0.94, T: 600 },
        ],
      },
      {
        label: "Eutectic isotherm",
        color: "hsl(350, 70%, 55%)",
        dashed: true,
        points: [
          { x: 0.05, T: 1053 }, { x: 0.40, T: 1053 }, { x: 0.86, T: 1053 },
        ],
      },
    ],
    invariants: [
      { label: "Eutectic", type: "eutectic", T: 1053, x: 0.40, description: "L → α + β (39.9 at.% Ag, 779°C)" },
    ],
    zones: [
      { name: "Liquid", color: "hsl(25, 80%, 55%)", polygon: [[0, 1358], [0.05, 1330], [0.10, 1280], [0.15, 1220], [0.20, 1150], [0.25, 1080], [0.30, 1020], [0.40, 1053], [0.50, 1060], [0.60, 1080], [0.70, 1120], [0.80, 1170], [0.90, 1220], [1.0, 1235], [1.0, 1500], [0, 1500]] },
      { name: "α (FCC Cu)", color: "hsl(200, 80%, 55%)", polygon: [[0, 1358], [0.05, 1053], [0.04, 900], [0.03, 800], [0.02, 700], [0.015, 600], [0, 600]] },
      { name: "α + β", color: "hsl(180, 50%, 45%)", polygon: [[0.05, 1053], [0.40, 1053], [0.86, 1053], [0.94, 600], [0.015, 600], [0.02, 700], [0.03, 800], [0.04, 900]] },
      { name: "β (FCC Ag)", color: "hsl(270, 55%, 60%)", polygon: [[1.0, 1235], [0.86, 1053], [0.88, 900], [0.90, 800], [0.92, 700], [0.94, 600], [1.0, 600]] },
    ],
  },
};
