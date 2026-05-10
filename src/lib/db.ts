import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { GraphState } from '@/types/graph'

interface PipePusherDB extends DBSchema {
  sessions: {
    key: string
    value: {
      id: string
      state: GraphState
      updatedAt: number
    }
  }
}

const DB_NAME = 'pipepusher-db'
const DB_VERSION = 2

let dbPromise: Promise<IDBPDatabase<PipePusherDB>> | null = null

function getDB() {
  if (typeof window === 'undefined') return null
  if (!dbPromise) {
    dbPromise = openDB<PipePusherDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('sessions', { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export async function saveSession(id: string, state: GraphState): Promise<void> {
  const db = await getDB()
  if (!db) return

  await db.put('sessions', {
    id,
    state,
    updatedAt: Date.now(),
  })
}

export async function loadSession(id: string): Promise<GraphState | null> {
  const db = await getDB()
  if (!db) return null

  const session = await db.get('sessions', id)
  return session ? session.state : null
}

export async function listSessions(): Promise<{ id: string; updatedAt: number }[]> {
  const db = await getDB()
  if (!db) return []

  const sessions = await db.getAll('sessions')
  return sessions
    .map((s) => ({ id: s.id, updatedAt: s.updatedAt }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}
