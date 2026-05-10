'use client'

import { useEffect, useRef } from 'react'
import { useGraphStore } from '@/store/graph'
import { useSession } from 'next-auth/react'
import { WorkerRequest, WorkerResponse } from '@/engine/worker'

export function EngineManager() {
  const { data: session } = useSession()
  const bubbles = useGraphStore((state) => state.bubbles)
  const setSummary = useGraphStore((state) => state.setSummary)
  const setBubbleScore = useGraphStore((state) => state.setBubbleScore)
  const setBubbleStatus = useGraphStore((state) => state.setBubbleStatus)
  const workerRef = useRef<Worker | null>(null)
  const processingRef = useRef<Set<string>>(new Set())
  const scoringRef = useRef<Set<string>>(new Set())
  const propagationQueueRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    workerRef.current = new Worker(new URL('../engine/worker.ts', import.meta.url))

    workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data
      if (response.type === 'summarized') {
        setSummary(response.bubbleId, response.summary)
        processingRef.current.delete(response.bubbleId)
      } else if (response.type === 'scored') {
        setBubbleScore(response.bubbleId, response.score, response.lastScoredAt)
        scoringRef.current.delete(response.bubbleId)
      } else if (response.type === 'propagated') {
        setBubbleStatus(response.targetBubbleId, 'drafting')
        propagationQueueRef.current.delete(response.targetBubbleId)
      } else if (response.type === 'error') {
        console.error('Worker error:', response.message)
      }
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [setSummary, setBubbleScore, setBubbleStatus])

  useEffect(() => {
    if (!session?.accessToken || !workerRef.current) return

    Object.values(bubbles).forEach((bubble) => {
      if (
        bubble.content.trim().length > 0 &&
        bubble.status === 'drafting' &&
        !processingRef.current.has(bubble.id)
      ) {
        processingRef.current.add(bubble.id)
        workerRef.current?.postMessage({
          type: 'summarize',
          bubbleId: bubble.id,
          content: bubble.content,
          accessToken: session.accessToken as string,
        } as WorkerRequest)
      }

      if (
        bubble.status === 'summarized' &&
        Date.now() - bubble.lastScoredAt > 24 * 60 * 60 * 1000 &&
        !scoringRef.current.has(bubble.id)
      ) {
        scoringRef.current.add(bubble.id)
        workerRef.current?.postMessage({
          type: 'score',
          bubbleId: bubble.id,
          content: bubble.content,
          accessToken: session.accessToken as string,
        } as WorkerRequest)
      }

      if (
        bubble.status === 'summarized' &&
        bubble.children.length > 0
      ) {
        const needsPropagation = bubble.children.filter(childId => {
          const child = bubbles[childId]
          return child && child.status !== 'propagating' && !propagationQueueRef.current.has(childId)
        })

        if (needsPropagation.length > 0) {
          needsPropagation.forEach(childId => {
            propagationQueueRef.current.add(childId)
            setBubbleStatus(childId, 'propagating')
          })

          workerRef.current?.postMessage({
            type: 'propagate',
            bubbleId: bubble.id,
            content: bubble.content,
            childrenIds: needsPropagation,
            accessToken: session.accessToken as string,
          } as WorkerRequest)
        }
      }
    })
  }, [bubbles, session?.accessToken, setBubbleStatus])

  return null
}
