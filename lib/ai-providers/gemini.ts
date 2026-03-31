// مزود Google Gemini: تنسيق مخصص مع contents/parts
import type { AIProviderInterface, StreamRequestConfig } from './index';

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export const geminiProvider: AIProviderInterface = {
  createStreamRequest(config: StreamRequestConfig) {
    let systemInstruction = '';
    const contents: GeminiContent[] = [];

    for (const msg of config.messages) {
      if (msg.role === 'system') {
        systemInstruction += (systemInstruction ? '\n' : '') + msg.content;
      } else {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // ضمان أن أول محتوى من المستخدم
    if (contents.length > 0 && contents[0]?.role !== 'user') {
      contents.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        maxOutputTokens: config.maxTokens ?? 4096,
        temperature: config.temperature ?? 0.7,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    return {
      url: \`https://generativelanguage.googleapis.com/v1beta/models/\${config.model}:streamGenerateContent?key=\${config.apiKey}&alt=sse\`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };
  },

  parseStreamChunk(chunk: string): string | null {
    try {
      const parsed = JSON.parse(chunk) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };

      const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ?? null;
    } catch {
      return null;
    }
  },

  async fetchModels(apiKey: string) {
    const res = await fetch(
      \`https://generativelanguage.googleapis.com/v1beta/models?key=\${apiKey}\`
    );
    if (!res.ok) return [];
    const data = await res.json() as {
      models?: Array<{ name: string; displayName?: string; supportedGenerationMethods?: string[] }>;
    };
    return (data.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => ({
        id: m.name.replace('models/', ''),
        name: m.displayName ?? m.name,
      }));
  },
};
