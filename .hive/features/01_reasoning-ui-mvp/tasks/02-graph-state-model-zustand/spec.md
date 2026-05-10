# Task: 02-graph-state-model-zustand

## Feature: reasoning-ui-mvp

## Dependencies

- **1. Project scaffold** (01-project-scaffold)

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
