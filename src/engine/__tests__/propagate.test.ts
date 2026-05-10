import { describe, it, expect, vi } from 'vitest'
import { propagateContext } from '../propagate'
import { GoogleGenAI } from '@google/genai'

describe('propagateContext', () => {
  it('should resolve after a delay', async () => {
    const mockClient = {} as GoogleGenAI
    const startTime = Date.now()
    await propagateContext(mockClient, 'Parent content', 'child-1')
    const duration = Date.now() - startTime
    
    expect(duration).toBeGreaterThanOrEqual(450)
  })
})
