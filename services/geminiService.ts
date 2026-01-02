
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SrtBlock } from "../types";

const CHUNK_SIZE = 25; // Translate 25 blocks at a time for reliability

export const translateSrtBlocks = async (
  blocks: SrtBlock[],
  targetLanguage: string,
  onProgress: (progress: number) => void
): Promise<SrtBlock[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const translatedBlocks: SrtBlock[] = [];

  const chunks: SrtBlock[][] = [];
  for (let i = 0; i < blocks.length; i += CHUNK_SIZE) {
    chunks.push(blocks.slice(i, i + CHUNK_SIZE));
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const prompt = `Translate the following SRT content into ${targetLanguage}. 
Rules:
1. Translate contextually (dialogue, documentary style).
2. DO NOT change timestamps or IDs.
3. Keep the exact SRT format.
4. If a line is too long, shorten it naturally for readability.
5. Provide ONLY the translated SRT text as output.

CONTENT TO TRANSLATE:
${chunk.map(b => `${b.id}\n${b.timestamp}\n${b.content}\n`).join('\n')}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.1, // Keep it precise
        },
      });

      const translatedText = response.text || '';
      const processedChunk = parseTranslatedText(translatedText, chunk);
      translatedBlocks.push(...processedChunk);
      
      onProgress(Math.round(((i + 1) / chunks.length) * 100));
    } catch (error) {
      console.error('Translation chunk error:', error);
      // Fallback: If a chunk fails, keep original to avoid breaking the file
      translatedBlocks.push(...chunk);
    }
  }

  return translatedBlocks;
};

// Ensures that the translated output matches the requested IDs and Timestamps
// even if the LLM makes minor formatting mistakes.
const parseTranslatedText = (text: string, originalChunk: SrtBlock[]): SrtBlock[] => {
  const normalizedText = text.trim();
  const blocks = normalizedText.split(/\n\s*\n/);
  
  return originalChunk.map((original, idx) => {
    // Try to find a matching block by index
    const translatedBlockStr = blocks[idx] || '';
    const lines = translatedBlockStr.split(/\r?\n/).filter(l => l.trim() !== '');
    
    // Most likely, the first line is ID, second is timestamp, rest is content
    // We strictly use original ID and Timestamp
    let content = original.content; // fallback
    
    if (lines.length >= 3) {
      // It looks like a full SRT block
      content = lines.slice(2).join('\n').trim();
    } else if (lines.length > 0 && lines.length < 3) {
      // Maybe the model only sent the text
      content = lines.join('\n').trim();
    }
    
    return {
      id: original.id,
      timestamp: original.timestamp,
      content: content || original.content
    };
  });
};
