// مزود Anthropic: تنسيق مخصص مع x-api-key و anthropic-version
import type { AIProviderInterface, StreamRequestConfig } from './index';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const anthropicProvider: AIProviderInterface = {
  createStreamRequest(config: StreamRequestConfig) {
    // استخراج رسالة النظام
    let systemPrompt = '';
    const convertedMessages: AnthropicMessage[] = [];

    for (const msg of config.messages) {
      if (msg.role === 'system') {
        systemPrompt += (systemPrompt ? '\n' : '') + msg.content;
      } else {
        convertedMessages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }

    // ضمان أن أول رسالة من المستخدم
    if (convertedMessages.length > 0 && convertedMessages[0]?.role !== 'user') {
      convertedMessages.unshift({ role: 'user', content: 'Hello' });
    }

    const body: Record<string, unknown> = {
      model: config.model,
      messages: convertedMessages,
      stream: true,
      max_tokens: config.maxTokens ?? 4096,
      temperature: config.temperature ?? 0.7,
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    return {
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    };
  },

  parseStreamChunk(chunk: string): string | null {
    try {
      const parsed = JSON.parse(chunk) as {
        type?: string;
        delta?: { type?: string; text?: string };
      };

      if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
        return parsed.delta.text ?? null;
      }

      if (parsed.type === 'message_stop') {
        return null;
      }

      return null;
    } catch {
      return null;
    }
  },

  async fetchModels() {
    // Anthropic لا يوفر API لجلب النماذج
    return [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
    ];
  },
};
