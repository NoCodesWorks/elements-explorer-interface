import type { DftData } from "@/data/dftData";

function DftItem({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <span className="text-muted-foreground text-xs">{label}</span>
      <p className="font-mono-code text-foreground text-[0.7rem]">{value ?? "—"}</p>
    </div>
  );
}

interface DftPropertiesProps {
  data: DftData;
}

export function DftProperties({ data }: DftPropertiesProps) {
  return (
    <div className="mt-3 pt-3 border-t border-border">
      <h3 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        DFT Reference Data
      </h3>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <DftItem label="Crystal Structure" value={data.crystalStructure} />
        <DftItem label="Space Group" value={data.spaceGroup} />
        <DftItem label="Band Gap Type" value={data.bandGapType} />
        <DftItem label="Band Gap (eV)" value={data.bandGapEv} />
        <DftItem label="Magnetic Ordering" value={data.magneticOrdering} />
        <DftItem label="Cohesive Energy (eV)" value={data.cohesiveEnergyEv} />
        <DftItem label="Bulk Modulus (GPa)" value={data.bulkModulusGpa} />
        <DftItem label="Formation Energy (eV)" value={data.formationEnergyEv} />
      </div>
    </div>
  );
}
