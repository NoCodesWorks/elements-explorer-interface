import { SlideThumbnail } from "./SlideThumbnail";
import type { Slide } from "./types";

interface GridViewProps {
  slides: Slide[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function GridView({ slides, currentIndex, onSelect }: GridViewProps) {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-[1400px] mx-auto">
        {slides.map((slide, i) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            index={i}
            isActive={i === currentIndex}
            onClick={() => onSelect(i)}
          />
        ))}
      </div>
    </div>
  );
}
