// مزود OpenRouter: متوافق مع OpenAI
import type { AIProviderInterface, StreamRequestConfig } from './index';

export const openRouterProvider: AIProviderInterface = {
  createStreamRequest(config: StreamRequestConfig) {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${config.apiKey}\`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': process.env.NEXT_PUBLIC_APP_NAME ?? 'AI Chat',
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
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': \`Bearer \${apiKey}\` },
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: Array<{ id: string; name?: string }> };
    return (data.data ?? []).map((m) => ({ id: m.id, name: m.name ?? m.id }));
  },
};
