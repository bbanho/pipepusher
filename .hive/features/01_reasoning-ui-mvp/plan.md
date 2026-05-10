# PipePusher — Reasoning UI MVP

## Discovery

### Original Request
- "como poderiamos, usando a tecla TAB, trocar entre ideias fragmentadas de desenvolvimento, entre LLMs desinformados mas municiados de como 'vibe coders' pensam em paralelo para organizar uma arquitetura de software ótima para implementação das ideias?"
- "o usuário pensa mais rápido que digita, esquece mais rápido que prompta"
- "tabs impedirão umas as outras de mesmo nível se concorrentes / elas terão filhas que nascerão caso as tias sejam coerentes"
- "se navegar pra bolha anterior e seguir o chat, abrir bifurcação a partir da selecionada"
- "o sistema deve trabalhar para convergir numa unica coluna de uma unica linha"
- "o sistema propaga edição da linha de raciocinio automaticamente para os agentes filhos, bloqueando interação até o processamento, aproveitar cache de contexto"
- "setas horizontais são possíveis, mas apenas o tab gera uma nova linha de raciocinio"

### Interview Summary
- **Product type**: Standalone planning tool (not integrated into IntraClinica)
- **Tab semantics**: Fragment of free-text intention — starts vague, LLM summarizes to title
- **LLM model**: Gemini via OAuth Google (`@google/genai`)
- **Graph visibility**: Discrete — user sees only the merge question suggestion, not raw graph
- **Branch visibility**: Active path visible, siblings collapsed (accessible)
- **Navigation within column**: Arrow keys + active bubble expanded
- **Convergence output**: Merge question offered; contradictions block evolution
- **Runtime MVP**: Frontend-first, Next.js, no backend server
- **Executor (bash)**: Deferred to V2 — runs in Docker container, same API local/cloud
- **Desktop**: Electron wrapping Next.js + container in V2
- **Persistence**: IndexedDB for MVP, Supabase in V2
- **Deploy**: Vercel or local `next dev`

### Research Findings
- `@google/genai`: `ai.caches.create` + `cachedContent: cache.name` — native context caching confirmed
- Gemini 2.0 Flash: fast + cheap for summarization tasks
- Gemini 2.5 Pro: semantic deduction, contradiction detection
- React Flow: MIT, interactive canvas, custom nodes, edge labels — direct fit for bubble canvas
- Zustand: lightweight, no provider needed, testable outside React
- IndexedDB via `idb` library: structured persistence, works in Next.js client components

---

## Non-Goals (What we are NOT building)

- Bash / shell executor (V2)
- Docker container integration (V2)
- Electron packaging (V2)
- Supabase / cloud persistence (V2)
- Multi-user collaboration
- Mobile layout
- Export to Hive plan.md (V2)
- Authentication UI (OAuth happens silently via Google on first LLM call)

---

## Design Summary

PipePusher is a **tab-driven reasoning canvas** where each column represents an independent line of thought. The user types freely into chat bubbles; an LLM engine runs silently in the background summarizing, detecting semantic relationships, and propagating context changes down the tree.

```
┌─ COLUMN A (active) ──────────┐  ┌─ COLUMN B ──────────┐
│                              │  │                      │
│  ● auth offline              │  │  ● revocation server │
│  │                           │  │  │                    │
│  ● JWT + local cache         │  │  ● blacklist endpoint│
│  │                           │  │       ↕ tension w/ A │
│  ├─ ● [branch collapsed]     │  └──────────────────────┘
│  │                           │
│  ▶ ● refresh automatic       │  ← ACTIVE PATH
│      > _  [input here]       │
│                              │
│  ══ propagating to children ═│  ← propagation lock overlay
└──────────────────────────────┘

[HISTORY PANEL — minimized]
  Archived columns · Discarded branches · Completed merges
```

**Keyboard map:**

| Key | Action |
|---|---|
| `TAB` | New column (new reasoning line) |
| `← →` | Navigate between existing columns |
| `↑ ↓` | Navigate between bubbles in column |
| `Enter` | Continue chat in active bubble |
| `Shift+Enter` (on previous bubble) | Bifurcate: new sibling branch from that bubble |
| `Shift+Enter` (on active bubble) | Create child bubble (deepen) |
| `Ctrl+W` | Isolate column as worktree |
| `Ctrl+M` | Cherry pick / propose worktree merge |
| `Ctrl+H` | Toggle history panel |
| `Esc` | Collapse branch / go up to parent |

**Background engine loop:**
1. Bubble created → Gemini Flash summarizes to 3-5 word title
2. Bubble edited → diff propagated to children via cached context (async queue, Web Worker)
3. Parallel column → semantic edge computed → intersection phrase generated
4. Tension → status bar signal (non-blocking)
5. Convergence → `Ctrl+M` enabled, merge question surfaced

---

## Tasks

### 1. Project scaffold

**Depends on**: none

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `.env.local.example`

**What to do**:
- Run: `npx create-next-app@latest pipepusher --typescript --tailwind --app --src-dir --no-git`
- Install dependencies:
  ```bash
  npm install @google/genai @xyflow/react zustand idb
  npm install -D @types/node
  ```
- In `next.config.ts`, ensure no static export (keep server mode):
  ```ts
  const config: NextConfig = { reactStrictMode: true }
  export default config
  ```
- In `.env.local.example`:
  ```
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  NEXTAUTH_SECRET=
  NEXTAUTH_URL=http://localhost:3000
  # V2:
  # EXECUTOR_URL=http://localhost:8080
  ```
- Verify: `npm run dev` → app loads at localhost:3000

**Verify:**
- Run: `npm run build`
- Expected: build succeeds with no errors

---

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

### 4. Canvas layout — columns and bubbles (React Flow)

**Depends on**: 2

**Files:**
- Create: `src/components/canvas/ReasoningCanvas.tsx`
- Create: `src/components/canvas/BubbleNode.tsx`
- Create: `src/components/canvas/SemanticEdge.tsx`
- Create: `src/components/canvas/ColumnGroup.tsx`
- Modify: `src/app/page.tsx`

**What to do**:
- Install React Flow: already in dependencies (`@xyflow/react`)
- `BubbleNode.tsx` — custom React Flow node:
  ```tsx
  // Props from React Flow NodeProps + Bubble data
  // Shows: summary title (collapsed) OR chat input (when focused/active)
  // Status indicators: spinner during 'propagating', lock icon during 'blocked'
  // Branch indicator: dashed left border when is a non-active branch
  ```
- `SemanticEdge.tsx` — custom edge with label:
  ```tsx
  // Shows intersection phrase on hover
  // Color: green (coherent) | yellow (tension) | red (contradiction)
  ```
- `ColumnGroup.tsx` — visual grouping per column (React Flow `<NodeResizer>` or background rect)
- `ReasoningCanvas.tsx`:
  ```tsx
  // Reads from useGraphStore()
  // Converts bubbles → React Flow nodes
  // Converts edges → React Flow edges
  // Sets up ReactFlowProvider
  // NO keyboard handling here (handled in task 5)
  ```
- In `src/app/page.tsx`, render `<ReasoningCanvas />` full viewport

**Verify:**
- Run: `npm run dev`
- Open browser: canvas renders with empty state (no columns yet)
- Run: `npm run build` — no TypeScript errors

---

### 5. Keyboard navigation engine

**Depends on**: 2, 4

**Files:**
- Create: `src/hooks/useKeyboardNavigation.ts`
- Create: `src/hooks/useKeyboardNavigation.test.ts`

**What to do**:
- Hook reads from `useGraphStore`, dispatches actions
- Implement all keyboard bindings:
  ```ts
  // TAB (not in input) → addColumn(), setFocus to new column root bubble
  // ← → → navigate columnOrder, update activeColumnId
  // ↑ ↓ → navigate bubbles in active column (active path only)
  // Enter (not in input) → focus input of active bubble
  // Shift+Enter in input → if on previous bubble: bifurcateBubble()
  //                      → if on active bubble: addBubble() as child
  // Ctrl+W → flag column as worktree
  // Ctrl+M → trigger merge suggestion (emit event, handled by engine)
  // Ctrl+H → toggle history panel visibility
  // Esc → collapse current branch, move focus to parent
  ```
- TAB must be captured before browser default (use `e.preventDefault()`)
- Write tests with simulated key events:
  - TAB on empty state → creates first column with root bubble
  - TAB again → creates second column
  - ← navigates to first column
  - ↓ on root bubble with children → moves to first child
  - Shift+Enter on non-active bubble → calls bifurcateBubble

**Verify:**
- Run: `npx vitest run src/hooks/useKeyboardNavigation.test.ts`
- Expected: all tests pass
- Manual: open app, press TAB → column appears

---

### 6. Chat interface per bubble

**Depends on**: 4, 5

**Files:**
- Create: `src/components/chat/BubbleChat.tsx`
- Create: `src/components/chat/MessageList.tsx`
- Create: `src/components/chat/ChatInput.tsx`
- Create: `src/types/chat.ts`

**What to do**:
- Define chat types in `src/types/chat.ts`:
  ```ts
  export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    createdAt: number
  }

  export interface ChatSession {
    bubbleId: string
    messages: Message[]
  }
  ```
- `BubbleChat.tsx` — rendered inside `BubbleNode` when bubble is active/focused:
  - `MessageList`: scrollable list of messages
  - `ChatInput`: textarea that captures Enter (send) and Shift+Enter (bubble action)
  - When collapsed: shows only `bubble.summary` as title
  - When expanded: shows full message history + input
- Chat state lives in a separate Zustand slice (`useChatStore`) keyed by `bubbleId`
- `ChatInput` must NOT intercept TAB (let it bubble to keyboard nav)

**Verify:**
- Run: `npm run dev`
- Manual: press TAB → column + bubble appear → click bubble → chat input focuses → type + Enter → message appears

---

### 7. Gemini OAuth setup

**Depends on**: 1

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/gemini.ts`
- Modify: `src/app/layout.tsx`

**What to do**:
- Install NextAuth:
  ```bash
  npm install next-auth
  ```
- Configure Google OAuth provider in `src/app/api/auth/[...nextauth]/route.ts`:
  ```ts
  import NextAuth from 'next-auth'
  import GoogleProvider from 'next-auth/providers/google'

  export const { handlers, auth } = NextAuth({
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
          params: {
            scope: 'openid email profile https://www.googleapis.com/auth/generative-language',
          },
        },
      }),
    ],
    callbacks: {
      async jwt({ token, account }) {
        if (account) token.accessToken = account.access_token
        return token
      },
      async session({ session, token }) {
        session.accessToken = token.accessToken
        return session
      },
    },
  })
  ```
- `src/lib/gemini.ts` — Gemini client factory:
  ```ts
  import { GoogleGenAI } from '@google/genai'

  export function getGeminiClient(accessToken: string) {
    return new GoogleGenAI({ auth: accessToken })
  }
  ```
- Add `<SessionProvider>` to `layout.tsx`
- Create Google OAuth credentials at console.cloud.google.com, add to `.env.local`

**Verify:**
- Run: `npm run dev`
- Navigate to localhost:3000 → Google sign-in appears → after auth, session established
- Run: `npm run build` — no errors

---

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

### 11. History panel

**Depends on**: 3, 4

**Files:**
- Create: `src/components/history/HistoryPanel.tsx`
- Create: `src/components/history/ArchivedColumn.tsx`
- Modify: `src/store/graph.ts` (add archiveColumn action)

**What to do**:
- `archiveColumn` action in Zustand:
  - Moves column to `archivedColumns: Record<string, Column & { bubbles: Bubble[] }>`
  - Removes from active `columns` and `columnOrder`
- `HistoryPanel.tsx`:
  - Toggled by `Ctrl+H`
  - Renders as side drawer (right side, 320px width)
  - Lists archived columns with their root bubble summaries
  - Click on archived column → restore it to active graph
- `ArchivedColumn.tsx`: collapsed view of archived column (tree of summaries)
- History is also persisted to IndexedDB (include `archivedColumns` in saved state)

**Verify:**
- Run: `npm run dev`
- Manual: press Ctrl+H → drawer opens → archived columns appear (empty initially)
- Archive a column → it disappears from canvas → appears in history panel

---

### 12. Worktree isolation and cherry pick UI

**Depends on**: 5, 10

**Files:**
- Create: `src/components/worktree/WorktreeBadge.tsx`
- Create: `src/components/worktree/MergeDialog.tsx`
- Modify: `src/store/graph.ts` (add worktree actions)
- Modify: `src/hooks/useKeyboardNavigation.ts`

**What to do**:
- Zustand actions:
  ```ts
  isolateAsWorktree: (columnId: string) => void  // sets worktreeId on column + all its bubbles
  proposeCherry: (fromColumnId: string, toColumnId: string) => CherryProposal
  applyCherry: (proposal: CherryProposal, selectedBubbleIds: string[]) => void
  ```
- `WorktreeBadge.tsx`: small badge on column header when `worktreeId !== null`
- `MergeDialog.tsx`: modal opened by `Ctrl+M`
  - Lists bubbles from worktree column
  - User selects which to cherry-pick
  - Conflicting bubbles (tension detected) shown with warning
  - "Apply" button: calls `applyCherry`, archives worktree column
- Keyboard: `Ctrl+W` → `isolateAsWorktree(activeColumnId)`

**Verify:**
- Run: `npm run dev`
- Manual: press Ctrl+W on a column → badge appears → Ctrl+M → dialog opens with bubble list

---

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

### 14. Polish and deploy

**Depends on**: 11, 12, 13

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/ui/StatusBar.tsx`
- Create: `src/components/ui/PropagationOverlay.tsx`
- Create: `vercel.json`

**What to do**:
- `StatusBar.tsx`: fixed bottom bar showing:
  - Active column + bubble path (breadcrumb)
  - Tension warnings ("⚡ Tensão detectada entre Tab 1 e Tab 2")
  - Propagation status ("⏳ Propagando para 3 filhos...")
  - Score of active path
  - Keyboard shortcut hints (toggle with `?`)
- `PropagationOverlay.tsx`: semi-transparent overlay on blocked bubbles with spinner
- Visual polish:
  - Dark theme (CSS variables)
  - Column headers with color accent per column (rotating palette)
  - Collapsed branch indicator: dashed left border
  - Active bubble: elevated card with shadow
  - Semantic edge labels: fade in on hover
- `vercel.json`: standard Next.js config, env vars documented
- Deploy to Vercel: `vercel deploy`

**Verify:**
- Run: `npm run build` — zero errors, zero TypeScript warnings
- Deploy: app accessible at Vercel URL
- Full manual flow: TAB → type idea → Shift+Enter → deepen → TAB again → type parallel idea → watch edge appear → Ctrl+M → merge dialog

---
