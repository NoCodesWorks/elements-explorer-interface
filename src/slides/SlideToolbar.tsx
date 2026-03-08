import { useRef } from "react";
import {
  Plus, Trash2, Copy, Grid, Play, Type, Square, ChevronLeft,
  Palette, Image,
} from "lucide-react";
import type { EditorMode, SlideElement } from "./types";
import { DEFAULT_THEMES } from "./types";

interface SlideToolbarProps {
  mode: EditorMode;
  currentIndex: number;
  totalSlides: number;
  onSetMode: (m: EditorMode) => void;
  onAddSlide: () => void;
  onDeleteSlide: () => void;
  onDuplicateSlide: () => void;
  onAddElement: (el: SlideElement) => void;
  onSetBackground: (bg: string) => void;
  onBack: () => void;
}

export function SlideToolbar({
  mode, currentIndex, totalSlides,
  onSetMode, onAddSlide, onDeleteSlide, onDuplicateSlide,
  onAddElement, onSetBackground, onBack,
}: SlideToolbarProps) {
  const addTextBox = () => {
    onAddElement({
      id: crypto.randomUUID(),
      type: "text",
      x: 400,
      y: 300,
      width: 800,
      height: 120,
      content: "New text",
      fontSize: 48,
      fontWeight: "400",
      color: "hsl(210, 20%, 92%)",
    });
  };

  const addShape = () => {
    onAddElement({
      id: crypto.randomUUID(),
      type: "shape",
      x: 660,
      y: 340,
      width: 600,
      height: 400,
      content: "",
      backgroundColor: "hsl(200, 80%, 55%)",
      borderRadius: 16,
      opacity: 0.3,
    });
  };

  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          const maxW = 1200;
          const maxH = 800;
          const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);
          onAddElement({
            id: crypto.randomUUID(),
            type: "image",
            x: Math.round((1920 - w) / 2),
            y: Math.round((1080 - h) / 2),
            width: w,
            height: h,
            content: reader.result as string,
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-3 gap-1 shrink-0">
      <button onClick={onBack} className="p-2 rounded-md hover:bg-secondary text-muted-foreground" title="Back to app">
        <ChevronLeft size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <span className="text-sm font-mono-code text-muted-foreground px-2">
        {currentIndex + 1} / {totalSlides}
      </span>

      <div className="w-px h-6 bg-border mx-1" />

      <button onClick={onAddSlide} className="p-2 rounded-md hover:bg-secondary text-muted-foreground" title="Add slide">
        <Plus size={16} />
      </button>
      <button onClick={onDuplicateSlide} className="p-2 rounded-md hover:bg-secondary text-muted-foreground" title="Duplicate">
        <Copy size={16} />
      </button>
      <button onClick={onDeleteSlide} className="p-2 rounded-md hover:bg-secondary text-destructive" title="Delete slide">
        <Trash2 size={16} />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button onClick={addTextBox} className="p-2 rounded-md hover:bg-secondary text-muted-foreground" title="Add text">
        <Type size={16} />
      </button>
      <button onClick={addShape} className="p-2 rounded-md hover:bg-secondary text-muted-foreground" title="Add shape">
        <Square size={16} />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Theme swatches */}
      <div className="flex items-center gap-1">
        <Palette size={14} className="text-muted-foreground mr-1" />
        {DEFAULT_THEMES.map((theme) => (
          <button
            key={theme.name}
            onClick={() => onSetBackground(theme.background)}
            className="w-5 h-5 rounded-full border border-border hover:ring-2 ring-primary transition-all"
            style={{ background: theme.background }}
            title={theme.name}
          />
        ))}
      </div>

      <div className="flex-1" />

      <button
        onClick={() => onSetMode(mode === "grid" ? "edit" : "grid")}
        className={`p-2 rounded-md transition-colors ${mode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}
        title="Grid view"
      >
        <Grid size={16} />
      </button>
      <button
        onClick={() => onSetMode("present")}
        className="p-2 rounded-md hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors"
        title="Present (F5)"
      >
        <Play size={16} />
      </button>
    </div>
  );
}
