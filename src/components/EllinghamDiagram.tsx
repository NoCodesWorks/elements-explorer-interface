import { useState } from "react";
import { ellinghamReactions, type EllinghamReaction } from "@/data/ellinghamData";

interface EllinghamDiagramProps {
  highlightElement?: number; // atomic number to highlight
}

export function EllinghamDiagram({ highlightElement }: EllinghamDiagramProps) {
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);

  const width = 420;
  const height = 320;
  const m = { top: 25, right: 20, bottom: 35, left: 55 };
  const plotW = width - m.left - m.right;
  const plotH = height - m.top - m.bottom;

  const tMin = 200;
  const tMax = 2600;
  const gMin = -1300;
  const gMax = 100;

  const scaleX = (t: number) => m.left + ((t - tMin) / (tMax - tMin)) * plotW;
  const scaleY = (g: number) => m.top + ((gMax - g) / (gMax - gMin)) * plotH;

  const calcG = (r: EllinghamReaction, t: number) => r.intercept + r.slope * t;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[420px]">
        {/* Grid */}
        {[-1200, -1000, -800, -600, -400, -200, 0].map(g => (
          <g key={g}>
            <line x1={m.left} y1={scaleY(g)} x2={m.left + plotW} y2={scaleY(g)}
              stroke="hsl(215, 15%, 20%)" strokeWidth={0.5} />
            <text x={m.left - 4} y={scaleY(g) + 1} textAnchor="end" dominantBaseline="central"
              className="fill-muted-foreground text-[6px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {g}
            </text>
          </g>
        ))}
        {[500, 1000, 1500, 2000, 2500].map(t => (
          <g key={t}>
            <line x1={scaleX(t)} y1={m.top} x2={scaleX(t)} y2={m.top + plotH}
              stroke="hsl(215, 15%, 20%)" strokeWidth={0.5} />
            <text x={scaleX(t)} y={m.top + plotH + 12} textAnchor="middle"
              className="fill-muted-foreground text-[6px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {t}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1={m.left} y1={m.top} x2={m.left} y2={m.top + plotH} stroke="hsl(215, 15%, 35%)" strokeWidth={1} />
        <line x1={m.left} y1={m.top + plotH} x2={m.left + plotW} y2={m.top + plotH} stroke="hsl(215, 15%, 35%)" strokeWidth={1} />

        {/* Axis labels */}
        <text x={m.left + plotW / 2} y={height - 4} textAnchor="middle"
          className="fill-muted-foreground text-[7px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Temperature (K)
        </text>
        <text x={12} y={m.top + plotH / 2} textAnchor="middle"
          className="fill-muted-foreground text-[7px]"
          transform={`rotate(-90, 12, ${m.top + plotH / 2})`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          ΔG° (kJ/mol O₂)
        </text>

        {/* Zero line */}
        <line x1={m.left} y1={scaleY(0)} x2={m.left + plotW} y2={scaleY(0)}
          stroke="hsl(0, 60%, 40%)" strokeWidth={0.8} strokeDasharray="4 2" opacity={0.6} />

        {/* Reaction lines */}
        {ellinghamReactions.map((r) => {
          const isHighlighted = highlightElement ? r.elementNumber === highlightElement : false;
          const isHovered = hoveredReaction === r.shortLabel;
          const opacity = hoveredReaction ? (isHovered ? 1 : 0.2) : (highlightElement ? (isHighlighted ? 1 : 0.35) : 0.8);

          const t1 = Math.max(r.tMin, tMin);
          const t2 = Math.min(r.tMax, tMax);
          const g1 = calcG(r, t1);
          const g2 = calcG(r, t2);

          return (
            <g key={r.shortLabel}
              onMouseEnter={() => setHoveredReaction(r.shortLabel)}
              onMouseLeave={() => setHoveredReaction(null)}
              style={{ cursor: "pointer" }}
            >
              <line
                x1={scaleX(t1)} y1={scaleY(g1)}
                x2={scaleX(t2)} y2={scaleY(g2)}
                stroke={r.color}
                strokeWidth={isHighlighted || isHovered ? 2.5 : 1.5}
                opacity={opacity}
              />
              {/* Melting point marker */}
              {r.meltingPoint && r.meltingPoint >= t1 && r.meltingPoint <= t2 && (
                <circle
                  cx={scaleX(r.meltingPoint)}
                  cy={scaleY(calcG(r, r.meltingPoint))}
                  r={3}
                  fill="none"
                  stroke={r.color}
                  strokeWidth={1.5}
                  opacity={opacity}
                />
              )}
              {/* Label at end */}
              <text
                x={scaleX(t2) + 2}
                y={scaleY(g2)}
                dominantBaseline="central"
                className="text-[5.5px]"
                style={{ fontFamily: "'JetBrains Mono', monospace", fill: r.color }}
                opacity={opacity}
              >
                {r.shortLabel}
              </text>
              {/* Tooltip on hover */}
              {isHovered && (
                <text
                  x={scaleX((t1 + t2) / 2)}
                  y={scaleY(calcG(r, (t1 + t2) / 2)) - 8}
                  textAnchor="middle"
                  className="text-[6px]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fill: r.color }}
                >
                  {r.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="text-[0.55rem] text-muted-foreground text-center">○ = metal melting point · Lines below = spontaneous oxidation</p>
    </div>
  );
}
