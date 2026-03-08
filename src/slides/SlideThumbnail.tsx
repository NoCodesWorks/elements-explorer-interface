import { ScaledSlide } from "./ScaledSlide";
import type { Slide } from "./types";

interface SlideThumbnailProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function SlideThumbnail({ slide, index, isActive, onClick }: SlideThumbnailProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full aspect-video rounded-md overflow-hidden border-2 transition-colors ${
        isActive ? "border-primary" : "border-border hover:border-muted-foreground"
      }`}
    >
      <ScaledSlide background={slide.background} className="w-full h-full pointer-events-none">
        {slide.elements.map((el) => (
          <div
            key={el.id}
            className="absolute"
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
            }}
          >
            {el.type === "text" ? (
              <div
                className="w-full h-full whitespace-pre-wrap break-words overflow-hidden"
                style={{
                  fontSize: el.fontSize ?? 32,
                  fontWeight: el.fontWeight ?? "400",
                  color: el.color ?? "hsl(210, 20%, 92%)",
                  lineHeight: 1.2,
                }}
              >
                {el.content}
              </div>
            ) : el.type === "shape" ? (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: el.backgroundColor ?? "hsl(200, 80%, 55%)",
                  borderRadius: el.borderRadius ?? 0,
                }}
              />
            ) : null}
          </div>
        ))}
      </ScaledSlide>
      <div className={`absolute bottom-1 left-1 text-[10px] font-mono-code px-1 rounded ${
        isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
      }`}>
        {index + 1}
      </div>
    </button>
  );
}
