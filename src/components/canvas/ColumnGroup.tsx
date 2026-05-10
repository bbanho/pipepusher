'use client'

import React, { memo } from 'react'
import { type Node, type NodeProps } from '@xyflow/react'

export type ColumnNode = Node<{
  label: string
}, 'column'>

const ColumnGroup = ({ data }: NodeProps<ColumnNode>) => {
  return (
    <div className="w-full h-full bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-xl pointer-events-none">
      <div className="absolute top-2 left-4 text-xs font-bold uppercase tracking-wider text-gray-400">
        {data.label}
      </div>
    </div>
  )
}

export default memo(ColumnGroup)
