export type ElementCategory =
  | "alkali"
  | "alkaline"
  | "transition"
  | "post-transition"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble"
  | "lanthanide"
  | "actinide"
  | "unknown";

export type Phase = "solid" | "liquid" | "gas" | "unknown";

export interface Element {
  number: number;
  symbol: string;
  name: string;
  mass: string;
  category: ElementCategory;
  row: number;
  col: number;
  electronConfig: string;
  electronegativity: number | null;
  meltingPoint: number | null; // in Kelvin
  boilingPoint: number | null; // in Kelvin
  discoveryYear: string;
}

export function getPhase(el: Element, tempK: number): Phase {
  if (el.meltingPoint === null || el.boilingPoint === null) return "unknown";
  if (tempK < el.meltingPoint) return "solid";
  if (tempK < el.boilingPoint) return "liquid";
  return "gas";
}

export const elements: Element[] = [
  // Period 1
  { number: 1, symbol: "H", name: "Hydrogen", mass: "1.008", category: "nonmetal", row: 1, col: 1, electronConfig: "1s¹", electronegativity: 2.20, meltingPoint: 14, boilingPoint: 20, discoveryYear: "1766" },
  { number: 2, symbol: "He", name: "Helium", mass: "4.003", category: "noble", row: 1, col: 18, electronConfig: "1s²", electronegativity: null, meltingPoint: 1, boilingPoint: 4, discoveryYear: "1868" },
  // Period 2
  { number: 3, symbol: "Li", name: "Lithium", mass: "6.941", category: "alkali", row: 2, col: 1, electronConfig: "[He] 2s¹", electronegativity: 0.98, meltingPoint: 454, boilingPoint: 1615, discoveryYear: "1817" },
  { number: 4, symbol: "Be", name: "Beryllium", mass: "9.012", category: "alkaline", row: 2, col: 2, electronConfig: "[He] 2s²", electronegativity: 1.57, meltingPoint: 1560, boilingPoint: 2742, discoveryYear: "1798" },
  { number: 5, symbol: "B", name: "Boron", mass: "10.81", category: "metalloid", row: 2, col: 13, electronConfig: "[He] 2s² 2p¹", electronegativity: 2.04, meltingPoint: 2349, boilingPoint: 4200, discoveryYear: "1808" },
  { number: 6, symbol: "C", name: "Carbon", mass: "12.01", category: "nonmetal", row: 2, col: 14, electronConfig: "[He] 2s² 2p²", electronegativity: 2.55, meltingPoint: 3823, boilingPoint: 4098, discoveryYear: "Ancient" },
  { number: 7, symbol: "N", name: "Nitrogen", mass: "14.01", category: "nonmetal", row: 2, col: 15, electronConfig: "[He] 2s² 2p³", electronegativity: 3.04, meltingPoint: 63, boilingPoint: 77, discoveryYear: "1772" },
  { number: 8, symbol: "O", name: "Oxygen", mass: "16.00", category: "nonmetal", row: 2, col: 16, electronConfig: "[He] 2s² 2p⁴", electronegativity: 3.44, meltingPoint: 54, boilingPoint: 90, discoveryYear: "1774" },
  { number: 9, symbol: "F", name: "Fluorine", mass: "19.00", category: "halogen", row: 2, col: 17, electronConfig: "[He] 2s² 2p⁵", electronegativity: 3.98, meltingPoint: 53, boilingPoint: 85, discoveryYear: "1886" },
  { number: 10, symbol: "Ne", name: "Neon", mass: "20.18", category: "noble", row: 2, col: 18, electronConfig: "[He] 2s² 2p⁶", electronegativity: null, meltingPoint: 25, boilingPoint: 27, discoveryYear: "1898" },
  // Period 3
  { number: 11, symbol: "Na", name: "Sodium", mass: "22.99", category: "alkali", row: 3, col: 1, electronConfig: "[Ne] 3s¹", electronegativity: 0.93, meltingPoint: 371, boilingPoint: 1156, discoveryYear: "1807" },
  { number: 12, symbol: "Mg", name: "Magnesium", mass: "24.31", category: "alkaline", row: 3, col: 2, electronConfig: "[Ne] 3s²", electronegativity: 1.31, meltingPoint: 923, boilingPoint: 1363, discoveryYear: "1755" },
  { number: 13, symbol: "Al", name: "Aluminium", mass: "26.98", category: "post-transition", row: 3, col: 13, electronConfig: "[Ne] 3s² 3p¹", electronegativity: 1.61, meltingPoint: 933, boilingPoint: 2792, discoveryYear: "1825" },
  { number: 14, symbol: "Si", name: "Silicon", mass: "28.09", category: "metalloid", row: 3, col: 14, electronConfig: "[Ne] 3s² 3p²", electronegativity: 1.90, meltingPoint: 1687, boilingPoint: 3538, discoveryYear: "1824" },
  { number: 15, symbol: "P", name: "Phosphorus", mass: "30.97", category: "nonmetal", row: 3, col: 15, electronConfig: "[Ne] 3s² 3p³", electronegativity: 2.19, meltingPoint: 317, boilingPoint: 554, discoveryYear: "1669" },
  { number: 16, symbol: "S", name: "Sulfur", mass: "32.07", category: "nonmetal", row: 3, col: 16, electronConfig: "[Ne] 3s² 3p⁴", electronegativity: 2.58, meltingPoint: 388, boilingPoint: 718, discoveryYear: "Ancient" },
  { number: 17, symbol: "Cl", name: "Chlorine", mass: "35.45", category: "halogen", row: 3, col: 17, electronConfig: "[Ne] 3s² 3p⁵", electronegativity: 3.16, meltingPoint: 172, boilingPoint: 239, discoveryYear: "1774" },
  { number: 18, symbol: "Ar", name: "Argon", mass: "39.95", category: "noble", row: 3, col: 18, electronConfig: "[Ne] 3s² 3p⁶", electronegativity: null, meltingPoint: 84, boilingPoint: 87, discoveryYear: "1894" },
  // Period 4
  { number: 19, symbol: "K", name: "Potassium", mass: "39.10", category: "alkali", row: 4, col: 1, electronConfig: "[Ar] 4s¹", electronegativity: 0.82, meltingPoint: 337, boilingPoint: 1032, discoveryYear: "1807" },
  { number: 20, symbol: "Ca", name: "Calcium", mass: "40.08", category: "alkaline", row: 4, col: 2, electronConfig: "[Ar] 4s²", electronegativity: 1.00, meltingPoint: 1115, boilingPoint: 1757, discoveryYear: "1808" },
  { number: 21, symbol: "Sc", name: "Scandium", mass: "44.96", category: "transition", row: 4, col: 3, electronConfig: "[Ar] 3d¹ 4s²", electronegativity: 1.36, meltingPoint: 1814, boilingPoint: 3109, discoveryYear: "1879" },
  { number: 22, symbol: "Ti", name: "Titanium", mass: "47.87", category: "transition", row: 4, col: 4, electronConfig: "[Ar] 3d² 4s²", electronegativity: 1.54, meltingPoint: 1941, boilingPoint: 3560, discoveryYear: "1791" },
  { number: 23, symbol: "V", name: "Vanadium", mass: "50.94", category: "transition", row: 4, col: 5, electronConfig: "[Ar] 3d³ 4s²", electronegativity: 1.63, meltingPoint: 2183, boilingPoint: 3680, discoveryYear: "1801" },
  { number: 24, symbol: "Cr", name: "Chromium", mass: "52.00", category: "transition", row: 4, col: 6, electronConfig: "[Ar] 3d⁵ 4s¹", electronegativity: 1.66, meltingPoint: 2180, boilingPoint: 2944, discoveryYear: "1794" },
  { number: 25, symbol: "Mn", name: "Manganese", mass: "54.94", category: "transition", row: 4, col: 7, electronConfig: "[Ar] 3d⁵ 4s²", electronegativity: 1.55, meltingPoint: 1519, boilingPoint: 2334, discoveryYear: "1774" },
  { number: 26, symbol: "Fe", name: "Iron", mass: "55.85", category: "transition", row: 4, col: 8, electronConfig: "[Ar] 3d⁶ 4s²", electronegativity: 1.83, meltingPoint: 1811, boilingPoint: 3134, discoveryYear: "Ancient" },
  { number: 27, symbol: "Co", name: "Cobalt", mass: "58.93", category: "transition", row: 4, col: 9, electronConfig: "[Ar] 3d⁷ 4s²", electronegativity: 1.88, meltingPoint: 1768, boilingPoint: 3200, discoveryYear: "1735" },
  { number: 28, symbol: "Ni", name: "Nickel", mass: "58.69", category: "transition", row: 4, col: 10, electronConfig: "[Ar] 3d⁸ 4s²", electronegativity: 1.91, meltingPoint: 1728, boilingPoint: 3186, discoveryYear: "1751" },
  { number: 29, symbol: "Cu", name: "Copper", mass: "63.55", category: "transition", row: 4, col: 11, electronConfig: "[Ar] 3d¹⁰ 4s¹", electronegativity: 1.90, meltingPoint: 1358, boilingPoint: 2835, discoveryYear: "Ancient" },
  { number: 30, symbol: "Zn", name: "Zinc", mass: "65.38", category: "transition", row: 4, col: 12, electronConfig: "[Ar] 3d¹⁰ 4s²", electronegativity: 1.65, meltingPoint: 693, boilingPoint: 1180, discoveryYear: "Ancient" },
  { number: 31, symbol: "Ga", name: "Gallium", mass: "69.72", category: "post-transition", row: 4, col: 13, electronConfig: "[Ar] 3d¹⁰ 4s² 4p¹", electronegativity: 1.81, meltingPoint: 303, boilingPoint: 2477, discoveryYear: "1875" },
  { number: 32, symbol: "Ge", name: "Germanium", mass: "72.63", category: "metalloid", row: 4, col: 14, electronConfig: "[Ar] 3d¹⁰ 4s² 4p²", electronegativity: 2.01, meltingPoint: 1211, boilingPoint: 3106, discoveryYear: "1886" },
  { number: 33, symbol: "As", name: "Arsenic", mass: "74.92", category: "metalloid", row: 4, col: 15, electronConfig: "[Ar] 3d¹⁰ 4s² 4p³", electronegativity: 2.18, meltingPoint: 1090, boilingPoint: 887, discoveryYear: "Ancient" },
  { number: 34, symbol: "Se", name: "Selenium", mass: "78.97", category: "nonmetal", row: 4, col: 16, electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁴", electronegativity: 2.55, meltingPoint: 494, boilingPoint: 958, discoveryYear: "1817" },
  { number: 35, symbol: "Br", name: "Bromine", mass: "79.90", category: "halogen", row: 4, col: 17, electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁵", electronegativity: 2.96, meltingPoint: 266, boilingPoint: 332, discoveryYear: "1826" },
  { number: 36, symbol: "Kr", name: "Krypton", mass: "83.80", category: "noble", row: 4, col: 18, electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁶", electronegativity: 3.00, meltingPoint: 116, boilingPoint: 120, discoveryYear: "1898" },
  // Period 5
  { number: 37, symbol: "Rb", name: "Rubidium", mass: "85.47", category: "alkali", row: 5, col: 1, electronConfig: "[Kr] 5s¹", electronegativity: 0.82, meltingPoint: 312, boilingPoint: 961, discoveryYear: "1861" },
  { number: 38, symbol: "Sr", name: "Strontium", mass: "87.62", category: "alkaline", row: 5, col: 2, electronConfig: "[Kr] 5s²", electronegativity: 0.95, meltingPoint: 1050, boilingPoint: 1655, discoveryYear: "1790" },
  { number: 39, symbol: "Y", name: "Yttrium", mass: "88.91", category: "transition", row: 5, col: 3, electronConfig: "[Kr] 4d¹ 5s²", electronegativity: 1.22, meltingPoint: 1799, boilingPoint: 3609, discoveryYear: "1794" },
  { number: 40, symbol: "Zr", name: "Zirconium", mass: "91.22", category: "transition", row: 5, col: 4, electronConfig: "[Kr] 4d² 5s²", electronegativity: 1.33, meltingPoint: 2128, boilingPoint: 4682, discoveryYear: "1789" },
  { number: 41, symbol: "Nb", name: "Niobium", mass: "92.91", category: "transition", row: 5, col: 5, electronConfig: "[Kr] 4d⁴ 5s¹", electronegativity: 1.6, meltingPoint: 2750, boilingPoint: 5017, discoveryYear: "1801" },
  { number: 42, symbol: "Mo", name: "Molybdenum", mass: "95.95", category: "transition", row: 5, col: 6, electronConfig: "[Kr] 4d⁵ 5s¹", electronegativity: 2.16, meltingPoint: 2896, boilingPoint: 4912, discoveryYear: "1781" },
  { number: 43, symbol: "Tc", name: "Technetium", mass: "(98)", category: "transition", row: 5, col: 7, electronConfig: "[Kr] 4d⁵ 5s²", electronegativity: 1.9, meltingPoint: 2430, boilingPoint: 4538, discoveryYear: "1937" },
  { number: 44, symbol: "Ru", name: "Ruthenium", mass: "101.1", category: "transition", row: 5, col: 8, electronConfig: "[Kr] 4d⁷ 5s¹", electronegativity: 2.2, meltingPoint: 2607, boilingPoint: 4423, discoveryYear: "1844" },
  { number: 45, symbol: "Rh", name: "Rhodium", mass: "102.9", category: "transition", row: 5, col: 9, electronConfig: "[Kr] 4d⁸ 5s¹", electronegativity: 2.28, meltingPoint: 2237, boilingPoint: 3968, discoveryYear: "1803" },
  { number: 46, symbol: "Pd", name: "Palladium", mass: "106.4", category: "transition", row: 5, col: 10, electronConfig: "[Kr] 4d¹⁰", electronegativity: 2.20, meltingPoint: 1828, boilingPoint: 3236, discoveryYear: "1803" },
  { number: 47, symbol: "Ag", name: "Silver", mass: "107.9", category: "transition", row: 5, col: 11, electronConfig: "[Kr] 4d¹⁰ 5s¹", electronegativity: 1.93, meltingPoint: 1235, boilingPoint: 2435, discoveryYear: "Ancient" },
  { number: 48, symbol: "Cd", name: "Cadmium", mass: "112.4", category: "transition", row: 5, col: 12, electronConfig: "[Kr] 4d¹⁰ 5s²", electronegativity: 1.69, meltingPoint: 594, boilingPoint: 1040, discoveryYear: "1817" },
  { number: 49, symbol: "In", name: "Indium", mass: "114.8", category: "post-transition", row: 5, col: 13, electronConfig: "[Kr] 4d¹⁰ 5s² 5p¹", electronegativity: 1.78, meltingPoint: 430, boilingPoint: 2345, discoveryYear: "1863" },
  { number: 50, symbol: "Sn", name: "Tin", mass: "118.7", category: "post-transition", row: 5, col: 14, electronConfig: "[Kr] 4d¹⁰ 5s² 5p²", electronegativity: 1.96, meltingPoint: 505, boilingPoint: 2875, discoveryYear: "Ancient" },
  { number: 51, symbol: "Sb", name: "Antimony", mass: "121.8", category: "metalloid", row: 5, col: 15, electronConfig: "[Kr] 4d¹⁰ 5s² 5p³", electronegativity: 2.05, meltingPoint: 904, boilingPoint: 1860, discoveryYear: "Ancient" },
  { number: 52, symbol: "Te", name: "Tellurium", mass: "127.6", category: "metalloid", row: 5, col: 16, electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁴", electronegativity: 2.1, meltingPoint: 723, boilingPoint: 1261, discoveryYear: "1783" },
  { number: 53, symbol: "I", name: "Iodine", mass: "126.9", category: "halogen", row: 5, col: 17, electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁵", electronegativity: 2.66, meltingPoint: 387, boilingPoint: 457, discoveryYear: "1811" },
  { number: 54, symbol: "Xe", name: "Xenon", mass: "131.3", category: "noble", row: 5, col: 18, electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁶", electronegativity: 2.6, meltingPoint: 161, boilingPoint: 165, discoveryYear: "1898" },
  // Period 6
  { number: 55, symbol: "Cs", name: "Caesium", mass: "132.9", category: "alkali", row: 6, col: 1, electronConfig: "[Xe] 6s¹", electronegativity: 0.79, meltingPoint: 302, boilingPoint: 944, discoveryYear: "1860" },
  { number: 56, symbol: "Ba", name: "Barium", mass: "137.3", category: "alkaline", row: 6, col: 2, electronConfig: "[Xe] 6s²", electronegativity: 0.89, meltingPoint: 1000, boilingPoint: 2170, discoveryYear: "1808" },
  // Lanthanides (row 9)
  { number: 57, symbol: "La", name: "Lanthanum", mass: "138.9", category: "lanthanide", row: 9, col: 3, electronConfig: "[Xe] 5d¹ 6s²", electronegativity: 1.10, meltingPoint: 1193, boilingPoint: 3737, discoveryYear: "1839" },
  { number: 58, symbol: "Ce", name: "Cerium", mass: "140.1", category: "lanthanide", row: 9, col: 4, electronConfig: "[Xe] 4f¹ 5d¹ 6s²", electronegativity: 1.12, meltingPoint: 1068, boilingPoint: 3716, discoveryYear: "1803" },
  { number: 59, symbol: "Pr", name: "Praseodymium", mass: "140.9", category: "lanthanide", row: 9, col: 5, electronConfig: "[Xe] 4f³ 6s²", electronegativity: 1.13, meltingPoint: 1208, boilingPoint: 3793, discoveryYear: "1885" },
  { number: 60, symbol: "Nd", name: "Neodymium", mass: "144.2", category: "lanthanide", row: 9, col: 6, electronConfig: "[Xe] 4f⁴ 6s²", electronegativity: 1.14, meltingPoint: 1297, boilingPoint: 3347, discoveryYear: "1885" },
  { number: 61, symbol: "Pm", name: "Promethium", mass: "(145)", category: "lanthanide", row: 9, col: 7, electronConfig: "[Xe] 4f⁵ 6s²", electronegativity: 1.13, meltingPoint: 1315, boilingPoint: 3273, discoveryYear: "1945" },
  { number: 62, symbol: "Sm", name: "Samarium", mass: "150.4", category: "lanthanide", row: 9, col: 8, electronConfig: "[Xe] 4f⁶ 6s²", electronegativity: 1.17, meltingPoint: 1345, boilingPoint: 2067, discoveryYear: "1879" },
  { number: 63, symbol: "Eu", name: "Europium", mass: "152.0", category: "lanthanide", row: 9, col: 9, electronConfig: "[Xe] 4f⁷ 6s²", electronegativity: 1.2, meltingPoint: 1099, boilingPoint: 1802, discoveryYear: "1901" },
  { number: 64, symbol: "Gd", name: "Gadolinium", mass: "157.3", category: "lanthanide", row: 9, col: 10, electronConfig: "[Xe] 4f⁷ 5d¹ 6s²", electronegativity: 1.20, meltingPoint: 1585, boilingPoint: 3546, discoveryYear: "1880" },
  { number: 65, symbol: "Tb", name: "Terbium", mass: "158.9", category: "lanthanide", row: 9, col: 11, electronConfig: "[Xe] 4f⁹ 6s²", electronegativity: 1.2, meltingPoint: 1629, boilingPoint: 3503, discoveryYear: "1843" },
  { number: 66, symbol: "Dy", name: "Dysprosium", mass: "162.5", category: "lanthanide", row: 9, col: 12, electronConfig: "[Xe] 4f¹⁰ 6s²", electronegativity: 1.22, meltingPoint: 1680, boilingPoint: 2840, discoveryYear: "1886" },
  { number: 67, symbol: "Ho", name: "Holmium", mass: "164.9", category: "lanthanide", row: 9, col: 13, electronConfig: "[Xe] 4f¹¹ 6s²", electronegativity: 1.23, meltingPoint: 1734, boilingPoint: 2993, discoveryYear: "1878" },
  { number: 68, symbol: "Er", name: "Erbium", mass: "167.3", category: "lanthanide", row: 9, col: 14, electronConfig: "[Xe] 4f¹² 6s²", electronegativity: 1.24, meltingPoint: 1802, boilingPoint: 3141, discoveryYear: "1843" },
  { number: 69, symbol: "Tm", name: "Thulium", mass: "168.9", category: "lanthanide", row: 9, col: 15, electronConfig: "[Xe] 4f¹³ 6s²", electronegativity: 1.25, meltingPoint: 1818, boilingPoint: 2223, discoveryYear: "1879" },
  { number: 70, symbol: "Yb", name: "Ytterbium", mass: "173.0", category: "lanthanide", row: 9, col: 16, electronConfig: "[Xe] 4f¹⁴ 6s²", electronegativity: 1.1, meltingPoint: 1097, boilingPoint: 1469, discoveryYear: "1878" },
  { number: 71, symbol: "Lu", name: "Lutetium", mass: "175.0", category: "lanthanide", row: 9, col: 17, electronConfig: "[Xe] 4f¹⁴ 5d¹ 6s²", electronegativity: 1.27, meltingPoint: 1925, boilingPoint: 3675, discoveryYear: "1907" },
  // Continue Period 6
  { number: 72, symbol: "Hf", name: "Hafnium", mass: "178.5", category: "transition", row: 6, col: 4, electronConfig: "[Xe] 4f¹⁴ 5d² 6s²", electronegativity: 1.3, meltingPoint: 2506, boilingPoint: 4876, discoveryYear: "1923" },
  { number: 73, symbol: "Ta", name: "Tantalum", mass: "180.9", category: "transition", row: 6, col: 5, electronConfig: "[Xe] 4f¹⁴ 5d³ 6s²", electronegativity: 1.5, meltingPoint: 3290, boilingPoint: 5731, discoveryYear: "1802" },
  { number: 74, symbol: "W", name: "Tungsten", mass: "183.8", category: "transition", row: 6, col: 6, electronConfig: "[Xe] 4f¹⁴ 5d⁴ 6s²", electronegativity: 2.36, meltingPoint: 3695, boilingPoint: 5828, discoveryYear: "1783" },
  { number: 75, symbol: "Re", name: "Rhenium", mass: "186.2", category: "transition", row: 6, col: 7, electronConfig: "[Xe] 4f¹⁴ 5d⁵ 6s²", electronegativity: 1.9, meltingPoint: 3459, boilingPoint: 5869, discoveryYear: "1925" },
  { number: 76, symbol: "Os", name: "Osmium", mass: "190.2", category: "transition", row: 6, col: 8, electronConfig: "[Xe] 4f¹⁴ 5d⁶ 6s²", electronegativity: 2.2, meltingPoint: 3306, boilingPoint: 5285, discoveryYear: "1803" },
  { number: 77, symbol: "Ir", name: "Iridium", mass: "192.2", category: "transition", row: 6, col: 9, electronConfig: "[Xe] 4f¹⁴ 5d⁷ 6s²", electronegativity: 2.20, meltingPoint: 2719, boilingPoint: 4701, discoveryYear: "1803" },
  { number: 78, symbol: "Pt", name: "Platinum", mass: "195.1", category: "transition", row: 6, col: 10, electronConfig: "[Xe] 4f¹⁴ 5d⁹ 6s¹", electronegativity: 2.28, meltingPoint: 2041, boilingPoint: 4098, discoveryYear: "1735" },
  { number: 79, symbol: "Au", name: "Gold", mass: "197.0", category: "transition", row: 6, col: 11, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", electronegativity: 2.54, meltingPoint: 1337, boilingPoint: 3129, discoveryYear: "Ancient" },
  { number: 80, symbol: "Hg", name: "Mercury", mass: "200.6", category: "transition", row: 6, col: 12, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s²", electronegativity: 2.00, meltingPoint: 234, boilingPoint: 630, discoveryYear: "Ancient" },
  { number: 81, symbol: "Tl", name: "Thallium", mass: "204.4", category: "post-transition", row: 6, col: 13, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹", electronegativity: 1.62, meltingPoint: 577, boilingPoint: 1746, discoveryYear: "1861" },
  { number: 82, symbol: "Pb", name: "Lead", mass: "207.2", category: "post-transition", row: 6, col: 14, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", electronegativity: 1.87, meltingPoint: 601, boilingPoint: 2022, discoveryYear: "Ancient" },
  { number: 83, symbol: "Bi", name: "Bismuth", mass: "209.0", category: "post-transition", row: 6, col: 15, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³", electronegativity: 2.02, meltingPoint: 545, boilingPoint: 1837, discoveryYear: "1753" },
  { number: 84, symbol: "Po", name: "Polonium", mass: "(209)", category: "post-transition", row: 6, col: 16, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴", electronegativity: 2.0, meltingPoint: 527, boilingPoint: 1235, discoveryYear: "1898" },
  { number: 85, symbol: "At", name: "Astatine", mass: "(210)", category: "halogen", row: 6, col: 17, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵", electronegativity: 2.2, meltingPoint: 575, boilingPoint: 610, discoveryYear: "1940" },
  { number: 86, symbol: "Rn", name: "Radon", mass: "(222)", category: "noble", row: 6, col: 18, electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶", electronegativity: 2.2, meltingPoint: 202, boilingPoint: 211, discoveryYear: "1900" },
  // Period 7
  { number: 87, symbol: "Fr", name: "Francium", mass: "(223)", category: "alkali", row: 7, col: 1, electronConfig: "[Rn] 7s¹", electronegativity: 0.7, meltingPoint: 300, boilingPoint: 950, discoveryYear: "1939" },
  { number: 88, symbol: "Ra", name: "Radium", mass: "(226)", category: "alkaline", row: 7, col: 2, electronConfig: "[Rn] 7s²", electronegativity: 0.9, meltingPoint: 973, boilingPoint: 2010, discoveryYear: "1898" },
  // Actinides (row 10)
  { number: 89, symbol: "Ac", name: "Actinium", mass: "(227)", category: "actinide", row: 10, col: 3, electronConfig: "[Rn] 6d¹ 7s²", electronegativity: 1.1, meltingPoint: 1323, boilingPoint: 3471, discoveryYear: "1899" },
  { number: 90, symbol: "Th", name: "Thorium", mass: "232.0", category: "actinide", row: 10, col: 4, electronConfig: "[Rn] 6d² 7s²", electronegativity: 1.3, meltingPoint: 2115, boilingPoint: 5061, discoveryYear: "1829" },
  { number: 91, symbol: "Pa", name: "Protactinium", mass: "231.0", category: "actinide", row: 10, col: 5, electronConfig: "[Rn] 5f² 6d¹ 7s²", electronegativity: 1.5, meltingPoint: 1841, boilingPoint: 4300, discoveryYear: "1913" },
  { number: 92, symbol: "U", name: "Uranium", mass: "238.0", category: "actinide", row: 10, col: 6, electronConfig: "[Rn] 5f³ 6d¹ 7s²", electronegativity: 1.38, meltingPoint: 1405, boilingPoint: 4404, discoveryYear: "1789" },
  { number: 93, symbol: "Np", name: "Neptunium", mass: "(237)", category: "actinide", row: 10, col: 7, electronConfig: "[Rn] 5f⁴ 6d¹ 7s²", electronegativity: 1.36, meltingPoint: 917, boilingPoint: 4273, discoveryYear: "1940" },
  { number: 94, symbol: "Pu", name: "Plutonium", mass: "(244)", category: "actinide", row: 10, col: 8, electronConfig: "[Rn] 5f⁶ 7s²", electronegativity: 1.28, meltingPoint: 913, boilingPoint: 3501, discoveryYear: "1940" },
  { number: 95, symbol: "Am", name: "Americium", mass: "(243)", category: "actinide", row: 10, col: 9, electronConfig: "[Rn] 5f⁷ 7s²", electronegativity: 1.3, meltingPoint: 1449, boilingPoint: 2880, discoveryYear: "1944" },
  { number: 96, symbol: "Cm", name: "Curium", mass: "(247)", category: "actinide", row: 10, col: 10, electronConfig: "[Rn] 5f⁷ 6d¹ 7s²", electronegativity: 1.3, meltingPoint: 1613, boilingPoint: 3383, discoveryYear: "1944" },
  { number: 97, symbol: "Bk", name: "Berkelium", mass: "(247)", category: "actinide", row: 10, col: 11, electronConfig: "[Rn] 5f⁹ 7s²", electronegativity: 1.3, meltingPoint: 1259, boilingPoint: 2900, discoveryYear: "1949" },
  { number: 98, symbol: "Cf", name: "Californium", mass: "(251)", category: "actinide", row: 10, col: 12, electronConfig: "[Rn] 5f¹⁰ 7s²", electronegativity: 1.3, meltingPoint: 1173, boilingPoint: 1743, discoveryYear: "1950" },
  { number: 99, symbol: "Es", name: "Einsteinium", mass: "(252)", category: "actinide", row: 10, col: 13, electronConfig: "[Rn] 5f¹¹ 7s²", electronegativity: 1.3, meltingPoint: 1133, boilingPoint: 1269, discoveryYear: "1952" },
  { number: 100, symbol: "Fm", name: "Fermium", mass: "(257)", category: "actinide", row: 10, col: 14, electronConfig: "[Rn] 5f¹² 7s²", electronegativity: 1.3, meltingPoint: 1800, boilingPoint: null, discoveryYear: "1952" },
  { number: 101, symbol: "Md", name: "Mendelevium", mass: "(258)", category: "actinide", row: 10, col: 15, electronConfig: "[Rn] 5f¹³ 7s²", electronegativity: 1.3, meltingPoint: 1100, boilingPoint: null, discoveryYear: "1955" },
  { number: 102, symbol: "No", name: "Nobelium", mass: "(259)", category: "actinide", row: 10, col: 16, electronConfig: "[Rn] 5f¹⁴ 7s²", electronegativity: 1.3, meltingPoint: 1100, boilingPoint: null, discoveryYear: "1958" },
  { number: 103, symbol: "Lr", name: "Lawrencium", mass: "(266)", category: "actinide", row: 10, col: 17, electronConfig: "[Rn] 5f¹⁴ 7s² 7p¹", electronegativity: 1.3, meltingPoint: 1900, boilingPoint: null, discoveryYear: "1961" },
  // Continue Period 7
  { number: 104, symbol: "Rf", name: "Rutherfordium", mass: "(267)", category: "transition", row: 7, col: 4, electronConfig: "[Rn] 5f¹⁴ 6d² 7s²", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "1964" },
  { number: 105, symbol: "Db", name: "Dubnium", mass: "(268)", category: "transition", row: 7, col: 5, electronConfig: "[Rn] 5f¹⁴ 6d³ 7s²", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "1967" },
  { number: 106, symbol: "Sg", name: "Seaborgium", mass: "(269)", category: "transition", row: 7, col: 6, electronConfig: "[Rn] 5f¹⁴ 6d⁴ 7s²", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "1974" },
  { number: 107, symbol: "Bh", name: "Bohrium", mass: "(270)", category: "transition", row: 7, col: 7, electronConfig: "[Rn] 5f¹⁴ 6d⁵ 7s²", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "1981" },
  { number: 108, symbol: "Hs", name: "Hassium", mass: "(277)", category: "transition", row: 7, col: 8, electronConfig: "[Rn] 5f¹⁴ 6d⁶ 7s²", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "1984" },
  { number: 109, symbol: "Mt", name: "Meitnerium", mass: "(278)", category: "unknown", row: 7, col: 9, electronConfig: "[Rn] 5f¹⁴ 6d⁷ 7s²", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "1982" },
  { number: 110, symbol: "Ds", name: "Darmstadtium", mass: "(281)", category: "unknown", row: 7, col: 10, electronConfig: "[Rn] 5f¹⁴ 6d⁸ 7s²", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "1994" },
  { number: 111, symbol: "Rg", name: "Roentgenium", mass: "(282)", category: "unknown", row: 7, col: 11, electronConfig: "[Rn] 5f¹⁴ 6d⁹ 7s²", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "1994" },
  { number: 112, symbol: "Cn", name: "Copernicium", mass: "(285)", category: "transition", row: 7, col: 12, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s²", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "1996" },
  { number: 113, symbol: "Nh", name: "Nihonium", mass: "(286)", category: "unknown", row: 7, col: 13, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "2003" },
  { number: 114, symbol: "Fl", name: "Flerovium", mass: "(289)", category: "unknown", row: 7, col: 14, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "1998" },
  { number: 115, symbol: "Mc", name: "Moscovium", mass: "(290)", category: "unknown", row: 7, col: 15, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "2003" },
  { number: 116, symbol: "Lv", name: "Livermorium", mass: "(293)", category: "unknown", row: 7, col: 16, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "2000" },
  { number: 117, symbol: "Ts", name: "Tennessine", mass: "(294)", category: "unknown", row: 7, col: 17, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "2010" },
  { number: 118, symbol: "Og", name: "Oganesson", mass: "(294)", category: "noble", row: 7, col: 18, electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶", electronegativity: null, meltingPoint: null, boilingPoint: null, discoveryYear: "2002" },
];

export const categoryLabels: Record<ElementCategory, string> = {
  alkali: "Alkali Metal",
  alkaline: "Alkaline Earth",
  transition: "Transition Metal",
  "post-transition": "Post-Transition",
  metalloid: "Metalloid",
  nonmetal: "Nonmetal",
  halogen: "Halogen",
  noble: "Noble Gas",
  lanthanide: "Lanthanide",
  actinide: "Actinide",
  unknown: "Unknown",
};
