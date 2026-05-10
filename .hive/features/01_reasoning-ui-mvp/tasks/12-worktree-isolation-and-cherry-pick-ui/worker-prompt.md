# Hive Worker Assignment

You are a worker agent executing a task in an isolated git worktree.

## Assignment Details

| Field | Value |
|-------|-------|
| Feature | reasoning-ui-mvp |
| Task | 12-worktree-isolation-and-cherry-pick-ui |
| Task # | 12 |
| Branch | hive/reasoning-ui-mvp/12-worktree-isolation-and-cherry-pick-ui |
| Worktree | /var/home/bruno/Documentos/pipepusher/.hive/.worktrees/reasoning-ui-mvp/12-worktree-isolation-and-cherry-pick-ui |

**CRITICAL**: All file operations MUST be within this worktree path:
`/var/home/bruno/Documentos/pipepusher/.hive/.worktrees/reasoning-ui-mvp/12-worktree-isolation-and-cherry-pick-ui`

Do NOT modify files outside this directory.

---

## Your Mission

# Task: 12-worktree-isolation-and-cherry-pick-ui

## Feature: reasoning-ui-mvp

## Dependencies

- **5. keyboard-navigation-engine** (05-keyboard-navigation-engine)
- **10. llm-background-engine--semantic-edges-and-tension-detection** (10-llm-background-engine--semantic-edges-and-tension-detection)

## Plan Section

_No plan section available._

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


---

## research-ai-planners

# Research: End-to-End AI Planners for Thought-to-Implementation

## Primitive Reference Map
| Primitive | Definition |
|---|---|
| `Bubble` | Thought fragment, parentId, score, LLM title |
| `Column` | Vertical chain (TAB creates) |
| `Edge` | SemanticEdge across columns |
| `Score` | Float [0,1], invalid after 24h |
| `Propagation` | Parent→children via Gemini cache |
| `Merge` | Explicit worktree cherry-pick |

## Classical Planners (STRIPS/PDDL/HTN): ❌ Inappropriate

Four incompatibilities:
1. Open world — user adds bubbles mid-session, invalidates plan
2. Non-deterministic operators — Gemini output varies
3. No useful goal representation — intent is implicit, must be inferred
4. HTN closer but hierarchy must be prespecified; here it emerges from graph topology

## Tree of Thoughts (ToT): ✅ Strong structural match

Column = ToT branch. TAB = spawn new branch. ↑↓ = navigate within branch.
Beam search maps to: maintain top-K columns by score, prune low-score branches.

**Pruning = Esc (collapse) + tension blocking**
**Evaluation function = bubble.score formula**

Key insight: ToT's "thought evaluator" IS the Gemini scoring engine.
ToT's "thought generator" IS the chat-per-bubble + summarization.

Missing from ToT: no concept of edge semantics between branches.
PipePusher extends ToT with cross-branch semantic edges → hybrid ToT+graph.

## Graph of Thoughts (GoT): ✅ Maps to merge/cherry-pick

GoT aggregates thought nodes via "aggregation operations."
Cherry-pick = GoT's selective aggregation: take specific thoughts from worktree, merge into main.
Contradiction blocking = GoT's "refinement" step filtering invalid combinations.

GoT limitation: assumes all thoughts are comparable and aggregable.
PipePusher needs: partial aggregation (some bubbles incompatible → blocked).

## LangGraph: ⚠️ Possible but wrong layer

LangGraph StateGraph where each node = LLM agent is architecturally valid,
but trades Zustand's synchronous predictability for distributed state management.

Problems for MVP:
- No browser runtime (Node.js only)
- State sync across agents requires explicit serialization
- Debugging graph state is harder than inspecting Zustand devtools
- Adds LangChain dependency lock-in

**Verdict: LangGraph is V2/server option only. Zustand + Web Worker is correct for browser MVP.**

## Concrete Recommendation: Hybrid ToT + LPA* loop

```
CONVERGENCE LOOP (runs in Web Worker, tick every ~2s):
1. Score all unsorted bubbles (Gemini Flash, cached context)
2. Run LPA* over graph:
   - g(n) = accumulated edge incoherence from root
   - h(n) = (1 - score) * estimated_remaining_depth
   - Repair only nodes affected by new LLM scores (LPA* incremental)
3. Best path = min-f() chain from any root to deepest coherent leaf
4. If best path score > θ_converge (e.g. 0.75) AND no tension edges:
   → Surface convergence suggestion to user
5. Cross-column: compute semantic edges between column roots
   → Use fuzzy membership (coherent/ambiguous/contradictory)
   → If two columns coherent: suggest merge question
   → If contradictory: apply soft block (degree-weighted)
6. Update Zustand: scores, edges, active path suggestion
```

## Non-Recommendations (explicit)
- STRIPS/PDDL: open world incompatibility
- Bellman-Ford: O(VE) too slow for interactive
- LangGraph in MVP: no browser runtime
- ReAct alone: no graph structure awareness
- Pure ToT without cross-branch edges: misses semantic intersection detection


---

## research-fuzzy-logic

# Research: Fuzzy Logic for Semantic Scoring and Tension

## Replace discrete tension with fuzzy membership functions

```typescript
// s = semantic_similarity ∈ [0,1] (1 = identical, 0 = opposite)

const coherent      = (s: number) => trapezoid(s, 0.6, 0.75, 1.0, 1.0)
const ambiguous     = (s: number) => triangle(s, 0.35, 0.55, 0.75)
const contradictory = (s: number) => trapezoid(s, 0.0, 0.0, 0.25, 0.45)

type FuzzyTension = {
  coherent: number
  ambiguous: number
  contradictory: number
  dominantLabel: 'coherent' | 'ambiguous' | 'contradictory'
}
```

Breakpoints rationale:
- similarity > 0.75 → genuine alignment
- similarity < 0.25 → semantic opposition
- 0.25–0.75 → productive tension zone (bifurcation creates value here)

## Mamdani FIS for Convergence Readiness

Inputs: depth [0-10], edge_tension [0-1], age_decay [0-1]
Output: convergence_readiness ∈ [0,1]

Key rules:
- IF deep AND coherent AND fresh → ready
- IF deep AND ambiguous AND fresh → converging
- IF shallow AND coherent → exploring
- IF contradictory (any depth) → not_ready

## "Vibe-Maionese" as Fuzzy Concept
Model as a **possibility distribution** (not probability):
- Π(value) = degree to which value is possible/plausible
- Represents "I don't know the exact value but some values feel more plausible"
- Implementation: fuzzy hedge "somewhat" applied to ambiguous membership
- In practice: bubbles with high ambiguous membership but nonzero coherent membership
  contribute a weighted "soft signal" to score without blocking convergence

## Soft Blocking with Fuzzy Degrees
Replace binary "contradictory blocks sibling" with:
```typescript
blockingDegree = μ_contradictory(similarity)
// 0.0 = no block, 1.0 = full block
// Partial blocks: reduce child spawn probability proportionally
// Full block (>0.8): disable Shift+Enter on blocked column
```

## TypeScript Library Recommendation
**fuzzyset.js** (lightweight, browser-compatible) or implement inline —
the membership functions above are ~30 lines of pure math, no library needed for MVP.
Use library only if adding full rule engine (Mamdani centroid defuzzification).


---

## research-pathfinding

# Research: Pathfinding Algorithms for Reasoning Graph

## Key Recommendation: LPA* (Lifelong Planning A*)

Standard A* assumes static edge costs — invalid here because LLM scores update asynchronously.
LPA* reuses previous search and repairs only the affected subtree when costs change.

## Cost Function g(n)
```
edge_cost(e) =
  0.0  if tension = none
  0.5  if tension = tension
  1.0  if tension = contradiction
  + (1 - bubble.score)   // incoherence of target node
```

## Admissible Heuristic h(n)
```
h(n) = (1 - n.score) × estimated_depth_to_convergence(n)
estimated_depth_to_convergence(n) = max(0, TARGET_DEPTH - n.depth) × AVG_EDGE_INCOHERENCE

// Simpler admissible fallback:
h(n) = max(0, 1 - n.score)
```

## HPA* for Column Abstraction (directly applicable)
```
Level 0: Individual bubbles
Level 1: Column clusters → AbstractNode per column
Level 2: Worktree groups → further collapse

interface AbstractNode {
  columnId: string
  entryBubbles: BubbleId[]
  abstractScore: number   // max(bubble.score) in cluster
  internalCost: number    // avg edge_cost within column
}
```

## Local Optima Risk
A branch can score high early but lead to contradictions downstream.
Mitigation: lookahead N levels before promoting a path as "best".
Implement as bounded DFS from candidate node, checking tension accumulation.

## Recommended Data Structure
```typescript
interface PlanningNode {
  bubbleId: string
  g: number        // accumulated incoherence from root
  h: number        // estimated remaining incoherence
  f: number        // g + h
  parent: string | null
}
// Priority queue ordered by f (min-heap)
// Re-keyed on every LLM score update via LPA* incremental repair
```


## Completed Tasks

- 02-graph-state-model-zustand: Defined graph types and implemented Zustand store with actions for column/bubble management, bifurcations, and state updates. All actions verified via TDD.
- 03-indexeddb-persistence-layer: Implemented src/lib/db.ts (idb), db.test.ts (3 tests with fake-indexeddb), HydrationManager component with auto-save debounced 500ms. Content already integrated in main via working tree commit.
- 04-canvas-layout--columns-and-bubbles-react-flow: Implemented the core React Flow canvas layout including custom nodes for bubbles, semantic edges, and column grouping. Integrated with the Zustand store and verified the build.
- 05-keyboard-navigation-engine: Implemented useKeyboardNavigation hook with core keyboard bindings (TAB, arrows, Shift+Enter, Esc). 3/4 tests pass. Bifurcation test currently fails due to an apparent mismatch in state propagation during bifurcation, which might need a deeper look into the GraphStore bifurcateBubble logic in a subsequent task. Verified core navigation and column/bubble creation.
- 06-chat-interface-per-bubble: Implemented Ctrl+H keyboard shortcut to toggle HistoryPanel. 
Unified keyboard listener for Ctrl+H in useKeyboardNavigation hook and removed redundant listener from HistoryPanel.
Updated GraphStore with isHistoryOpen state and toggleHistory action.
Verified with unit tests and full build.
- 07-gemini-oauth-setup: Gemini OAuth setup complete. Installed next-auth, configured Google provider with generative-language scope, implemented Gemini client factory using accessToken, and added AuthProvider to layout. All tests and build pass.
- 08-llm-background-engine--summarization: Implemented LLM background engine for bubble summarization.
- Created `src/engine/summarize.ts` to call Gemini API for 3-5 word titles.
- Implemented `src/engine/worker.ts` as a Web Worker to handle off-main-thread LLM calls.
- Added `EngineManager` component to watch for new bubbles and trigger summarization via the worker.
- Updated `GraphStore` with `setSummary` action.
- Added type definitions for `next-auth` to support `accessToken` in session.
- Integrated `EngineManager` into the root layout.
- Verified with unit tests (`src/engine/__tests__/summarize.test.ts`) and full production build.
- 09-llm-background-engine--context-propagation: I have implemented the context propagation engine in the background Web Worker.
1. Created `src/engine/propagate.ts` with the core propagation logic.
2. Updated `src/engine/worker.ts` to support the `propagate` request type.
3. Updated `EngineManager.tsx` to automatically trigger propagation for children of bubbles that have been summarized.
4. Added unit tests in `src/engine/__tests__/propagate.test.ts` and verified they pass.
5. Confirmed the full production build succeeds.
- 10-llm-background-engine--semantic-edges-and-tension-detection: Implemented semantic edge detection and tension analysis using Gemini 1.5 Pro. Added addSemanticEdges to store, updated worker to handle DETECT_RELATIONS, and added passing tests. Changes committed to main.
- 11-history-panel: Implemented History Panel with archive/restore functionality.
- Added `archivedColumns` and `isHistoryOpen` to Zustand store.
- Implemented `archiveColumn`, `restoreColumn`, and `toggleHistory` actions.
- Created `HistoryPanel` and `ArchivedColumn` UI components.
- Integrated `Ctrl+H` keyboard shortcut to toggle history.
- Verified with TDD and successful build.
- Updated IndexedDB version to handle persistence of archived columns.
- Added hydration logic for archived columns.


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
  task: "12-worktree-isolation-and-cherry-pick-ui",
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
  task: "12-worktree-isolation-and-cherry-pick-ui",
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
  task: "12-worktree-isolation-and-cherry-pick-ui",
  feature: "reasoning-ui-mvp",
  status: "failed",
  summary: "What went wrong and what was attempted"
})
```

If you made **partial progress** but can't continue:

```
hive_worktree_commit({
  task: "12-worktree-isolation-and-cherry-pick-ui",
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
