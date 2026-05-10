import { GoogleGenAI } from '@google/genai'

export async function summarizeBubble(
  client: GoogleGenAI,
  content: string
): Promise<string> {
  if (!content.trim()) {
    return 'Empty thought'
  }

  const prompt = `Summarize the following thought into a 3-5 word title. 
Output ONLY the title, no quotes, no period, no extra text.

Thought:
${content}`

  try {
    const result = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [prompt],
    })
    const text = result.text?.trim() ?? 'Summary failed'
    
    return text.replace(/^["']|["']$/g, '').replace(/\.$/, '')
  } catch (error) {
    console.error('Summarization failed:', error)
    return 'Summary failed'
  }
}
