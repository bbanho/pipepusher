# Task: 07-gemini-oauth-setup

## Feature: reasoning-ui-mvp

## Dependencies

- **1. project-scaffold** (01-project-scaffold)

## Plan Section

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

## Task Type

modification

## Context

## architecture-decisions

# Architecture Decisions — PipePusher Reasoning UI MVP

## Stack
- **Framework**: Next.js App Router (TypeScript)
- **Canvas**: React Flow — bubble nodes, semantic edges
- **State**: Zustand (graph logic) + IndexedDB (persistence between sessions)
- **LLM**: Gemini via OAuth Google (`@google/genai`)
- **Context cache**: `ai.caches.create` per parent node — children send only diff
- **Propagation**: async queue per level, Web Worker — non-blocking UI
- **Deploy MVP**: Vercel or local `next dev`

## Key UX Rules
- TAB = create new column (new reasoning line) — ONLY way to create columns
- ← → = navigate between existing columns (no creation)
- ↑ ↓ = navigate between bubbles in current column
- Enter = continue chat in active bubble
- Shift+Enter on PREVIOUS bubble = bifurcate (sibling branch from that bubble)
- Shift+Enter on ACTIVE bubble = create child bubble (deepen vertically)
- Ctrl+W = isolate column as worktree
- Ctrl+M = cherry pick / propose worktree merge
- Ctrl+H = open history panel
- Esc = collapse branch / go up to parent

## Graph Model
- COLUMN = reasoning line (created by TAB)
- BUBBLE = thought node inside column (chat + LLM summary as title)
- BRANCH = bifurcation within column (Shift+Enter on old bubble)
- ACTIVE PATH = current branch being followed (siblings collapsed)
- WORKTREE = logically isolated subgraph (`worktreeId` flag on nodes)

## System Goal
Converge to: 1 column · 1 active path · 1 implementation plan

## LLM Background Engine
1. Bubble created → summarize to 3-5 words (title)
2. Bubble edited → propagate diff to children (cascading, with cache per bubble) — block child input during propagation
3. Parallel column created → compute semantic edge → generate intersection phrase
4. Tension detected → signal in status bar (non-blocking)
5. Convergence → enable Ctrl+M, suggest merge question

## Score Formula (MVP)
score = (depth × 0.4) + (coherence_edges × 0.4) + (age_decay × 0.2)
coherence_edges = edges without detected tension

## V2 (not in MVP)
- Docker container: REST+WS API for bash/git/filesystem
- EXECUTOR_URL env var (localhost or cloud — same code)
- Electron wrapper: packages Next.js + starts container

## Rejected Alternatives
- Electron from start: bash integration not needed in MVP
- LangGraph: too heavy, LangChain lock-in
- Static Next.js export: loses API routes, OAuth broken
- Blocking propagation: 5-level cascade = ~15s UI freeze
- GPT-4o: no explicit cache control, less predictable


## Completed Tasks

- 01-project-scaffold: Project scaffolded and verified. All dependencies installed and build succeeds.
