export type BubbleStatus =
  | 'drafting'
  | 'summarized'
  | 'propagating'
  | 'blocked'
  | 'merged'
  | 'archived'

export type TensionStatus = 'none' | 'tension' | 'contradiction'

export interface Bubble {
  id: string
  columnId: string
  parentId: string | null
  branchIndex: number
  content: string
  summary: string
  status: BubbleStatus
  score: number
  depth: number
  createdAt: number
  lastScoredAt: number
  cacheId: string | null
  children: string[]
  blockedBy: string[]
  worktreeId: string | null
}

export interface Column {
  id: string
  order: number
  activePathId: string | null
  worktreeId: string | null
  createdAt: number
}

export interface SemanticEdge {
  id: string
  fromBubbleId: string
  toBubbleId: string
  label: string
  tension: TensionStatus
}

export interface GraphState {
  bubbles: Record<string, Bubble>
  columns: Record<string, Column>
  columnOrder: string[]
  edges: Record<string, SemanticEdge>
  activeColumnId: string | null
  focusedBubbleId: string | null
}
