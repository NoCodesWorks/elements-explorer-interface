import type { Element } from "@/data/elements";
import { parseElectronConfig, getSubshellsByEnergy, getEnergyLevel, type Subshell } from "@/lib/electronConfig";

interface EnergyBandDiagramProps {
  element: Element;
}

const SUBSHELL_COLORS: Record<string, string> = {
  s: "hsl(200, 80%, 55%)",
  p: "hsl(140, 60%, 50%)",
  d: "hsl(35, 85%, 55%)",
  f: "hsl(320, 60%, 55%)",
};

export function EnergyBandDiagram({ element }: EnergyBandDiagramProps) {
  const subshells = parseElectronConfig(element.electronConfig);
  if (subshells.length === 0) return null;

  const sorted = getSubshellsByEnergy(subshells);

  // Calculate energy positions
  const energyLevels = sorted.map(s => getEnergyLevel(s.n, s.l));
  const minE = Math.min(...energyLevels);
  const maxE = Math.max(...energyLevels);
  const range = maxE - minE || 1;

  const width = 260;
  const height = Math.min(280, sorted.length * 32 + 40);
  const margin = { top: 20, bottom: 20, left: 40, right: 20 };
  const plotH = height - margin.top - margin.bottom;
  const plotW = width - margin.left - margin.right;

  const getY = (energy: number) => {
    return margin.top + plotH - ((energy - minE) / range) * plotH;
  };

  // Group by energy level to space them horizontally if same level
  const levelGroups = new Map<number, { subshell: Subshell; index: number }[]>();
  sorted.forEach((s, i) => {
    const e = energyLevels[i];
    if (!levelGroups.has(e)) levelGroups.set(e, []);
    levelGroups.get(e)!.push({ subshell: s, index: i });
  });

  const lineW = 30;
  const arrowH = 8;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Energy axis */}
        <line
          x1={margin.left - 10}
          y1={margin.top}
          x2={margin.left - 10}
          y2={margin.top + plotH}
          stroke="hsl(215, 15%, 30%)"
          strokeWidth={1}
        />
        <text
          x={margin.left - 22}
          y={margin.top + plotH / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-muted-foreground text-[7px]"
          transform={`rotate(-90, ${margin.left - 22}, ${margin.top + plotH / 2})`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Energy →
        </text>
        {/* Arrow at top */}
        <polyline
          points={`${margin.left - 14},${margin.top + 5} ${margin.left - 10},${margin.top - 3} ${margin.left - 6},${margin.top + 5}`}
          fill="none"
          stroke="hsl(215, 15%, 30%)"
          strokeWidth={1}
        />

        {/* Energy levels */}
        {sorted.map((s, i) => {
          const y = getY(energyLevels[i]);
          const color = SUBSHELL_COLORS[s.l];
          const orbitals = s.maxElectrons / 2;

          // Determine x offset based on group position
          const group = levelGroups.get(energyLevels[i])!;
          const groupIdx = group.findIndex(g => g.index === i);
          const totalGroupW = group.length * (orbitals * (lineW / orbitals + 4));
          const baseX = margin.left + (plotW - totalGroupW) / 2 + groupIdx * (orbitals * (lineW / orbitals + 4));

          // Build orbital lines with electrons
          const orbBoxes: { up: boolean; down: boolean }[] = [];
          let rem = s.electrons;
          for (let o = 0; o < orbitals; o++) orbBoxes.push({ up: false, down: false });
          for (let o = 0; o < orbitals && rem > 0; o++) { orbBoxes[o].up = true; rem--; }
          for (let o = 0; o < orbitals && rem > 0; o++) { orbBoxes[o].down = true; rem--; }

          const orbW = lineW;
          const orbGap = 6;
          const totalOrbW = orbitals * orbW + (orbitals - 1) * orbGap;
          const startX = baseX + (orbitals * (lineW / orbitals + 4) - totalOrbW) / 2;

          return (
            <g key={i}>
              {/* Label */}
              <text
                x={startX - 4}
                y={y + 1}
                textAnchor="end"
                dominantBaseline="central"
                className="text-[6px]"
                style={{ fontFamily: "'JetBrains Mono', monospace", fill: color }}
              >
                {s.n}{s.l}
              </text>
              {orbBoxes.map((box, j) => {
                const ox = startX + j * (orbW + orbGap);
                return (
                  <g key={j}>
                    {/* Horizontal line */}
                    <line
                      x1={ox}
                      y1={y}
                      x2={ox + orbW}
                      y2={y}
                      stroke={color}
                      strokeWidth={1.5}
                      opacity={0.8}
                    />
                    {/* Up arrow */}
                    {box.up && (
                      <g transform={`translate(${ox + orbW / 2 - 3}, ${y - arrowH - 1})`}>
                        <line x1={2} y1={arrowH} x2={2} y2={0} stroke={color} strokeWidth={1.5} />
                        <polyline points={`0,3 2,0 4,3`} fill="none" stroke={color} strokeWidth={1} />
                      </g>
                    )}
                    {/* Down arrow */}
                    {box.down && (
                      <g transform={`translate(${ox + orbW / 2 + 1}, ${y - arrowH - 1})`}>
                        <line x1={2} y1={0} x2={2} y2={arrowH} stroke={color} strokeWidth={1.5} />
                        <polyline points={`0,${arrowH - 3} 2,${arrowH} 4,${arrowH - 3}`} fill="none" stroke={color} strokeWidth={1} />
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
