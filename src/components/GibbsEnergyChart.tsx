import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Element } from "@/data/elements";

interface GibbsEnergyChartProps {
  element: Element;
}

/**
 * Simplified Gibbs free energy model: G(T) = H_ref - T * S_ref
 * Uses melting/boiling point data to derive approximate enthalpy/entropy values.
 * ΔH_fus ≈ T_m * ΔS_fus (Richard's rule: ΔS_fus ≈ 8.4 J/mol·K for metals)
 * ΔH_vap ≈ T_b * ΔS_vap (Trouton's rule: ΔS_vap ≈ 88 J/mol·K)
 */
export function GibbsEnergyChart({ element }: GibbsEnergyChartProps) {
  const chartData = useMemo(() => {
    const { meltingPoint: Tm, boilingPoint: Tb } = element;
    if (!Tm || !Tb) return null;

    // Reference entropies (J/mol·K)
    const S_fus = 8.4; // Richard's rule
    const S_vap = 88; // Trouton's rule
    const H_fus = Tm * S_fus; // J/mol
    const H_vap = Tb * S_vap; // J/mol

    // Base solid entropy estimate (Dulong-Petit ~25 J/mol·K)
    const S_solid_base = 25;
    const H_solid_ref = 0; // Reference at 0 K

    const data: { T: number; solid: number; liquid: number; gas: number }[] = [];
    const maxT = Math.min(Tb * 1.5, 6000);
    const step = Math.max(10, Math.round(maxT / 100));

    for (let T = 100; T <= maxT; T += step) {
      // G_solid = H_ref - T * S_solid
      const G_solid = H_solid_ref - T * S_solid_base;
      // G_liquid = (H_ref + H_fus) - T * (S_solid + S_fus)
      const G_liquid = H_fus - T * (S_solid_base + S_fus);
      // G_gas = (H_ref + H_fus + H_vap) - T * (S_solid + S_fus + S_vap)
      const G_gas = (H_fus + H_vap) - T * (S_solid_base + S_fus + S_vap);

      data.push({
        T,
        solid: G_solid / 1000, // Convert to kJ/mol
        liquid: G_liquid / 1000,
        gas: G_gas / 1000,
      });
    }

    return data;
  }, [element]);

  if (!chartData) {
    return (
      <p className="text-xs text-muted-foreground text-center py-2">
        Insufficient thermodynamic data for Gibbs energy curves
      </p>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
          <XAxis
            dataKey="T"
            stroke="hsl(215, 15%, 55%)"
            fontSize={9}
            label={{ value: "Temperature (K)", position: "insideBottom", offset: -2, fontSize: 9, fill: "hsl(215, 15%, 55%)" }}
          />
          <YAxis
            stroke="hsl(215, 15%, 55%)"
            fontSize={9}
            label={{ value: "G (kJ/mol)", angle: -90, position: "insideLeft", offset: 10, fontSize: 9, fill: "hsl(215, 15%, 55%)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 18%, 12%)",
              border: "1px solid hsl(220, 15%, 25%)",
              borderRadius: 6,
              fontSize: 10,
            }}
            labelFormatter={(v) => `${v} K`}
            formatter={(v: number) => [`${v.toFixed(1)} kJ/mol`]}
          />
          <Legend wrapperStyle={{ fontSize: 9 }} />
          <Line type="monotone" dataKey="solid" stroke="hsl(200, 80%, 55%)" dot={false} strokeWidth={2} name="Solid" />
          <Line type="monotone" dataKey="liquid" stroke="hsl(25, 80%, 55%)" dot={false} strokeWidth={2} name="Liquid" />
          <Line type="monotone" dataKey="gas" stroke="hsl(140, 60%, 50%)" dot={false} strokeWidth={2} name="Gas" />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[0.55rem] text-muted-foreground text-center mt-1">
        Simplified model: Richard's rule (ΔS_fus≈8.4) + Trouton's rule (ΔS_vap≈88 J/mol·K)
      </p>
    </div>
  );
}
