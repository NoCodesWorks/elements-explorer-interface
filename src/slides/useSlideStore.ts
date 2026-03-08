import { useState, useCallback } from "react";
import { Slide, SlideElement, EditorMode, createBlankSlide } from "./types";

export function useSlideStore() {
  const [slides, setSlides] = useState<Slide[]>([createBlankSlide()]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<EditorMode>("edit");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const currentSlide = slides[currentIndex] ?? slides[0];

  const addSlide = useCallback((afterIndex?: number) => {
    const idx = afterIndex ?? currentIndex;
    setSlides(prev => {
      const next = [...prev];
      next.splice(idx + 1, 0, createBlankSlide());
      return next;
    });
    setCurrentIndex(idx + 1);
  }, [currentIndex]);

  const deleteSlide = useCallback((index: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== index));
    setCurrentIndex(prev => Math.min(prev, slides.length - 2));
  }, [slides.length]);

  const duplicateSlide = useCallback((index: number) => {
    setSlides(prev => {
      const dup = JSON.parse(JSON.stringify(prev[index])) as Slide;
      dup.id = crypto.randomUUID();
      dup.elements = dup.elements.map(el => ({ ...el, id: crypto.randomUUID() }));
      const next = [...prev];
      next.splice(index + 1, 0, dup);
      return next;
    });
  }, []);

  const updateSlide = useCallback((index: number, patch: Partial<Slide>) => {
    setSlides(prev => prev.map((s, i) => i === index ? { ...s, ...patch } : s));
  }, []);

  const updateElement = useCallback((slideIndex: number, elementId: string, patch: Partial<SlideElement>) => {
    setSlides(prev => prev.map((s, i) => {
      if (i !== slideIndex) return s;
      return { ...s, elements: s.elements.map(el => el.id === elementId ? { ...el, ...patch } : el) };
    }));
  }, []);

  const addElement = useCallback((slideIndex: number, element: SlideElement) => {
    setSlides(prev => prev.map((s, i) => {
      if (i !== slideIndex) return s;
      return { ...s, elements: [...s.elements, element] };
    }));
    setSelectedElementId(element.id);
  }, []);

  const deleteElement = useCallback((slideIndex: number, elementId: string) => {
    setSlides(prev => prev.map((s, i) => {
      if (i !== slideIndex) return s;
      return { ...s, elements: s.elements.filter(el => el.id !== elementId) };
    }));
    setSelectedElementId(null);
  }, []);

  const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    setSlides(prev => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
    setCurrentIndex(toIndex);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, slides.length - 1)));
    setSelectedElementId(null);
  }, [slides.length]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  return {
    slides, currentSlide, currentIndex, mode, selectedElementId,
    setMode, setSelectedElementId, goTo, goNext, goPrev,
    addSlide, deleteSlide, duplicateSlide, updateSlide,
    updateElement, addElement, deleteElement, reorderSlides,
  };
}
