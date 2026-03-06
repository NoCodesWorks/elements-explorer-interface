

## Plan: Smart Scaling, Advanced Computation, and Physical Consistency for Phase Diagrams

This is a significant feature set spanning 5 areas. Here is the implementation plan.

---

### 1. Adaptive X-Axis Scaling for Binary Phase Diagrams

**What changes:**
- Add a `maxComposition` field to `BinaryPhaseDiagramData` interface (optional, defaults to 1.0)
- For Fe-C system, hardcode `maxComposition: 0.0667` (6.67 at% cementite limit)
- Add a "Zoom to Region of Interest" slider/toggle in the `BinaryPhaseDiagram` component header
- Modify `xScale`, `xInv`, x-axis ticks, and zone rendering to use the dynamic max instead of hardcoded 0-1 range

**Files:** `src/data/binaryPhaseDiagrams.ts`, `src/components/BinaryPhaseDiagram.tsx`

---

### 2. Multi-Source Data Orchestrator

**What changes:**
- Create a new DB table `element_properties_cache` to store previously fetched data (element_number, source, property_type, data JSON, fetched_at)
- Create a `src/hooks/useDataOrchestrator.ts` hook that:
  1. Checks local DB cache first via Supabase query
  2. Falls back to Materials Project API (existing edge function)
  3. Exposes a manual "Query AFLOW" trigger
- Create a new edge function `aflow-proxy` to fetch Bulk/Shear Modulus and thermal properties from the AFLOW REST API (`aflowlib.org/API`)
- Add a "Query AFLOW API" button in the `ElementDetail` panel that triggers the AFLOW fetch and displays results

**Files:** New `supabase/functions/aflow-proxy/index.ts`, new `src/hooks/useDataOrchestrator.ts`, update `src/components/ElementDetail.tsx`, DB migration for cache table

---

### 3. Simulation Workflow UI (Compute Modal)

**What changes:**
- Create `src/components/ComputeModal.tsx` — a dialog that appears for element pairs without existing CALPHAD data
- Fields: MD Temperature Range (min/max sliders), DFT Functional Selection (dropdown: PBE, PBEsol, SCAN, r2SCAN)
- Status indicator with three states: "Idle", "API Fetching" (pulsing blue), "Active Simulation" (pulsing orange)
- Wire the modal into `Index.tsx` — when "Generate Diagram" is clicked and no local data exists, show this modal instead of the error message
- On submit, call the existing `binary-simulation` edge function with the additional parameters

**Files:** New `src/components/ComputeModal.tsx`, update `src/pages/Index.tsx`

---

### 4. Physical Consistency Check (PINN-Inspired Gibbs Phase Rule Validation)

**What changes:**
- Create `src/lib/phaseConsistency.ts` with validation logic:
  - Check boundary curves for non-physical crossings (two boundaries of the same type intersecting)
  - Verify Gibbs phase rule: F = C - P + 2; for a binary (C=2) at fixed pressure, max phases in equilibrium = 3 (invariant), 2 (univariant line), 1 (area)
  - Flag regions where >3 phases appear to coexist
- Add an "Uncertainty Badge" to `BinaryPhaseDiagram` that shows "High Uncertainty" with a warning icon when violations are detected
- Display specific violations in a collapsible details section

**Files:** New `src/lib/phaseConsistency.ts`, update `src/components/BinaryPhaseDiagram.tsx`

---

### 5. Thermodynamic Curves (G vs. T) in Element Detail

**What changes:**
- Create `src/components/GibbsEnergyChart.tsx` — a Recharts `LineChart` showing Gibbs free energy vs. temperature for each phase (solid, liquid, gas)
- Use simplified thermodynamic model: G(T) = H - T*S, with enthalpy/entropy derived from existing melting/boiling point data and DFT cohesive energies
- If Materials Project or AFLOW data provides formation energies, overlay those as reference points
- Add this chart to `ElementDetail` between the phase diagram and DFT sections

**Files:** New `src/components/GibbsEnergyChart.tsx`, update `src/components/ElementDetail.tsx`

---

### Database Migration

A single migration to create the cache table:

```sql
CREATE TABLE public.element_properties_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_number integer NOT NULL,
  source text NOT NULL,  -- 'materials_project', 'aflow', 'local'
  property_type text NOT NULL,  -- 'formation_energy', 'mechanical', 'thermal'
  data jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(element_number, source, property_type)
);

ALTER TABLE public.element_properties_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read"
  ON public.element_properties_cache FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow service insert/update"
  ON public.element_properties_cache FOR ALL
  TO service_role
  USING (true);
```

---

### Summary of New Files
- `src/components/ComputeModal.tsx`
- `src/components/GibbsEnergyChart.tsx`
- `src/lib/phaseConsistency.ts`
- `src/hooks/useDataOrchestrator.ts`
- `supabase/functions/aflow-proxy/index.ts`

### Modified Files
- `src/data/binaryPhaseDiagrams.ts` — add `maxComposition` to interface and Fe-C data
- `src/components/BinaryPhaseDiagram.tsx` — adaptive scaling, zoom controls, uncertainty badge
- `src/components/ElementDetail.tsx` — add Gibbs chart, AFLOW button, orchestrator integration
- `src/pages/Index.tsx` — compute modal for missing diagrams
- `supabase/config.toml` — register `aflow-proxy` function

