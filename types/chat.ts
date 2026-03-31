// أنواع الدردشة: أدوار الرسائل، الرسائل، المحادثات، حالة البث

/**
 * أدوار الرسائل في المحادثة
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * الرسالة - تطابق جدول messages
 */
export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  model: string | null;
  platform: string | null;
  persona_name: string | null;
  tokens_used: number;
  response_time_ms: number | null;
  created_at: string;
}

/**
 * المحادثة - تطابق جدول conversations
 */
export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  persona_id: string | null;
  platform: string;
  model: string;
  folder_id: string | null;
  is_favorited: boolean;
  message_count: number;
  total_tokens: number;
  created_at: string;
  updated_at: string;
}

/**
 * حالة البث المباشر
 */
export interface StreamState {
  isStreaming: boolean;
  isSending: boolean;
}

/**
 * بيانات إنشاء رسالة جديدة
 */
export interface CreateMessageData {
  conversation_id: string;
  role: MessageRole;
  content: string;
  model?: string;
  platform?: string;
  persona_name?: string;
  tokens_used?: number;
  response_time_ms?: number;
}

/**
 * بيانات إنشاء محادثة جديدة
 */
export interface CreateConversationData {
  title?: string;
  persona_id?: string | null;
  platform: string;
  model: string;
  folder_id?: string | null;
}

/**
 * بيانات تحديث المحادثة
 */
export interface UpdateConversationData {
  title?: string;
  folder_id?: string | null;
  is_favorited?: boolean;
}

/**
 * رسالة للإرسال إلى مزود الذكاء الاصطناعي
 */
export interface AIMessage {
  role: MessageRole;
  content: string;
}

/**
 * طلب الدردشة للـ API
 */
export interface ChatRequest {
  messages: AIMessage[];
  model: string;
  platform: string;
  conversationId: string;
  personaName?: string;
  apiKeyId?: string;
  isGlobalKey?: boolean;
}

/**
 * استجابة الدردشة من الـ API
 */
export interface ChatResponse {
  content: string;
  tokensUsed: number;
  responseTimeMs: number;
}
