import type { Element } from "@/data/elements";
import { categoryLabels } from "@/data/elements";
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
}

export function ElementDetail({ element, onClose }: ElementDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-card border border-border rounded-lg p-6 w-80 shadow-2xl"
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
        </div>
      </div>
    </div>
  );
}
