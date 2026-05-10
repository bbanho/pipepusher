import { GoogleGenAI } from '@google/genai'

export async function propagateContext(
  client: GoogleGenAI,
  parentContent: string,
  childId: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
}
