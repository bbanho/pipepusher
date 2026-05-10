# Task: 10-llm-background-engine--semantic-edges-and-tension-detection

## Feature: reasoning-ui-mvp

## Dependencies

- **8. LLM background engine — summarization** (08-llm-background-engine--summarization)

## Plan Section

### 10. LLM background engine — semantic edges and tension detection

**Depends on**: 8

**Files:**
- Create: `src/engine/semantic.ts`
- Create: `src/engine/semantic.test.ts`
- Modify: `src/engine/worker.ts`
- Modify: `src/components/canvas/ReasoningCanvas.tsx`

**What to do**:
- `src/engine/semantic.ts`:
  ```ts
  // Given two bubble summaries from parallel columns
  // Returns: { label: string; tension: TensionStatus }
  // label = natural language intersection phrase ("both concern access control")
  // tension = 'none' | 'tension' | 'contradiction'
  export async function detectSemanticRelation(
    summaryA: string,
    summaryB: string,
    accessToken: string
  ): Promise<{ label: string; tension: TensionStatus }>
  ```
- Engine triggers detection when:
  - A new column's root bubble gets its first summary
  - Compare against all other columns' root bubbles
  - Creates edges in Zustand: `addEdge(fromId, toId, label)` + `setTension(edgeId, tension)`
- Status bar component in canvas: shows tension warnings
- Merge suggestion: when engine detects two columns with `tension: 'none'` and similar depth, surface a discrete banner:
  ```
  💬 "Suas ideias em Tab 1 e Tab 2 convergem em: [label]. Quer explorar isso?"
  [Abrir como nova tab]  [Ignorar]
  ```
- Write tests mocking Gemini:
  - Returns label + tension for two summaries
  - Contradiction detected when summaries are semantic opposites (mocked)

**Verify:**
- Run: `npx vitest run src/engine/semantic.test.ts`
- Manual: open two parallel columns, type in both → after summarization, edge appears between them

---

## Task Type

modification
