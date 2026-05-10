# Task: 14-polish-and-deploy

## Feature: reasoning-ui-mvp

## Dependencies

- **11. History panel** (11-history-panel)
- **12. Worktree isolation and cherry pick UI** (12-worktree-isolation-and-cherry-pick-ui)
- **13. Score computation and path suggestion** (13-score-computation-and-path-suggestion)

## Plan Section

### 14. Polish and deploy

**Depends on**: 11, 12, 13

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/ui/StatusBar.tsx`
- Create: `src/components/ui/PropagationOverlay.tsx`
- Create: `vercel.json`

**What to do**:
- `StatusBar.tsx`: fixed bottom bar showing:
  - Active column + bubble path (breadcrumb)
  - Tension warnings ("⚡ Tensão detectada entre Tab 1 e Tab 2")
  - Propagation status ("⏳ Propagando para 3 filhos...")
  - Score of active path
  - Keyboard shortcut hints (toggle with `?`)
- `PropagationOverlay.tsx`: semi-transparent overlay on blocked bubbles with spinner
- Visual polish:
  - Dark theme (CSS variables)
  - Column headers with color accent per column (rotating palette)
  - Collapsed branch indicator: dashed left border
  - Active bubble: elevated card with shadow
  - Semantic edge labels: fade in on hover
- `vercel.json`: standard Next.js config, env vars documented
- Deploy to Vercel: `vercel deploy`

**Verify:**
- Run: `npm run build` — zero errors, zero TypeScript warnings
- Deploy: app accessible at Vercel URL
- Full manual flow: TAB → type idea → Shift+Enter → deepen → TAB again → type parallel idea → watch edge appear → Ctrl+M → merge dialog

---

## Task Type

modification
