// مصنع مزودي الذكاء الاصطناعي: يعيد المزود المناسب حسب اسم المنصة
import { openRouterProvider } from './openrouter';
import { groqProvider } from './groq';
import { openAIProvider } from './openai';
import { anthropicProvider } from './anthropic';
import { geminiProvider } from './gemini';
import { togetherProvider } from './together';
import { mistralProvider } from './mistral';
import type { PlatformName } from '@/types/platform';
import type { AIMessage } from '@/types/chat';

/**
 * واجهة مزود AI
 */
export interface AIProviderInterface {
  createStreamRequest: (config: StreamRequestConfig) => {
    url: string;
    headers: Record<string, string>;
    body: string;
  };
  parseStreamChunk: (chunk: string) => string | null;
  fetchModels?: (apiKey: string) => Promise<Array<{ id: string; name: string }>>;
}

/**
 * إعدادات طلب البث
 */
export interface StreamRequestConfig {
  apiKey: string;
  model: string;
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
}

/**
 * خريطة المزودين
 */
const providers: Record<PlatformName, AIProviderInterface> = {
  openrouter: openRouterProvider,
  groq: groqProvider,
  openai: openAIProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  together: togetherProvider,
  mistral: mistralProvider,
};

/**
 * الحصول على مزود حسب اسم المنصة
 */
export function getProvider(platform: PlatformName): AIProviderInterface {
  const provider = providers[platform];
  if (!provider) {
    throw new Error(\`Unsupported platform: \${platform}\`);
  }
  return provider;
}

/**
 * التحقق من دعم المنصة
 */
export function isSupportedPlatform(platform: string): platform is PlatformName {
  return platform in providers;
}
