# Task: 03-indexeddb-persistence-layer

## Feature: reasoning-ui-mvp

## Dependencies

- **2. Graph state model (Zustand)** (02-graph-state-model-zustand)

## Plan Section

### 3. IndexedDB persistence layer

**Depends on**: 2

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/db.test.ts`

**What to do**:
- Use `idb` library to persist graph state between sessions:
  ```ts
  import { openDB, DBSchema } from 'idb'
  import { GraphState } from '@/types/graph'

  interface PipePusherDB extends DBSchema {
    sessions: {
      key: string
      value: { id: string; state: GraphState; updatedAt: number }
    }
  }

  export async function saveSession(id: string, state: GraphState): Promise<void>
  export async function loadSession(id: string): Promise<GraphState | null>
  export async function listSessions(): Promise<{ id: string; updatedAt: number }[]>
  ```
- Auto-save: subscribe to Zustand store changes, debounce 500ms, call `saveSession`
- On app load: call `loadSession('default')`, hydrate store if data exists
- Write tests in `src/lib/db.test.ts` using fake-indexeddb:
  ```bash
  npm install -D fake-indexeddb
  ```
  - `saveSession` then `loadSession` returns same state
  - `loadSession` with unknown id returns null
  - `listSessions` returns sorted by updatedAt desc

**Verify:**
- Run: `npx vitest run src/lib/db.test.ts`
- Expected: all tests pass

---

## Task Type

greenfield
