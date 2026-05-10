'use client'

import React, { useState, useEffect } from 'react';
import { useGraphStore } from '../../store/graph';

export default function StatusBar() {
  const [showHints, setShowHints] = useState(true);
  const { columnOrder, activeColumnId, focusedBubbleId, edges } = useGraphStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setShowHints((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tensionEdges = Object.values(edges).filter((e) => e.tension !== 'none');

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur text-slate-300 p-2.5 px-4 text-xs flex justify-between items-center z-50 font-mono shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-slate-800">
      <div className="flex items-center space-x-6">
        <span className="font-semibold text-white tracking-wide">PipePusher Engine</span>
        {activeColumnId ? (
          <span className="text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active Column: {activeColumnId.substring(0, 5)}</span>
        ) : (
          <span className="text-slate-500">○ No active column</span>
        )}
        {tensionEdges.length > 0 && (
          <span className="text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">⚡ {tensionEdges.length} Tension Edge(s)</span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {showHints ? (
          <div className="flex space-x-4 text-slate-400 items-center">
            <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-200">TAB</kbd> New Column</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-200">↑↓←→</kbd> Navigate</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-200">⇧+↵</kbd> Deepen/Bifurcate</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-200">Ctrl+W</kbd> Worktree</span>
            <span className="flex items-center gap-1.5"><kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-200">Ctrl+H</kbd> History</span>
            <span className="text-slate-500 ml-2">Press <kbd className="text-slate-300">?</kbd> to hide</span>
          </div>
        ) : (
          <span className="text-slate-500 cursor-pointer hover:text-slate-300 transition-colors" onClick={() => setShowHints(true)}>Press <kbd>?</kbd> for hints</span>
        )}
      </div>
    </div>
  );
}
