import { describe, it, expect, vi } from 'vitest'
import { getGeminiClient } from './gemini'
import { GoogleGenAI } from '@google/genai'

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function(config) {
      this.config = config;
    })
  }
})

describe('getGeminiClient', () => {
  it('should initialize GoogleGenAI with the provided accessToken as apiKey', () => {
    const accessToken = 'test-token'
    const client = getGeminiClient(accessToken)
    
    expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: accessToken })
    expect(client).toBeDefined()
  })
})
