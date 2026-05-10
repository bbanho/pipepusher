# Task: 06-chat-interface-per-bubble

## Feature: reasoning-ui-mvp

## Dependencies

- **4. Canvas layout — columns and bubbles (React Flow)** (04-canvas-layout--columns-and-bubbles-react-flow)
- **5. Keyboard navigation engine** (05-keyboard-navigation-engine)

## Plan Section

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

## Task Type

greenfield
