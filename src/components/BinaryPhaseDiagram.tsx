import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { X } from "lucide-react";
import type { BinaryPhaseDiagramData } from "@/data/binaryPhaseDiagrams";

interface BinaryPhaseDiagramProps {
  data: BinaryPhaseDiagramData;
  onClose: () => void;
}

export function BinaryPhaseDiagram({ data, onClose }: BinaryPhaseDiagramProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-card border border-border rounded-lg p-6 w-[560px] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold text-foreground font-mono-code">
          {data.systemName} Binary Phase Diagram
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">at 1 atm — {data.notes}</p>

        {/* Chart */}
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 10, right: 15, bottom: 25, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 1]}
                ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                label={{
                  value: `${data.elementA} ← Atomic % ${data.elementB} →`,
                  position: "insideBottom",
                  offset: -12,
                  style: { fill: "hsl(215, 15%, 55%)", fontSize: 10 },
                }}
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 9 }}
                stroke="hsl(220, 15%, 20%)"
              />
              <YAxis
                dataKey="T"
                type="number"
                label={{
                  value: "Temperature (K)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: { fill: "hsl(215, 15%, 55%)", fontSize: 10 },
                }}
                tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 9 }}
                stroke="hsl(220, 15%, 20%)"
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(220, 18%, 12%)",
                  border: "1px solid hsl(220, 15%, 20%)",
                  borderRadius: 6,
                  fontSize: 11,
                  color: "hsl(210, 20%, 92%)",
                }}
                formatter={(value: number, name: string) => [`${value} K`, name]}
                labelFormatter={(label) => `x = ${(Number(label) * 100).toFixed(1)}% ${data.elementB}`}
              />
              {data.boundaries.map((boundary) => (
                <Line
                  key={boundary.label}
                  data={boundary.points}
                  dataKey="T"
                  name={boundary.label}
                  stroke={boundary.color}
                  strokeWidth={2}
                  strokeDasharray={boundary.dashed ? "5 3" : undefined}
                  dot={false}
                  type="monotone"
                />
              ))}
              {data.invariants.map((inv) => (
                <ReferenceDot
                  key={inv.label + inv.x}
                  x={inv.x}
                  y={inv.T}
                  r={4}
                  fill={
                    inv.type === "eutectic" ? "hsl(350, 70%, 55%)" :
                    inv.type === "eutectoid" ? "hsl(270, 55%, 60%)" :
                    inv.type === "peritectic" ? "hsl(45, 70%, 50%)" :
                    "hsl(200, 80%, 55%)"
                  }
                  stroke="none"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Phase regions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {data.regions.map((r) => (
            <span key={r.name} className="text-[0.6rem] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
              {r.name}
            </span>
          ))}
        </div>

        {/* Boundary legend */}
        <div className="flex flex-wrap gap-3 mt-2">
          {data.boundaries.map((b) => (
            <span key={b.label} className="text-[0.55rem] text-muted-foreground flex items-center gap-1">
              <span className="w-3 h-0.5 rounded" style={{ background: b.color, borderStyle: b.dashed ? "dashed" : "solid" }} />
              {b.label}
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
