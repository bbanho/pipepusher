import { create } from 'zustand'
import { GraphState, Bubble, Column, SemanticEdge } from '../types/graph'

export interface GraphActions {
  addColumn: () => Column
  addBubble: (columnId: string, parentId: string | null) => Bubble
  bifurcateBubble: (fromBubbleId: string) => Bubble
  updateBubbleContent: (id: string, content: string) => void
  setSummary: (id: string, summary: string) => void
  setBubbleStatus: (id: string, status: Bubble['status']) => void
  setActivePath: (columnId: string, bubbleId: string) => void
  setFocus: (bubbleId: string) => void
  addEdge: (fromId: string, toId: string, label: string) => void
  setTension: (edgeId: string, tension: SemanticEdge['tension']) => void
  toggleHistory: () => void
  hydrate: (state: Partial<GraphState>) => void
  archiveColumn: (id: string) => void
  restoreColumn: (id: string) => void
}

export const initialState: GraphState = {
  bubbles: {},
  columns: {},
  columnOrder: [],
  edges: {},
  archivedColumns: {},
  activeColumnId: null,
  focusedBubbleId: null,
  isHistoryOpen: false,
}

export const useGraphStore = create<GraphState & GraphActions>((set, get) => ({
  ...initialState,

  addColumn: () => {
    const id = crypto.randomUUID()
    const order = get().columnOrder.length
    const column: Column = {
      id,
      order,
      activePathId: null,
      worktreeId: null,
      createdAt: Date.now(),
    }

    set((state) => ({
      columns: { ...state.columns, [id]: column },
      columnOrder: [...state.columnOrder, id],
      activeColumnId: id,
    }))

    return column
  },
  addBubble: (columnId, parentId) => {
    const id = crypto.randomUUID()
    const parent = parentId ? get().bubbles[parentId] : null
    const depth = parent ? parent.depth + 1 : 0
    const branchIndex = parent ? parent.children.length : 0

    const bubble: Bubble = {
      id,
      columnId,
      parentId,
      branchIndex,
      content: '',
      summary: '',
      status: 'drafting',
      score: 0,
      depth,
      createdAt: Date.now(),
      lastScoredAt: 0,
      cacheId: null,
      children: [],
      blockedBy: [],
      worktreeId: null,
    }

    set((state) => {
      const bubbles = { ...state.bubbles, [id]: bubble }
      
      if (parentId && state.bubbles[parentId]) {
        bubbles[parentId] = {
          ...state.bubbles[parentId],
          children: [...state.bubbles[parentId].children, id],
        }
      }

      const columns = { ...state.columns }
      if (columns[columnId]) {
        columns[columnId] = {
          ...columns[columnId],
          activePathId: id,
        }
      }

      return { bubbles, columns, focusedBubbleId: id }
    })

    return bubble
  },
  bifurcateBubble: (fromBubbleId) => {
    const fromBubble = get().bubbles[fromBubbleId]
    if (!fromBubble) throw new Error('Bubble not found')

    const parentId = fromBubble.parentId
    const columnId = fromBubble.columnId
    
    let branchIndex = 0
    if (!parentId) {
      branchIndex = Object.values(get().bubbles).filter(
        (b) => b.columnId === columnId && b.parentId === null
      ).length
    }

    const bubble = get().addBubble(columnId, parentId)
    
    if (!parentId) {
      set((state) => ({
        bubbles: {
          ...state.bubbles,
          [bubble.id]: {
            ...state.bubbles[bubble.id],
            branchIndex,
          },
        },
      }))
      return { ...bubble, branchIndex }
    }

    return bubble
  },
  updateBubbleContent: (id, content) => {
    set((state) => ({
      bubbles: {
        ...state.bubbles,
        [id]: {
          ...state.bubbles[id],
          content,
          status: 'drafting',
        },
      },
    }))
  },
  setSummary: (id, summary) => {
    set((state) => ({
      bubbles: {
        ...state.bubbles,
        [id]: {
          ...state.bubbles[id],
          summary,
          status: 'summarized',
        },
      },
    }))
  },
  setBubbleStatus: (id, status) => {
    set((state) => ({
      bubbles: {
        ...state.bubbles,
        [id]: {
          ...state.bubbles[id],
          status,
        },
      },
    }))
  },
  setActivePath: (columnId, bubbleId) => {
    set((state) => ({
      columns: {
        ...state.columns,
        [columnId]: {
          ...state.columns[columnId],
          activePathId: bubbleId,
        },
      },
      activeColumnId: columnId,
      focusedBubbleId: bubbleId,
    }))
  },
  setFocus: (bubbleId) => {
    set({ focusedBubbleId: bubbleId })
  },
  addEdge: (fromId, toId, label) => {
    const id = crypto.randomUUID()
    const edge: SemanticEdge = {
      id,
      fromBubbleId: fromId,
      toBubbleId: toId,
      label,
      tension: 'none',
    }
    set((state) => ({
      edges: { ...state.edges, [id]: edge },
    }))
  },
  setTension: (edgeId, tension) => {
    set((state) => ({
      edges: {
        ...state.edges,
        [edgeId]: {
          ...state.edges[edgeId],
          tension,
        },
      },
    }))
  },
  toggleHistory: () => {
    set((state) => ({ isHistoryOpen: !state.isHistoryOpen }))
  },
  hydrate: (state) => {
    set((old) => ({ ...old, ...state }))
  },
  archiveColumn: (id) => {
    set((state) => {
      const column = state.columns[id]
      if (!column) return state

      const columnBubbles = Object.values(state.bubbles).filter((b) => b.columnId === id)
      const bubbleIds = columnBubbles.map((b) => b.id)

      const remainingBubbles = { ...state.bubbles }
      bubbleIds.forEach((bid) => delete remainingBubbles[bid])

      const remainingColumns = { ...state.columns }
      delete remainingColumns[id]

      return {
        columns: remainingColumns,
        columnOrder: state.columnOrder.filter((cid) => cid !== id),
        bubbles: remainingBubbles,
        archivedColumns: {
          ...state.archivedColumns,
          [id]: { ...column, bubbles: columnBubbles },
        },
        activeColumnId: state.activeColumnId === id ? null : state.activeColumnId,
        focusedBubbleId: bubbleIds.includes(state.focusedBubbleId!) ? null : state.focusedBubbleId,
      }
    })
  },
  restoreColumn: (id) => {
    set((state) => {
      const archived = state.archivedColumns[id]
      if (!archived) return state

      const { bubbles: restoredBubbles, ...column } = archived
      const newBubbles = { ...state.bubbles }
      restoredBubbles.forEach((b) => {
        newBubbles[b.id] = b
      })

      const newArchived = { ...state.archivedColumns }
      delete newArchived[id]

      return {
        columns: { ...state.columns, [id]: column },
        columnOrder: [...state.columnOrder, id],
        bubbles: newBubbles,
        archivedColumns: newArchived,
      }
    })
  },
}))
