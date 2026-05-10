import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useKeyboardNavigation } from './useKeyboardNavigation'
import { useGraphStore } from '../store/graph'

// @ts-ignore
if (!global.crypto) {
  // @ts-ignore
  global.crypto = { randomUUID: () => Math.random().toString(36).substring(7) }
}

describe('useKeyboardNavigation', () => {
  beforeEach(() => {
    useGraphStore.setState({
      bubbles: {},
      columns: {},
      columnOrder: [],
      edges: {},
      archivedColumns: {},
      activeColumnId: null,
      focusedBubbleId: null,
      isHistoryOpen: false,
    })
  })

  it('creates first column with root bubble on TAB with empty state', () => {
    renderHook(() => useKeyboardNavigation())
    
    const event = new KeyboardEvent('keydown', { key: 'Tab' })
    vi.spyOn(event, 'preventDefault')
    act(() => {
      window.dispatchEvent(event)
    })

    const state = useGraphStore.getState()
    expect(state.columnOrder.length).toBe(1)
    expect(Object.keys(state.bubbles).length).toBe(1)
    expect(event.preventDefault).toHaveBeenCalled()
    
    const bubbleId = Object.keys(state.bubbles)[0]
    expect(state.focusedBubbleId).toBe(bubbleId)
  })

  it('navigates between columns with ArrowLeft and ArrowRight', () => {
    let col1: any, col2: any
    act(() => {
      const store = useGraphStore.getState()
      col1 = store.addColumn()
      store.addBubble(col1.id, null)
      col2 = store.addColumn()
      store.addBubble(col2.id, null)
      useGraphStore.setState({ activeColumnId: col2.id })
    })

    renderHook(() => useKeyboardNavigation())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })
    expect(useGraphStore.getState().activeColumnId).toBe(col1.id)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    })
    expect(useGraphStore.getState().activeColumnId).toBe(col2.id)
  })

  it('navigates bubbles in active column with ArrowUp and ArrowDown', () => {
    let col: any, root: any, child: any
    act(() => {
      const store = useGraphStore.getState()
      col = store.addColumn()
      root = store.addBubble(col.id, null)
      child = store.addBubble(col.id, root.id)
      useGraphStore.setState({ focusedBubbleId: root.id })
    })

    renderHook(() => useKeyboardNavigation())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
    })
    expect(useGraphStore.getState().focusedBubbleId).toBe(child.id)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
    })
    expect(useGraphStore.getState().focusedBubbleId).toBe(root.id)
  })

  it('toggles history with Ctrl+H', () => {
    renderHook(() => useKeyboardNavigation())
    
    expect(useGraphStore.getState().isHistoryOpen).toBe(false)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', ctrlKey: true }))
    })

    expect(useGraphStore.getState().isHistoryOpen).toBe(true)

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', ctrlKey: true }))
    })

    expect(useGraphStore.getState().isHistoryOpen).toBe(false)
  })

  it('bifurcates bubble on Shift+Enter when on non-active bubble', () => {
    let col: any, root: any, child1: any
    act(() => {
      const currentStore = useGraphStore.getState()
      col = currentStore.addColumn()
      root = currentStore.addBubble(col.id, null)
      child1 = currentStore.addBubble(col.id, root.id)
      
      const latestState = useGraphStore.getState()
      useGraphStore.setState({ 
        focusedBubbleId: child1.id,
        columns: {
          ...latestState.columns,
          [col.id]: { ...latestState.columns[col.id], activePathId: child1.id }
        }
      })
    })

    renderHook(() => useKeyboardNavigation())

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }))
    })
    
    expect(useGraphStore.getState().bubbles[child1.id].children.length).toBe(1)

    act(() => {
      useGraphStore.setState({ focusedBubbleId: child1.id })
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true }))
    })

    const finalState = useGraphStore.getState()
    expect(finalState.bubbles[root.id].children.length).toBe(2)
    expect(Object.keys(finalState.bubbles).length).toBe(4)
  })
})
