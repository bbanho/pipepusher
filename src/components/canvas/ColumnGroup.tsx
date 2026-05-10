'use client'

import React, { memo } from 'react'
import { type Node, type NodeProps } from '@xyflow/react'
import { useGraphStore } from '../../store/graph'

export type ColumnNode = Node<{
  label: string
  columnId: string
}, 'column'>

const ColumnGroup = ({ data }: NodeProps<ColumnNode>) => {
  const { archiveColumn, columns } = useGraphStore()
  const column = columns[data.columnId]
  const isWorktree = !!column?.worktreeId

  return (
    <div className={`w-full h-full border-2 border-dashed rounded-xl group transition-colors ${isWorktree ? 'bg-amber-50/50 border-amber-200' : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'}`}>
      <div className="absolute top-2 left-4 right-4 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className={`text-xs font-bold uppercase tracking-wider ${isWorktree ? 'text-amber-500' : 'text-gray-400'}`}>
            {data.label}
          </div>
          {isWorktree && <span className="text-[10px] px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded font-bold">WORKTREE</span>}
        </div>
        <button
          onClick={() => archiveColumn(data.columnId)}
          className="pointer-events-auto opacity-0 group-hover:opacity-100 text-[10px] bg-red-50 text-red-500 hover:bg-red-100 px-2 py-0.5 rounded transition-all"
        >
          Archive
        </button>
      </div>
    </div>
  )
}

export default memo(ColumnGroup)
