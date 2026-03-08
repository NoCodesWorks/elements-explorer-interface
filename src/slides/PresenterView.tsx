import { useEffect, useCallback } from "react";
import { ScaledSlide } from "./ScaledSlide";
import type { Slide } from "./types";

interface PresenterViewProps {
  slides: Slide[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}

export function PresenterView({ slides, currentIndex, onNext, onPrev, onExit }: PresenterViewProps) {
  const slide = slides[currentIndex];

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); onNext(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); onPrev(); }
    else if (e.key === "Escape") { onExit(); }
  }, [onNext, onPrev, onExit]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => {
      document.removeEventListener("keydown", handleKey);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, [handleKey]);

  // Handle exiting fullscreen externally
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) onExit();
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, [onExit]);

  if (!slide) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black cursor-none" onClick={onNext}>
      <ScaledSlide background={slide.background} className="w-full h-full">
        {slide.elements.map((el) => (
          <div
            key={el.id}
            className="absolute"
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              opacity: el.opacity ?? 1,
              transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
            }}
          >
            {el.type === "text" ? (
              <div
                className="w-full h-full whitespace-pre-wrap break-words"
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
            ) : el.type === "image" ? (
              <img src={el.content} alt="" className="w-full h-full object-contain" />
            ) : null}
          </div>
        ))}
      </ScaledSlide>
      <div className="absolute bottom-4 right-4 text-muted-foreground text-sm font-mono-code opacity-50">
        {currentIndex + 1} / {slides.length}
      </div>
    </div>
  );
}
