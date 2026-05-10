# Task: 08-llm-background-engine--summarization

## Feature: reasoning-ui-mvp

## Dependencies

- **6. Chat interface per bubble** (06-chat-interface-per-bubble)
- **7. Gemini OAuth setup** (07-gemini-oauth-setup)

## Plan Section

### 8. LLM background engine — summarization

**Depends on**: 6, 7

**Files:**
- Create: `src/engine/summarize.ts`
- Create: `src/engine/summarize.test.ts`
- Create: `src/engine/worker.ts` (Web Worker entry)
- Create: `src/hooks/useEngine.ts`

**What to do**:
- `src/engine/summarize.ts`:
  ```ts
  // Given bubble chat transcript, calls Gemini Flash
  // Returns 3-5 word summary
  // Uses temperature=0 for determinism
  export async function summarizeBubble(
    transcript: string,
    accessToken: string
  ): Promise<string>
  ```
- `src/engine/worker.ts` — Web Worker that receives messages from main thread:
  ```ts
  type EngineMessage =
    | { type: 'SUMMARIZE'; bubbleId: string; transcript: string; accessToken: string }
    | { type: 'PROPAGATE'; bubbleId: string; parentSummary: string; accessToken: string }
    | { type: 'DETECT_TENSION'; edgeId: string; bubbleA: string; bubbleB: string; accessToken: string }
  ```
- `src/hooks/useEngine.ts`:
  - Instantiates Web Worker once on mount
  - Watches Zustand store for bubble content changes (debounce 800ms)
  - On change: posts `SUMMARIZE` to worker
  - On worker response: calls `setSummary(bubbleId, summary)`
- Write tests for `summarize.ts` by mocking `@google/genai`:
  - Returns string of 3-5 words
  - Does not throw on empty transcript (returns default "New idea")

**Verify:**
- Run: `npx vitest run src/engine/summarize.test.ts`
- Manual: type in a bubble → wait 800ms → bubble title updates to LLM summary

---

## Task Type

greenfield
