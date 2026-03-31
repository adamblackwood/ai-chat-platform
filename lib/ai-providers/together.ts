// مزود Together AI: متوافق مع OpenAI
import type { AIProviderInterface, StreamRequestConfig } from './index';

export const togetherProvider: AIProviderInterface = {
  createStreamRequest(config: StreamRequestConfig) {
    return {
      url: 'https://api.together.xyz/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${config.apiKey}\`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: config.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
        max_tokens: config.maxTokens ?? 4096,
        temperature: config.temperature ?? 0.7,
      }),
    };
  },

  parseStreamChunk(chunk: string): string | null {
    if (chunk === '[DONE]') return null;
    try {
      const parsed = JSON.parse(chunk) as {
        choices?: Array<{ delta?: { content?: string } }>;
      };
      return parsed.choices?.[0]?.delta?.content ?? null;
    } catch {
      return null;
    }
  },

  async fetchModels(apiKey: string) {
    const res = await fetch('https://api.together.xyz/v1/models', {
      headers: { 'Authorization': \`Bearer \${apiKey}\` },
    });
    if (!res.ok) return [];
    const data = await res.json() as Array<{ id: string; display_name?: string; type?: string }>;
    return (Array.isArray(data) ? data : [])
      .filter((m) => m.type === 'chat')
      .map((m) => ({ id: m.id, name: m.display_name ?? m.id }));
  },
};
