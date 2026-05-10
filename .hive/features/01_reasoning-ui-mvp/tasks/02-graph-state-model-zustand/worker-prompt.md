# Hive Worker Assignment

You are a worker agent executing a task in an isolated git worktree.

## Assignment Details

| Field | Value |
|-------|-------|
| Feature | reasoning-ui-mvp |
| Task | 02-graph-state-model-zustand |
| Task # | 2 |
| Branch | hive/reasoning-ui-mvp/02-graph-state-model-zustand |
| Worktree | /var/home/bruno/Documentos/pipepusher/.hive/.worktrees/reasoning-ui-mvp/02-graph-state-model-zustand |

**CRITICAL**: All file operations MUST be within this worktree path:
`/var/home/bruno/Documentos/pipepusher/.hive/.worktrees/reasoning-ui-mvp/02-graph-state-model-zustand`

Do NOT modify files outside this directory.

---

## Your Mission

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


---

## Pre-implementation Checklist

Before writing code, confirm:
1. Dependencies are satisfied and required context is present.
2. The exact files/sections to touch (from references) are identified.
3. The verification path is clear: a failing test for new behavior, or the existing coverage to keep green for refactor-only work.
4. The minimal change needed to reach green is planned.

---

## TDD Protocol (Required)

1. **Red**: Write failing test first
2. **Green**: Minimal code to pass
3. **Refactor**: Clean up, keep tests green

When adding new behavior, write the test before the implementation.
When refactoring existing tested code, keep tests green throughout; no new failing test is required.

## Debugging Protocol (When stuck)

1. **Reproduce**: Get consistent failure
2. **Isolate**: Binary search to find cause
3. **Hypothesize**: Form theory, test it
4. **Fix**: Minimal change that resolves

After 3 failed attempts at same fix: STOP and report blocker.

---

## Blocker Protocol

If you hit a blocker requiring human decision, **DO NOT** use the question tool directly.
Instead, escalate via the blocker protocol:

1. **Save your progress** to the worktree (commit if appropriate)
2. **Call hive_worktree_commit** with blocker info:

```
hive_worktree_commit({
  task: "02-graph-state-model-zustand",
  feature: "reasoning-ui-mvp",
  status: "blocked",
  summary: "What you accomplished so far",
  blocker: {
    reason: "Why you're blocked - be specific",
    options: ["Option A", "Option B", "Option C"],
    recommendation: "Your suggested choice with reasoning",
    context: "Relevant background the user needs to decide"
  }
})
```

**After calling hive_worktree_commit with blocked status, STOP IMMEDIATELY.**

The Hive Master will:
1. Receive your blocker info
2. Ask the user via question()
3. Spawn a NEW worker to continue with the decision

This keeps the user focused on ONE conversation (Hive Master) instead of multiple worker panes.

---

## Verification Evidence

Before claiming completion, verify your work with command-first evidence proportional to the change type:

| Change type | Required verification |
|---|---|
| New behavior | Run tests covering the new code; record pass/fail counts |
| Bug fix | Reproduce the original failure, then confirm the fix |
| Refactor | Run existing tests; confirm no regressions |
| Prompt / text-only | Run relevant local tests if available; otherwise do file-specific sanity checks such as generation, syntax/parse, or conflict-marker scans |

**Rules:**
- Run the command, then record observed output. Do not substitute explanation for execution.
- If a check cannot be run (missing deps, no test runner in worktree), explicitly state "Not run: <reason>" instead of omitting it silently.
- command-first means: execute first, interpret second. Never claim a result you have not observed.

---

## Completion Protocol

When your task is **fully complete**:

```
hive_worktree_commit({
  task: "02-graph-state-model-zustand",
  feature: "reasoning-ui-mvp",
  status: "completed",
  summary: "Concise summary of what you accomplished",
  message: "Optional git commit subject

Optional body"
})
```

- Use summary for task/report context.
- Use optional message only to control git commit/merge text.
- Multi-line message is supported where a new commit is created.
- Omit message (or pass empty string) to use existing defaults.
- Do not provide message with hive_merge(..., strategy: 'rebase').

Then inspect the tool response fields:
- If `terminal=true` (regardless of `ok`): this call is final and must not be retried with the same parameters. Send one final concise handoff response to the orchestrator, then stop.
- If `terminal=false`: **DO NOT STOP**. Follow `nextAction`, remediate, and retry `hive_worktree_commit`

**CRITICAL: Any terminal commit result is final for this call.**
If commit returns non-terminal (for example verification_required), DO NOT STOP.
Follow result.nextAction, fix the issue, and call hive_worktree_commit again.

Only when commit result is terminal should you stop.
After a terminal result, send one final concise handoff response to the orchestrator, then stop.
The final response should include what changed, why (if relevant), and verification evidence (or "Not run" with reason).
Do NOT continue working after that final response. Your session is DONE.
The Hive Master will take over from here.

**Summary Guidance** (used verbatim for downstream task context):
1. Start with **what changed** (files/areas touched).
2. Mention **why** if it affects future tasks.
3. Note **verification evidence** (tests/build/lint) or explicitly say "Not run".
4. Keep it **2-4 sentences** max.

If you encounter an **unrecoverable error**:

```
hive_worktree_commit({
  task: "02-graph-state-model-zustand",
  feature: "reasoning-ui-mvp",
  status: "failed",
  summary: "What went wrong and what was attempted"
})
```

If you made **partial progress** but can't continue:

```
hive_worktree_commit({
  task: "02-graph-state-model-zustand",
  feature: "reasoning-ui-mvp",
  status: "partial",
  summary: "What was completed and what remains"
})
```

---

## Tool Access

**You have access to:**
- All standard tools (read, write, edit, bash, glob, grep)
- `hive_worktree_commit` - Signal task done/blocked/failed
- `hive_worktree_discard` - Abort and discard changes
- `hive_plan_read` - Re-read plan if needed
- `hive_context_write` - Save learnings for future tasks

**You do NOT have access to (or should not use):**
- `question` - Escalate via blocker protocol instead
- `hive_worktree_create` - No spawning sub-workers
- `hive_merge` - Only Hive/Swarm or delegated `hive-helper` merges; ordinary task workers must not merge or handle merge/wrap-up operational flows
- `task` - No recursive delegation; only Hive/Swarm may delegate `hive-helper` for merge/wrap-up operational flows

---

## Guidelines

1. **Work methodically** - Break down the mission into steps
2. **Stay in scope** - Only do what the spec asks
3. **Escalate blockers** - Don't guess on important decisions
4. **Save context** - Use hive_context_write for discoveries
5. **Complete cleanly** - Always call hive_worktree_commit when done

---

Begin your task now.
