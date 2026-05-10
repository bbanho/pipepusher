# PipePusher — Overview

## At a Glance

Tab-driven reasoning canvas where each column = independent line of thought.
User types freely into chat bubbles. LLM engine runs silently: summarizes, detects semantic relationships, propagates context changes down the tree, scores paths, suggests convergence.

Goal: converge to 1 column · 1 active path · 1 implementation plan.

## Stack (frozen)
- Next.js App Router + TypeScript
- React Flow (`@xyflow/react`) — bubble canvas
- Zustand + IndexedDB — graph state + persistence
- Gemini via OAuth Google (`@google/genai`) — LLM engine
- `ai.caches.create` — context caching per parent bubble
- Web Worker — async LLM queue, non-blocking UI
- Vitest — unit tests

## Tasks Progress
| # | Task | Status |
|---|---|---|
| 01 | project-scaffold | ✅ done |
| 02 | graph-state-model (Zustand) | ✅ done (7 tests) |
| 03 | indexeddb-persistence | ✅ done (3 tests) |
| 04 | canvas-layout (React Flow) | ✅ done |
| 07 | gemini-oauth-setup | ✅ done (8 tests) |
| 05 | keyboard-navigation | 🔜 next (deps: 02+04 ✅) |
| 06 | chat-interface-per-bubble | pending (deps: 04+05) |
| 08 | llm-engine-summarization | pending (deps: 06+07) |
| 09 | llm-engine-propagation | pending (deps: 08) |
| 10 | semantic-edges-tension | pending (deps: 08) |
| 11 | history-panel | pending (deps: 03+04) |
| 12 | worktree-ui | pending (deps: 05+10) |
| 13 | score-computation | pending (deps: 09+10) |
| 14 | polish-deploy | pending (deps: 11+12+13) |

## Research Findings (condensed)

### Pathfinding → LPA* recommended
- A* with lazy re-expansion for dynamic score updates from async LLM
- g(n) = accumulated edge incoherence; h(n) = (1-score) * remaining_depth
- HPA* for column-level abstraction (Level 0: bubble, Level 1: column, Level 2: worktree)
- Local optima risk: bounded DFS lookahead before promoting best path
- Full details: context/research-pathfinding.md

### Fuzzy Logic → replace discrete tension with continuous membership
- coherent(s) = trapezoid(s, 0.6, 0.75, 1.0, 1.0)
- ambiguous(s) = triangle(s, 0.35, 0.55, 0.75)
- contradictory(s) = trapezoid(s, 0.0, 0.0, 0.25, 0.45)
- Mamdani FIS: depth + edge_tension + age_decay → convergence_readiness ∈ [0,1]
- "Vibe-maionese" = possibility distribution on ambiguous membership (soft signal, no block)
- Soft blocking: blockingDegree = μ_contradictory(similarity), full block >0.8
- No library needed for MVP: ~30 lines of pure math
- Full details: context/research-fuzzy-logic.md

### AI Planners → Hybrid ToT + LPA* convergence loop
- Classical planners (STRIPS/PDDL/HTN): ❌ open-world incompatibility
- Tree of Thoughts: ✅ Column = ToT branch, TAB = spawn, beam search = score-based pruning
- Graph of Thoughts: ✅ cherry-pick = selective aggregation
- LangGraph: ⚠️ V2/server only, no browser runtime
- **Recommended engine loop** (Web Worker, ~2s tick):
  1. Score unsorted bubbles (Gemini Flash + cache)
  2. LPA* repair over graph (incremental on score updates)
  3. Best path = min-f() chain to deepest coherent leaf
  4. If score > 0.75 AND no tension: surface convergence suggestion
  5. Cross-column: fuzzy edge classification → merge suggestion or soft block
  6. Update Zustand
- Full details: context/research-ai-planners.md

## Config Files (project-local)
- `.opencode/opencode.json` — plugins, models, MCP, rules
- `.opencode/oh-my-openagent.json` — agent→model mapping (annotated)
- `.opencode/agent_hive.json` — Hive roles (hive-master=Gemini 3.1 Pro, forager=Flash)

## V2 Boundaries (not in MVP)
Bash executor, Docker container, Electron, Supabase, multi-user, mobile

## Revision History
- 2026-05-10: Project created, plan approved, tasks 01-04+07 completed
- 2026-05-10: AGENTS.md written (inspired by intraclinica-ng)
- 2026-05-10: opencode/hive/oh-my-openagent configs imported locally
- 2026-05-10: hive-master upgraded to Gemini 3.1 Pro
- 2026-05-10: 3 oracle research agents run in parallel (pathfinding, fuzzy, planners)
- 2026-05-10: Research saved to context files, ready to inform engine implementation
