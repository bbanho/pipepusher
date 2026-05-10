import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computeBubbleScore, suggestBestPath } from '../score'
import { GoogleGenAI } from '@google/genai'

vi.mock('@google/genai')

describe('computeBubbleScore', () => {
  let mockClient: any

  beforeEach(() => {
    mockClient = {
      models: {
        generateContent: vi.fn()
      }
    }
  })

  it('should return a score and timestamp on success', async () => {
    mockClient.models.generateContent.mockResolvedValue({
      text: '85'
    })

    const result = await computeBubbleScore(mockClient as unknown as GoogleGenAI, 'This is a great thought')

    expect(result.score).toBe(85)
    expect(result.lastScoredAt).toBeGreaterThan(0)
    expect(mockClient.models.generateContent).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gemini-1.5-pro'
    }))
  })

  it('should handle non-numeric responses from LLM', async () => {
    mockClient.models.generateContent.mockResolvedValue({
      text: 'High'
    })

    const result = await computeBubbleScore(mockClient as unknown as GoogleGenAI, 'This is a great thought')

    expect(result.score).toBe(0)
  })

  it('should clamp scores between 0 and 100', async () => {
     mockClient.models.generateContent.mockResolvedValue({
      text: '150'
    })

    const result = await computeBubbleScore(mockClient as unknown as GoogleGenAI, 'This is a great thought')
    expect(result.score).toBe(100)

    mockClient.models.generateContent.mockResolvedValue({
      text: '-10'
    })
    const result2 = await computeBubbleScore(mockClient as unknown as GoogleGenAI, 'This is a great thought')
    expect(result2.score).toBe(0)
  })

  it('should return 0 score on error', async () => {
    mockClient.models.generateContent.mockRejectedValue(new Error('API Error'))

    const result = await computeBubbleScore(mockClient as unknown as GoogleGenAI, 'This is a great thought')

    expect(result.score).toBe(0)
    expect(result.lastScoredAt).toBeGreaterThan(0)
  })
})

describe('suggestBestPath', () => {
  it('should return the path to the leaf with the highest aggregate score', () => {
    const bubbles: Record<string, any> = {
      'A': { id: 'A', score: 80, parentId: null, children: ['B', 'D'] },
      'B': { id: 'B', score: 70, parentId: 'A', children: ['C'] },
      'C': { id: 'C', score: 90, parentId: 'B', children: [] },
      'D': { id: 'D', score: 60, parentId: 'A', children: ['E'] },
      'E': { id: 'E', score: 100, parentId: 'D', children: [] },
      'F': { id: 'F', score: 50, parentId: null, children: ['G'] },
      'G': { id: 'G', score: 60, parentId: 'F', children: [] },
    }

    const path = suggestBestPath(bubbles as any)

    expect(path).toContain('A')
    expect(path.length).toBeGreaterThan(1)
    
    const sum = path.reduce((s, id) => s + bubbles[id].score, 0)
    expect(sum).toBe(240)
  })

  it('should return an empty array if no bubbles exist', () => {
    expect(suggestBestPath({})).toEqual([])
  })
})
