import type { Element } from "@/data/elements";
import { parseElectronConfig, type Subshell } from "@/lib/electronConfig";

interface SubshellDiagramProps {
  element: Element;
}

const SUBSHELL_COLORS: Record<string, string> = {
  s: "hsl(200, 80%, 55%)",
  p: "hsl(140, 60%, 50%)",
  d: "hsl(35, 85%, 55%)",
  f: "hsl(320, 60%, 55%)",
};

const SUBSHELL_BG: Record<string, string> = {
  s: "hsl(200, 80%, 55%, 0.15)",
  p: "hsl(140, 60%, 50%, 0.15)",
  d: "hsl(35, 85%, 55%, 0.15)",
  f: "hsl(320, 60%, 55%, 0.15)",
};

function OrbitalBoxes({ subshell }: { subshell: Subshell }) {
  const orbitals = subshell.maxElectrons / 2;
  const boxes: { up: boolean; down: boolean }[] = [];

  // Hund's rule: fill spin-up first, then spin-down
  let remaining = subshell.electrons;
  for (let i = 0; i < orbitals; i++) {
    boxes.push({ up: false, down: false });
  }
  // First pass: one electron per orbital (spin up)
  for (let i = 0; i < orbitals && remaining > 0; i++) {
    boxes[i].up = true;
    remaining--;
  }
  // Second pass: pair electrons (spin down)
  for (let i = 0; i < orbitals && remaining > 0; i++) {
    boxes[i].down = true;
    remaining--;
  }

  const boxSize = 18;
  const gap = 2;
  const arrowH = 7;
  const totalW = orbitals * (boxSize + gap) - gap;
  const color = SUBSHELL_COLORS[subshell.l];
  const bg = SUBSHELL_BG[subshell.l];

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[0.55rem] font-mono-code text-muted-foreground">
        {subshell.n}{subshell.l}<sup>{subshell.electrons}</sup>
      </span>
      <svg width={totalW + 2} height={boxSize + 2} viewBox={`-1 -1 ${totalW + 2} ${boxSize + 2}`}>
        {boxes.map((box, i) => {
          const x = i * (boxSize + gap);
          return (
            <g key={i}>
              <rect
                x={x}
                y={0}
                width={boxSize}
                height={boxSize}
                fill={bg}
                stroke={color}
                strokeWidth={0.8}
                rx={2}
              />
              {/* Spin-up arrow (↑) */}
              {box.up && (
                <g transform={`translate(${x + boxSize / 2 - 2}, ${boxSize / 2 - arrowH / 2 + 1})`}>
                  <line x1={2} y1={arrowH} x2={2} y2={0} stroke={color} strokeWidth={1.5} />
                  <polyline points={`0,${arrowH * 0.35} 2,0 4,${arrowH * 0.35}`} fill="none" stroke={color} strokeWidth={1.2} />
                </g>
              )}
              {/* Spin-down arrow (↓) */}
              {box.down && (
                <g transform={`translate(${x + boxSize / 2 + 1}, ${boxSize / 2 - arrowH / 2 + 1})`}>
                  <line x1={2} y1={0} x2={2} y2={arrowH} stroke={color} strokeWidth={1.5} />
                  <polyline points={`0,${arrowH * 0.65} 2,${arrowH} 4,${arrowH * 0.65}`} fill="none" stroke={color} strokeWidth={1.2} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function SubshellDiagram({ element }: SubshellDiagramProps) {
  const subshells = parseElectronConfig(element.electronConfig);
  if (subshells.length === 0) return null;

  // Group by principal quantum number
  const grouped = new Map<number, Subshell[]>();
  for (const s of subshells) {
    if (!grouped.has(s.n)) grouped.set(s.n, []);
    grouped.get(s.n)!.push(s);
  }

  return (
    <div className="flex flex-col gap-2">
      {Array.from(grouped.entries()).map(([n, shells]) => (
        <div key={n} className="flex items-end gap-3">
          <span className="text-[0.6rem] font-mono-code text-muted-foreground w-4 text-right shrink-0">
            n={n}
          </span>
          <div className="flex items-end gap-2 flex-wrap">
            {shells.map((s, i) => (
              <OrbitalBoxes key={i} subshell={s} />
            ))}
          </div>
        </div>
      ))}
      {/* Legend */}
      <div className="flex gap-3 justify-center mt-1">
        {["s", "p", "d", "f"].map(l => (
          <span key={l} className="flex items-center gap-1 text-[0.55rem] text-muted-foreground">
            <span className="w-2 h-2 rounded-sm" style={{ background: SUBSHELL_COLORS[l] }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
