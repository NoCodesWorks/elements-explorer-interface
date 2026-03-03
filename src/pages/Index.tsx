import { useState, useCallback } from "react";
import { elements } from "@/data/elements";
import type { Element, ElementCategory } from "@/data/elements";
import { ElementCard } from "@/components/ElementCard";
import { ElementDetail } from "@/components/ElementDetail";
import { Legend } from "@/components/Legend";
import { TemperatureSlider } from "@/components/TemperatureSlider";
import { BinaryPhaseDiagram } from "@/components/BinaryPhaseDiagram";
import type { SimulationResult } from "@/components/BinaryPhaseDiagram";
import { SimulationLoader } from "@/components/SimulationLoader";
import { getBinaryDiagram } from "@/data/binaryPhaseDiagrams";
import { FlaskConical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [highlighted, setHighlighted] = useState<ElementCategory | null>(null);
  const [selected, setSelected] = useState<Element | null>(null);
  const [temperature, setTemperature] = useState(298);

  // Binary phase diagram mode
  const [binaryMode, setBinaryMode] = useState(false);
  const [binarySelection, setBinarySelection] = useState<[Element | null, Element | null]>([null, null]);
  const [binaryDiagramOpen, setBinaryDiagramOpen] = useState(false);
  const [binaryError, setBinaryError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const handleElementClick = useCallback(
    (el: Element) => {
      if (!binaryMode) {
        setSelected(el);
        return;
      }
      // Binary selection logic
      if (binarySelection[0]?.number === el.number) {
        setBinarySelection([null, binarySelection[1]]);
        setBinaryError(null);
        return;
      }
      if (binarySelection[1]?.number === el.number) {
        setBinarySelection([binarySelection[0], null]);
        setBinaryError(null);
        return;
      }
      if (!binarySelection[0]) {
        setBinarySelection([el, binarySelection[1]]);
        setBinaryError(null);
      } else if (!binarySelection[1]) {
        setBinarySelection([binarySelection[0], el]);
        setBinaryError(null);
      } else {
        // Replace second
        setBinarySelection([binarySelection[0], el]);
        setBinaryError(null);
      }
    },
    [binaryMode, binarySelection],
  );

  const getSelectionIndex = (el: Element): number | undefined => {
    if (!binaryMode) return undefined;
    if (binarySelection[0]?.number === el.number) return 1;
    if (binarySelection[1]?.number === el.number) return 2;
    return undefined;
  };

  const handleGenerate = () => {
    if (!binarySelection[0] || !binarySelection[1]) return;
    const diagram = getBinaryDiagram(binarySelection[0].number, binarySelection[1].number);
    if (!diagram) {
      setBinaryError(
        `No CALPHAD data available for ${binarySelection[0].symbol}–${binarySelection[1].symbol}. Try: Fe–C, Cu–Zn, Al–Cu, Ti–Al, Ni–Al, Pb–Sn, Si–Ge, Au–Cu, Fe–Ni, Cu–Sn, Al–Si, Ag–Cu.`,
      );
      return;
    }
    setBinaryError(null);
    setSimulationResult(null);
    setSimulating(true);

    // Fire the backend simulation request in parallel with the loading animation
    supabase.functions
      .invoke("binary-simulation", {
        body: {
          elementA: binarySelection[0].number,
          elementB: binarySelection[1].number,
          symbolA: binarySelection[0].symbol,
          symbolB: binarySelection[1].symbol,
        },
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Simulation error:", error);
          toast.error("Backend simulation failed — showing CALPHAD data only");
        } else if (data) {
          setSimulationResult(data as SimulationResult);
        }
      });
  };

  const handleSimulationComplete = () => {
    setSimulating(false);
    setBinaryDiagramOpen(true);
  };

  const toggleBinaryMode = () => {
    setBinaryMode((prev) => {
      if (prev) {
        setBinarySelection([null, null]);
        setBinaryError(null);
      }
      return !prev;
    });
  };

  const binaryDiagramData =
    binarySelection[0] && binarySelection[1]
      ? getBinaryDiagram(binarySelection[0].number, binarySelection[1].number)
      : null;

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

      {/* Binary Phase Diagram toggle */}
      <div className="flex justify-center px-4 pb-3">
        <button
          onClick={toggleBinaryMode}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
            binaryMode
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <FlaskConical size={14} />
          {binaryMode ? "Exit Binary Phase Diagram Mode" : "Binary Phase Diagram"}
        </button>
      </div>

      {/* Binary selection bar */}
      {binaryMode && (
        <div className="flex flex-col items-center gap-2 px-4 pb-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground text-xs">Select two elements:</span>
            <span className={`px-2 py-0.5 rounded text-xs font-mono-code border ${binarySelection[0] ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}>
              {binarySelection[0] ? `① ${binarySelection[0].symbol} (${binarySelection[0].name})` : "① Click element A"}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-mono-code border ${binarySelection[1] ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"}`}>
              {binarySelection[1] ? `② ${binarySelection[1].symbol} (${binarySelection[1].name})` : "② Click element B"}
            </span>
            {binarySelection[0] && binarySelection[1] && (
              <button
                onClick={handleGenerate}
                className="px-3 py-1 rounded-md text-xs font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
              >
                Generate Diagram
              </button>
            )}
          </div>
          {binaryError && (
            <p className="text-xs text-destructive max-w-md text-center">{binaryError}</p>
          )}
        </div>
      )}

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
                onClick={handleElementClick}
                temperature={temperature}
                selectionIndex={getSelectionIndex(el)}
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

      {!binaryMode && selected && <ElementDetail element={selected} onClose={() => setSelected(null)} temperature={temperature} />}

      {simulating && binarySelection[0] && binarySelection[1] && (
        <SimulationLoader
          systemName={`${binarySelection[0].symbol}–${binarySelection[1].symbol}`}
          onComplete={handleSimulationComplete}
        />
      )}

      {binaryDiagramOpen && binaryDiagramData && (
        <BinaryPhaseDiagram
          data={binaryDiagramData}
          onClose={() => setBinaryDiagramOpen(false)}
          simulationResult={simulationResult}
        />
      )}
    </div>
  );
};

export default Index;
