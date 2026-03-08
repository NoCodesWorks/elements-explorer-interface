import { useRef, useState, useCallback } from "react";
import { ScaledSlide, SLIDE_W, SLIDE_H } from "./ScaledSlide";
import type { Slide, SlideElement } from "./types";

interface SlideCanvasProps {
  slide: Slide;
  slideIndex: number;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (slideIndex: number, elementId: string, patch: Partial<SlideElement>) => void;
  onDeleteElement: (slideIndex: number, elementId: string) => void;
  onAddElement?: (slideIndex: number, element: SlideElement) => void;
}

export function SlideCanvas({
  slide, slideIndex, selectedElementId,
  onSelectElement, onUpdateElement, onDeleteElement, onAddElement,
}: SlideCanvasProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);

  const handleCanvasClick = () => {
    onSelectElement(null);
    setEditingId(null);
  };

  const handleElementClick = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    onSelectElement(el.id);
  };

  const handleDoubleClick = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    if (el.type === "text") {
      setEditingId(el.id);
    }
  };

  const handleTextChange = (el: SlideElement, value: string) => {
    onUpdateElement(slideIndex, el.id, { content: value });
  };

  const handleTextBlur = () => {
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      if (selectedElementId && editingId !== selectedElementId) {
        e.preventDefault();
        onDeleteElement(slideIndex, selectedElementId);
      }
    }
    if (e.key === "Escape") {
      onSelectElement(null);
      setEditingId(null);
    }
  };

  // Drag logic (operates in slide coordinates)
  const handlePointerDown = (e: React.PointerEvent, el: SlideElement) => {
    if (editingId === el.id) return;
    e.stopPropagation();
    onSelectElement(el.id);
    const slideContainer = (e.currentTarget as HTMLElement).closest(".slide-content");
    if (!slideContainer) return;
    const rect = slideContainer.getBoundingClientRect();
    const scaleX = SLIDE_W / rect.width;
    const scaleY = SLIDE_H / rect.height;
    setDragging({
      id: el.id,
      startX: e.clientX * scaleX,
      startY: e.clientY * scaleY,
      elX: el.x,
      elY: el.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const slideContainer = (e.currentTarget as HTMLElement).closest(".slide-content");
    if (!slideContainer) return;
    const rect = slideContainer.getBoundingClientRect();
    const scaleX = SLIDE_W / rect.width;
    const scaleY = SLIDE_H / rect.height;
    const dx = e.clientX * scaleX - dragging.startX;
    const dy = e.clientY * scaleY - dragging.startY;
    onUpdateElement(slideIndex, dragging.id, {
      x: Math.round(dragging.elX + dx),
      y: Math.round(dragging.elY + dy),
    });
  };

  const handlePointerUp = () => {
    setDragging(null);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-background p-4" tabIndex={0} onKeyDown={handleKeyDown}>
      <ScaledSlide background={slide.background} className="w-full h-full">
        <div
          className="absolute inset-0"
          onClick={handleCanvasClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {slide.elements.map((el) => (
            <div
              key={el.id}
              className={`absolute cursor-move select-none ${
                selectedElementId === el.id ? "ring-2 ring-primary" : ""
              }`}
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                opacity: el.opacity ?? 1,
              }}
              onClick={(e) => handleElementClick(e, el)}
              onDoubleClick={(e) => handleDoubleClick(e, el)}
              onPointerDown={(e) => handlePointerDown(e, el)}
            >
              {el.type === "text" && editingId === el.id ? (
                <textarea
                  autoFocus
                  className="w-full h-full bg-transparent border-none outline-none resize-none"
                  style={{
                    fontSize: el.fontSize ?? 32,
                    fontWeight: el.fontWeight ?? "400",
                    color: el.color ?? "hsl(210, 20%, 92%)",
                    lineHeight: 1.2,
                  }}
                  value={el.content}
                  onChange={(e) => handleTextChange(el, e.target.value)}
                  onBlur={handleTextBlur}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : el.type === "text" ? (
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
        </div>
      </ScaledSlide>
    </div>
  );
}
