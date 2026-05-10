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
  const isWorktree = !!bubble.worktreeId

  const borderStyle = !isActivePath ? 'border-l-2 border-dashed border-gray-400' : 'border-l-2 border-solid border-blue-500'

  return (
    <div className={`p-4 rounded-xl shadow-xl transition-all duration-200 ${isWorktree ? 'bg-amber-50/90 border-amber-200' : 'bg-white/95 backdrop-blur-sm'} ${isFocused ? 'ring-2 ring-slate-800 shadow-2xl scale-[1.02]' : 'ring-1 ring-slate-900/5'} ${borderStyle}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-slate-400 border-2 border-white" />
      
      <div className="flex flex-col gap-3 min-w-[280px]">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">#{bubble.id.slice(0, 4)}</span>
          <div className="flex gap-2 items-center">
            {isWorktree && <span title="Worktree" className="px-1.5 font-bold bg-amber-200 text-amber-800 rounded scale-90 origin-right">WT</span>}
            {isPropagating && <span className="animate-spin text-slate-400">⏳</span>}
            {isBlocked && <span title="Blocked" className="text-rose-500">🔒</span>}
          </div>
        </div>

        {isFocused ? (
          <textarea
            className="w-full p-3 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white resize-none transition-colors"
            rows={4}
            value={bubble.content}
            onChange={(e) => updateBubbleContent(bubble.id, e.target.value)}
            placeholder="Type your reasoning here..."
            autoFocus
          />
        ) : (
          <div className="text-sm font-medium text-slate-700 leading-relaxed px-1">
            {bubble.summary || bubble.content.slice(0, 60) + (bubble.content.length > 60 ? '...' : '') || 'Empty bubble'}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-400 border-2 border-white" />
    </div>
  )
}

export default memo(BubbleNode)
