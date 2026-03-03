import { useState, useCallback, useRef, useMemo } from "react";
import { X } from "lucide-react";
import type { BinaryPhaseDiagramData, PhaseZone, BinaryBoundary } from "@/data/binaryPhaseDiagrams";

// Point-in-polygon using ray casting
function pointInPolygon(x: number, y: number, polygon: [number, number][]): boolean {
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

function findZone(x: number, T: number, zones: PhaseZone[]): PhaseZone | null {
  for (const zone of zones) {
    if (pointInPolygon(x, T, zone.polygon)) return zone;
  }
  return null;
}

interface BinaryPhaseDiagramProps {
  data: BinaryPhaseDiagramData;
  onClose: () => void;
}

export function BinaryPhaseDiagram({ data, onClose }: BinaryPhaseDiagramProps) {
  const [hoveredZone, setHoveredZone] = useState<PhaseZone | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; T: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Chart layout constants
  const width = 520;
  const height = 340;
  const margin = { top: 20, right: 20, bottom: 40, left: 55 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // Compute T range from data
  const { minT, maxT } = useMemo(() => {
    const allT = [
      ...data.boundaries.flatMap((b) => b.points.map((p) => p.T)),
      ...data.zones.flatMap((z) => z.polygon.map(([, T]) => T)),
    ];
    const lo = Math.min(...allT);
    const hi = Math.max(...allT);
    // Round to nice values
    return { minT: Math.floor(lo / 50) * 50 - 50, maxT: Math.ceil(hi / 50) * 50 + 50 };
  }, [data]);

  // Map data coords to SVG pixel coords
  const xScale = useCallback((v: number) => margin.left + v * plotW, [plotW]);
  const yScale = useCallback((T: number) => margin.top + plotH - ((T - minT) / (maxT - minT)) * plotH, [plotH, minT, maxT]);

  // Reverse map
  const xInv = useCallback((px: number) => (px - margin.left) / plotW, [plotW]);
  const yInv = useCallback((py: number) => maxT - ((py - margin.top) / plotH) * (maxT - minT), [plotH, minT, maxT]);

  // Build SVG path for a polygon
  const polygonPath = useCallback(
    (polygon: [number, number][]) =>
      polygon.map(([x, T], i) => `${i === 0 ? "M" : "L"}${xScale(x)},${yScale(T)}`).join(" ") + " Z",
    [xScale, yScale],
  );

  // Build SVG path for a boundary
  const boundaryPath = useCallback(
    (b: BinaryBoundary) =>
      b.points.map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.x)},${yScale(p.T)}`).join(" "),
    [xScale, yScale],
  );

  // Centroid of polygon for label placement
  const centroid = useCallback(
    (polygon: [number, number][]): [number, number] => {
      // Clip polygon to visible area
      const clipped = polygon.map(([x, T]) => [
        Math.max(0, Math.min(1, x)),
        Math.max(minT, Math.min(maxT, T)),
      ] as [number, number]);
      const cx = clipped.reduce((s, [x]) => s + x, 0) / clipped.length;
      const cT = clipped.reduce((s, [, T]) => s + T, 0) / clipped.length;
      return [xScale(cx), yScale(cT)];
    },
    [xScale, yScale, minT, maxT],
  );

  // Axis ticks
  const xTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const yTickCount = 8;
  const yTicks = useMemo(() => {
    const step = Math.round((maxT - minT) / yTickCount / 50) * 50;
    const ticks: number[] = [];
    for (let t = Math.ceil(minT / step) * step; t <= maxT; t += step) ticks.push(t);
    return ticks;
  }, [minT, maxT]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px < margin.left || px > margin.left + plotW || py < margin.top || py > margin.top + plotH) {
        setHoveredZone(null);
        setCursorPos(null);
        return;
      }
      const xVal = xInv(px);
      const tVal = yInv(py);
      const zone = findZone(xVal, tVal, data.zones);
      setHoveredZone(zone);
      setCursorPos({ x: xVal, T: Math.round(tVal) });
    },
    [data.zones, xInv, yInv, plotW, plotH],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-card border border-border rounded-lg p-6 w-[600px] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold text-foreground font-mono-code">
          {data.systemName} Binary Phase Diagram
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">at 1 atm — {data.notes}</p>

        {/* Hover zone indicator */}
        <div className="h-6 mt-2 flex items-center gap-2">
          {hoveredZone ? (
            <div className="flex items-center gap-2 text-xs animate-in fade-in duration-150">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: hoveredZone.color }} />
              <span className="font-medium text-foreground">{hoveredZone.name}</span>
              {cursorPos && (
                <span className="text-muted-foreground font-mono-code text-[0.65rem]">
                  ({(cursorPos.x * 100).toFixed(1)}% {data.elementB}, {cursorPos.T} K)
                </span>
              )}
            </div>
          ) : (
            <span className="text-[0.65rem] text-muted-foreground italic">Hover over the chart to identify phase regions</span>
          )}
        </div>

        {/* SVG Chart */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full mt-1 cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { setHoveredZone(null); setCursorPos(null); }}
        >
          {/* Clip path for plot area */}
          <defs>
            <clipPath id="plotClip">
              <rect x={margin.left} y={margin.top} width={plotW} height={plotH} />
            </clipPath>
          </defs>

          {/* Background */}
          <rect x={margin.left} y={margin.top} width={plotW} height={plotH} fill="hsl(220, 18%, 10%)" />

          {/* Filled phase zones */}
          <g clipPath="url(#plotClip)">
            {data.zones.map((zone) => (
              <path
                key={zone.name}
                d={polygonPath(zone.polygon)}
                fill={zone.color}
                fillOpacity={0.25}
                stroke="none"
              />
            ))}
          </g>

          {/* Grid lines */}
          <g>
            {xTicks.map((t) => (
              <line key={`gx${t}`} x1={xScale(t)} y1={margin.top} x2={xScale(t)} y2={margin.top + plotH} stroke="hsl(220, 15%, 18%)" strokeDasharray="2 3" />
            ))}
            {yTicks.map((t) => (
              <line key={`gy${t}`} x1={margin.left} y1={yScale(t)} x2={margin.left + plotW} y2={yScale(t)} stroke="hsl(220, 15%, 18%)" strokeDasharray="2 3" />
            ))}
          </g>

          {/* Phase boundaries */}
          <g clipPath="url(#plotClip)">
            {data.boundaries.map((b) => (
              <path
                key={b.label}
                d={boundaryPath(b)}
                fill="none"
                stroke={b.color}
                strokeWidth={2}
                strokeDasharray={b.dashed ? "6 3" : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* Invariant points */}
          {data.invariants.map((inv) => (
            <g key={inv.label + inv.x}>
              <circle
                cx={xScale(inv.x)}
                cy={yScale(inv.T)}
                r={4}
                fill={
                  inv.type === "eutectic" ? "hsl(350, 70%, 55%)" :
                  inv.type === "eutectoid" ? "hsl(270, 55%, 60%)" :
                  inv.type === "peritectic" ? "hsl(45, 70%, 50%)" :
                  "hsl(200, 80%, 55%)"
                }
              />
              <text
                x={xScale(inv.x)}
                y={yScale(inv.T) - 8}
                textAnchor="middle"
                fill="hsl(210, 20%, 80%)"
                fontSize={7}
                fontFamily="monospace"
              >
                {inv.T} K
              </text>
            </g>
          ))}

          {/* Inline phase region labels */}
          <g clipPath="url(#plotClip)">
            {data.zones.map((zone) => {
              const [cx, cy] = centroid(zone.polygon);
              return (
                <text
                  key={`label-${zone.name}`}
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="hsl(210, 20%, 90%)"
                  fontSize={8}
                  fontWeight="600"
                  fontFamily="monospace"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {zone.name}
                </text>
              );
            })}
          </g>

          {/* X axis */}
          <line x1={margin.left} y1={margin.top + plotH} x2={margin.left + plotW} y2={margin.top + plotH} stroke="hsl(220, 15%, 30%)" />
          {xTicks.map((t) => (
            <g key={`xt${t}`}>
              <line x1={xScale(t)} y1={margin.top + plotH} x2={xScale(t)} y2={margin.top + plotH + 4} stroke="hsl(220, 15%, 30%)" />
              <text x={xScale(t)} y={margin.top + plotH + 14} textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize={9}>
                {(t * 100).toFixed(0)}%
              </text>
            </g>
          ))}
          <text x={margin.left + plotW / 2} y={height - 4} textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize={10}>
            {data.elementA} ← Atomic % {data.elementB} →
          </text>

          {/* Y axis */}
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotH} stroke="hsl(220, 15%, 30%)" />
          {yTicks.map((t) => (
            <g key={`yt${t}`}>
              <line x1={margin.left - 4} y1={yScale(t)} x2={margin.left} y2={yScale(t)} stroke="hsl(220, 15%, 30%)" />
              <text x={margin.left - 6} y={yScale(t) + 3} textAnchor="end" fill="hsl(215, 15%, 55%)" fontSize={9}>
                {t}
              </text>
            </g>
          ))}
          <text
            x={14}
            y={margin.top + plotH / 2}
            textAnchor="middle"
            fill="hsl(215, 15%, 55%)"
            fontSize={10}
            transform={`rotate(-90, 14, ${margin.top + plotH / 2})`}
          >
            Temperature (K)
          </text>

          {/* Plot border */}
          <rect x={margin.left} y={margin.top} width={plotW} height={plotH} fill="none" stroke="hsl(220, 15%, 30%)" />
        </svg>

        {/* Phase regions legend */}
        <div className="flex flex-wrap gap-2 mt-3">
          {data.regions.map((r) => (
            <span key={r.name} className="text-[0.6rem] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
              {r.name}
            </span>
          ))}
        </div>

        {/* Invariant reactions */}
        {data.invariants.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <h3 className="text-xs font-medium text-muted-foreground mb-1.5">Invariant Reactions</h3>
            {data.invariants.map((inv) => (
              <div key={inv.label + inv.x} className="text-[0.65rem] text-foreground mb-1 font-mono-code">
                <span className="text-muted-foreground">{inv.type} @ {inv.T} K:</span>{" "}
                {inv.description}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
