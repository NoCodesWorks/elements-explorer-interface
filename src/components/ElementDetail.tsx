import type { Element } from "@/data/elements";
import { categoryLabels, getPhase } from "@/data/elements";
import { X } from "lucide-react";

const categoryBgMap: Record<string, string> = {
  alkali: "bg-element-alkali",
  alkaline: "bg-element-alkaline",
  transition: "bg-element-transition",
  "post-transition": "bg-element-post-transition",
  metalloid: "bg-element-metalloid",
  nonmetal: "bg-element-nonmetal",
  halogen: "bg-element-halogen",
  noble: "bg-element-noble",
  lanthanide: "bg-element-lanthanide",
  actinide: "bg-element-actinide",
  unknown: "bg-element-unknown",
};

interface ElementDetailProps {
  element: Element;
  onClose: () => void;
  temperature: number;
}

function formatTemp(k: number | null): string {
  if (k === null) return "—";
  return `${k} K (${(k - 273.15).toFixed(0)} °C)`;
}

export function ElementDetail({ element, onClose, temperature }: ElementDetailProps) {
  const phase = getPhase(element, temperature);
  const phaseLabel = phase === "unknown" ? "Unknown" : phase.charAt(0).toUpperCase() + phase.slice(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-card border border-border rounded-lg p-6 w-96 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-md flex items-center justify-center text-2xl font-bold ${categoryBgMap[element.category]} text-background`}>
            {element.symbol}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{element.name}</h2>
            <p className="text-sm text-muted-foreground font-mono-code">#{element.number}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Atomic Mass</span>
            <p className="font-mono-code text-foreground">{element.mass}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Category</span>
            <p className="text-foreground">{categoryLabels[element.category]}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Period</span>
            <p className="font-mono-code text-foreground">{element.row <= 7 ? element.row : element.row === 9 ? 6 : 7}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Group</span>
            <p className="font-mono-code text-foreground">{element.col}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Electronegativity</span>
            <p className="font-mono-code text-foreground">{element.electronegativity ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Discovery</span>
            <p className="font-mono-code text-foreground">{element.discoveryYear}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Melting Point</span>
            <p className="font-mono-code text-foreground text-[0.7rem]">{formatTemp(element.meltingPoint)}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Boiling Point</span>
            <p className="font-mono-code text-foreground text-[0.7rem]">{formatTemp(element.boilingPoint)}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Phase @ {temperature} K</span>
            <p className="text-foreground font-medium">{phaseLabel}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-muted-foreground text-xs">Electron Configuration</span>
          <p className="font-mono-code text-foreground text-sm mt-0.5">{element.electronConfig}</p>
        </div>
      </div>
    </div>
  );
}
