<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NEXUS-canvas — Agent & Engineering Guidelines (v1.0)

This document is the absolute source of truth for AI Agents and Developers working on this project. Follow these rules strictly.

Inspired by the discipline of `intraclinica-ng/AGENTS.md` — adapted for this stack and domain.

---

## 0. Language Policy

**English is the mandatory language for all documentation, plans, context files, commit messages, code comments, and agent communication.** This is a token-efficiency rule: consistent single-language output reduces tokenization overhead and improves cross-model portability.

- Agent responses to the user may be in Portuguese if the user writes in Portuguese.
- All written artifacts (AGENTS.md, plan.md, context files, specs, code comments) must be in English.
- Violation of this rule in new artifacts is a defect, not a style preference.

---

## 1. Engineering Principles

### Graph Invariants (Domain Core)

The reasoning graph is the central domain model. These invariants must never be violated:

- **Column identity:** A column is created ONLY by the TAB key action. Never create columns implicitly.
- **Bubble parentage:** Every bubble except a column root must have a valid `parentId` pointing to an existing bubble in the same column.
- **Branch immutability:** Once a bubble has children, its `parentId` cannot change.
- **Propagation order:** Context propagation is always level-by-level (parent before children). Never skip levels.
- **Worktree isolation:** Bubbles with a `worktreeId` must never be merged into the main graph without an explicit cherry-pick action. Never auto-merge worktree content.
- **Score freshness:** `bubble.score` is invalid after 24h without re-scoring. Always check `lastScoredAt` before trusting a score.

### LLM Calls

- **temperature=0** for all deterministic operations (summarization, scoring, propagation diff).
- **Gemini Flash** for fast/cheap operations: summarization, title generation.
- **Gemini Pro** for complex operations: semantic edge detection, tension classification, convergence detection.
- **Always use context caching** (`ai.caches.create`) when calling Gemini with a parent bubble's context as prefix. Cache the parent, send only the diff.
- **Never call Gemini from the React render cycle.** All LLM calls go through the Web Worker (`src/engine/worker.ts`).

### State Management

- **Zustand is the single source of truth** for the graph in memory.
- **IndexedDB** (via `idb`) is the persistence layer. Auto-save on every Zustand state change (debounced 500ms).
- **React Flow is a rendering layer only.** It reads from Zustand. Never treat React Flow's internal node state as authoritative.
- **No server state in MVP.** All state is local. No fetch calls to external APIs except Gemini.

### Anti-Blind-Loop (Empirical Debugging)

- **Never infer Gemini API behavior from training data alone.** The API surface may differ from what the model was trained on.
- **If a Gemini integration issue arises** (caching not working, OAuth token rejected, response format unexpected), stop guessing.
- **Write an isolated test script** (e.g. `scripts/test-gemini.ts`) to reproduce the exact call and log the raw response before modifying application code.
- Agents are **prohibited** from looping blind attempts altering source code based on unverified API hypotheses.

---

## 2. Agentic Workflow

Agents and humans operate in a continuous feedback and verification cycle.

### A. Planning and Hive

- Use the **Hive** framework: `hive_feature_create` → `hive_plan_write` before any code change.
- Keep Hive updated: every completed task must be committed via `hive_worktree_commit`.
- Context files: write durable decisions to `hive_context_write` — especially LLM behavior observations and graph invariant discoveries.

### B. Mandatory Development and Testing

- **TDD:** Every new module or behavior MUST include unit tests written before the implementation.
- **Test files:** `src/**/*.test.ts` — run with `npx vitest run`.
- **Quality gate:** Code is only valid after passing:
  ```bash
  npm run build          # TypeScript compilation + Next.js build
  npx vitest run         # all unit tests
  ```
- No task is `done` unless both commands pass with zero errors.

### C. Commit Discipline

- **Atomic commits:** One logical change per commit.
- **Commit message format:** `type(scope): description` — e.g. `feat(graph): add bifurcateBubble action`, `fix(engine): prevent propagation loop on circular references`.
- Never commit with `--no-verify`.

### D. No Feature Without Tests

- Every Zustand action must have a test covering: happy path, edge case (empty state, invalid id), and invariant violation (should throw or be a no-op).
- Every engine function (`summarize`, `propagate`, `detectSemanticRelation`, `computeScore`) must have tests with mocked Gemini responses.
- Tests must not call real Gemini API. Always mock `@google/genai`.

---

## 3. Tech Stack

- **Framework:** Next.js App Router (TypeScript). Read `node_modules/next/dist/docs/` before writing routing or server component code.
- **Canvas:** `@xyflow/react` (React Flow v12+). Do NOT use the v10 API — hooks and component names changed.
- **State:** `zustand` (v5+). Use the functional `create` pattern, not the class pattern.
- **Persistence:** `idb` for IndexedDB. Schema versioning is mandatory — always increment `version` when changing the store schema.
- **LLM:** `@google/genai` (Google GenAI SDK). OAuth via NextAuth Google provider.
- **Testing:** `vitest` + `@testing-library/react` for component tests. Use `fake-indexeddb` for IndexedDB tests.
- **Node.js:** Use the version in `.nvmrc` or `engines` field in `package.json` as source of truth.

---

## 4. UX Doctrine: Keyboard-First Reasoning

This is a **keyboard-driven tool**. Every interaction must be reachable without a mouse.

### Keyboard Map (Canonical — Do Not Deviate)

| Key | Action |
|---|---|
| `TAB` | Create new column (ONLY way to create columns) |
| `← →` | Navigate between existing columns |
| `↑ ↓` | Navigate between bubbles in active column |
| `Enter` | Continue chat in active bubble |
| `Shift+Enter` on **previous** bubble | Bifurcate: new sibling branch from that bubble |
| `Shift+Enter` on **active** bubble | Create child bubble (deepen vertically) |
| `Ctrl+W` | Isolate column as worktree |
| `Ctrl+M` | Cherry pick / propose worktree merge |
| `Ctrl+H` | Toggle history panel |
| `Esc` | Collapse branch / go up to parent |

**TAB must always be intercepted** (`e.preventDefault()`) when focus is not inside a textarea. Never let it cycle through DOM elements.

### Component Design: Dumb UI, Smart Engine

UI components are declarative and structurally dumb. Business logic (graph mutations, LLM calls, score computation) belongs in the engine and Zustand store — not in React components.

- Components read from `useGraphStore()` and dispatch actions. They do not compute derived state.
- The Web Worker (`src/engine/worker.ts`) owns all LLM communication. Components never call Gemini directly.

---

## 5. V2 Boundaries (Do Not Implement in MVP)

These are explicitly out of scope for MVP. Do not add them speculatively:

- Bash / shell executor
- Docker container integration
- Electron packaging
- Supabase / cloud persistence
- Multi-user collaboration
- Export to external formats
- Mobile layout

If a task seems to require any of the above, stop and raise a blocker. Do not implement V2 features to satisfy a V1 requirement.

---

## 6. Key Files Reference

| Path | Purpose |
|---|---|
| `src/types/graph.ts` | Canonical domain types — `Bubble`, `Column`, `SemanticEdge`, `GraphState` |
| `src/store/graph.ts` | Zustand store — all graph mutations |
| `src/engine/worker.ts` | Web Worker entry — all LLM calls |
| `src/engine/summarize.ts` | Bubble title generation (Gemini Flash) |
| `src/engine/propagate.ts` | Context propagation cascade |
| `src/engine/semantic.ts` | Semantic edge + tension detection |
| `src/engine/score.ts` | Score computation per bubble |
| `src/lib/db.ts` | IndexedDB persistence (idb) |
| `src/lib/gemini.ts` | Gemini client factory (OAuth) |
| `src/hooks/useKeyboardNavigation.ts` | Canonical keyboard handler |
| `src/components/canvas/ReasoningCanvas.tsx` | React Flow canvas root |
