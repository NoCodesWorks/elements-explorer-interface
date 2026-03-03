// Parse electron configuration strings and generate subshell filling data

export interface Subshell {
  n: number;        // principal quantum number
  l: string;        // s, p, d, f
  electrons: number;
  maxElectrons: number;
}

const SUBSHELL_MAX: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 };

// Aufbau order for energy levels
const AUFBAU_ORDER: [number, string][] = [
  [1, "s"], [2, "s"], [2, "p"], [3, "s"], [3, "p"], [4, "s"], [3, "d"],
  [4, "p"], [5, "s"], [4, "d"], [5, "p"], [6, "s"], [4, "f"], [5, "d"],
  [6, "p"], [7, "s"], [5, "f"], [6, "d"], [7, "p"],
];

// Noble gas core electron counts
const NOBLE_CORES: Record<string, number> = {
  He: 2, Ne: 10, Ar: 18, Kr: 36, Xe: 54, Rn: 86,
};

const NOBLE_SUBSHELLS: Record<string, Subshell[]> = {
  He: [{ n: 1, l: "s", electrons: 2, maxElectrons: 2 }],
  Ne: [
    { n: 1, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 2, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 2, l: "p", electrons: 6, maxElectrons: 6 },
  ],
  Ar: [
    { n: 1, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 2, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 2, l: "p", electrons: 6, maxElectrons: 6 },
    { n: 3, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 3, l: "p", electrons: 6, maxElectrons: 6 },
  ],
  Kr: [
    { n: 1, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 2, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 2, l: "p", electrons: 6, maxElectrons: 6 },
    { n: 3, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 3, l: "p", electrons: 6, maxElectrons: 6 },
    { n: 4, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 3, l: "d", electrons: 10, maxElectrons: 10 },
    { n: 4, l: "p", electrons: 6, maxElectrons: 6 },
  ],
  Xe: [
    { n: 1, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 2, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 2, l: "p", electrons: 6, maxElectrons: 6 },
    { n: 3, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 3, l: "p", electrons: 6, maxElectrons: 6 },
    { n: 4, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 3, l: "d", electrons: 10, maxElectrons: 10 },
    { n: 4, l: "p", electrons: 6, maxElectrons: 6 },
    { n: 5, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 4, l: "d", electrons: 10, maxElectrons: 10 },
    { n: 5, l: "p", electrons: 6, maxElectrons: 6 },
  ],
  Rn: [
    { n: 1, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 2, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 2, l: "p", electrons: 6, maxElectrons: 6 },
    { n: 3, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 3, l: "p", electrons: 6, maxElectrons: 6 },
    { n: 4, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 3, l: "d", electrons: 10, maxElectrons: 10 },
    { n: 4, l: "p", electrons: 6, maxElectrons: 6 },
    { n: 5, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 4, l: "d", electrons: 10, maxElectrons: 10 },
    { n: 5, l: "p", electrons: 6, maxElectrons: 6 },
    { n: 6, l: "s", electrons: 2, maxElectrons: 2 },
    { n: 4, l: "f", electrons: 14, maxElectrons: 14 },
    { n: 5, l: "d", electrons: 10, maxElectrons: 10 },
    { n: 6, l: "p", electrons: 6, maxElectrons: 6 },
  ],
};

const SUPERSCRIPT_MAP: Record<string, number> = {
  "⁰": 0, "¹": 1, "²": 2, "³": 3, "⁴": 4,
  "⁵": 5, "⁶": 6, "⁷": 7, "⁸": 8, "⁹": 9,
};

function parseSuperscript(s: string): number {
  let result = 0;
  for (const ch of s) {
    if (SUPERSCRIPT_MAP[ch] !== undefined) {
      result = result * 10 + SUPERSCRIPT_MAP[ch];
    }
  }
  return result || 0;
}

export function parseElectronConfig(config: string): Subshell[] {
  const subshells: Subshell[] = [];

  // Check for noble gas core
  const coreMatch = config.match(/\[(\w+)\]/);
  if (coreMatch) {
    const coreSymbol = coreMatch[1];
    if (NOBLE_SUBSHELLS[coreSymbol]) {
      subshells.push(...NOBLE_SUBSHELLS[coreSymbol].map(s => ({ ...s })));
    }
  }

  // Parse remaining subshells: e.g. "3d¹⁰ 4s²"
  const remainder = config.replace(/\[.*?\]\s*/, "");
  const regex = /(\d)([spdf])([\u2070-\u2079\u00B2\u00B3\u00B9]+)/g;
  let match;
  while ((match = regex.exec(remainder)) !== null) {
    const n = parseInt(match[1]);
    const l = match[2];
    const electrons = parseSuperscript(match[3]);
    subshells.push({ n, l, electrons, maxElectrons: SUBSHELL_MAX[l] });
  }

  return subshells;
}

// Get subshells sorted by energy (Aufbau order)
export function getSubshellsByEnergy(subshells: Subshell[]): Subshell[] {
  const sorted: Subshell[] = [];
  for (const [n, l] of AUFBAU_ORDER) {
    const found = subshells.find(s => s.n === n && s.l === l);
    if (found) sorted.push(found);
  }
  return sorted;
}

// Approximate relative energy levels for visualization
export function getEnergyLevel(n: number, l: string): number {
  const lVal = { s: 0, p: 1, d: 2, f: 3 }[l] ?? 0;
  // Madelung rule approximation: n + l, with n as tiebreaker
  return (n + lVal) * 10 + n;
}
