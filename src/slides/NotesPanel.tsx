import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface NotesPanelProps {
  notes: string;
  onChange: (notes: string) => void;
}

export function NotesPanel({ notes, onChange }: NotesPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border-t border-border bg-card shrink-0">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-1.5 text-xs text-muted-foreground hover:bg-secondary transition-colors"
      >
        <span>Speaker Notes</span>
        {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {!collapsed && (
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add speaker notes..."
          className="w-full h-24 px-4 py-2 text-sm bg-transparent text-foreground border-none outline-none resize-none placeholder:text-muted-foreground"
        />
      )}
    </div>
  );
}
