import React from 'react'
import { Bubble, Column } from '../../types/graph'
import { useGraphStore } from '../../store/graph'

interface ArchivedColumnProps {
  column: Column & { bubbles: Bubble[] }
}

const ArchivedColumn: React.FC<ArchivedColumnProps> = ({ column }) => {
  const { restoreColumn } = useGraphStore()
  const rootBubbles = column.bubbles.filter((b) => !b.parentId)

  return (
    <div className="p-4 mb-4 border rounded-lg bg-white/5 border-white/10 hover:border-white/30 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-white/90">
          Column {column.order + 1}
        </h3>
        <button
          onClick={() => restoreColumn(column.id)}
          className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white/70 transition-colors"
        >
          Restore
        </button>
      </div>
      <div className="space-y-2">
        {rootBubbles.map((bubble) => (
          <div key={bubble.id} className="text-xs text-white/50 italic truncate">
            {bubble.summary || bubble.content || 'Empty bubble'}
          </div>
        ))}
        {column.bubbles.length > rootBubbles.length && (
          <div className="text-[10px] text-white/30 italic">
            + {column.bubbles.length - rootBubbles.length} more bubbles
          </div>
        )}
      </div>
    </div>
  )
}

export default ArchivedColumn
