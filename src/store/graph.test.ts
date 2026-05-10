import { describe, it, expect, beforeEach } from 'vitest'
import { useGraphStore, initialState } from './graph'

describe('Graph Store', () => {
  beforeEach(() => {
    useGraphStore.setState(initialState)
  })

  describe('addColumn', () => {
    it('creates column with correct order', () => {
      const { addColumn } = useGraphStore.getState()
      
      const col1 = addColumn()
      expect(col1.order).toBe(0)
      expect(useGraphStore.getState().columnOrder).toContain(col1.id)
      expect(useGraphStore.getState().columns[col1.id]).toEqual(col1)

      const col2 = addColumn()
      expect(col2.order).toBe(1)
      expect(useGraphStore.getState().columnOrder[1]).toBe(col2.id)
    })
  })

  describe('addBubble', () => {
    it('creates root bubble when parentId is null', () => {
      const { addColumn, addBubble } = useGraphStore.getState()
      const col = addColumn()
      
      const bubble = addBubble(col.id, null)
      
      expect(bubble.parentId).toBeNull()
      expect(bubble.columnId).toBe(col.id)
      expect(bubble.depth).toBe(0)
      expect(useGraphStore.getState().bubbles[bubble.id]).toEqual(bubble)
    })

    it('creates child bubble and updates parent', () => {
      const { addColumn, addBubble } = useGraphStore.getState()
      const col = addColumn()
      const root = addBubble(col.id, null)
      
      const child = addBubble(col.id, root.id)
      
      expect(child.parentId).toBe(root.id)
      expect(child.depth).toBe(1)
      expect(useGraphStore.getState().bubbles[root.id].children).toContain(child.id)
    })
  })

  describe('bifurcateBubble', () => {
    it('creates sibling with same parent and incremented branchIndex', () => {
      const { addColumn, addBubble, bifurcateBubble } = useGraphStore.getState()
      const col = addColumn()
      const root = addBubble(col.id, null)
      const child1 = addBubble(col.id, root.id)
      
      const child2 = bifurcateBubble(child1.id)
      
      expect(child2.parentId).toBe(root.id)
      expect(child2.branchIndex).toBe(1)
      expect(useGraphStore.getState().bubbles[root.id].children).toContain(child2.id)
      expect(useGraphStore.getState().bubbles[root.id].children[1]).toBe(child2.id)
    })

    it('creates sibling for root bubble', () => {
      const { addColumn, addBubble, bifurcateBubble } = useGraphStore.getState()
      const col = addColumn()
      const root1 = addBubble(col.id, null)
      
      const root2 = bifurcateBubble(root1.id)
      
      expect(root2.parentId).toBeNull()
      expect(root2.columnId).toBe(col.id)
      expect(root2.branchIndex).toBe(1)
    })
  })

  describe('updateBubbleContent', () => {
    it('updates content and sets status to drafting', () => {
      const { addColumn, addBubble, updateBubbleContent, setBubbleStatus } = useGraphStore.getState()
      const col = addColumn()
      const bubble = addBubble(col.id, null)
      setBubbleStatus(bubble.id, 'summarized')
      
      updateBubbleContent(bubble.id, 'new content')
      
      const updated = useGraphStore.getState().bubbles[bubble.id]
      expect(updated.content).toBe('new content')
      expect(updated.status).toBe('drafting')
    })
  })

  describe('setActivePath', () => {
    it('updates column.activePathId', () => {
      const { addColumn, addBubble, setActivePath } = useGraphStore.getState()
      const col = addColumn()
      const root = addBubble(col.id, null)
      const child = addBubble(col.id, root.id)
      
      setActivePath(col.id, root.id)
      
      expect(useGraphStore.getState().columns[col.id].activePathId).toBe(root.id)
    })
  })
})
