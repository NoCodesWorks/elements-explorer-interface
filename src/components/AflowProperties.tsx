import { AflowProperty, OrchestratorResult } from "@/hooks/useDataOrchestrator";
import { Button } from "@/components/ui/button";
import { Database, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface AflowPropertiesProps {
  data: OrchestratorResult | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  elementSymbol: string;
}

function Val({ label, value, unit }: { label: string; value: number | string | null; unit?: string }) {
  if (value == null) return null;
  const display = typeof value === "number" ? value.toFixed(value < 1 ? 4 : 2) : value;
  return (
    <div className="flex justify-between items-baseline gap-2 py-0.5">
      <span className="text-muted-foreground text-[0.6rem] shrink-0">{label}</span>
      <span className="font-mono-code text-foreground text-[0.6rem] text-right">
        {display}{unit ? <span className="text-muted-foreground ml-0.5">{unit}</span> : null}
      </span>
    </div>
  );
}

function CompoundCard({ p, index }: { p: AflowProperty; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const hasElastic = p.bulkModulus != null || p.shearModulus != null || p.youngsModulus != null;
  const hasThermal = p.thermalConductivity != null || p.heatCapacityCp != null || p.aglDebye != null;
  const hasElectronic = p.bandGap != null;
  const hasStructural = p.spaceGroup != null || p.latticeSystem != null;

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-2 py-1.5 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono-code text-[0.65rem] font-semibold text-foreground">{p.compound}</span>
          {p.spaceGroup && <span className="text-[0.55rem] text-muted-foreground">{p.spaceGroup}</span>}
        </div>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <div className="px-2 py-1.5 space-y-2">
          {/* Structural */}
          {hasStructural && (
            <div>
              <p className="text-[0.55rem] font-medium text-primary mb-0.5">Structure</p>
              <Val label="Space Group" value={p.spaceGroup} />
              <Val label="Lattice System" value={p.latticeSystem} />
              <Val label="Pearson Symbol" value={p.pearsonSymbol} />
              <Val label="Volume/Atom" value={p.volumePerAtom} unit="Å³" />
              <Val label="Density" value={p.density} unit="g/cm³" />
            </div>
          )}

          {/* Elastic */}
          {hasElastic && (
            <div>
              <p className="text-[0.55rem] font-medium text-primary mb-0.5">Elastic (AEL)</p>
              <Val label="Bulk Modulus (VRH)" value={p.bulkModulus} unit="GPa" />
              <Val label="Shear Modulus (VRH)" value={p.shearModulus} unit="GPa" />
              <Val label="Young's Modulus (VRH)" value={p.youngsModulus} unit="GPa" />
              <Val label="Poisson Ratio" value={p.poissonRatio} />
              <Val label="Pugh's Ratio" value={p.pughsRatio} />
              <Val label="Elastic Anisotropy" value={p.elasticAnisotropy} />
              <Val label="Debye Temperature" value={p.debyeTemperature} unit="K" />
              <Val label="Sound Speed (avg)" value={p.speedSoundAvg} unit="m/s" />
              <Val label="Sound Speed (long)" value={p.speedSoundLong} unit="m/s" />
              <Val label="Sound Speed (trans)" value={p.speedSoundTrans} unit="m/s" />
            </div>
          )}

          {/* Thermal */}
          {hasThermal && (
            <div>
              <p className="text-[0.55rem] font-medium text-primary mb-0.5">Thermal (AGL)</p>
              <Val label="Thermal Conductivity" value={p.thermalConductivity} unit="W/mK" />
              <Val label="Thermal Expansion" value={p.thermalExpansion} unit="1/K" />
              <Val label="Debye Temp (AGL)" value={p.aglDebye} unit="K" />
              <Val label="Grüneisen Parameter" value={p.gruneisen} />
              <Val label="Heat Capacity Cₚ" value={p.heatCapacityCp} unit="kB/atom" />
              <Val label="Heat Capacity Cᵥ" value={p.heatCapacityCv} unit="kB/atom" />
            </div>
          )}

          {/* Electronic */}
          {hasElectronic && (
            <div>
              <p className="text-[0.55rem] font-medium text-primary mb-0.5">Electronic</p>
              <Val label="Band Gap" value={p.bandGap} unit="eV" />
              <Val label="Band Gap Type" value={p.bandGapType} />
            </div>
          )}

          {/* Energetics */}
          {(p.enthalpy != null || p.formationEnthalpy != null) && (
            <div>
              <p className="text-[0.55rem] font-medium text-primary mb-0.5">Energetics</p>
              <Val label="Energy/Atom" value={p.energyPerAtom} unit="eV" />
              <Val label="Enthalpy/Atom" value={p.enthalpy} unit="eV" />
              <Val label="Formation Enthalpy" value={p.formationEnthalpy} unit="eV/atom" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AflowProperties({ data, loading, error, onRefresh, elementSymbol }: AflowPropertiesProps) {
  return (
    <div className="mt-4 p-3 rounded-md bg-background/50 border border-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-muted-foreground font-medium">AFLOW Database</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-6 text-[0.6rem] px-2"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? (
            <><Loader2 size={10} className="animate-spin mr-1" /> Fetching…</>
          ) : data ? (
            <><RefreshCw size={10} className="mr-1" /> Refresh</>
          ) : (
            <><Database size={10} className="mr-1" /> Query AFLOW</>
          )}
        </Button>
      </div>

      {loading && !data && (
        <div className="flex items-center gap-2 py-3 justify-center">
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
          <span className="text-[0.6rem] text-muted-foreground">Querying AFLOW API for {elementSymbol}…</span>
        </div>
      )}

      {error && <p className="text-[0.6rem] text-destructive">{error}</p>}

      {data && data.properties.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[0.55rem] text-muted-foreground">
            Source: {data.source} · {data.properties.length} compound{data.properties.length > 1 ? "s" : ""}
          </p>
          {data.properties.map((p, i) => (
            <CompoundCard key={i} p={p} index={i} />
          ))}
        </div>
      )}

      {data && data.properties.length === 0 && (
        <p className="text-[0.6rem] text-muted-foreground">No AFLOW data found for {elementSymbol}</p>
      )}
    </div>
  );
}
