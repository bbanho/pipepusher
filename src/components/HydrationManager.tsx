'use client'

import { useEffect } from 'react'
import { useGraphStore } from '@/store/graph'
import { loadSession } from '@/lib/db'

export function HydrationManager() {
  const hydrate = useGraphStore((state) => state.hydrate)

  useEffect(() => {
    async function init() {
      const savedState = await loadSession('default')
      if (savedState) {
        hydrate(savedState)
      }
    }
    init()
  }, [hydrate])

  return null
}
