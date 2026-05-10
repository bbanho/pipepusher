# Task: 12-worktree-isolation-and-cherry-pick-ui

## Feature: reasoning-ui-mvp

## Dependencies

- **5. Keyboard navigation engine** (05-keyboard-navigation-engine)
- **10. LLM background engine — semantic edges and tension detection** (10-llm-background-engine--semantic-edges-and-tension-detection)

## Plan Section

### 12. Worktree isolation and cherry pick UI

**Depends on**: 5, 10

**Files:**
- Create: `src/components/worktree/WorktreeBadge.tsx`
- Create: `src/components/worktree/MergeDialog.tsx`
- Modify: `src/store/graph.ts` (add worktree actions)
- Modify: `src/hooks/useKeyboardNavigation.ts`

**What to do**:
- Zustand actions:
  ```ts
  isolateAsWorktree: (columnId: string) => void  // sets worktreeId on column + all its bubbles
  proposeCherry: (fromColumnId: string, toColumnId: string) => CherryProposal
  applyCherry: (proposal: CherryProposal, selectedBubbleIds: string[]) => void
  ```
- `WorktreeBadge.tsx`: small badge on column header when `worktreeId !== null`
- `MergeDialog.tsx`: modal opened by `Ctrl+M`
  - Lists bubbles from worktree column
  - User selects which to cherry-pick
  - Conflicting bubbles (tension detected) shown with warning
  - "Apply" button: calls `applyCherry`, archives worktree column
- Keyboard: `Ctrl+W` → `isolateAsWorktree(activeColumnId)`

**Verify:**
- Run: `npm run dev`
- Manual: press Ctrl+W on a column → badge appears → Ctrl+M → dialog opens with bubble list

---

## Task Type

modification
