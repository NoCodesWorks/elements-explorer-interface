import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Map atomic number to most common Materials Project material_id
const elementMaterialIds: Record<number, string> = {
  1: "mp-24504",   // H2
  6: "mp-66",      // C (diamond)
  7: "mp-154",     // N2
  8: "mp-12957",   // O2
  11: "mp-127",    // Na
  13: "mp-134",    // Al
  14: "mp-149",    // Si
  15: "mp-157",    // P
  22: "mp-72",     // Ti
  24: "mp-90",     // Cr
  26: "mp-13",     // Fe
  27: "mp-102",    // Co
  28: "mp-23",     // Ni
  29: "mp-30",     // Cu
  30: "mp-79",     // Zn
  31: "mp-142",    // Ga
  32: "mp-32",     // Ge
  47: "mp-124",    // Ag
  50: "mp-117",    // Sn
  74: "mp-91",     // W
  79: "mp-81",     // Au
  82: "mp-20483",  // Pb
  92: "mp-44",     // U
  94: "mp-582",    // Pu
};

export interface MPData {
  material_id: string;
  formula_pretty: string;
  band_gap: number | null;
  is_metal: boolean;
  is_magnetic: boolean;
  ordering: string;
  energy_per_atom: number | null;
  formation_energy_per_atom: number | null;
  energy_above_hull: number | null;
  k_vrh: number | null;  // bulk modulus
  g_vrh: number | null;  // shear modulus
  density: number | null;
  symmetry?: {
    crystal_system?: string;
    symbol?: string;
    number?: number;
  };
}

async function fetchMPData(atomicNumber: number): Promise<MPData | null> {
  const materialId = elementMaterialIds[atomicNumber];
  if (!materialId) return null;

  const { data, error } = await supabase.functions.invoke("materials-project", {
    body: { material_ids: [materialId] },
  });

  if (error) throw error;
  
  const results = data?.data;
  if (!results || results.length === 0) return null;

  return results[0] as MPData;
}

export function useMaterialsProject(atomicNumber: number) {
  return useQuery({
    queryKey: ["materials-project", atomicNumber],
    queryFn: () => fetchMPData(atomicNumber),
    enabled: !!elementMaterialIds[atomicNumber],
    staleTime: 1000 * 60 * 60, // 1 hour cache
    retry: 1,
  });
}

export function hasMPData(atomicNumber: number): boolean {
  return !!elementMaterialIds[atomicNumber];
}
