# Task: 01-project-scaffold

## Feature: reasoning-ui-mvp

## Dependencies

_None_

## Plan Section

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

## Task Type

greenfield
