import { env } from '../config/env';

export async function invokeLLM(prompt: string, options?: {
  model?: string;
  responseJson?: boolean;
  addContextFromInternet?: boolean;
}): Promise<string | null> {
  if (!env.GEMINI_API_KEY) {
    console.warn('[LLM] GEMINI_API_KEY not configured');
    return null;
  }

  try {
    const model = options?.model || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    const body: Record<string, unknown> = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ text: string }> };
      }>;
    };

    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('[LLM] Error:', (error as Error).message);
    return null;
  }
}

export async function invokeLLMJson<T>(prompt: string): Promise<T | null> {
  const fullPrompt = `${prompt}\n\nResponde SOLO con JSON válido, sin markdown ni explicaciones.`;
  const response = await invokeLLM(fullPrompt);
  if (!response) return null;

  try {
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || [null, response];
    return JSON.parse(jsonMatch[1] || response) as T;
  } catch {
    return null;
  }
}
