import { useState, useCallback, useEffect, useRef } from "react";
import { elements } from "@/data/elements";
import type { Element, ElementCategory } from "@/data/elements";
import { ElementCard } from "@/components/ElementCard";
import { ElementDetail } from "@/components/ElementDetail";
import { Legend } from "@/components/Legend";
import { TemperatureSlider } from "@/components/TemperatureSlider";
import { BinaryPhaseDiagram } from "@/components/BinaryPhaseDiagram";
import type { SimulationResult } from "@/components/BinaryPhaseDiagram";
import { SimulationLoader } from "@/components/SimulationLoader";
import { ComputeModal } from "@/components/ComputeModal";
import { usePhaseDiagramResolver } from "@/hooks/usePhaseDiagramResolver";
import { FlaskConical } from "lucide-react";
import { Helmet } from "react-helmet-async";
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
  const [computeModalOpen, setComputeModalOpen] = useState(false);

  const resolver = usePhaseDiagramResolver();

  const handleElementClick = useCallback(
    (el: Element) => {
      if (!binaryMode) { setSelected(el); return; }
      if (binarySelection[0]?.number === el.number) {
        setBinarySelection([null, binarySelection[1]]); setBinaryError(null); return;
      }
      if (binarySelection[1]?.number === el.number) {
        setBinarySelection([binarySelection[0], null]); setBinaryError(null); return;
      }
      if (!binarySelection[0]) {
        setBinarySelection([el, binarySelection[1]]); setBinaryError(null);
      } else if (!binarySelection[1]) {
        setBinarySelection([binarySelection[0], el]); setBinaryError(null);
      } else {
        setBinarySelection([binarySelection[0], el]); setBinaryError(null);
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

  const animationDoneRef = useRef(false);
  const resolverDoneRef = useRef(false);

  const handleGenerate = async () => {
    if (!binarySelection[0] || !binarySelection[1]) return;
    setBinaryError(null);
    setSimulationResult(null);
    animationDoneRef.current = false;
    resolverDoneRef.current = false;
    setSimulating(true);

    // Use the multi-tier resolver
    resolver.resolve(binarySelection[0], binarySelection[1]);
  };

  const finishSimulation = useCallback(() => {
    if (!animationDoneRef.current || !resolverDoneRef.current) return;
    setSimulating(false);

    if (resolver.state.diagram) {
      if (resolver.state.dataSource === "calphad") {
        supabase.functions
          .invoke("binary-simulation", {
            body: {
              elementA: binarySelection[0]!.number,
              elementB: binarySelection[1]!.number,
              symbolA: binarySelection[0]!.symbol,
              symbolB: binarySelection[1]!.symbol,
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
      }
      setBinaryDiagramOpen(true);
    } else if (resolver.state.error) {
      setComputeModalOpen(true);
    }
  }, [resolver.state, binarySelection]);

  const handleAnimationComplete = useCallback(() => {
    animationDoneRef.current = true;
    finishSimulation();
  }, [finishSimulation]);

  // Watch resolver state completion
  useEffect(() => {
    if (!resolver.state.resolving && simulating) {
      resolverDoneRef.current = true;
      finishSimulation();
    }
  }, [resolver.state.resolving, simulating, finishSimulation]);

  const toggleBinaryMode = () => {
    setBinaryMode((prev) => {
      if (prev) {
        setBinarySelection([null, null]);
        setBinaryError(null);
        resolver.reset();
      }
      return !prev;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Periodic Table Explorer — 118 Elements Interactive</title>
        <meta name="description" content="Interact with all 118 elements. Adjust temperature to see live phase states, view electron configurations, crystal structures, and simulate binary phase diagrams." />
        <link rel="canonical" href="https://elements-explorer-interface.lovable.app/explore" />
        <meta property="og:title" content="Periodic Table Explorer — 118 Elements Interactive" />
        <meta property="og:description" content="Interact with all 118 elements, adjust temperature, and simulate binary phase diagrams." />
        <meta property="og:url" content="https://elements-explorer-interface.lovable.app/explore" />
      </Helmet>
      <header className="text-center pt-6 pb-2 px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-mono-code">
          Periodic Table
        </h1>
        <p className="text-sm text-muted-foreground mt-1">of the Elements</p>
      </header>

      {/* Temperature slider + phase legend */}
      <section aria-labelledby="temperature-heading" className="flex flex-col items-center gap-2 px-4 pb-3">
        <h2 id="temperature-heading" className="sr-only">Temperature and Phase Controls</h2>
        <TemperatureSlider temperature={temperature} onChange={setTemperature} />
        <div className="flex items-center gap-4 text-[0.65rem] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-phase-solid" /> Solid</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-phase-liquid" /> Liquid</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-phase-gas" /> Gas</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-phase-unknown" /> Unknown</span>
        </div>
      </section>

      {/* Binary Phase Diagram toggle */}
      <section aria-labelledby="alloy-heading" className="flex flex-col items-center px-4 pb-3">
        <h2 id="alloy-heading" className="sr-only">Alloy Simulation</h2>
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

        {binaryMode && (
          <div className="flex flex-col items-center gap-2 pt-3">
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
                  disabled={resolver.state.resolving}
                  className="px-3 py-1 rounded-md text-xs font-medium bg-accent text-accent-foreground hover:bg-accent/80 transition-colors disabled:opacity-50"
                >
                  {resolver.state.resolving ? "Resolving…" : "Generate Diagram"}
                </button>
              )}
            </div>
            {binaryError && (
              <p className="text-xs text-destructive max-w-md text-center">{binaryError}</p>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="periodic-table-heading" className="flex-1 flex flex-col items-center px-2 pb-4 gap-4 overflow-x-auto">
        <h2 id="periodic-table-heading" className="sr-only">Periodic Table</h2>
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
      </section>

      {!binaryMode && selected && <ElementDetail element={selected} onClose={() => setSelected(null)} temperature={temperature} />}

      {simulating && binarySelection[0] && binarySelection[1] && (
        <SimulationLoader
          systemName={`${binarySelection[0].symbol}–${binarySelection[1].symbol}`}
          onComplete={handleAnimationComplete}
        />
      )}

      {binaryDiagramOpen && resolver.state.diagram && (
        <BinaryPhaseDiagram
          data={resolver.state.diagram}
          onClose={() => { setBinaryDiagramOpen(false); resolver.reset(); }}
          simulationResult={simulationResult}
          confidence={resolver.state.confidence}
          reasoning={resolver.state.reasoning}
        />
      )}

      {/* Compute Modal fallback */}
      {binarySelection[0] && binarySelection[1] && (
        <ComputeModal
          open={computeModalOpen}
          onOpenChange={setComputeModalOpen}
          elementA={{ number: binarySelection[0].number, symbol: binarySelection[0].symbol, name: binarySelection[0].name }}
          elementB={{ number: binarySelection[1].number, symbol: binarySelection[1].symbol, name: binarySelection[1].name }}
          onResult={(result) => {
            setSimulationResult(result);
            setComputeModalOpen(false);
            toast.success("Computation result received");
          }}
          tierStatus={{
            tier1: resolver.state.tier1,
            tier2: resolver.state.tier2,
            tier3: resolver.state.tier3,
          }}
        />
      )}
    </div>
  );
};

export default Index;
