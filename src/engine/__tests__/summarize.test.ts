import { describe, it, expect, vi } from 'vitest'
import { summarizeBubble } from '../summarize'
import { GoogleGenAI } from '@google/genai'

describe('summarizeBubble', () => {
  it('should return "Empty thought" if content is empty', async () => {
    const mockClient = {} as GoogleGenAI
    const result = await summarizeBubble(mockClient, '')
    expect(result).toBe('Empty thought')
  })

  it('should call generateContent and return trimmed response', async () => {
    const mockResult = {
      text: '  Test Summary  '
    }
    const mockClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue(mockResult)
      }
    } as unknown as GoogleGenAI

    const result = await summarizeBubble(mockClient, 'Long content that needs summary')
    
    expect(mockClient.models.generateContent).toHaveBeenCalledWith({
      model: 'gemini-1.5-flash',
      contents: [expect.stringContaining('Long content that needs summary')]
    })
    expect(result).toBe('Test Summary')
  })

  it('should strip quotes and trailing periods', async () => {
    const mockResult = {
      text: '"Quoted Summary."'
    }
    const mockClient = {
      models: {
        generateContent: vi.fn().mockResolvedValue(mockResult)
      }
    } as unknown as GoogleGenAI

    const result = await summarizeBubble(mockClient, 'Content')
    expect(result).toBe('Quoted Summary')
  })

  it('should return "Summary failed" on error', async () => {
    const mockClient = {
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('API Error'))
      }
    } as unknown as GoogleGenAI

    const result = await summarizeBubble(mockClient, 'Content')
    expect(result).toBe('Summary failed')
  })
})
