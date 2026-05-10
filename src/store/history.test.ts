import { describe, it, expect, beforeEach } from 'vitest'
import { useGraphStore, initialState } from './graph'

describe('Graph Store - History', () => {
  beforeEach(() => {
    useGraphStore.setState(initialState)
  })

  describe('archiveColumn', () => {
    it('moves column and its bubbles to archivedColumns', () => {
      const { addColumn, addBubble, archiveColumn } = useGraphStore.getState()
      const col = addColumn()
      const bubble = addBubble(col.id, null)
      
      archiveColumn(col.id)
      
      const state = useGraphStore.getState()
      expect(state.columns[col.id]).toBeUndefined()
      expect(state.columnOrder).not.toContain(col.id)
      expect(state.bubbles[bubble.id]).toBeUndefined()
      
      expect(state.archivedColumns[col.id]).toBeDefined()
      expect(state.archivedColumns[col.id].bubbles).toHaveLength(1)
      expect(state.archivedColumns[col.id].bubbles[0].id).toBe(bubble.id)
    })
  })

  describe('restoreColumn', () => {
    it('moves archived column back to active columns', () => {
      const { addColumn, addBubble, archiveColumn, restoreColumn } = useGraphStore.getState()
      const col = addColumn()
      const bubble = addBubble(col.id, null)
      archiveColumn(col.id)
      
      restoreColumn(col.id)
      
      const state = useGraphStore.getState()
      expect(state.columns[col.id]).toBeDefined()
      expect(state.columnOrder).toContain(col.id)
      expect(state.bubbles[bubble.id]).toBeDefined()
      expect(state.archivedColumns[col.id]).toBeUndefined()
    })
  })

  describe('toggleHistory', () => {
    it('toggles isHistoryOpen state', () => {
      const { toggleHistory } = useGraphStore.getState()
      
      expect(useGraphStore.getState().isHistoryOpen).toBe(false)
      toggleHistory()
      expect(useGraphStore.getState().isHistoryOpen).toBe(true)
      toggleHistory()
      expect(useGraphStore.getState().isHistoryOpen).toBe(false)
    })
  })
})
