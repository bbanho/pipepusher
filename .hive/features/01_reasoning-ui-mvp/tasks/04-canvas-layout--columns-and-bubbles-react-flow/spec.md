# Task: 04-canvas-layout--columns-and-bubbles-react-flow

## Feature: reasoning-ui-mvp

## Dependencies

- **2. Graph state model (Zustand)** (02-graph-state-model-zustand)

## Plan Section

### 4. Canvas layout — columns and bubbles (React Flow)

**Depends on**: 2

**Files:**
- Create: `src/components/canvas/ReasoningCanvas.tsx`
- Create: `src/components/canvas/BubbleNode.tsx`
- Create: `src/components/canvas/SemanticEdge.tsx`
- Create: `src/components/canvas/ColumnGroup.tsx`
- Modify: `src/app/page.tsx`

**What to do**:
- Install React Flow: already in dependencies (`@xyflow/react`)
- `BubbleNode.tsx` — custom React Flow node:
  ```tsx
  // Props from React Flow NodeProps + Bubble data
  // Shows: summary title (collapsed) OR chat input (when focused/active)
  // Status indicators: spinner during 'propagating', lock icon during 'blocked'
  // Branch indicator: dashed left border when is a non-active branch
  ```
- `SemanticEdge.tsx` — custom edge with label:
  ```tsx
  // Shows intersection phrase on hover
  // Color: green (coherent) | yellow (tension) | red (contradiction)
  ```
- `ColumnGroup.tsx` — visual grouping per column (React Flow `<NodeResizer>` or background rect)
- `ReasoningCanvas.tsx`:
  ```tsx
  // Reads from useGraphStore()
  // Converts bubbles → React Flow nodes
  // Converts edges → React Flow edges
  // Sets up ReactFlowProvider
  // NO keyboard handling here (handled in task 5)
  ```
- In `src/app/page.tsx`, render `<ReasoningCanvas />` full viewport

**Verify:**
- Run: `npm run dev`
- Open browser: canvas renders with empty state (no columns yet)
- Run: `npm run build` — no TypeScript errors

---

## Task Type

modification
