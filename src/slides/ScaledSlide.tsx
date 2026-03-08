import { useRef, useEffect, useState, type ReactNode } from "react";

const SLIDE_W = 1920;
const SLIDE_H = 1080;

interface ScaledSlideProps {
  children: ReactNode;
  background?: string;
  className?: string;
  onClick?: () => void;
}

export function ScaledSlide({ children, background, className = "", onClick }: ScaledSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setScale(Math.min(width / SLIDE_W, height / SLIDE_H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`} onClick={onClick}>
      <div
        className="absolute slide-content"
        style={{
          width: SLIDE_W,
          height: SLIDE_H,
          left: "50%",
          top: "50%",
          marginLeft: -SLIDE_W / 2,
          marginTop: -SLIDE_H / 2,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          background: background || "hsl(220, 20%, 7%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export { SLIDE_W, SLIDE_H };
