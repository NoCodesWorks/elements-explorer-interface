import { useState } from "react";
import { tttDiagrams, type TTTDiagram, type TTTCurve } from "@/data/tttData";

interface TTTDiagramViewerProps {
  initialAlloy?: string;
}

function drawCurve(
  curve: TTTCurve,
  scaleX: (v: number) => number,
  scaleY: (v: number) => number,
  color: string,
  dashed = false,
) {
  const pts = curve.points.map(([t, temp]) => `${scaleX(t)},${scaleY(temp)}`).join(" ");
  return (
    <polyline
      points={pts}
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeDasharray={dashed ? "4 2" : "none"}
      opacity={0.9}
    />
  );
}

export function TTTDiagramViewer({ initialAlloy }: TTTDiagramViewerProps) {
  const alloyKeys = Object.keys(tttDiagrams);
  const [selectedAlloy, setSelectedAlloy] = useState(initialAlloy ?? alloyKeys[0]);
  const diagram = tttDiagrams[selectedAlloy];

  if (!diagram) return null;

  const width = 420;
  const height = 320;
  const m = { top: 25, right: 20, bottom: 35, left: 50 };
  const plotW = width - m.left - m.right;
  const plotH = height - m.top - m.bottom;

  // X: log10(seconds) from -1 to 6
  const xMin = -1;
  const xMax = 6;
  // Y: temperature in °C from 0 to 900
  const yMin = 0;
  const yMax = 900;

  const scaleX = (logT: number) => m.left + ((logT - xMin) / (xMax - xMin)) * plotW;
  const scaleY = (temp: number) => m.top + ((yMax - temp) / (yMax - yMin)) * plotH;

  const { curves } = diagram;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Alloy selector */}
      <div className="flex gap-2">
        {alloyKeys.map(k => (
          <button
            key={k}
            onClick={() => setSelectedAlloy(k)}
            className={`px-2 py-0.5 rounded text-[0.6rem] font-mono-code border transition-colors ${
              selectedAlloy === k
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {tttDiagrams[k].alloyName}
          </button>
        ))}
      </div>

      <p className="text-[0.6rem] text-muted-foreground font-mono-code">{diagram.composition} · Austenitized {diagram.austenitizingTemp}°C</p>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[420px]">
        {/* Grid */}
        {[100, 200, 300, 400, 500, 600, 700, 800].map(t => (
          <g key={t}>
            <line x1={m.left} y1={scaleY(t)} x2={m.left + plotW} y2={scaleY(t)}
              stroke="hsl(215, 15%, 20%)" strokeWidth={0.5} />
            <text x={m.left - 4} y={scaleY(t) + 1} textAnchor="end" dominantBaseline="central"
              className="fill-muted-foreground text-[6px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {t}
            </text>
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5].map(logT => (
          <g key={logT}>
            <line x1={scaleX(logT)} y1={m.top} x2={scaleX(logT)} y2={m.top + plotH}
              stroke="hsl(215, 15%, 20%)" strokeWidth={0.5} />
            <text x={scaleX(logT)} y={m.top + plotH + 12} textAnchor="middle"
              className="fill-muted-foreground text-[6px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {logT === 0 ? "1s" : logT === 1 ? "10s" : logT === 2 ? "100s" : logT === 3 ? "~17m" : logT === 4 ? "~3h" : "~28h"}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1={m.left} y1={m.top} x2={m.left} y2={m.top + plotH} stroke="hsl(215, 15%, 35%)" strokeWidth={1} />
        <line x1={m.left} y1={m.top + plotH} x2={m.left + plotW} y2={m.top + plotH} stroke="hsl(215, 15%, 35%)" strokeWidth={1} />

        {/* Axis labels */}
        <text x={m.left + plotW / 2} y={height - 4} textAnchor="middle"
          className="fill-muted-foreground text-[7px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Time (log scale)
        </text>
        <text x={12} y={m.top + plotH / 2} textAnchor="middle"
          className="fill-muted-foreground text-[7px]"
          transform={`rotate(-90, 12, ${m.top + plotH / 2})`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Temperature (°C)
        </text>

        {/* Austenite region label */}
        <text x={scaleX(0.5)} y={scaleY(800)} className="fill-muted-foreground text-[7px]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }} opacity={0.6}>
          Austenite (γ)
        </text>

        {/* Ferrite curves */}
        {curves.ferrite_start && drawCurve(curves.ferrite_start, scaleX, scaleY, "hsl(35, 85%, 55%)")}

        {/* Pearlite curves */}
        {curves.pearlite_start && drawCurve(curves.pearlite_start, scaleX, scaleY, "hsl(15, 70%, 50%)")}
        {curves.pearlite_finish && drawCurve(curves.pearlite_finish, scaleX, scaleY, "hsl(15, 70%, 50%)", true)}

        {/* Bainite curves */}
        {curves.bainite_start && drawCurve(curves.bainite_start, scaleX, scaleY, "hsl(200, 80%, 55%)")}
        {curves.bainite_finish && drawCurve(curves.bainite_finish, scaleX, scaleY, "hsl(200, 80%, 55%)", true)}

        {/* Martensite lines */}
        <line x1={m.left} y1={scaleY(curves.martensite_start)} x2={m.left + plotW} y2={scaleY(curves.martensite_start)}
          stroke="hsl(320, 60%, 55%)" strokeWidth={1.5} />
        <text x={m.left + plotW - 2} y={scaleY(curves.martensite_start) - 4} textAnchor="end"
          className="text-[6px]" style={{ fontFamily: "'JetBrains Mono', monospace", fill: "hsl(320, 60%, 55%)" }}>
          Ms = {curves.martensite_start}°C
        </text>
        {curves.martensite_50 && (
          <>
            <line x1={m.left} y1={scaleY(curves.martensite_50)} x2={m.left + plotW} y2={scaleY(curves.martensite_50)}
              stroke="hsl(320, 60%, 55%)" strokeWidth={0.8} strokeDasharray="4 2" />
            <text x={m.left + plotW - 2} y={scaleY(curves.martensite_50) - 4} textAnchor="end"
              className="text-[5px]" style={{ fontFamily: "'JetBrains Mono', monospace", fill: "hsl(320, 60%, 55%)" }}>
              M50
            </text>
          </>
        )}
        {curves.martensite_90 && (
          <>
            <line x1={m.left} y1={scaleY(curves.martensite_90)} x2={m.left + plotW} y2={scaleY(curves.martensite_90)}
              stroke="hsl(320, 60%, 55%)" strokeWidth={0.8} strokeDasharray="4 2" />
            <text x={m.left + plotW - 2} y={scaleY(curves.martensite_90) - 4} textAnchor="end"
              className="text-[5px]" style={{ fontFamily: "'JetBrains Mono', monospace", fill: "hsl(320, 60%, 55%)" }}>
              M90
            </text>
          </>
        )}

        {/* Phase labels in regions */}
        {curves.pearlite_start && (
          <text x={scaleX(2.5)} y={scaleY(580)} textAnchor="middle"
            className="text-[7px]" style={{ fontFamily: "'JetBrains Mono', monospace", fill: "hsl(15, 70%, 50%)" }} opacity={0.7}>
            Pearlite
          </text>
        )}
        {curves.bainite_start && (
          <text x={scaleX(2.5)} y={scaleY(370)} textAnchor="middle"
            className="text-[7px]" style={{ fontFamily: "'JetBrains Mono', monospace", fill: "hsl(200, 80%, 55%)" }} opacity={0.7}>
            Bainite
          </text>
        )}
        <text x={scaleX(0)} y={scaleY(curves.martensite_start - 60)} textAnchor="start"
          className="text-[7px]" style={{ fontFamily: "'JetBrains Mono', monospace", fill: "hsl(320, 60%, 55%)" }} opacity={0.7}>
          Martensite
        </text>
      </svg>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap justify-center">
        <span className="flex items-center gap-1 text-[0.55rem] text-muted-foreground">
          <span className="w-4 h-[2px] inline-block" style={{ background: "hsl(35, 85%, 55%)" }} /> Ferrite
        </span>
        <span className="flex items-center gap-1 text-[0.55rem] text-muted-foreground">
          <span className="w-4 h-[2px] inline-block" style={{ background: "hsl(15, 70%, 50%)" }} /> Pearlite
        </span>
        <span className="flex items-center gap-1 text-[0.55rem] text-muted-foreground">
          <span className="w-4 h-[2px] inline-block" style={{ background: "hsl(200, 80%, 55%)" }} /> Bainite
        </span>
        <span className="flex items-center gap-1 text-[0.55rem] text-muted-foreground">
          <span className="w-4 h-[2px] inline-block" style={{ background: "hsl(320, 60%, 55%)" }} /> Martensite
        </span>
      </div>
    </div>
  );
}
