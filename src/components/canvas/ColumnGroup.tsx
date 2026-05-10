'use client'

import React, { memo } from 'react'
import { type Node, type NodeProps } from '@xyflow/react'
import { useGraphStore } from '../../store/graph'

export type ColumnNode = Node<{
  label: string
  columnId: string
}, 'column'>

const ColumnGroup = ({ data }: NodeProps<ColumnNode>) => {
  const { archiveColumn } = useGraphStore()

  return (
    <div className="w-full h-full bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-xl group hover:border-gray-300 transition-colors">
      <div className="absolute top-2 left-4 right-4 flex justify-between items-center">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {data.label}
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
