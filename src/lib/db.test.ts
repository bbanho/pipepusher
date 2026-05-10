import { describe, it, expect } from 'vitest'
import 'fake-indexeddb/auto'
import { openDB } from 'idb'
import { saveSession, loadSession, listSessions } from './db'
import { GraphState } from '@/types/graph'

const mockState: GraphState = {
  bubbles: {},
  columns: {},
  columnOrder: [],
  edges: {},
  activeColumnId: null,
  focusedBubbleId: null,
}

describe('IndexedDB Persistence Layer', () => {
  async function clearDB() {
    const db = await openDB('pipepusher-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' })
        }
      },
    })
    const tx = db.transaction('sessions', 'readwrite')
    await tx.objectStore('sessions').clear()
    await tx.done
    db.close()
  }

  it('saveSession then loadSession returns same state', async () => {
    await clearDB()
    const id = 'test-session'
    const state = { ...mockState, activeColumnId: 'col-1' }
    
    await saveSession(id, state)
    const loaded = await loadSession(id)
    
    expect(loaded).toEqual(state)
  })

  it('loadSession with unknown id returns null', async () => {
    await clearDB()
    const loaded = await loadSession('non-existent')
    expect(loaded).toBeNull()
  })

  it('listSessions returns sorted by updatedAt desc', async () => {
    await clearDB()
    await saveSession('session-1', mockState)
    await new Promise(r => setTimeout(r, 10))
    await saveSession('session-2', mockState)
    await new Promise(r => setTimeout(r, 10))
    await saveSession('session-3', mockState)

    const sessions = await listSessions()
    
    expect(sessions).toHaveLength(3)
    expect(sessions[0].id).toBe('session-3')
    expect(sessions[1].id).toBe('session-2')
    expect(sessions[2].id).toBe('session-1')
  })
})
