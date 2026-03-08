export interface SlideElement {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  opacity?: number;
  rotation?: number;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  background: string;
  notes: string;
}

export type EditorMode = "edit" | "grid" | "present";

export interface SlideTheme {
  name: string;
  background: string;
  textColor: string;
  accentColor: string;
}

export const DEFAULT_THEMES: SlideTheme[] = [
  { name: "Dark", background: "hsl(220, 20%, 7%)", textColor: "hsl(210, 20%, 92%)", accentColor: "hsl(200, 80%, 55%)" },
  { name: "Light", background: "hsl(0, 0%, 98%)", textColor: "hsl(220, 20%, 10%)", accentColor: "hsl(200, 80%, 45%)" },
  { name: "Midnight", background: "hsl(240, 30%, 12%)", textColor: "hsl(240, 20%, 90%)", accentColor: "hsl(270, 70%, 60%)" },
  { name: "Forest", background: "hsl(150, 25%, 10%)", textColor: "hsl(140, 15%, 88%)", accentColor: "hsl(140, 60%, 50%)" },
  { name: "Warm", background: "hsl(30, 20%, 10%)", textColor: "hsl(35, 20%, 90%)", accentColor: "hsl(25, 80%, 55%)" },
];

export function createBlankSlide(): Slide {
  return {
    id: crypto.randomUUID(),
    elements: [
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 200,
        y: 400,
        width: 1520,
        height: 200,
        content: "Click to edit title",
        fontSize: 72,
        fontWeight: "700",
        color: "hsl(210, 20%, 92%)",
      },
      {
        id: crypto.randomUUID(),
        type: "text",
        x: 200,
        y: 620,
        width: 1520,
        height: 100,
        content: "Click to add subtitle",
        fontSize: 32,
        fontWeight: "400",
        color: "hsl(215, 15%, 55%)",
      },
    ],
    background: "hsl(220, 20%, 7%)",
    notes: "",
  };
}
