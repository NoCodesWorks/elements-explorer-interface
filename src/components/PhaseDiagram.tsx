import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import type { PhaseDiagramData } from "@/data/dftData";

interface PhaseDiagramProps {
  data: PhaseDiagramData;
}

export function PhaseDiagram({ data }: PhaseDiagramProps) {
  return (
    <div className="mt-3 pt-3 border-t border-border">
      <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        Phase Diagram — {data.elementName}
      </h3>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 10, right: 15, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
            <XAxis
              dataKey="T"
              type="number"
              label={{ value: "Temperature (K)", position: "insideBottom", offset: -2, style: { fill: "hsl(215, 15%, 55%)", fontSize: 10 } }}
              tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 9 }}
              stroke="hsl(220, 15%, 20%)"
            />
            <YAxis
              dataKey="P"
              type="number"
              label={{ value: `Pressure (${data.pressureUnit})`, angle: -90, position: "insideLeft", offset: 10, style: { fill: "hsl(215, 15%, 55%)", fontSize: 10 } }}
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
              formatter={(value: number) => [`${value}`, ""]}
              labelFormatter={(label) => `T = ${label} K`}
            />
            {data.boundaries.map((boundary) => (
              <Line
                key={boundary.label}
                data={boundary.points}
                dataKey="P"
                name={boundary.label}
                stroke={boundary.color}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            ))}
            {data.triplePoint && (
              <ReferenceDot
                x={data.triplePoint.T}
                y={data.triplePoint.P}
                r={4}
                fill="hsl(45, 70%, 50%)"
                stroke="hsl(45, 70%, 50%)"
              />
            )}
            {data.criticalPoint && (
              <ReferenceDot
                x={data.criticalPoint.T}
                y={data.criticalPoint.P}
                r={4}
                fill="hsl(350, 70%, 55%)"
                stroke="hsl(350, 70%, 55%)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Phase regions legend */}
      <div className="flex flex-wrap gap-2 mt-2">
        {data.phases.map((phase) => (
          <span key={phase.name} className="text-[0.6rem] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
            {phase.name}
          </span>
        ))}
        {data.triplePoint && (
          <span className="text-[0.6rem] text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: "hsl(45, 70%, 50%)" }} /> Triple Pt
          </span>
        )}
        {data.criticalPoint && (
          <span className="text-[0.6rem] text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: "hsl(350, 70%, 55%)" }} /> Critical Pt
          </span>
        )}
      </div>

      {/* Boundary legend */}
      <div className="flex flex-wrap gap-3 mt-1.5">
        {data.boundaries.map((b) => (
          <span key={b.label} className="text-[0.55rem] text-muted-foreground flex items-center gap-1">
            <span className="w-3 h-0.5 rounded" style={{ background: b.color }} />
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
