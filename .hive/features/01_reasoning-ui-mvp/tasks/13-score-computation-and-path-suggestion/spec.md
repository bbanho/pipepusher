# Task: 13-score-computation-and-path-suggestion

## Feature: reasoning-ui-mvp

## Dependencies

- **9. LLM background engine — context propagation** (09-llm-background-engine--context-propagation)
- **10. LLM background engine — semantic edges and tension detection** (10-llm-background-engine--semantic-edges-and-tension-detection)

## Plan Section

### 13. Score computation and path suggestion

**Depends on**: 9, 10

**Files:**
- Create: `src/engine/score.ts`
- Create: `src/engine/score.test.ts`
- Modify: `src/store/graph.ts` (add updateScore action)
- Modify: `src/components/canvas/BubbleNode.tsx` (show score indicator)

**What to do**:
- `src/engine/score.ts`:
  ```ts
  // score = (depth * 0.4) + (coherenceEdges * 0.4) + (ageDecay * 0.2)
  // depth: number of ancestors
  // coherenceEdges: count of edges touching this bubble without tension
  // ageDecay: normalized time since creation (newer = higher, decays over 24h)
  export function computeScore(bubble: Bubble, edges: SemanticEdge[]): number

  // Given all bubbles, returns the highest-scoring leaf bubble
  export function findBestPath(bubbles: Record<string, Bubble>, edges: SemanticEdge[]): string[]
  ```
- Engine calls `computeScore` after every summarization + propagation cycle
- Store updates `bubble.score` and `bubble.lastScoredAt`
- `BubbleNode` shows a subtle score bar (thin colored strip, 0=grey, 1=green)
- When one path has score > 0.8 and others < 0.4: surface suggestion:
  ```
  ✨ "Este caminho tem maior coerência. Quer convergir para ele?"
  [Definir como caminho principal]  [Ignorar]
  ```
- Write tests:
  - Deeper bubble with no tension scores higher than shallow bubble
  - Age decay reduces score correctly after simulated time
  - `findBestPath` returns leaf of highest-score chain

**Verify:**
- Run: `npx vitest run src/engine/score.test.ts`
- Manual: build a tree of 3+ levels → score bars appear on bubbles

---

## Task Type

modification
