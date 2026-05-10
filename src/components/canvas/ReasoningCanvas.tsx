'use client'

import React, { useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useGraphStore } from '../../store/graph'
import BubbleNode from './BubbleNode'
import SemanticEdge from './SemanticEdge'
import ColumnGroup from './ColumnGroup'

import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'
import EmptyState from '../ui/EmptyState'

const nodeTypes = {
  bubble: BubbleNode,
  column: ColumnGroup,
}

const edgeTypes = {
  semantic: SemanticEdge,
}

const COLUMN_WIDTH = 350
const BUBBLE_SPACING_Y = 200
const COLUMN_PADDING = 50

const ReasoningCanvasInner = () => {
  const { bubbles, columns, columnOrder, edges, focusedBubbleId } = useGraphStore()
  
  useKeyboardNavigation()

  const nodes = useMemo(() => {
    const rfNodes: Node[] = []

    columnOrder.forEach((columnId, index) => {
      const column = columns[columnId]
      const bubblesInColumn = Object.values(bubbles).filter((b) => b.columnId === columnId)
      const maxDepth = bubblesInColumn.length > 0 ? Math.max(...bubblesInColumn.map((b) => b.depth)) : 0

      rfNodes.push({
        id: `column-${columnId}`,
        type: 'column',
        data: { 
          label: `Column ${index + 1}`,
          columnId: columnId
        },
        position: { x: index * COLUMN_WIDTH, y: 0 },
        style: {
          width: COLUMN_WIDTH - 20,
          height: (maxDepth + 1) * BUBBLE_SPACING_Y + COLUMN_PADDING,
          zIndex: -1,
        },
        draggable: false,
        selectable: false,
      })
    })

    Object.values(bubbles).forEach((bubble) => {
      const columnIndex = columnOrder.indexOf(bubble.columnId)
      if (columnIndex === -1) return

      const column = columns[bubble.columnId]
      const isActivePath = column.activePathId === bubble.id || bubble.id === focusedBubbleId

      rfNodes.push({
        id: bubble.id,
        type: 'bubble',
        data: {
          bubble,
          isActivePath,
          isFocused: focusedBubbleId === bubble.id,
        },
        position: {
          x: columnIndex * COLUMN_WIDTH + 20,
          y: bubble.depth * BUBBLE_SPACING_Y + COLUMN_PADDING,
        },
      })
    })

    return rfNodes
  }, [bubbles, columns, columnOrder, focusedBubbleId])

  const rfEdges = useMemo(() => {
    const result: Edge[] = []

    Object.values(bubbles).forEach((bubble) => {
      if (bubble.parentId) {
        result.push({
          id: `edge-${bubble.parentId}-${bubble.id}`,
          source: bubble.parentId,
          target: bubble.id,
          type: 'default',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        })
      }
    })

    Object.values(edges).forEach((edge) => {
      result.push({
        id: edge.id,
        source: edge.fromBubbleId,
        target: edge.toBubbleId,
        type: 'semantic',
        data: { label: edge.label, tension: edge.tension },
      })
    })

    return result
  }, [bubbles, edges])

  return (
    <div 
      className="w-full h-full bg-slate-50 relative focus:outline-none"
      tabIndex={-1}
    >
      <EmptyState />
      <ReactFlow
        nodes={nodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="#cbd5e1" gap={20} />
      </ReactFlow>
    </div>
  )
}

const ReasoningCanvas = () => {
  return (
    <ReactFlowProvider>
      <ReasoningCanvasInner />
    </ReactFlowProvider>
  )
}

export default ReasoningCanvas
