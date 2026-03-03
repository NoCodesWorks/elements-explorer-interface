import type { MPData } from "@/hooks/useMaterialsProject";
import { Loader2 } from "lucide-react";

function MPItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <p className="font-mono-code text-foreground text-[0.7rem]">{value ?? "—"}</p>
    </div>
  );
}

interface MPPropertiesProps {
  data: MPData | null | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function MPProperties({ data, isLoading, error }: MPPropertiesProps) {
  if (isLoading) {
    return (
      <div className="mt-3 pt-3 border-t border-border">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Materials Project (Live)
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          Fetching live data…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3 pt-3 border-t border-border">
        <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
          Materials Project (Live)
        </h3>
        <p className="text-xs text-destructive">Failed to fetch live data</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        Materials Project (Live)
      </h3>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <MPItem label="Material ID" value={data.material_id} />
        <MPItem label="Formula" value={data.formula_pretty} />
        <MPItem label="Crystal System" value={data.symmetry?.crystal_system} />
        <MPItem label="Space Group" value={data.symmetry?.symbol} />
        <MPItem label="Band Gap (eV)" value={data.band_gap !== null ? data.band_gap?.toFixed(3) : null} />
        <MPItem label="Is Metal" value={data.is_metal ? "Yes" : "No"} />
        <MPItem label="Magnetic" value={data.is_magnetic ? `Yes (${data.ordering})` : "No"} />
        <MPItem label="E/atom (eV)" value={data.energy_per_atom?.toFixed(3)} />
        <MPItem label="Formation E (eV)" value={data.formation_energy_per_atom?.toFixed(3)} />
        <MPItem label="E above hull (eV)" value={data.energy_above_hull?.toFixed(4)} />
        <MPItem label="Bulk Modulus (GPa)" value={data.k_vrh?.toFixed(1)} />
        <MPItem label="Shear Modulus (GPa)" value={data.g_vrh?.toFixed(1)} />
        <MPItem label="Density (g/cm³)" value={data.density?.toFixed(3)} />
      </div>
      <p className="text-[0.6rem] text-muted-foreground mt-2 italic">
        Data from Materials Project API — updated in real-time
      </p>
    </div>
  );
}
