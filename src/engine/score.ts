import { GoogleGenAI } from '@google/genai'
import { Bubble } from '../types/graph'

export interface ScoringResult {
  score: number
  lastScoredAt: number
}

export async function computeBubbleScore(
  client: GoogleGenAI,
  content: string
): Promise<ScoringResult> {
  const lastScoredAt = Date.now()

  if (!content.trim()) {
    return { score: 0, lastScoredAt }
  }

  const prompt = `Evaluate the following thought from 0 to 100 based on its clarity, depth, and how much it contributes to solving a problem.
Output ONLY the numerical score, nothing else.

Thought:
${content}`

  try {
    const result = await client.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [prompt],
    })

    const text = result.text?.trim() ?? ''
    let score = parseInt(text, 10)

    if (isNaN(score)) {
      score = 0
    }

    score = Math.max(0, Math.min(100, score))

    return { score, lastScoredAt }
  } catch (error) {
    console.error('Scoring failed:', error)
    return { score: 0, lastScoredAt }
  }
}

export function suggestBestPath(bubbles: Record<string, Bubble>): string[] {
  const bubbleList = Object.values(bubbles)
  if (bubbleList.length === 0) return []

  const leaves = bubbleList.filter((b) => b.children.length === 0)
  let bestPath: string[] = []
  let maxScore = -1

  for (const leaf of leaves) {
    const path: string[] = []
    let current: Bubble | undefined = leaf
    let pathScore = 0

    while (current) {
      path.unshift(current.id)
      pathScore += current.score
      current = current.parentId ? bubbles[current.parentId] : undefined
    }

    if (pathScore > maxScore) {
      maxScore = pathScore
      bestPath = path
    }
  }

  return bestPath
}
