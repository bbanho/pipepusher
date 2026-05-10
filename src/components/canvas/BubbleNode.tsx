'use client'

import React, { memo } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { Bubble } from '../../types/graph'
import { useGraphStore } from '../../store/graph'

export type BubbleNode = Node<{
  bubble: Bubble
  isActivePath: boolean
  isFocused: boolean
}, 'bubble'>

const BubbleNode = ({ data }: NodeProps<BubbleNode>) => {
  const { bubble, isActivePath, isFocused } = data
  const updateBubbleContent = useGraphStore((state) => state.updateBubbleContent)

  const isPropagating = bubble.status === 'propagating'
  const isBlocked = bubble.status === 'blocked'

  const borderStyle = !isActivePath ? 'border-l-2 border-dashed border-gray-400' : 'border-l-2 border-solid border-blue-500'

  return (
    <div className={`p-3 rounded shadow-lg bg-white min-w-[200px] max-w-[300px] transition-all ${isFocused ? 'ring-2 ring-blue-400' : ''} ${borderStyle}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500" />
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
          <span className="font-mono">#{bubble.id.slice(0, 4)}</span>
          <div className="flex gap-1">
            {isPropagating && <span className="animate-spin text-blue-500">⏳</span>}
            {isBlocked && <span title="Blocked" className="text-red-500">🔒</span>}
          </div>
        </div>

        {isFocused ? (
          <textarea
            className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-300 resize-none"
            rows={3}
            value={bubble.content}
            onChange={(e) => updateBubbleContent(bubble.id, e.target.value)}
            placeholder="Type your reasoning..."
            autoFocus
          />
        ) : (
          <div className="text-sm font-medium text-gray-800">
            {bubble.summary || bubble.content.slice(0, 50) + (bubble.content.length > 50 ? '...' : '') || 'Empty bubble'}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-500" />
    </div>
  )
}

export default memo(BubbleNode)
