// أنواع المنصات: أسماء المنصات، النماذج، مزودي الذكاء الاصطناعي، إعدادات المزود

import type { AIMessage } from './chat';

/**
 * أسماء المنصات المدعومة
 */
export type PlatformName =
  | 'openrouter'
  | 'groq'
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'together'
  | 'mistral';

/**
 * معلومات المنصة
 */
export interface Platform {
  name: PlatformName;
  displayName: string;
  icon: string;
  baseUrl: string;
  authMethod: 'bearer' | 'api-key' | 'query';
}

/**
 * النموذج (Model) للذكاء الاصطناعي
 */
export interface Model {
  id: string;
  name: string;
  description?: string;
}

/**
 * واجهة مزود الذكاء الاصطناعي
 */
export interface AIProvider {
  sendMessage: (config: ProviderRequestConfig) => Promise<ReadableStream<Uint8Array>>;
  fetchModels: (apiKey: string) => Promise<Model[]>;
}

/**
 * إعدادات المزود
 */
export interface ProviderConfig {
  baseUrl: string;
  authHeader: string;
  streamPath: string;
}

/**
 * إعدادات طلب المزود
 */
export interface ProviderRequestConfig {
  apiKey: string;
  model: string;
  messages: AIMessage[];
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
}

/**
 * استجابة البث (Streaming Response chunk)
 */
export interface StreamChunk {
  content: string;
  isFinished: boolean;
  tokensUsed?: number;
}

/**
 * النموذج المعروض في واجهة المستخدم
 */
export interface DisplayModel {
  id: string;
  name: string;
  platform: PlatformName;
  isGlobal: boolean;
  apiKeyId: string;
}

/**
 * حالة اختيار المنصة والنموذج
 */
export interface PlatformSelection {
  platform: PlatformName;
  model: string;
  apiKeyId: string;
  isGlobalKey: boolean;
}
