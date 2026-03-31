// مخزن الدردشة: يحفظ المحادثة الحالية والرسائل وحالة البث
// لا يستخدم persist لأن البيانات تأتي من قاعدة البيانات
import { create } from 'zustand';
import type { Conversation, Message } from '@/types/chat';

/**
 * واجهة مخزن الدردشة
 */
interface ChatStore {
  /** المحادثة الحالية */
  conversation: Conversation | null;
  /** قائمة الرسائل في المحادثة الحالية */
  messages: Message[];
  /** هل يتم إرسال رسالة؟ */
  isSending: boolean;
  /** هل يتم استقبال بث مباشر؟ */
  isStreaming: boolean;
  /** عدد الرسائل في المحادثة الحالية */
  messageCount: number;
  /** إجمالي الرموز المستخدمة */
  totalTokens: number;
  /** النص المتدفق حالياً (أثناء البث) */
  streamingContent: string;

  /** تعيين المحادثة الحالية */
  setConversation: (conversation: Conversation | null) => void;
  /** إضافة رسالة جديدة */
  addMessage: (message: Message) => void;
  /** تحديث آخر رسالة (للبث المباشر) */
  updateLastMessage: (content: string) => void;
  /** تعيين قائمة الرسائل */
  setMessages: (messages: Message[]) => void;
  /** تعيين حالة الإرسال */
  setSending: (isSending: boolean) => void;
  /** تعيين حالة البث */
  setStreaming: (isStreaming: boolean) => void;
  /** تعيين النص المتدفق */
  setStreamingContent: (content: string) => void;
  /** إضافة محتوى للنص المتدفق */
  appendStreamingContent: (chunk: string) => void;
  /** زيادة عدد الرسائل */
  incrementMessageCount: () => void;
  /** إضافة رموز مستخدمة */
  addTokens: (tokens: number) => void;
  /** مسح جميع بيانات الدردشة */
  clearChat: () => void;
}

/**
 * مخزن الدردشة باستخدام Zustand
 */
export const useChatStore = create<ChatStore>((set) => ({
  conversation: null,
  messages: [],
  isSending: false,
  isStreaming: false,
  messageCount: 0,
  totalTokens: 0,
  streamingContent: '',

  setConversation: (conversation) =>
    set({
      conversation,
      messageCount: conversation?.message_count ?? 0,
      totalTokens: conversation?.total_tokens ?? 0,
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      const lastIndex = messages.length - 1;
      if (lastIndex >= 0) {
        const lastMessage = messages[lastIndex];
        if (lastMessage) {
          messages[lastIndex] = { ...lastMessage, content };
        }
      }
      return { messages };
    }),

  setMessages: (messages) => set({ messages }),

  setSending: (isSending) => set({ isSending }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  setStreamingContent: (content) => set({ streamingContent: content }),

  appendStreamingContent: (chunk) =>
    set((state) => ({
      streamingContent: state.streamingContent + chunk,
    })),

  incrementMessageCount: () =>
    set((state) => ({
      messageCount: state.messageCount + 1,
    })),

  addTokens: (tokens) =>
    set((state) => ({
      totalTokens: state.totalTokens + tokens,
    })),

  clearChat: () =>
    set({
      conversation: null,
      messages: [],
      isSending: false,
      isStreaming: false,
      messageCount: 0,
      totalTokens: 0,
      streamingContent: '',
    }),
}));
