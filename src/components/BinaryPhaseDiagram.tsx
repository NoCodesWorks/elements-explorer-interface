import { useState, useCallback, useRef, useMemo } from "react";
import { X, AlertTriangle, ChevronDown, ChevronUp, ZoomIn, Info, Lock, Unlock } from "lucide-react";
import type { BinaryPhaseDiagramData, PhaseZone, BinaryBoundary, DataSource } from "@/data/binaryPhaseDiagrams";
import { validatePhaseDiagram, type ConsistencyViolation } from "@/lib/phaseConsistency";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

export interface SimulationResult {
  system: string;
  compounds: {
    formula: string;
    materialId: string;
    formationEnergy: number | null;
    energyAboveHull: number | null;
    bandGap: number | null;
    isMetal: boolean | null;
    density: number | null;
    spaceGroup: string | null;
    bulkModulus: number | null;
    shearModulus: number | null;
  }[];
  aiAnalysis: string | null;
  timestamp: string;
}

const SOURCE_BADGE_CONFIG: Record<DataSource, { label: string; className: string; tooltip: string }> = {
  calphad: {
    label: "Verified (CALPHAD)",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    tooltip: "Established thermodynamic data from assessed CALPHAD databases. High confidence.",
  },
  materials_project: {
    label: "Experimental (Materials Project)",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    tooltip: "Approximate diagram derived from DFT formation energies via Materials Project. Moderate confidence.",
  },
  ml_predicted: {
    label: "ML-Predicted (Estimated)",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    tooltip: "Phase boundaries predicted by ML classifier based on elemental properties. Use with caution.",
  },
};

interface BinaryPhaseDiagramProps {
  data: BinaryPhaseDiagramData;
  onClose: () => void;
  simulationResult?: SimulationResult | null;
  confidence?: string | null;
  reasoning?: string | null;
}

export function BinaryPhaseDiagram({ data, onClose, simulationResult, confidence, reasoning }: BinaryPhaseDiagramProps) {
  const [hoveredZone, setHoveredZone] = useState<PhaseZone | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; T: number } | null>(null);
  const [violationsOpen, setViolationsOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Adaptive x-axis scaling with metadata support
  const metadata = data.metadata;
  const defaultMax = metadata?.defaultRange?.[1] ?? data.maxComposition ?? 1.0;
  const fullMax = metadata?.fullRange?.[1] ?? 1.0;
  const [xMax, setXMax] = useState(defaultMax);
  const [fullRangeUnlocked, setFullRangeUnlocked] = useState(false);

  const dataSource = data.dataSource ?? "calphad";
  const badgeConfig = SOURCE_BADGE_CONFIG[dataSource];

  // Physical consistency check
  const violations = useMemo(() => validatePhaseDiagram(data), [data]);
  const hasViolations = violations.length > 0;

  const toggleFullRange = useCallback(() => {
    setFullRangeUnlocked(prev => {
      const next = !prev;
      setXMax(next ? fullMax : defaultMax);
      return next;
    });
  }, [fullMax, defaultMax]);

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
    return { minT: Math.floor(lo / 50) * 50 - 50, maxT: Math.ceil(hi / 50) * 50 + 50 };
  }, [data]);

  // Map data coords to SVG pixel coords
  const xScale = useCallback((v: number) => margin.left + (v / xMax) * plotW, [plotW, xMax]);
  const yScale = useCallback((T: number) => margin.top + plotH - ((T - minT) / (maxT - minT)) * plotH, [plotH, minT, maxT]);
  const xInv = useCallback((px: number) => ((px - margin.left) / plotW) * xMax, [plotW, xMax]);
  const yInv = useCallback((py: number) => maxT - ((py - margin.top) / plotH) * (maxT - minT), [plotH, minT, maxT]);

  const polygonPath = useCallback(
    (polygon: [number, number][]) =>
      polygon.map(([x, T], i) => `${i === 0 ? "M" : "L"}${xScale(x)},${yScale(T)}`).join(" ") + " Z",
    [xScale, yScale],
  );

  const boundaryPath = useCallback(
    (b: BinaryBoundary) =>
      b.points.map((p, i) => `${i === 0 ? "M" : "L"}${xScale(p.x)},${yScale(p.T)}`).join(" "),
    [xScale, yScale],
  );

  const centroid = useCallback(
    (polygon: [number, number][]): [number, number] => {
      const clipped = polygon.map(([x, T]) => [
        Math.max(0, Math.min(xMax, x)),
        Math.max(minT, Math.min(maxT, T)),
      ] as [number, number]);
      const cx = clipped.reduce((s, [x]) => s + x, 0) / clipped.length;
      const cT = clipped.reduce((s, [, T]) => s + T, 0) / clipped.length;
      return [xScale(cx), yScale(cT)];
    },
    [xScale, yScale, minT, maxT, xMax],
  );

  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const count = 5;
    for (let i = 0; i <= count; i++) ticks.push((i / count) * xMax);
    return ticks;
  }, [xMax]);

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
    <TooltipProvider>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
        <div
          className="relative bg-card border border-border rounded-lg p-6 w-[620px] shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} aria-label="Close phase diagram" className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>

          {/* Title + Source Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-foreground font-mono-code">
              {data.systemName} Binary Phase Diagram
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-medium border cursor-help ${badgeConfig.className}`}>
                  {badgeConfig.label}
                  <Info size={9} />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[250px] text-xs">
                {badgeConfig.tooltip}
              </TooltipContent>
            </Tooltip>
            {hasViolations && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.6rem] font-medium bg-destructive/15 text-destructive border border-destructive/30">
                <AlertTriangle size={10} />
                High Uncertainty
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">at 1 atm — {data.notes}</p>

          {/* ML confidence info */}
          {dataSource === "ml_predicted" && confidence && (
            <div className="mt-2 px-2 py-1.5 rounded bg-amber-500/5 border border-amber-500/20 text-[0.65rem] text-amber-300/90">
              <span className="font-medium">Confidence: {confidence}</span>
              {reasoning && <span className="text-muted-foreground ml-2">— {reasoning}</span>}
            </div>
          )}

          {/* Zoom slider + Unlock Full Range */}
          <div className="flex items-center gap-2 mt-3 px-1">
            <ZoomIn size={12} className="text-muted-foreground shrink-0" />
            <span className="text-[0.6rem] text-muted-foreground whitespace-nowrap">X-Axis Max:</span>
            <Slider
              min={Math.min(0.05, defaultMax)}
              max={fullRangeUnlocked ? 1.0 : fullMax}
              step={0.01}
              value={[xMax]}
              onValueChange={([v]) => setXMax(v)}
              className="flex-1"
            />
            <span className="text-[0.6rem] font-mono-code text-foreground w-12 text-right">
              {(xMax * 100).toFixed(0)}%
            </span>
            {defaultMax < fullMax && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleFullRange}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[0.55rem] font-medium border transition-colors ${
                      fullRangeUnlocked
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                    }`}
                  >
                    {fullRangeUnlocked ? <Unlock size={9} /> : <Lock size={9} />}
                    {fullRangeUnlocked ? "Full Range" : "Unlock"}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {fullRangeUnlocked ? "Click to return to default composition range" : "Unlock full composition range for research"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

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
            <defs>
              <clipPath id="plotClip">
                <rect x={margin.left} y={margin.top} width={plotW} height={plotH} />
              </clipPath>
            </defs>

            <rect x={margin.left} y={margin.top} width={plotW} height={plotH} fill="hsl(220, 18%, 10%)" />

            {/* Filled phase zones */}
            <g clipPath="url(#plotClip)">
              {data.zones.map((zone) => (
                <path key={zone.name} d={polygonPath(zone.polygon)} fill={zone.color} fillOpacity={0.25} stroke="none" />
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
                <path key={b.label} d={boundaryPath(b)} fill="none" stroke={b.color} strokeWidth={2} strokeDasharray={b.dashed ? "6 3" : undefined} strokeLinecap="round" strokeLinejoin="round" />
              ))}
            </g>

            {/* Invariant points */}
            {data.invariants.map((inv) => (
              <g key={inv.label + inv.x}>
                <circle
                  cx={xScale(inv.x)} cy={yScale(inv.T)} r={4}
                  fill={
                    inv.type === "eutectic" ? "hsl(350, 70%, 55%)" :
                    inv.type === "eutectoid" ? "hsl(270, 55%, 60%)" :
                    inv.type === "peritectic" ? "hsl(45, 70%, 50%)" :
                    "hsl(200, 80%, 55%)"
                  }
                />
                <text x={xScale(inv.x)} y={yScale(inv.T) - 8} textAnchor="middle" fill="hsl(210, 20%, 80%)" fontSize={7} fontFamily="monospace">
                  {inv.T} K
                </text>
              </g>
            ))}

            {/* Inline phase region labels */}
            <g clipPath="url(#plotClip)">
              {data.zones.map((zone) => {
                const [cx, cy] = centroid(zone.polygon);
                return (
                  <text key={`label-${zone.name}`} x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="hsl(210, 20%, 90%)" fontSize={8} fontWeight="600" fontFamily="monospace" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
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
                  {(t * 100).toFixed(xMax < 0.1 ? 1 : 0)}%
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
            <text x={14} y={margin.top + plotH / 2} textAnchor="middle" fill="hsl(215, 15%, 55%)" fontSize={10} transform={`rotate(-90, 14, ${margin.top + plotH / 2})`}>
              Temperature (K)
            </text>

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

          {/* Consistency violations */}
          {hasViolations && (
            <div className="mt-3 pt-3 border-t border-border">
              <button onClick={() => setViolationsOpen(!violationsOpen)} className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors">
                <AlertTriangle size={12} />
                {violations.length} consistency {violations.length === 1 ? "issue" : "issues"} detected
                {violationsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {violationsOpen && (
                <div className="mt-2 space-y-1">
                  {violations.map((v, i) => (
                    <div key={i} className="text-[0.6rem] font-mono-code text-muted-foreground flex items-start gap-1.5">
                      <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${v.severity === "error" ? "bg-destructive" : "bg-yellow-500"}`} />
                      {v.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

          {/* Materials Project compounds */}
          {simulationResult && simulationResult.compounds.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <h3 className="text-xs font-medium text-muted-foreground mb-1.5">
                Materials Project Compounds ({simulationResult.compounds.length})
              </h3>
              <div className="max-h-[120px] overflow-y-auto space-y-1">
                {simulationResult.compounds
                  .filter((c) => c.energyAboveHull !== null && c.energyAboveHull <= 0.05)
                  .slice(0, 8)
                  .map((c) => (
                    <div key={c.materialId} className="text-[0.6rem] font-mono-code text-foreground flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{c.formula}</span>
                      {c.formationEnergy != null && <span className="text-muted-foreground">ΔHf={c.formationEnergy.toFixed(3)} eV/atom</span>}
                      {c.spaceGroup && <span className="text-muted-foreground">{c.spaceGroup}</span>}
                      {c.isMetal != null && (
                        <span className={`text-[0.55rem] px-1 rounded ${c.isMetal ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                          {c.isMetal ? "metal" : "non-metal"}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* AI Phase Analysis */}
          {simulationResult?.aiAnalysis && (
            <div className="mt-3 pt-3 border-t border-border">
              <h3 className="text-xs font-medium text-muted-foreground mb-1.5">AI Phase Analysis</h3>
              <div className="text-[0.65rem] text-foreground/90 leading-relaxed prose prose-invert prose-xs max-w-none whitespace-pre-wrap">
                {simulationResult.aiAnalysis}
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
