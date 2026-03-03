import type { ElementCategory } from "@/data/elements";
import { categoryLabels } from "@/data/elements";

const legendItems: { category: ElementCategory; colorClass: string }[] = [
  { category: "alkali", colorClass: "bg-element-alkali" },
  { category: "alkaline", colorClass: "bg-element-alkaline" },
  { category: "transition", colorClass: "bg-element-transition" },
  { category: "post-transition", colorClass: "bg-element-post-transition" },
  { category: "metalloid", colorClass: "bg-element-metalloid" },
  { category: "nonmetal", colorClass: "bg-element-nonmetal" },
  { category: "halogen", colorClass: "bg-element-halogen" },
  { category: "noble", colorClass: "bg-element-noble" },
  { category: "lanthanide", colorClass: "bg-element-lanthanide" },
  { category: "actinide", colorClass: "bg-element-actinide" },
  { category: "unknown", colorClass: "bg-element-unknown" },
];

interface LegendProps {
  highlighted: ElementCategory | null;
  onHover: (cat: ElementCategory | null) => void;
}

export function Legend({ highlighted, onHover }: LegendProps) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
      {legendItems.map(({ category, colorClass }) => (
        <button
          key={category}
          className={`flex items-center gap-1.5 text-xs transition-opacity duration-200 ${
            highlighted !== null && highlighted !== category ? "opacity-30" : ""
          }`}
          onMouseEnter={() => onHover(category)}
          onMouseLeave={() => onHover(null)}
        >
          <span className={`w-2.5 h-2.5 rounded-sm ${colorClass}`} />
          <span className="text-muted-foreground">{categoryLabels[category]}</span>
        </button>
      ))}
    </div>
  );
}
