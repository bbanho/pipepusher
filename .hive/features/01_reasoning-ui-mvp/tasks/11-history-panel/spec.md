# Task: 11-history-panel

## Feature: reasoning-ui-mvp

## Dependencies

- **3. IndexedDB persistence layer** (03-indexeddb-persistence-layer)
- **4. Canvas layout — columns and bubbles (React Flow)** (04-canvas-layout--columns-and-bubbles-react-flow)

## Plan Section

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

## Task Type

modification
