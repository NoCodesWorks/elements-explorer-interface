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

export interface BinaryPhaseDiagramData {
  systemName: string;
  elementA: string;
  elementB: string;
  elementANumber: number;
  elementBNumber: number;
  boundaries: BinaryBoundary[];
  regions: BinaryPhaseRegion[];
  invariants: InvariantReaction[];
  notes: string;
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
  },

  // Cu-Zn (Copper-Zinc / Brass)
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
  },

  // Al-Cu (Aluminium-Copper)
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
  },

  // Ti-Al (Titanium-Aluminium)
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
  },

  // Ni-Al (Nickel-Aluminium)
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
  },

  // Pb-Sn (Lead-Tin / Solder)
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
  },

  // Si-Ge (Silicon-Germanium)
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
  },

  // Au-Cu (Gold-Copper)
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
  },
};
