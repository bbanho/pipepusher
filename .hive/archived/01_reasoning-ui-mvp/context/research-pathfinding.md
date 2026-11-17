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
