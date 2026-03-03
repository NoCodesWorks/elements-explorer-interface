import { useState } from "react";
import type { Element, ElementCategory } from "@/data/elements";

const categoryColorMap: Record<ElementCategory, string> = {
  alkali: "bg-element-alkali/20 border-element-alkali/50 hover:bg-element-alkali/35 hover:border-element-alkali",
  alkaline: "bg-element-alkaline/20 border-element-alkaline/50 hover:bg-element-alkaline/35 hover:border-element-alkaline",
  transition: "bg-element-transition/20 border-element-transition/50 hover:bg-element-transition/35 hover:border-element-transition",
  "post-transition": "bg-element-post-transition/20 border-element-post-transition/50 hover:bg-element-post-transition/35 hover:border-element-post-transition",
  metalloid: "bg-element-metalloid/20 border-element-metalloid/50 hover:bg-element-metalloid/35 hover:border-element-metalloid",
  nonmetal: "bg-element-nonmetal/20 border-element-nonmetal/50 hover:bg-element-nonmetal/35 hover:border-element-nonmetal",
  halogen: "bg-element-halogen/20 border-element-halogen/50 hover:bg-element-halogen/35 hover:border-element-halogen",
  noble: "bg-element-noble/20 border-element-noble/50 hover:bg-element-noble/35 hover:border-element-noble",
  lanthanide: "bg-element-lanthanide/20 border-element-lanthanide/50 hover:bg-element-lanthanide/35 hover:border-element-lanthanide",
  actinide: "bg-element-actinide/20 border-element-actinide/50 hover:bg-element-actinide/35 hover:border-element-actinide",
  unknown: "bg-element-unknown/20 border-element-unknown/50 hover:bg-element-unknown/35 hover:border-element-unknown",
};

const dimmedClass = "opacity-20";

interface ElementCardProps {
  element: Element;
  highlighted: ElementCategory | null;
  onHover: (cat: ElementCategory | null) => void;
  onClick: (el: Element) => void;
}

export function ElementCard({ element, highlighted, onHover, onClick }: ElementCardProps) {
  const isDimmed = highlighted !== null && highlighted !== element.category;

  return (
    <button
      className={`
        relative flex flex-col items-center justify-center
        border rounded-sm p-0.5 cursor-pointer
        transition-all duration-200 ease-out
        w-full aspect-square min-w-0
        ${categoryColorMap[element.category]}
        ${isDimmed ? dimmedClass : ""}
      `}
      style={{
        gridRow: element.row,
        gridColumn: element.col,
      }}
      onMouseEnter={() => onHover(element.category)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(element)}
    >
      <span className="text-[0.45rem] leading-none text-muted-foreground font-mono-code">
        {element.number}
      </span>
      <span className="text-xs sm:text-sm font-bold leading-tight text-foreground">
        {element.symbol}
      </span>
      <span className="text-[0.35rem] leading-none text-muted-foreground truncate w-full text-center hidden sm:block">
        {element.name}
      </span>
    </button>
  );
}
