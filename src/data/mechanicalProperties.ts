// Mechanical properties for metallic elements
// Sources: ASM Handbook, CES EduPack, MatWeb

export interface MechanicalProps {
  crystalStructure: "BCC" | "FCC" | "HCP" | "Diamond" | "Tetragonal" | "Orthorhombic" | "Rhombohedral" | "Monoclinic" | "Other";
  latticeParams: { a: number; b?: number; c?: number }; // in Å
  yieldStrength: number | null;      // MPa (pure, annealed)
  tensileStrength: number | null;    // MPa
  vickersHardness: number | null;    // HV
  mohsHardness: number | null;
  youngModulus: number | null;       // GPa
  shearModulus: number | null;       // GPa
  bulkModulus: number | null;        // GPa
  poissonRatio: number | null;
  elongation: number | null;         // % elongation at break
  fractureToughness: number | null;  // MPa·√m
}

// Keyed by atomic number
export const mechanicalDatabase: Record<number, MechanicalProps> = {
  // Lithium
  3: { crystalStructure: "BCC", latticeParams: { a: 3.51 }, yieldStrength: 12, tensileStrength: 15, vickersHardness: 5, mohsHardness: 0.6, youngModulus: 4.9, shearModulus: 4.2, bulkModulus: 11, poissonRatio: 0.36, elongation: 50, fractureToughness: null },
  // Beryllium
  4: { crystalStructure: "HCP", latticeParams: { a: 2.29, c: 3.58 }, yieldStrength: 240, tensileStrength: 370, vickersHardness: 167, mohsHardness: 5.5, youngModulus: 287, shearModulus: 132, bulkModulus: 130, poissonRatio: 0.032, elongation: 6, fractureToughness: 12 },
  // Sodium
  11: { crystalStructure: "BCC", latticeParams: { a: 4.29 }, yieldStrength: 10, tensileStrength: 15, vickersHardness: 0.5, mohsHardness: 0.5, youngModulus: 10, shearModulus: 3.3, bulkModulus: 6.3, poissonRatio: 0.32, elongation: null, fractureToughness: null },
  // Magnesium
  12: { crystalStructure: "HCP", latticeParams: { a: 3.21, c: 5.21 }, yieldStrength: 69, tensileStrength: 130, vickersHardness: 44, mohsHardness: 2.5, youngModulus: 45, shearModulus: 17, bulkModulus: 45, poissonRatio: 0.29, elongation: 8, fractureToughness: 18 },
  // Aluminium
  13: { crystalStructure: "FCC", latticeParams: { a: 4.05 }, yieldStrength: 15, tensileStrength: 40, vickersHardness: 16, mohsHardness: 2.75, youngModulus: 70, shearModulus: 26, bulkModulus: 76, poissonRatio: 0.35, elongation: 50, fractureToughness: 35 },
  // Silicon
  14: { crystalStructure: "Diamond", latticeParams: { a: 5.43 }, yieldStrength: null, tensileStrength: 165, vickersHardness: 1150, mohsHardness: 6.5, youngModulus: 130, shearModulus: 52, bulkModulus: 100, poissonRatio: 0.28, elongation: 0, fractureToughness: 0.9 },
  // Titanium
  22: { crystalStructure: "HCP", latticeParams: { a: 2.95, c: 4.69 }, yieldStrength: 140, tensileStrength: 220, vickersHardness: 97, mohsHardness: 6.0, youngModulus: 116, shearModulus: 44, bulkModulus: 110, poissonRatio: 0.32, elongation: 54, fractureToughness: 70 },
  // Vanadium
  23: { crystalStructure: "BCC", latticeParams: { a: 3.03 }, yieldStrength: 180, tensileStrength: 530, vickersHardness: 63, mohsHardness: 7.0, youngModulus: 128, shearModulus: 47, bulkModulus: 160, poissonRatio: 0.37, elongation: 18, fractureToughness: null },
  // Chromium
  24: { crystalStructure: "BCC", latticeParams: { a: 2.88 }, yieldStrength: 210, tensileStrength: 280, vickersHardness: 101, mohsHardness: 8.5, youngModulus: 279, shearModulus: 115, bulkModulus: 160, poissonRatio: 0.21, elongation: 0, fractureToughness: null },
  // Manganese
  25: { crystalStructure: "BCC", latticeParams: { a: 8.91 }, yieldStrength: 241, tensileStrength: 500, vickersHardness: 196, mohsHardness: 6.0, youngModulus: 198, shearModulus: 39, bulkModulus: 120, poissonRatio: 0.23, elongation: null, fractureToughness: null },
  // Iron
  26: { crystalStructure: "BCC", latticeParams: { a: 2.87 }, yieldStrength: 80, tensileStrength: 210, vickersHardness: 61, mohsHardness: 4.0, youngModulus: 211, shearModulus: 82, bulkModulus: 170, poissonRatio: 0.29, elongation: 45, fractureToughness: 50 },
  // Cobalt
  27: { crystalStructure: "HCP", latticeParams: { a: 2.51, c: 4.07 }, yieldStrength: 345, tensileStrength: 760, vickersHardness: 104, mohsHardness: 5.0, youngModulus: 209, shearModulus: 75, bulkModulus: 180, poissonRatio: 0.31, elongation: 15, fractureToughness: null },
  // Nickel
  28: { crystalStructure: "FCC", latticeParams: { a: 3.52 }, yieldStrength: 59, tensileStrength: 317, vickersHardness: 64, mohsHardness: 4.0, youngModulus: 200, shearModulus: 76, bulkModulus: 180, poissonRatio: 0.31, elongation: 30, fractureToughness: 100 },
  // Copper
  29: { crystalStructure: "FCC", latticeParams: { a: 3.61 }, yieldStrength: 33, tensileStrength: 210, vickersHardness: 37, mohsHardness: 3.0, youngModulus: 130, shearModulus: 48, bulkModulus: 140, poissonRatio: 0.34, elongation: 60, fractureToughness: null },
  // Zinc
  30: { crystalStructure: "HCP", latticeParams: { a: 2.66, c: 4.95 }, yieldStrength: 30, tensileStrength: 37, vickersHardness: 42, mohsHardness: 2.5, youngModulus: 108, shearModulus: 43, bulkModulus: 70, poissonRatio: 0.25, elongation: 1, fractureToughness: null },
  // Germanium
  32: { crystalStructure: "Diamond", latticeParams: { a: 5.66 }, yieldStrength: null, tensileStrength: null, vickersHardness: 780, mohsHardness: 6.0, youngModulus: 103, shearModulus: 41, bulkModulus: 75, poissonRatio: 0.26, elongation: 0, fractureToughness: 0.6 },
  // Zirconium
  40: { crystalStructure: "HCP", latticeParams: { a: 3.23, c: 5.15 }, yieldStrength: 230, tensileStrength: 330, vickersHardness: 90, mohsHardness: 5.0, youngModulus: 68, shearModulus: 33, bulkModulus: 94, poissonRatio: 0.34, elongation: 32, fractureToughness: null },
  // Niobium
  41: { crystalStructure: "BCC", latticeParams: { a: 3.30 }, yieldStrength: 105, tensileStrength: 275, vickersHardness: 73, mohsHardness: 6.0, youngModulus: 105, shearModulus: 38, bulkModulus: 170, poissonRatio: 0.40, elongation: 30, fractureToughness: null },
  // Molybdenum
  42: { crystalStructure: "BCC", latticeParams: { a: 3.15 }, yieldStrength: 324, tensileStrength: 690, vickersHardness: 153, mohsHardness: 5.5, youngModulus: 329, shearModulus: 126, bulkModulus: 230, poissonRatio: 0.31, elongation: 36, fractureToughness: 15 },
  // Silver
  47: { crystalStructure: "FCC", latticeParams: { a: 4.09 }, yieldStrength: 55, tensileStrength: 140, vickersHardness: 25, mohsHardness: 2.5, youngModulus: 83, shearModulus: 30, bulkModulus: 100, poissonRatio: 0.37, elongation: 48, fractureToughness: null },
  // Tin
  50: { crystalStructure: "Tetragonal", latticeParams: { a: 5.83, c: 3.18 }, yieldStrength: 9, tensileStrength: 15, vickersHardness: 5, mohsHardness: 1.5, youngModulus: 50, shearModulus: 18, bulkModulus: 58, poissonRatio: 0.36, elongation: 80, fractureToughness: null },
  // Tantalum
  73: { crystalStructure: "BCC", latticeParams: { a: 3.30 }, yieldStrength: 170, tensileStrength: 285, vickersHardness: 87, mohsHardness: 6.5, youngModulus: 186, shearModulus: 69, bulkModulus: 200, poissonRatio: 0.34, elongation: 34, fractureToughness: null },
  // Tungsten
  74: { crystalStructure: "BCC", latticeParams: { a: 3.16 }, yieldStrength: 750, tensileStrength: 980, vickersHardness: 343, mohsHardness: 7.5, youngModulus: 411, shearModulus: 161, bulkModulus: 310, poissonRatio: 0.28, elongation: 2, fractureToughness: 10 },
  // Platinum
  78: { crystalStructure: "FCC", latticeParams: { a: 3.92 }, yieldStrength: 14, tensileStrength: 125, vickersHardness: 55, mohsHardness: 3.5, youngModulus: 168, shearModulus: 61, bulkModulus: 230, poissonRatio: 0.38, elongation: 35, fractureToughness: null },
  // Gold
  79: { crystalStructure: "FCC", latticeParams: { a: 4.08 }, yieldStrength: 10, tensileStrength: 120, vickersHardness: 22, mohsHardness: 2.5, youngModulus: 78, shearModulus: 27, bulkModulus: 220, poissonRatio: 0.44, elongation: 45, fractureToughness: null },
  // Lead
  82: { crystalStructure: "FCC", latticeParams: { a: 4.95 }, yieldStrength: 8, tensileStrength: 12, vickersHardness: 4, mohsHardness: 1.5, youngModulus: 16, shearModulus: 5.6, bulkModulus: 46, poissonRatio: 0.44, elongation: 60, fractureToughness: null },
};
