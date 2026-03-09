

## Plan: Add Landing Page

**Approach:** Create a new `Landing.tsx` page as the `/` route, move the current periodic table to `/explore`, and build a visually appealing landing page with the product description, a workflow diagram (rendered as a styled static graphic), and a CTA button.

### Changes

1. **Create `src/pages/Landing.tsx`**
   - Hero section with title "Interactive Periodic Table Explorer" and the product description
   - Animated/styled workflow diagram section showing the user flow (Explore → Click Element → Details / Adjust Temperature → Phase States / Binary Mode → Phase Diagrams)
   - Features grid highlighting key capabilities (temperature-aware phases, electron configs, crystal structures, binary phase diagrams)
   - CTA button linking to `/explore`
   - Dark theme consistent with existing design

2. **Update `src/App.tsx`**
   - Route `/` → `Landing`
   - Route `/explore` → `Index` (periodic table)
   - Keep `/slides` and catch-all

3. **Update any internal links** pointing to `/` that should now go to `/explore`

### Landing Page Sections
- **Hero**: Large title, subtitle, glowing CTA button "Explore the Elements →"
- **Features**: 4-card grid (Phase States, Element Properties, Crystal Structures, Binary Phase Diagrams)
- **Workflow**: Visual step-by-step flow diagram built with styled divs and connecting lines
- **Footer CTA**: Secondary call-to-action

