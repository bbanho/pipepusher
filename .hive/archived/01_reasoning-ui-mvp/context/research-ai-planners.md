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
