

## Plan: Multi-Tier Data Strategy with ML Prediction and Visual Source Badges

This plan adds a tiered data fallback system, ML-based phase prediction for unknown systems, system metadata with smart composition constraints, and clear data-source labeling on all diagrams.

---

### 1. System Metadata with Dynamic Composition Constraints

**What:** Add a `SystemMetadata` type and a metadata registry that defines per-system composition limits, data source tier, and display defaults.

**Changes:**
- In `src/data/binaryPhaseDiagrams.ts`: extend `BinaryPhaseDiagramData` with a `dataSource` field (`"calphad" | "materials_project" | "ml_predicted"`) and a `metadata` object (`{ defaultRange: [number, number], fullRange: [number, number], compositionLabel?: string }`)
- Add metadata for existing systems (Fe-C defaults to `[0, 0.07]` with full range `[0, 0.25]`, Cu-Zn defaults `[0, 1]`, etc.)
- In `BinaryPhaseDiagram.tsx`: use metadata to set initial `xMax`, add an "Unlock Full Range" toggle button that switches between `defaultRange` and `fullRange`

---

### 2. Data Tier Fallback Logic in Orchestrator

**What:** Upgrade `useDataOrchestrator` and create a new `usePhaseDiagramResolver` hook that implements the 3-tier strategy.

**New file: `src/hooks/usePhaseDiagramResolver.ts`**
- **Tier 1:** Check `getBinaryDiagram()` for local CALPHAD data. If found, return with `dataSource: "calphad"`.
- **Tier 2:** If no CALPHAD, call `binary-simulation` edge function (which fetches Materials Project). Build an approximate diagram from MP formation energies. Return with `dataSource: "materials_project"`.
- **Tier 3:** If MP returns no useful data, run the ML classifier (edge function) to predict phase boundaries from elemental properties. Return with `dataSource: "ml_predicted"`.

**Update `src/pages/Index.tsx`:** Replace the current generate logic to use `usePhaseDiagramResolver` instead of manual `getBinaryDiagram` + `ComputeModal` branching.

---

### 3. ML Phase Boundary Classifier (Edge Function)

**New file: `supabase/functions/ml-phase-predict/index.ts`**

A lightweight edge function that:
- Accepts two element symbols + their properties (electronegativity, atomic radius, melting point, density)
- Uses Lovable AI (Gemini Flash) with structured tool calling to predict:
  - Likely phase types (eutectic, peritectic, solid solution, intermetallic)
  - Approximate invariant temperatures
  - Estimated solubility limits
- Returns structured JSON matching `BinaryPhaseDiagramData` format with `dataSource: "ml_predicted"`
- This replaces the need for a Python-hosted Random Forest/XGBoost — the LLM acts as the "pre-trained classifier" using its training knowledge of materials science

---

### 4. PINN-Inspired Boundary Interpolation

**What:** For Tier 2/3 diagrams, add interpolation logic that connects sparse DFT/MP data points into smooth phase boundaries.

**New file: `src/lib/boundaryInterpolation.ts`**
- Monotone cubic spline interpolation for boundary curves (connects DFT formation energy points at T=0 with estimated melting/transition temperatures)
- Enforces physical constraints: boundaries must not cross non-physically, liquidus must be above solidus, invariant isotherms must be horizontal
- Uses the existing `phaseConsistency.ts` validator as a post-check

---

### 5. Visual Data Source Badges

**What:** Add clear visual indicators showing whether data is verified CALPHAD, MP-derived, or ML-predicted.

**Changes to `BinaryPhaseDiagram.tsx`:**
- Add a colored badge next to the title:
  - Green "Verified (CALPHAD)" for Tier 1
  - Blue "Experimental (Materials Project)" for Tier 2
  - Amber "ML-Predicted (Estimated)" for Tier 3
- Add a small info tooltip explaining the data source and confidence level
- Include the existing "High Uncertainty" badge from `phaseConsistency.ts` alongside the source badge when violations are found

---

### 6. Updated Compute Modal

**Changes to `ComputeModal.tsx`:**
- Add a "Data Source" section showing which tiers were attempted and their status
- Show tier progression: "Checking CALPHAD... → Querying Materials Project... → Running ML Prediction..."
- Update status indicator to reflect the 3-tier process

---

### Summary

| Item | Files |
|------|-------|
| System metadata + composition constraints | `binaryPhaseDiagrams.ts`, `BinaryPhaseDiagram.tsx` |
| Phase diagram resolver hook | New `usePhaseDiagramResolver.ts` |
| ML prediction edge function | New `ml-phase-predict/index.ts` |
| Boundary interpolation | New `boundaryInterpolation.ts` |
| Visual source badges | `BinaryPhaseDiagram.tsx` |
| Compute modal update | `ComputeModal.tsx` |
| Index page wiring | `Index.tsx` |

No database changes needed -- the existing `element_properties_cache` table can store ML predictions.

