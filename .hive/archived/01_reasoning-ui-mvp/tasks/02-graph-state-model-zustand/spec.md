# Task: 02-graph-state-model-zustand

## Feature: reasoning-ui-mvp

## Dependencies

- **1. project-scaffold** (01-project-scaffold)

## Plan Section

### 2. Graph state model (Zustand)

**Depends on**: 1

**Files:**
- Create: `src/store/graph.ts`
- Create: `src/store/graph.test.ts`
- Create: `src/types/graph.ts`

**What to do**:
- Define types in `src/types/graph.ts`:
  ```ts
  export type BubbleStatus =
    | 'drafting'
    | 'summarized'
    | 'propagating'
    | 'blocked'
    | 'merged'
    | 'archived'

  export type TensionStatus = 'none' | 'tension' | 'contradiction'

  export interface Bubble {
    id: string
    columnId: string
    parentId: string | null        // null = root of column
    branchIndex: number            // sibling order
    content: string                // raw chat transcript
    summary: string                // LLM-generated 3-5 word title
    status: BubbleStatus
    score: number                  // (depth*0.4) + (coherence*0.4) + (age*0.2)
    depth: number
    createdAt: number
    lastScoredAt: number
    cacheId: string | null         // Gemini cache name for this bubble's context
    children: string[]             // child bubble ids
    blockedBy: string[]            // bubble ids blocking this one
    worktreeId: string | null      // null = main graph
  }

  export interface Column {
    id: string
    order: number
    activePathId: string | null    // id of active bubble (leaf of active path)
    worktreeId: string | null
    createdAt: number
  }

  export interface SemanticEdge {
    id: string
    fromBubbleId: string
    toBubbleId: string
    label: string                  // natural language intersection phrase
    tension: TensionStatus
  }

  export interface GraphState {
    bubbles: Record<string, Bubble>
    columns: Record<string, Column>
    columnOrder: string[]
    edges: Record<string, SemanticEdge>
    activeColumnId: string | null
    focusedBubbleId: string | null
  }
  ```
- Create store in `src/store/graph.ts` with Zustand:
  ```ts
  import { create } from 'zustand'
  import { GraphState, Bubble, Column } from '@/types/graph'

  interface GraphActions {
    addColumn: () => Column
    addBubble: (columnId: string, parentId: string | null) => Bubble
    bifurcateBubble: (fromBubbleId: string) => Bubble
    updateBubbleContent: (id: string, content: string) => void
    setSummary: (id: string, summary: string) => void
    setBubbleStatus: (id: string, status: Bubble['status']) => void
    setActivePath: (columnId: string, bubbleId: string) => void
    setFocus: (bubbleId: string) => void
    addEdge: (fromId: string, toId: string, label: string) => void
    setTension: (edgeId: string, tension: SemanticEdge['tension']) => void
  }

  export const useGraphStore = create<GraphState & GraphActions>()(...)
  ```
- Write tests in `src/store/graph.test.ts`:
  - `addColumn` creates column with correct order
  - `addBubble` with parentId=null creates root bubble
  - `addBubble` with parentId adds to parent's children array
  - `bifurcateBubble` creates sibling with same parentId, incremented branchIndex
  - `updateBubbleContent` sets status to 'drafting'
  - `setActivePath` updates column.activePathId

**Verify:**
- Run: `npx vitest run src/store/graph.test.ts`
- Expected: all tests pass

---

## Task Type

greenfield

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
