import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSlideStore } from "@/slides/useSlideStore";
import { SlideToolbar } from "@/slides/SlideToolbar";
import { SlideCanvas } from "@/slides/SlideCanvas";
import { SlideThumbnail } from "@/slides/SlideThumbnail";
import { GridView } from "@/slides/GridView";
import { PresenterView } from "@/slides/PresenterView";
import { NotesPanel } from "@/slides/NotesPanel";

const SlidesPage = () => {
  const navigate = useNavigate();
  const store = useSlideStore();

  const handleGridSelect = useCallback((index: number) => {
    store.goTo(index);
    store.setMode("edit");
  }, [store]);

  const handleBack = useCallback(() => navigate("/"), [navigate]);

  if (store.mode === "present") {
    return (
      <PresenterView
        slides={store.slides}
        currentIndex={store.currentIndex}
        onNext={store.goNext}
        onPrev={store.goPrev}
        onExit={() => store.setMode("edit")}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <SlideToolbar
        mode={store.mode}
        currentIndex={store.currentIndex}
        totalSlides={store.slides.length}
        onSetMode={store.setMode}
        onAddSlide={() => store.addSlide()}
        onDeleteSlide={() => store.deleteSlide(store.currentIndex)}
        onDuplicateSlide={() => store.duplicateSlide(store.currentIndex)}
        onAddElement={(el) => store.addElement(store.currentIndex, el)}
        onSetBackground={(bg) => store.updateSlide(store.currentIndex, { background: bg })}
        onBack={handleBack}
      />

      {store.mode === "grid" ? (
        <GridView
          slides={store.slides}
          currentIndex={store.currentIndex}
          onSelect={handleGridSelect}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar thumbnails */}
          <div className="w-48 border-r border-border bg-card overflow-y-auto p-2 space-y-2 shrink-0">
            {store.slides.map((slide, i) => (
              <SlideThumbnail
                key={slide.id}
                slide={slide}
                index={i}
                isActive={i === store.currentIndex}
                onClick={() => store.goTo(i)}
              />
            ))}
          </div>

          {/* Main canvas + notes */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <SlideCanvas
              slide={store.currentSlide}
              slideIndex={store.currentIndex}
              selectedElementId={store.selectedElementId}
              onSelectElement={store.setSelectedElementId}
              onUpdateElement={store.updateElement}
              onDeleteElement={store.deleteElement}
            />
            <NotesPanel
              notes={store.currentSlide.notes}
              onChange={(notes) => store.updateSlide(store.currentIndex, { notes })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidesPage;
