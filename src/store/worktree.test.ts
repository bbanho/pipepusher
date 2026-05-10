import { describe, it, expect, beforeEach } from 'vitest'
import { useGraphStore, initialState } from './graph'

describe('Graph Store - Worktree & Cherry-pick', () => {
  beforeEach(() => {
    useGraphStore.setState(initialState)
  })

  describe('isolateColumnAsWorktree', () => {
    it('marks column and all its bubbles as belonging to a worktree', () => {
      const { addColumn, addBubble } = useGraphStore.getState()
      const col = addColumn()
      const root = addBubble(col.id, null)
      const child = addBubble(col.id, root.id)
      
      const { isolateColumnAsWorktree } = useGraphStore.getState()
      isolateColumnAsWorktree(col.id)
      
      const state = useGraphStore.getState()
      const worktreeId = state.columns[col.id].worktreeId
      expect(worktreeId).toBeDefined()
      expect(typeof worktreeId).toBe('string')
      expect(state.bubbles[root.id].worktreeId).toBe(worktreeId)
      expect(state.bubbles[child.id].worktreeId).toBe(worktreeId)
    })
  })

  describe('proposeWorktreeMerge', () => {
    it('cherry-picks a specific bubble from a worktree into a new column', () => {
      const { addColumn, addBubble, isolateColumnAsWorktree } = useGraphStore.getState()
      const col = addColumn()
      const root = addBubble(col.id, null)
      const child = addBubble(col.id, root.id)
      child.content = 'Worktree content'
      
      isolateColumnAsWorktree(col.id)
      
      const { proposeWorktreeMerge } = useGraphStore.getState()
      const newBubble = proposeWorktreeMerge(child.id)
      
      const state = useGraphStore.getState()
      expect(newBubble.columnId).not.toBe(col.id)
      expect(newBubble.content).toBe(child.content)
      expect(newBubble.worktreeId).toBeNull() // Merged content is no longer in worktree
      expect(state.columnOrder).toContain(newBubble.columnId)
      expect(state.columns[newBubble.columnId].worktreeId).toBeNull()
    })
  })
})
