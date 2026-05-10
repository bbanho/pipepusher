import { GoogleGenAI } from '@google/genai'

export function getGeminiClient(accessToken: string) {
  return new GoogleGenAI({ 
    apiKey: accessToken,
  })
}
