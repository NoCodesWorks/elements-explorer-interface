import { useState } from "react";
import { elements } from "@/data/elements";
import type { Element, ElementCategory } from "@/data/elements";
import { ElementCard } from "@/components/ElementCard";
import { ElementDetail } from "@/components/ElementDetail";
import { Legend } from "@/components/Legend";
import { TemperatureSlider } from "@/components/TemperatureSlider";

const Index = () => {
  const [highlighted, setHighlighted] = useState<ElementCategory | null>(null);
  const [selected, setSelected] = useState<Element | null>(null);
  const [temperature, setTemperature] = useState(298);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="text-center pt-6 pb-2 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-mono-code">
          Periodic Table
        </h1>
        <p className="text-sm text-muted-foreground mt-1">of the Elements</p>
      </header>

      {/* Temperature slider + phase legend */}
      <div className="flex flex-col items-center gap-2 px-4 pb-3">
        <TemperatureSlider temperature={temperature} onChange={setTemperature} />
        <div className="flex items-center gap-4 text-[0.65rem] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-phase-solid" /> Solid</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-phase-liquid" /> Liquid</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-phase-gas" /> Gas</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-phase-unknown" /> Unknown</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-2 pb-4 gap-4 overflow-x-auto">
        <div className="w-full max-w-[1200px]">
          <div
            className="grid gap-[2px] w-full"
            style={{
              gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
              gridTemplateRows: "repeat(10, minmax(0, auto))",
            }}
          >
            {elements.map((el) => (
              <ElementCard
                key={el.number}
                element={el}
                highlighted={highlighted}
                onHover={setHighlighted}
                onClick={setSelected}
                temperature={temperature}
              />
            ))}

            {/* Lanthanide / Actinide labels */}
            <div className="col-span-1 flex items-center justify-end pr-1" style={{ gridRow: 9, gridColumn: 2 }}>
              <span className="text-[0.5rem] text-element-lanthanide">57-71</span>
            </div>
            <div className="col-span-1 flex items-center justify-end pr-1" style={{ gridRow: 10, gridColumn: 2 }}>
              <span className="text-[0.5rem] text-element-actinide">89-103</span>
            </div>

            <div
              className="flex items-center justify-center border border-element-lanthanide/30 rounded-sm text-[0.4rem] text-element-lanthanide"
              style={{ gridRow: 6, gridColumn: 3 }}
            >
              57-71
            </div>
            <div
              className="flex items-center justify-center border border-element-actinide/30 rounded-sm text-[0.4rem] text-element-actinide"
              style={{ gridRow: 7, gridColumn: 3 }}
            >
              89-103
            </div>
          </div>
        </div>

        <Legend highlighted={highlighted} onHover={setHighlighted} />
      </div>

      {selected && <ElementDetail element={selected} onClose={() => setSelected(null)} temperature={temperature} />}
    </div>
  );
};

export default Index;
