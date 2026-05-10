# Task: 09-llm-background-engine--context-propagation

## Feature: reasoning-ui-mvp

## Dependencies

- **8. LLM background engine — summarization** (08-llm-background-engine--summarization)

## Plan Section

### 9. LLM background engine — context propagation

**Depends on**: 8

**Files:**
- Modify: `src/engine/worker.ts`
- Create: `src/engine/propagate.ts`
- Create: `src/engine/propagate.test.ts`
- Modify: `src/store/graph.ts` (add propagation queue actions)

**What to do**:
- `src/engine/propagate.ts`:
  ```ts
  // Creates Gemini cache for parent bubble context
  // Sends diff to each child with cachedContent reference
  // Returns updated summaries for each child
  export async function propagateToChildren(
    parentBubble: Bubble,
    children: Bubble[],
    accessToken: string
  ): Promise<{ bubbleId: string; summary: string }[]>
  ```
- Propagation flow:
  1. Parent bubble edited → `setBubbleStatus(parentId, 'propagating')`
  2. All direct children: `setBubbleStatus(childId, 'blocked')`
  3. Call Gemini: create cache for parent context
  4. For each child: `generateContent` with `cachedContent: cache.name` + child's own messages
  5. Update child summaries
  6. Set children back to 'summarized'
  7. Recurse for grandchildren (level by level, await each level)
- Add to Zustand: `propagationQueue: string[]` — bubble ids pending propagation
- Write tests mocking `@google/genai`:
  - Parent edit → children become 'blocked' during propagation
  - Children become 'summarized' after propagation completes
  - Propagation respects depth order (level by level)

**Verify:**
- Run: `npx vitest run src/engine/propagate.test.ts`
- Manual: edit a bubble that has children → children show spinner → then update

---

## Task Type

modification
