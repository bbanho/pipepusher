'use client'

import React from 'react';
import { useGraphStore } from '../../store/graph';

export default function EmptyState() {
  const { columnOrder } = useGraphStore();

  if (columnOrder.length > 0) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pb-20">
      <div className="bg-white/90 backdrop-blur-sm p-10 rounded-2xl shadow-2xl border border-slate-200/60 text-center max-w-md ring-1 ring-slate-900/5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-3">Reasoning Engine</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          You have an empty canvas. The engine is ready to track your parallel lines of thought.
        </p>
        <div className="inline-flex items-center px-5 py-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-sm shadow-md ring-1 ring-inset ring-white/10">
          Press <kbd className="mx-2 px-2.5 py-1 bg-slate-800 rounded-md text-amber-400 font-bold border border-slate-700 shadow-sm">TAB</kbd> to start
        </div>
      </div>
    </div>
  );
}
