// Static DFT-derived reference data for select elements
// Sources: Materials Project, published DFT calculations

export interface DftData {
  crystalStructure: string;
  spaceGroup: string;
  bandGapType: string; // "Metal", "Semiconductor", "Insulator", "Semimetal"
  bandGapEv: number | null;
  magneticOrdering: string;
  cohesiveEnergyEv: number | null;
  bulkModulusGpa: number | null;
  formationEnergyEv: number | null;
}

export interface PhasePoint {
  T: number; // Temperature in K
  P: number; // Pressure in GPa (or atm for simple ones)
}

export interface PhaseBoundary {
  label: string;
  points: PhasePoint[];
  color: string;
}

export interface PhaseDiagramData {
  elementName: string;
  pressureUnit: string;
  phases: { name: string; region: string }[];
  boundaries: PhaseBoundary[];
  triplePoint?: PhasePoint;
  criticalPoint?: PhasePoint;
}

// DFT data keyed by atomic number
export const dftDatabase: Record<number, DftData> = {
  // Hydrogen
  1: { crystalStructure: "HCP", spaceGroup: "P6₃/mmc", bandGapType: "Insulator", bandGapEv: 14.0, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 2.29, bulkModulusGpa: null, formationEnergyEv: 0 },
  // Carbon
  6: { crystalStructure: "Diamond cubic / Graphite", spaceGroup: "Fd3̄m / P6₃/mmc", bandGapType: "Semiconductor / Semimetal", bandGapEv: 5.47, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 7.37, bulkModulusGpa: 442, formationEnergyEv: 0 },
  // Nitrogen
  7: { crystalStructure: "HCP (α-N₂)", spaceGroup: "Pa3̄", bandGapType: "Insulator", bandGapEv: 15.5, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 4.92, bulkModulusGpa: null, formationEnergyEv: 0 },
  // Oxygen
  8: { crystalStructure: "Monoclinic (α-O₂)", spaceGroup: "C2/m", bandGapType: "Insulator", bandGapEv: null, magneticOrdering: "Paramagnetic", cohesiveEnergyEv: 2.60, bulkModulusGpa: null, formationEnergyEv: 0 },
  // Sodium
  11: { crystalStructure: "BCC", spaceGroup: "Im3̄m", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Paramagnetic", cohesiveEnergyEv: 1.11, bulkModulusGpa: 6.3, formationEnergyEv: 0 },
  // Aluminium
  13: { crystalStructure: "FCC", spaceGroup: "Fm3̄m", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Paramagnetic", cohesiveEnergyEv: 3.39, bulkModulusGpa: 76, formationEnergyEv: 0 },
  // Silicon
  14: { crystalStructure: "Diamond cubic", spaceGroup: "Fd3̄m", bandGapType: "Semiconductor", bandGapEv: 1.17, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 4.63, bulkModulusGpa: 98, formationEnergyEv: 0 },
  // Phosphorus
  15: { crystalStructure: "Orthorhombic", spaceGroup: "Cmca", bandGapType: "Semiconductor", bandGapEv: 0.34, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 3.43, bulkModulusGpa: 11, formationEnergyEv: 0 },
  // Titanium
  22: { crystalStructure: "HCP", spaceGroup: "P6₃/mmc", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Paramagnetic", cohesiveEnergyEv: 4.85, bulkModulusGpa: 110, formationEnergyEv: 0 },
  // Chromium
  24: { crystalStructure: "BCC", spaceGroup: "Im3̄m", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Antiferromagnetic", cohesiveEnergyEv: 4.10, bulkModulusGpa: 160, formationEnergyEv: 0 },
  // Iron
  26: { crystalStructure: "BCC (α-Fe)", spaceGroup: "Im3̄m", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Ferromagnetic", cohesiveEnergyEv: 4.28, bulkModulusGpa: 170, formationEnergyEv: 0 },
  // Cobalt
  27: { crystalStructure: "HCP", spaceGroup: "P6₃/mmc", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Ferromagnetic", cohesiveEnergyEv: 4.39, bulkModulusGpa: 180, formationEnergyEv: 0 },
  // Nickel
  28: { crystalStructure: "FCC", spaceGroup: "Fm3̄m", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Ferromagnetic", cohesiveEnergyEv: 4.44, bulkModulusGpa: 180, formationEnergyEv: 0 },
  // Copper
  29: { crystalStructure: "FCC", spaceGroup: "Fm3̄m", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 3.49, bulkModulusGpa: 140, formationEnergyEv: 0 },
  // Zinc
  30: { crystalStructure: "HCP", spaceGroup: "P6₃/mmc", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 1.35, bulkModulusGpa: 70, formationEnergyEv: 0 },
  // Germanium
  32: { crystalStructure: "Diamond cubic", spaceGroup: "Fd3̄m", bandGapType: "Semiconductor", bandGapEv: 0.66, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 3.85, bulkModulusGpa: 75, formationEnergyEv: 0 },
  // Silver
  47: { crystalStructure: "FCC", spaceGroup: "Fm3̄m", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 2.95, bulkModulusGpa: 100, formationEnergyEv: 0 },
  // Tin
  50: { crystalStructure: "Tetragonal (β-Sn)", spaceGroup: "I4₁/amd", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 3.14, bulkModulusGpa: 58, formationEnergyEv: 0 },
  // Gold
  79: { crystalStructure: "FCC", spaceGroup: "Fm3̄m", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 3.81, bulkModulusGpa: 220, formationEnergyEv: 0 },
  // Lead
  82: { crystalStructure: "FCC", spaceGroup: "Fm3̄m", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 2.03, bulkModulusGpa: 46, formationEnergyEv: 0 },
  // Uranium
  92: { crystalStructure: "Orthorhombic (α-U)", spaceGroup: "Cmcm", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Paramagnetic", cohesiveEnergyEv: 5.55, bulkModulusGpa: 100, formationEnergyEv: 0 },
  // Plutonium
  94: { crystalStructure: "Monoclinic (α-Pu)", spaceGroup: "P2₁/m", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Paramagnetic", cohesiveEnergyEv: 3.60, bulkModulusGpa: 54, formationEnergyEv: 0 },
  // Tungsten
  74: { crystalStructure: "BCC", spaceGroup: "Im3̄m", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Paramagnetic", cohesiveEnergyEv: 8.90, bulkModulusGpa: 310, formationEnergyEv: 0 },
  // Gallium arsenide proxy — Gallium
  31: { crystalStructure: "Orthorhombic", spaceGroup: "Cmca", bandGapType: "Metal", bandGapEv: null, magneticOrdering: "Diamagnetic", cohesiveEnergyEv: 2.81, bulkModulusGpa: 56, formationEnergyEv: 0 },
};

// Static phase diagrams for select elements
export const phaseDiagrams: Record<number, PhaseDiagramData> = {
  // Iron phase diagram (simplified P-T)
  26: {
    elementName: "Iron (Fe)",
    pressureUnit: "GPa",
    phases: [
      { name: "α-Fe (BCC)", region: "Low T, low P" },
      { name: "γ-Fe (FCC)", region: "Mid T" },
      { name: "δ-Fe (BCC)", region: "High T" },
      { name: "ε-Fe (HCP)", region: "High P" },
      { name: "Liquid", region: "Above melting" },
    ],
    boundaries: [
      {
        label: "α → γ",
        color: "hsl(350, 70%, 55%)",
        points: [
          { T: 300, P: 0 }, { T: 800, P: 0 }, { T: 1000, P: 5 },
          { T: 1185, P: 10 },
        ],
      },
      {
        label: "γ → δ",
        color: "hsl(45, 70%, 50%)",
        points: [
          { T: 1185, P: 10 }, { T: 1394, P: 5 }, { T: 1665, P: 0 },
        ],
      },
      {
        label: "α → ε",
        color: "hsl(200, 80%, 55%)",
        points: [
          { T: 300, P: 13 }, { T: 500, P: 13 }, { T: 700, P: 11 },
          { T: 800, P: 10 },
        ],
      },
      {
        label: "Melting",
        color: "hsl(25, 80%, 55%)",
        points: [
          { T: 1811, P: 0 }, { T: 2000, P: 5 }, { T: 2200, P: 10 },
          { T: 2500, P: 20 }, { T: 3000, P: 40 },
        ],
      },
    ],
    triplePoint: { T: 800, P: 10 },
  },
  // Carbon phase diagram
  6: {
    elementName: "Carbon (C)",
    pressureUnit: "GPa",
    phases: [
      { name: "Graphite", region: "Low P" },
      { name: "Diamond", region: "High P" },
      { name: "Liquid", region: "Very high T & P" },
      { name: "Vapor", region: "Low P, high T" },
    ],
    boundaries: [
      {
        label: "Graphite–Diamond",
        color: "hsl(200, 80%, 55%)",
        points: [
          { T: 300, P: 2 }, { T: 1000, P: 4 }, { T: 1500, P: 5 },
          { T: 2000, P: 6 }, { T: 2500, P: 8 }, { T: 3000, P: 10 },
        ],
      },
      {
        label: "Graphite melting",
        color: "hsl(25, 80%, 55%)",
        points: [
          { T: 3800, P: 0 }, { T: 4000, P: 5 }, { T: 4200, P: 10 },
          { T: 4500, P: 15 },
        ],
      },
      {
        label: "Diamond melting",
        color: "hsl(350, 70%, 55%)",
        points: [
          { T: 4000, P: 10 }, { T: 4200, P: 15 }, { T: 4500, P: 20 },
          { T: 5000, P: 30 },
        ],
      },
    ],
    triplePoint: { T: 4600, P: 10.8 },
  },
  // Water / Hydrogen (simplified)
  1: {
    elementName: "Hydrogen (H₂)",
    pressureUnit: "GPa",
    phases: [
      { name: "Solid (molecular)", region: "Low T" },
      { name: "Liquid (molecular)", region: "Mid range" },
      { name: "Gas", region: "Low P" },
      { name: "Metallic H", region: "Very high P" },
    ],
    boundaries: [
      {
        label: "Solid–Liquid",
        color: "hsl(200, 80%, 55%)",
        points: [
          { T: 14, P: 0 }, { T: 20, P: 0.1 }, { T: 30, P: 1 },
          { T: 50, P: 5 }, { T: 100, P: 10 },
        ],
      },
      {
        label: "Liquid–Gas",
        color: "hsl(140, 60%, 50%)",
        points: [
          { T: 14, P: 0 }, { T: 20, P: 0.001 }, { T: 33, P: 0.013 },
        ],
      },
      {
        label: "Molecular–Metallic",
        color: "hsl(45, 70%, 50%)",
        points: [
          { T: 100, P: 400 }, { T: 300, P: 350 }, { T: 500, P: 300 },
          { T: 1000, P: 250 },
        ],
      },
    ],
    triplePoint: { T: 14, P: 0.007 },
    criticalPoint: { T: 33, P: 0.013 },
  },
  // Titanium
  22: {
    elementName: "Titanium (Ti)",
    pressureUnit: "GPa",
    phases: [
      { name: "α-Ti (HCP)", region: "Low T" },
      { name: "β-Ti (BCC)", region: "High T" },
      { name: "ω-Ti", region: "High P" },
      { name: "Liquid", region: "Above melting" },
    ],
    boundaries: [
      {
        label: "α → β",
        color: "hsl(200, 80%, 55%)",
        points: [
          { T: 300, P: 0 }, { T: 800, P: 2 }, { T: 1155, P: 0 },
        ],
      },
      {
        label: "α → ω",
        color: "hsl(270, 55%, 60%)",
        points: [
          { T: 300, P: 2 }, { T: 300, P: 9 }, { T: 500, P: 8 },
          { T: 700, P: 6 },
        ],
      },
      {
        label: "Melting",
        color: "hsl(25, 80%, 55%)",
        points: [
          { T: 1941, P: 0 }, { T: 2100, P: 5 }, { T: 2300, P: 10 },
        ],
      },
    ],
  },
};

export const categoryLabels: Record<string, string> = {
  alkali: "Alkali Metal",
  alkaline: "Alkaline Earth",
  transition: "Transition Metal",
  "post-transition": "Post-Transition Metal",
  metalloid: "Metalloid",
  nonmetal: "Nonmetal",
  halogen: "Halogen",
  noble: "Noble Gas",
  lanthanide: "Lanthanide",
  actinide: "Actinide",
  unknown: "Unknown",
};
