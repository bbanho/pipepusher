# Task: 11-history-panel Implementation Plan

I'm using the writing-plans skill to create the implementation plan.

## Discovery

### Original Request
- "11. History panel"

### Design Summary
- Extend `GraphState` and `GraphActions` in Zustand to support archiving/restoring columns.
- Update `PipePusherDB` schema (if necessary) and ensure `archivedColumns` are persisted.
- Implement `HistoryPanel` (drawer) and `ArchivedColumn` (item) components.
- Add keyboard shortcut `Ctrl+H` to toggle the history panel.

---

## Tasks

### 1. Update Types
**Depends on**: none
**Files:**
- Modify: `src/types/graph.ts`
**What to do**:
- Add `archivedColumns: Record<string, Column & { bubbles: Bubble[] }>` to `GraphState`.
- Add `isHistoryOpen: boolean` to `GraphState`.

### 2. Add Zustand Actions
**Depends on**: 1
**Files:**
- Modify: `src/store/graph.ts`
**What to do**:
- Add `archiveColumn: (columnId: string) => void`
- Add `restoreColumn: (columnId: string) => void`
- Add `toggleHistory: () => void`

### 3. TDD: Test Archive/Restore Actions
**Depends on**: 2
**Files:**
- Create: `src/store/history.test.ts`
**What to do**:
- Step 1: Write failing tests for `archiveColumn` and `restoreColumn`.
- Step 2: Run tests to verify failure.
- Step 3: Implement minimal code in `src/store/graph.ts`.
- Step 4: Run tests to verify pass.

### 4. Persistence Update
**Depends on**: 2
**Files:**
- Modify: `src/lib/db.ts`
**What to do**:
- Increment `DB_VERSION` to 2.
- Update `upgrade` to handle migration if needed (though `GraphState` change might just work).
- Ensure `archivedColumns` are saved/loaded.

### 5. History Panel UI
**Depends on**: 1
**Files:**
- Create: `src/components/history/ArchivedColumn.tsx`
- Create: `src/components/history/HistoryPanel.tsx`
**What to do**:
- Implement `ArchivedColumn` showing root bubble summaries.
- Implement `HistoryPanel` as a right-side drawer.

### 6. Keyboard Shortcuts & Integration
**Depends on**: 5
**Files:**
- Modify: `src/components/canvas/ReasoningCanvas.tsx` or `src/app/page.tsx`
**What to do**:
- Add `Ctrl+H` listener to toggle `isHistoryOpen`.
- Render `HistoryPanel` if `isHistoryOpen` is true.

### 7. Verification
**Depends on**: 6
**What to do**:
- Run `npm run dev`.
- Verify Ctrl+H opens drawer.
- Verify archiving a column moves it to history.
- Verify restoring a column moves it back to canvas.
