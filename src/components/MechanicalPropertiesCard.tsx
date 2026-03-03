import { mechanicalDatabase, type MechanicalProps } from "@/data/mechanicalProperties";

interface MechanicalPropertiesCardProps {
  data: MechanicalProps;
}

function PropRow({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-muted-foreground text-[0.65rem]">{label}</span>
      <span className="font-mono-code text-foreground text-[0.65rem]">
        {value !== null ? `${value} ${unit}` : "—"}
      </span>
    </div>
  );
}

export function MechanicalPropertiesCard({ data }: MechanicalPropertiesCardProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
      <PropRow label="Yield Strength" value={data.yieldStrength} unit="MPa" />
      <PropRow label="Tensile Strength" value={data.tensileStrength} unit="MPa" />
      <PropRow label="Young's Modulus" value={data.youngModulus} unit="GPa" />
      <PropRow label="Shear Modulus" value={data.shearModulus} unit="GPa" />
      <PropRow label="Bulk Modulus" value={data.bulkModulus} unit="GPa" />
      <PropRow label="Poisson's Ratio" value={data.poissonRatio} unit="" />
      <PropRow label="Vickers Hardness" value={data.vickersHardness} unit="HV" />
      <PropRow label="Mohs Hardness" value={data.mohsHardness} unit="" />
      <PropRow label="Elongation" value={data.elongation} unit="%" />
      <PropRow label="Fracture Toughness" value={data.fractureToughness} unit="MPa·√m" />
    </div>
  );
}
