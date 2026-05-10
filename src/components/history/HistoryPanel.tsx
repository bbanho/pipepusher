'use client'

import React, { useEffect } from 'react'
import { useGraphStore } from '../../store/graph'
import ArchivedColumn from './ArchivedColumn'

const HistoryPanel: React.FC = () => {
  const { archivedColumns, isHistoryOpen, toggleHistory } = useGraphStore()

  if (!isHistoryOpen) return null

  const columns = Object.values(archivedColumns).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40" 
        onClick={toggleHistory}
      />
      
      <div className="fixed right-0 top-0 h-full w-[320px] bg-zinc-900 border-l border-white/10 z-50 p-6 overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-white">History</h2>
          <button 
            onClick={toggleHistory}
            className="text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {columns.length === 0 ? (
          <div className="text-center text-white/30 mt-20">
            <p>No archived columns yet.</p>
            <p className="text-xs mt-2 italic">Archive a column to see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {columns.map((col) => (
              <ArchivedColumn key={col.id} column={col} />
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/5">
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
            Keyboard Shortcuts
          </h3>
          <div className="space-y-2 text-xs text-white/50">
            <div className="flex justify-between">
              <span>Toggle History</span>
              <kbd className="px-1 bg-white/10 rounded">Ctrl+H</kbd>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HistoryPanel
