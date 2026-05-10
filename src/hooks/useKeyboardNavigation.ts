import { useEffect } from 'react'
import { useGraphStore } from '../store/graph'

export function useKeyboardNavigation() {
  const {
    addColumn,
    addBubble,
    bifurcateBubble,
    activeColumnId,
    columnOrder,
    bubbles,
    columns,
    focusedBubbleId,
    setActivePath,
    setFocus,
  } = useGraphStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement

      if (e.key === 'Tab' && !isInput) {
        e.preventDefault()
        const store = useGraphStore.getState()
        const col = store.addColumn()
        store.addBubble(col.id, null)
        return
      }

      if (!isInput) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          const store = useGraphStore.getState()
          const currentIndex = store.activeColumnId
            ? store.columnOrder.indexOf(store.activeColumnId)
            : -1
          let nextIndex = currentIndex

          if (e.key === 'ArrowLeft') {
            nextIndex = Math.max(0, currentIndex - 1)
          } else if (e.key === 'ArrowRight') {
            nextIndex = Math.min(store.columnOrder.length - 1, currentIndex + 1)
          }

          if (nextIndex !== -1 && store.columnOrder[nextIndex]) {
            const nextColumnId = store.columnOrder[nextIndex]
            const nextColumn = store.columns[nextColumnId]
            if (nextColumn.activePathId) {
              store.setActivePath(nextColumnId, nextColumn.activePathId)
            } else {
              useGraphStore.setState({ activeColumnId: nextColumnId })
            }
          }
        }

        if (focusedBubbleId && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          const store = useGraphStore.getState()
          const bubble = store.bubbles[focusedBubbleId]
          if (!bubble) return

          if (e.key === 'ArrowUp') {
            if (bubble.parentId) {
              store.setFocus(bubble.parentId)
              store.setActivePath(bubble.columnId, bubble.parentId)
            }
          } else if (e.key === 'ArrowDown') {
            const column = store.columns[bubble.columnId]
            if (bubble.children.length > 0) {
              const childInPath = bubble.children.find(childId => {
                let current = store.bubbles[column.activePathId!]
                while (current) {
                  if (current.id === childId) return true
                  current = current.parentId ? store.bubbles[current.parentId] : (null as any)
                }
                return false
              })

              const targetChildId = childInPath || bubble.children[0]
              store.setFocus(targetChildId)
            }
          }
        }
        
        if (e.key === 'Escape') {
          const store = useGraphStore.getState()
          const bubble = store.focusedBubbleId ? store.bubbles[store.focusedBubbleId] : null
          if (bubble && bubble.parentId) {
            store.setFocus(bubble.parentId)
            store.setActivePath(bubble.columnId, bubble.parentId)
          }
        }
      }

      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault()
        const store = useGraphStore.getState()
        if (store.focusedBubbleId) {
          const bubble = store.bubbles[store.focusedBubbleId]
          if (!bubble) return
          const column = store.columns[bubble.columnId]
          
          if (column.activePathId === store.focusedBubbleId) {
            store.addBubble(bubble.columnId, store.focusedBubbleId)
          } else {
            store.bifurcateBubble(store.focusedBubbleId)
          }
        }
      }
      
      if (e.ctrlKey) {
        if (e.key === 'w') {
          e.preventDefault()
        }
        if (e.key === 'm') {
          e.preventDefault()
        }
        if (e.key === 'h' || e.key === 'H') {
          e.preventDefault()
          const store = useGraphStore.getState()
          store.toggleHistory()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedBubbleId])
}
