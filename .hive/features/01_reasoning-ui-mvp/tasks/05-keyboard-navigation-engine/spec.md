# Task: 05-keyboard-navigation-engine

## Feature: reasoning-ui-mvp

## Dependencies

- **2. Graph state model (Zustand)** (02-graph-state-model-zustand)
- **4. Canvas layout — columns and bubbles (React Flow)** (04-canvas-layout--columns-and-bubbles-react-flow)

## Plan Section

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

## Task Type

greenfield
