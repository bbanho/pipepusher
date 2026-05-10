import { getGeminiClient } from '../lib/gemini'
import { summarizeBubble } from './summarize'
import { propagateContext } from './propagate'
import { computeBubbleScore } from './score'

export type WorkerRequest = 
  | { type: 'summarize'; bubbleId: string; content: string; accessToken: string }
  | { type: 'propagate'; bubbleId: string; content: string; childrenIds: string[]; accessToken: string }
  | { type: 'score'; bubbleId: string; content: string; accessToken: string }

export type WorkerResponse = 
  | { type: 'summarized'; bubbleId: string; summary: string }
  | { type: 'propagated'; bubbleId: string; targetBubbleId: string }
  | { type: 'scored'; bubbleId: string; score: number; lastScoredAt: number }
  | { type: 'error'; message: string }

addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data

  if (request.type === 'summarize') {
    try {
      const client = getGeminiClient(request.accessToken)
      
      const summary = await summarizeBubble(client, request.content)
      
      postMessage({ 
        type: 'summarized', 
        bubbleId: request.bubbleId, 
        summary 
      } as WorkerResponse)
    } catch (error) {
      postMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      } as WorkerResponse)
    }
  } else if (request.type === 'propagate') {
    try {
      const client = getGeminiClient(request.accessToken)
      
      await Promise.all(
        request.childrenIds.map(async (childId) => {
          await propagateContext(client, request.content, childId)
          postMessage({
            type: 'propagated',
            bubbleId: request.bubbleId,
            targetBubbleId: childId,
          } as WorkerResponse)
        })
      )
    } catch (error) {
      postMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      } as WorkerResponse)
    }
  } else if (request.type === 'score') {
    try {
      const client = getGeminiClient(request.accessToken)
      const { score, lastScoredAt } = await computeBubbleScore(client, request.content)
      
      postMessage({
        type: 'scored',
        bubbleId: request.bubbleId,
        score,
        lastScoredAt
      } as WorkerResponse)
    } catch (error) {
      postMessage({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      } as WorkerResponse)
    }
  }
})
