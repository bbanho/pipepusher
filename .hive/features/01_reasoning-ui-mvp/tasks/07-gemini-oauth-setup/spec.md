# Task: 07-gemini-oauth-setup

## Feature: reasoning-ui-mvp

## Dependencies

- **1. Project scaffold** (01-project-scaffold)

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
