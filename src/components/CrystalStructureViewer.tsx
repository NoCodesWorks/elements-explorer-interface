import { mechanicalDatabase, type MechanicalProps } from "@/data/mechanicalProperties";

interface CrystalStructureViewerProps {
  data: MechanicalProps;
}

// Isometric projection helper
function iso(x: number, y: number, z: number, cx: number, cy: number, scale: number) {
  const px = cx + scale * (x - z) * Math.cos(Math.PI / 6);
  const py = cy - scale * (x + z) * Math.sin(Math.PI / 6) + scale * y;
  return { x: px, y: cy + (cy - py) }; // flip y for SVG
}

function BCCUnit({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  const corners = [
    [0,0,0],[1,0,0],[1,1,0],[0,1,0],
    [0,0,1],[1,0,1],[1,1,1],[0,1,1],
  ].map(([x,y,z]) => iso(x-0.5, y-0.5, z-0.5, cx, cy, scale));
  const center = iso(0, 0, 0, cx, cy, scale);
  
  const edges = [
    [0,1],[1,2],[2,3],[3,0], // bottom
    [4,5],[5,6],[6,7],[7,4], // top
    [0,4],[1,5],[2,6],[3,7], // verticals
  ];

  return (
    <g>
      {edges.map(([a,b], i) => (
        <line key={i} x1={corners[a].x} y1={corners[a].y} x2={corners[b].x} y2={corners[b].y}
          stroke="hsl(215, 15%, 40%)" strokeWidth={0.8} opacity={0.5} />
      ))}
      {corners.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={5} fill="hsl(200, 80%, 55%)" opacity={0.9} />
      ))}
      <circle cx={center.x} cy={center.y} r={5} fill="hsl(35, 85%, 55%)" opacity={0.9} />
      <text x={cx} y={cy + scale + 18} textAnchor="middle" className="fill-muted-foreground text-[7px]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}>BCC — Packing: 68%</text>
    </g>
  );
}

function FCCUnit({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  const corners = [
    [0,0,0],[1,0,0],[1,1,0],[0,1,0],
    [0,0,1],[1,0,1],[1,1,1],[0,1,1],
  ].map(([x,y,z]) => iso(x-0.5, y-0.5, z-0.5, cx, cy, scale));
  
  const facecenters = [
    [0.5,0.5,0],[0.5,0.5,1],[0.5,0,0.5],[0.5,1,0.5],[0,0.5,0.5],[1,0.5,0.5],
  ].map(([x,y,z]) => iso(x-0.5, y-0.5, z-0.5, cx, cy, scale));

  const edges = [
    [0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7],
  ];

  return (
    <g>
      {edges.map(([a,b], i) => (
        <line key={i} x1={corners[a].x} y1={corners[a].y} x2={corners[b].x} y2={corners[b].y}
          stroke="hsl(215, 15%, 40%)" strokeWidth={0.8} opacity={0.5} />
      ))}
      {corners.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={4.5} fill="hsl(200, 80%, 55%)" opacity={0.9} />
      ))}
      {facecenters.map((c, i) => (
        <circle key={`f${i}`} cx={c.x} cy={c.y} r={4.5} fill="hsl(140, 60%, 50%)" opacity={0.9} />
      ))}
      <text x={cx} y={cy + scale + 18} textAnchor="middle" className="fill-muted-foreground text-[7px]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}>FCC — Packing: 74%</text>
    </g>
  );
}

function HCPUnit({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  // Simplified HCP: hexagonal prism with atoms at corners + 3 interior
  const s = scale * 0.6;
  const pts: { x: number; y: number }[] = [];
  
  // Bottom hex
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    pts.push({ x: cx + s * Math.cos(angle), y: cy + 12 + s * Math.sin(angle) });
  }
  // Top hex
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    pts.push({ x: cx + s * Math.cos(angle), y: cy - 12 + s * Math.sin(angle) });
  }

  return (
    <g>
      {/* Bottom hex edges */}
      {[0,1,2,3,4,5].map(i => (
        <line key={`b${i}`} x1={pts[i].x} y1={pts[i].y} x2={pts[(i+1)%6].x} y2={pts[(i+1)%6].y}
          stroke="hsl(215, 15%, 40%)" strokeWidth={0.8} opacity={0.5} />
      ))}
      {/* Top hex edges */}
      {[6,7,8,9,10,11].map(i => (
        <line key={`t${i}`} x1={pts[i].x} y1={pts[i].y} x2={pts[i === 11 ? 6 : i+1].x} y2={pts[i === 11 ? 6 : i+1].y}
          stroke="hsl(215, 15%, 40%)" strokeWidth={0.8} opacity={0.5} />
      ))}
      {/* Verticals */}
      {[0,1,2,3,4,5].map(i => (
        <line key={`v${i}`} x1={pts[i].x} y1={pts[i].y} x2={pts[i+6].x} y2={pts[i+6].y}
          stroke="hsl(215, 15%, 40%)" strokeWidth={0.8} opacity={0.4} />
      ))}
      {/* Atoms */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="hsl(200, 80%, 55%)" opacity={0.9} />
      ))}
      {/* Interior atoms (3) */}
      {[0, 2, 4].map(i => {
        const midX = (pts[i].x + pts[i+6].x) / 2 + 4;
        const midY = (pts[i].y + pts[i+6].y) / 2;
        return <circle key={`in${i}`} cx={midX} cy={midY} r={4} fill="hsl(320, 60%, 55%)" opacity={0.9} />;
      })}
      <text x={cx} y={cy + scale + 18} textAnchor="middle" className="fill-muted-foreground text-[7px]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}>HCP — Packing: 74%</text>
    </g>
  );
}

function DiamondUnit({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  // Simplified: show tetrahedral coordination
  const center = { x: cx, y: cy };
  const s = scale * 0.5;
  const tetrahedral = [
    { x: cx, y: cy - s },
    { x: cx - s * 0.94, y: cy + s * 0.33 },
    { x: cx + s * 0.94, y: cy + s * 0.33 },
    { x: cx, y: cy + s * 0.8 },
  ];

  return (
    <g>
      {tetrahedral.map((p, i) => (
        <g key={i}>
          <line x1={center.x} y1={center.y} x2={p.x} y2={p.y}
            stroke="hsl(215, 15%, 40%)" strokeWidth={0.8} opacity={0.5} />
          <circle cx={p.x} cy={p.y} r={4} fill="hsl(200, 80%, 55%)" opacity={0.9} />
        </g>
      ))}
      <circle cx={center.x} cy={center.y} r={5} fill="hsl(35, 85%, 55%)" opacity={0.9} />
      <text x={cx} y={cy + scale + 18} textAnchor="middle" className="fill-muted-foreground text-[7px]"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}>Diamond Cubic — Packing: 34%</text>
    </g>
  );
}

export function CrystalStructureViewer({ data }: CrystalStructureViewerProps) {
  const cx = 90;
  const cy = 70;
  const scale = 40;

  const latticeStr = data.latticeParams.c
    ? `a = ${data.latticeParams.a} Å, c = ${data.latticeParams.c} Å`
    : `a = ${data.latticeParams.a} Å`;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={180} height={110} viewBox="0 0 180 110">
        {data.crystalStructure === "BCC" && <BCCUnit cx={cx} cy={cy - 5} scale={scale} />}
        {data.crystalStructure === "FCC" && <FCCUnit cx={cx} cy={cy - 5} scale={scale} />}
        {data.crystalStructure === "HCP" && <HCPUnit cx={cx} cy={cy - 5} scale={scale} />}
        {data.crystalStructure === "Diamond" && <DiamondUnit cx={cx} cy={cy - 5} scale={scale} />}
        {!["BCC", "FCC", "HCP", "Diamond"].includes(data.crystalStructure) && (
          <text x={cx} y={cy} textAnchor="middle" className="fill-foreground text-[9px]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {data.crystalStructure}
          </text>
        )}
      </svg>
      <span className="text-[0.6rem] font-mono-code text-muted-foreground">{latticeStr}</span>
    </div>
  );
}
