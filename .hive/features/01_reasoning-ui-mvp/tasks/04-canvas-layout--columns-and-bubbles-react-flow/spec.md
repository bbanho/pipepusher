# Task: 04-canvas-layout--columns-and-bubbles-react-flow

## Feature: reasoning-ui-mvp

## Dependencies

- **2. graph-state-model-zustand** (02-graph-state-model-zustand)

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

## Context

## architecture-decisions

# Architecture Decisions — PipePusher Reasoning UI MVP

## Stack
- **Framework**: Next.js App Router (TypeScript)
- **Canvas**: React Flow — bubble nodes, semantic edges
- **State**: Zustand (graph logic) + IndexedDB (persistence between sessions)
- **LLM**: Gemini via OAuth Google (`@google/genai`)
- **Context cache**: `ai.caches.create` per parent node — children send only diff
- **Propagation**: async queue per level, Web Worker — non-blocking UI
- **Deploy MVP**: Vercel or local `next dev`

## Key UX Rules
- TAB = create new column (new reasoning line) — ONLY way to create columns
- ← → = navigate between existing columns (no creation)
- ↑ ↓ = navigate between bubbles in current column
- Enter = continue chat in active bubble
- Shift+Enter on PREVIOUS bubble = bifurcate (sibling branch from that bubble)
- Shift+Enter on ACTIVE bubble = create child bubble (deepen vertically)
- Ctrl+W = isolate column as worktree
- Ctrl+M = cherry pick / propose worktree merge
- Ctrl+H = open history panel
- Esc = collapse branch / go up to parent

## Graph Model
- COLUMN = reasoning line (created by TAB)
- BUBBLE = thought node inside column (chat + LLM summary as title)
- BRANCH = bifurcation within column (Shift+Enter on old bubble)
- ACTIVE PATH = current branch being followed (siblings collapsed)
- WORKTREE = logically isolated subgraph (`worktreeId` flag on nodes)

## System Goal
Converge to: 1 column · 1 active path · 1 implementation plan

## LLM Background Engine
1. Bubble created → summarize to 3-5 words (title)
2. Bubble edited → propagate diff to children (cascading, with cache per bubble) — block child input during propagation
3. Parallel column created → compute semantic edge → generate intersection phrase
4. Tension detected → signal in status bar (non-blocking)
5. Convergence → enable Ctrl+M, suggest merge question

## Score Formula (MVP)
score = (depth × 0.4) + (coherence_edges × 0.4) + (age_decay × 0.2)
coherence_edges = edges without detected tension

## V2 (not in MVP)
- Docker container: REST+WS API for bash/git/filesystem
- EXECUTOR_URL env var (localhost or cloud — same code)
- Electron wrapper: packages Next.js + starts container

## Rejected Alternatives
- Electron from start: bash integration not needed in MVP
- LangGraph: too heavy, LangChain lock-in
- Static Next.js export: loses API routes, OAuth broken
- Blocking propagation: 5-level cascade = ~15s UI freeze
- GPT-4o: no explicit cache control, less predictable


## Completed Tasks

- 01-project-scaffold: Project scaffolded and verified. All dependencies installed and build succeeds.
- 02-graph-state-model-zustand: Defined graph types and implemented Zustand store with actions for column/bubble management, bifurcations, and state updates. All actions verified via TDD.
- 07-gemini-oauth-setup: Gemini OAuth setup complete. Installed next-auth, configured Google provider with generative-language scope, implemented Gemini client factory using accessToken, and added AuthProvider to layout. All tests and build pass.
