# PipePusher

> *"O usuário pensa mais rápido que digita, esquece mais rápido que prompta."*

PipePusher is a **tab-driven reasoning canvas** designed to capture, organize, and converge fragmented developer thoughts into coherent implementation plans. It pairs a fluid, keyboard-first UI with a silent, asynchronous LLM engine that deduces relationships between parallel ideas.

---

## 🧠 The Concept

Traditional chat interfaces force a linear, single-threaded thought process. Developers, however, often think in parallel, exploring multiple approaches, hitting dead ends, and bifurcating ideas.

PipePusher models this natural cognitive flow:
- **Columns (Tabs):** Independent, parallel lines of thought.
- **Bubbles:** Chat fragments within a line of thought.
- **Branches:** Bifurcations where a single thought splits into alternative approaches.
- **Semantic Edges:** The engine automatically detects when parallel columns touch on similar concepts, creating "tension" or "coherence" links.

The system's ultimate goal is to help the user **converge** multiple parallel lines into a single, highly coherent implementation plan via cherry-picking and merging.

---

## 🏗️ Architecture & Engineering

The application is built with a **Dumb UI / Smart Engine** pattern. The visual layer is strictly declarative, while the business logic, graph mutations, and LLM orchestrations live in an isolated state and background workers.

### Tech Stack
*   **Framework:** Next.js (App Router) + TypeScript
*   **Canvas:** React Flow (`@xyflow/react`)
*   **State Management:** Zustand (headless, detached from React render cycle)
*   **Persistence:** IndexedDB (`idb`) for offline-first local storage
*   **LLM Engine:** Gemini 1.5 Flash / Pro via `@google/genai`
*   **Auth:** NextAuth (Auth.js) with Google Provider (to handle Gemini OAuth securely)
*   **Testing:** Vitest

### The Background Engine
All LLM operations are decoupled from the UI thread using a **Web Worker** (`src/engine/worker.ts`). The engine observes the Zustand store and performs:
1.  **Summarization:** Shrinks raw thought fragments into 3-5 word titles.
2.  **Context Propagation:** Cascades context down the tree. It uses Gemini's native `ai.caches.create` for the parent node, meaning child nodes only transmit their differential content, saving massive amounts of tokens.
3.  **Semantic Tension:** Classifies the relationship between parallel columns (Coherent, Ambiguous, Contradictory).
4.  **Score Computation:** Evaluates the "implementation readiness" of a path using a combination of depth, coherence, and age decay.

### V2 Roadmap
While the MVP focuses entirely on the reasoning UI, V2 will introduce the **Executor**:
*   A local Docker container providing a REST/WS API.
*   Bash execution, Git integration, and filesystem access.
*   The reasoning canvas will be able to dispatch actual code generation subagents to the container.
*   Future pathfinding algorithms (LPA*) and Fuzzy Logic inference for semantic scoring.

---

## ⌨️ Keyboard-First UX

The interface is designed to be operated entirely without a mouse.

| Key | Action |
| :--- | :--- |
| `TAB` | Create a new column (new parallel line of reasoning) |
| `←` / `→` | Navigate between existing columns |
| `↑` / `↓` | Navigate between bubbles in the active column |
| `Enter` | Continue the chat in the active bubble |
| `Shift + Enter` | Bifurcate (on a previous bubble) or Deepen (on an active bubble) |
| `Ctrl + W` | Isolate the active column as a Worktree |
| `Ctrl + M` | Cherry-pick / Merge a worktree into the main graph |
| `Ctrl + H` | Toggle the History / Archive panel |
| `Esc` | Collapse current branch and move focus up to the parent |

---

## 🚀 Getting Started

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set up your environment variables:
    ```bash
    cp .env.local.example .env.local
    # Generate a secret: openssl rand -base64 32
    # Add your Google Client ID and Secret for OAuth
    ```
4.  Run the development server: `npm run dev`
5.  Open `http://localhost:3000`, hit **TAB**, and start reasoning.
