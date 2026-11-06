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
