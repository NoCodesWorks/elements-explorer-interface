import type { Element } from "@/data/elements";
import { categoryLabels, getPhase } from "@/data/elements";
import { dftDatabase, phaseDiagrams } from "@/data/dftData";
import { mechanicalDatabase } from "@/data/mechanicalProperties";
import { ellinghamReactions } from "@/data/ellinghamData";
import { ElectronShellDiagram } from "@/components/ElectronShellDiagram";
import { SubshellDiagram } from "@/components/SubshellDiagram";
import { EnergyBandDiagram } from "@/components/EnergyBandDiagram";
import { CrystalStructureViewer } from "@/components/CrystalStructureViewer";
import { MechanicalPropertiesCard } from "@/components/MechanicalPropertiesCard";
import { EllinghamDiagram } from "@/components/EllinghamDiagram";
import { TTTDiagramViewer } from "@/components/TTTDiagramViewer";
import { DftProperties } from "@/components/DftProperties";
import { MPProperties } from "@/components/MPProperties";
import { PhaseDiagram } from "@/components/PhaseDiagram";
import { useMaterialsProject, hasMPData } from "@/hooks/useMaterialsProject";
import { X } from "lucide-react";

const categoryBgMap: Record<string, string> = {
  alkali: "bg-element-alkali",
  alkaline: "bg-element-alkaline",
  transition: "bg-element-transition",
  "post-transition": "bg-element-post-transition",
  metalloid: "bg-element-metalloid",
  nonmetal: "bg-element-nonmetal",
  halogen: "bg-element-halogen",
  noble: "bg-element-noble",
  lanthanide: "bg-element-lanthanide",
  actinide: "bg-element-actinide",
  unknown: "bg-element-unknown",
};

interface ElementDetailProps {
  element: Element;
  onClose: () => void;
  temperature: number;
}

function formatTemp(k: number | null): string {
  if (k === null) return "—";
  return `${k} K (${(k - 273.15).toFixed(0)} °C)`;
}

function PropertyItem({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <p className="font-mono-code text-foreground text-[0.7rem]">{value ?? "—"}</p>
    </div>
  );
}

export function ElementDetail({ element, onClose, temperature }: ElementDetailProps) {
  const phase = getPhase(element, temperature);
  const phaseLabel = phase === "unknown" ? "Unknown" : phase.charAt(0).toUpperCase() + phase.slice(1);
  const { data: mpData, isLoading: mpLoading, error: mpError } = useMaterialsProject(element.number);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-card border border-border rounded-lg p-6 w-[480px] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-md flex items-center justify-center text-2xl font-bold ${categoryBgMap[element.category]} text-background`}>
            {element.symbol}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{element.name}</h2>
            <p className="text-sm text-muted-foreground font-mono-code">#{element.number}</p>
          </div>
        </div>

        {/* Electron Shell Diagram */}
        <div className="mt-4 p-3 rounded-md bg-background/50 border border-border">
          <h3 className="text-xs text-muted-foreground mb-2 text-center font-medium">Electron Shell Diagram</h3>
          <ElectronShellDiagram element={element} />
        </div>

        {/* Subshell Orbital Diagram */}
        <div className="mt-4 p-3 rounded-md bg-background/50 border border-border">
          <h3 className="text-xs text-muted-foreground mb-2 text-center font-medium">Subshell Orbital Filling</h3>
          <SubshellDiagram element={element} />
        </div>

        {/* Energy Band Diagram */}
        <div className="mt-4 p-3 rounded-md bg-background/50 border border-border">
          <h3 className="text-xs text-muted-foreground mb-2 text-center font-medium">Energy Level Diagram</h3>
          <EnergyBandDiagram element={element} />
        </div>

        {/* Properties Grid */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <PropertyItem label="Atomic Mass" value={element.mass} />
          <PropertyItem label="Category" value={categoryLabels[element.category]} />
          <PropertyItem label="Period" value={element.row <= 7 ? element.row : element.row === 9 ? 6 : 7} />
          <PropertyItem label="Group" value={element.col} />
          <PropertyItem label="Electronegativity" value={element.electronegativity} />
          <PropertyItem label="Discovery" value={element.discoveryYear} />
          <PropertyItem label="Melting Point" value={formatTemp(element.meltingPoint)} />
          <PropertyItem label="Boiling Point" value={formatTemp(element.boilingPoint)} />
          <PropertyItem label={`Phase @ ${temperature} K`} value={phaseLabel} />
          <PropertyItem label="Density (g/cm³)" value={element.density} />
          <PropertyItem label="Atomic Radius (pm)" value={element.atomicRadius} />
          <PropertyItem label="Ionization Energy (kJ/mol)" value={element.ionizationEnergy} />
        </div>

        {/* Oxidation States */}
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-muted-foreground text-xs">Oxidation States</span>
          <p className="font-mono-code text-foreground text-sm mt-0.5">{element.oxidationStates}</p>
        </div>

        {/* Electron Configuration */}
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-muted-foreground text-xs">Electron Configuration</span>
          <p className="font-mono-code text-foreground text-sm mt-0.5">{element.electronConfig}</p>
        </div>

        {/* Crystal Structure & Mechanical Properties */}
        {mechanicalDatabase[element.number] && (
          <>
            <div className="mt-4 p-3 rounded-md bg-background/50 border border-border">
              <h3 className="text-xs text-muted-foreground mb-2 text-center font-medium">Crystal Structure</h3>
              <CrystalStructureViewer data={mechanicalDatabase[element.number]} />
            </div>

            <div className="mt-4 p-3 rounded-md bg-background/50 border border-border">
              <h3 className="text-xs text-muted-foreground mb-2 text-center font-medium">Mechanical Properties</h3>
              <MechanicalPropertiesCard data={mechanicalDatabase[element.number]} />
            </div>
          </>
        )}

        {/* Ellingham Diagram */}
        {ellinghamReactions.some(r => r.elementNumber === element.number) && (
          <div className="mt-4 p-3 rounded-md bg-background/50 border border-border">
            <h3 className="text-xs text-muted-foreground mb-2 text-center font-medium">Ellingham Diagram</h3>
            <EllinghamDiagram highlightElement={element.number} />
          </div>
        )}

        {/* TTT Diagram (for Fe / steel-relevant) */}
        {element.number === 26 && (
          <div className="mt-4 p-3 rounded-md bg-background/50 border border-border">
            <h3 className="text-xs text-muted-foreground mb-2 text-center font-medium">TTT Diagrams (Steel Alloys)</h3>
            <TTTDiagramViewer />
          </div>
        )}

        {/* DFT Properties */}
        {dftDatabase[element.number] && (
          <DftProperties data={dftDatabase[element.number]} />
        )}

        {/* Materials Project Live Data */}
        {hasMPData(element.number) && (
          <MPProperties data={mpData} isLoading={mpLoading} error={mpError} />
        )}

        {/* Phase Diagram */}
        {phaseDiagrams[element.number] && (
          <PhaseDiagram data={phaseDiagrams[element.number]} />
        )}
      </div>
    </div>
  );
}
