import type { Element } from "@/data/elements";

interface ElectronShellDiagramProps {
  element: Element;
}

const SHELL_LABELS = ["K", "L", "M", "N", "O", "P", "Q"];

export function ElectronShellDiagram({ element }: ElectronShellDiagramProps) {
  const { electronShells } = element;
  const shellCount = electronShells.length;
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const nucleusR = 16;
  const maxShellR = (size / 2) - 12;
  const shellGap = shellCount > 0 ? (maxShellR - nucleusR) / (shellCount + 0.5) : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[200px] h-auto"
        role="img"
        aria-label={`Electron shell diagram for ${element.name}`}
      >
        {/* Background glow */}
        <defs>
          <radialGradient id={`nucleus-glow-${element.number}`}>
            <stop offset="0%" stopColor="hsl(200, 80%, 55%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(200, 80%, 55%)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Nucleus glow */}
        <circle cx={cx} cy={cy} r={nucleusR + 6} fill={`url(#nucleus-glow-${element.number})`} />

        {/* Nucleus */}
        <circle cx={cx} cy={cy} r={nucleusR} fill="hsl(200, 80%, 55%)" opacity="0.9" />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-background text-[9px] font-bold"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {element.symbol}
        </text>

        {/* Shells */}
        {electronShells.map((electrons, i) => {
          const r = nucleusR + shellGap * (i + 1);
          const dots: { x: number; y: number }[] = [];
          for (let e = 0; e < electrons; e++) {
            const angle = (2 * Math.PI * e) / electrons - Math.PI / 2;
            dots.push({
              x: cx + r * Math.cos(angle),
              y: cy + r * Math.sin(angle),
            });
          }

          return (
            <g key={i}>
              {/* Shell orbit ring */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="hsl(215, 15%, 30%)"
                strokeWidth="0.6"
                strokeDasharray="3 2"
                opacity="0.6"
              />
              {/* Shell label */}
              <text
                x={cx + r + 1}
                y={cy - 3}
                className="fill-muted-foreground text-[5px]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {SHELL_LABELS[i]}
              </text>
              {/* Electrons */}
              {dots.map((d, j) => (
                <circle
                  key={j}
                  cx={d.x}
                  cy={d.y}
                  r={2.5}
                  fill="hsl(140, 60%, 50%)"
                  opacity="0.9"
                >
                  <animate
                    attributeName="opacity"
                    values="0.9;0.5;0.9"
                    dur={`${2 + i * 0.3}s`}
                    repeatCount="indefinite"
                    begin={`${j * 0.1}s`}
                  />
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex gap-1 flex-wrap justify-center">
        {electronShells.map((e, i) => (
          <span key={i} className="text-[0.6rem] font-mono-code text-muted-foreground">
            {SHELL_LABELS[i]}:{e}
          </span>
        ))}
      </div>
    </div>
  );
}
