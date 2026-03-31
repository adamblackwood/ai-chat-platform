// خطاف الدردشة المتكامل: يدير المحادثات والرسائل والبث المباشر
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { usePlatformStore } from '@/stores/platformStore';
import { usePersonaStore } from '@/stores/personaStore';
import type {
  Conversation, Message, CreateConversationData,
  UpdateConversationData, AIMessage,
} from '@/types/chat';

interface UseChatReturn {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  isStreaming: boolean;
  streamingContent: string;
  loadConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<Conversation | null>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  createConversation: (data: CreateConversationData) => Promise<Conversation | null>;
  updateConversation: (id: string, data: UpdateConversationData) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  searchConversations: (query: string) => Conversation[];
}

export function useChat(): UseChatReturn {
  const supabase = createSupabaseBrowserClient();
  const { user } = useAuthStore();
  const { activePlatform, activeModel, apiType } = usePlatformStore();
  const { activePersona } = usePersonaStore();
  const {
    conversation: currentConversation,
    messages,
    isSending,
    isStreaming,
    streamingContent,
    setConversation,
    setMessages,
    addMessage,
    setSending,
    setStreaming,
    setStreamingContent,
    appendStreamingContent,
    incrementMessageCount,
    addTokens,
    clearChat,
  } = useChatStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const loadedRef = useRef(false);

  // تحميل المحادثات
  const loadConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingConversations(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (!error && data) setConversations(data as Conversation[]);
    } catch { /* تجاهل */ } finally {
      setIsLoadingConversations(false);
    }
  }, [supabase, user]);

  // تحميل محادثة واحدة
  const loadConversation = useCallback(
    async (id: string): Promise<Conversation | null> => {
      if (!user) return null;
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        if (error || !data) return null;
        const conv = data as Conversation;
        setConversation(conv);
        return conv;
      } catch { return null; }
    },
    [supabase, user, setConversation]
  );

  // تحميل الرسائل
  const loadMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (!error && data) setMessages(data as Message[]);
      } catch { /* تجاهل */ } finally {
        setIsLoadingMessages(false);
      }
    },
    [supabase, setMessages]
  );

  // إرسال رسالة مع بث مباشر
  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !currentConversation) return;
      setSending(true);
      setStreamingContent('');

      const startTime = Date.now();

      // إضافة رسالة المستخدم محلياً (تفاؤلي)
      const userMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: currentConversation.id,
        role: 'user',
        content,
        model: null,
        platform: null,
        persona_name: null,
        tokens_used: 0,
        response_time_ms: null,
        created_at: new Date().toISOString(),
      };
      addMessage(userMsg);
      incrementMessageCount();

      // حفظ رسالة المستخدم في قاعدة البيانات
      try {
        await supabase.from('messages').insert({
          conversation_id: currentConversation.id,
          role: 'user' as const,
          content,
        });
      } catch { /* تجاهل */ }

      // بناء رسائل API
      const apiMessages: AIMessage[] = [];

      // إضافة system prompt إذا وجدت شخصية
      if (activePersona?.system_prompt) {
        apiMessages.push({ role: 'system', content: activePersona.system_prompt });
      }

      // إضافة الرسائل السابقة
      for (const msg of messages) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          apiMessages.push({ role: msg.role, content: msg.content });
        }
      }

      // إضافة الرسالة الحالية
      apiMessages.push({ role: 'user', content });

      // إرسال للـ API
      try {
        setSending(false);
        setStreaming(true);

        abortRef.current = new AbortController();

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            model: activeModel,
            platform: activePlatform,
            conversationId: currentConversation.id,
            personaName: activePersona?.name ?? null,
            apiType,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as Record<string, string>;
          throw new Error(errorData.error ?? 'Failed to send message');
        }

        // قراءة البث
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data) as { content?: string; error?: string };
                if (parsed.content) {
                  fullContent += parsed.content;
                  setStreamingContent(fullContent);
                }
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (parseErr) {
                if (parseErr instanceof Error && parseErr.message !== data) {
                  // ليس JSON صالح، تجاهل
                }
              }
            }
          }
        }

        const responseTime = Date.now() - startTime;
        const estimatedTokens = Math.ceil(fullContent.length / 4);

        // إضافة رسالة المساعد محلياً
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          conversation_id: currentConversation.id,
          role: 'assistant',
          content: fullContent,
          model: activeModel,
          platform: activePlatform,
          persona_name: activePersona?.name ?? null,
          tokens_used: estimatedTokens,
          response_time_ms: responseTime,
          created_at: new Date().toISOString(),
        };
        addMessage(assistantMsg);
        addTokens(estimatedTokens);

        // حفظ رسالة المساعد في قاعدة البيانات
        await supabase.from('messages').insert({
          conversation_id: currentConversation.id,
          role: 'assistant' as const,
          content: fullContent,
          model: activeModel,
          platform: activePlatform,
          persona_name: activePersona?.name ?? null,
          tokens_used: estimatedTokens,
          response_time_ms: responseTime,
        });

        // تحديث عنوان المحادثة إذا كانت أول رسالة
        if (messages.length === 0) {
          const title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
          await supabase
            .from('conversations')
            .update({ title, updated_at: new Date().toISOString() })
            .eq('id', currentConversation.id);

          setConversation({ ...currentConversation, title });
          setConversations((prev) =>
            prev.map((c) => (c.id === currentConversation.id ? { ...c, title } : c))
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // تم إلغاء البث بواسطة المستخدم
        } else {
          // إضافة رسالة خطأ
          const errorMsg: Message = {
            id: crypto.randomUUID(),
            conversation_id: currentConversation.id,
            role: 'assistant',
            content: err instanceof Error ? err.message : 'An error occurred',
            model: null,
            platform: null,
            persona_name: null,
            tokens_used: 0,
            response_time_ms: null,
            created_at: new Date().toISOString(),
          };
          addMessage(errorMsg);
        }
      } finally {
        setStreaming(false);
        setSending(false);
        setStreamingContent('');
        abortRef.current = null;
      }
    },
    [
      user, currentConversation, messages, activeModel, activePlatform,
      activePersona, apiType, supabase, addMessage, setSending, setStreaming,
      setStreamingContent, incrementMessageCount, addTokens, setConversation,
    ]
  );

  // إيقاف البث
  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
    setSending(false);
  }, [setStreaming, setSending]);

  // إنشاء محادثة
  const createConversation = useCallback(
    async (data: CreateConversationData): Promise<Conversation | null> => {
      if (!user) return null;
      try {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: data.title ?? 'محادثة جديدة',
            persona_id: data.persona_id ?? null,
            platform: data.platform,
            model: data.model,
            folder_id: data.folder_id ?? null,
          })
          .select()
          .single();
        if (error || !newConv) return null;
        const conv = newConv as Conversation;
        setConversation(conv);
        setMessages([]);
        setConversations((prev) => [conv, ...prev]);
        return conv;
      } catch { return null; }
    },
    [supabase, user, setConversation, setMessages]
  );

  // تحديث محادثة
  const updateConversation = useCallback(
    async (id: string, data: UpdateConversationData) => {
      try {
        await supabase
          .from('conversations')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id);
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...data } : c))
        );
        if (currentConversation?.id === id) {
          setConversation({ ...currentConversation, ...data, updated_at: new Date().toISOString() });
        }
      } catch { /* تجاهل */ }
    },
    [supabase, currentConversation, setConversation]
  );

  // حذف محادثة
  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await supabase.from('conversations').delete().eq('id', id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (currentConversation?.id === id) {
          clearChat();
        }
      } catch { /* تجاهل */ }
    },
    [supabase, currentConversation, clearChat]
  );

  // بحث
  const searchConversations = useCallback(
    (query: string): Conversation[] => {
      if (!query.trim()) return conversations;
      const lower = query.toLowerCase();
      return conversations.filter((c) => c.title.toLowerCase().includes(lower));
    },
    [conversations]
  );

  // تحميل أولي
  useEffect(() => {
    if (user && !loadedRef.current) {
      loadedRef.current = true;
      loadConversations();
    }
    return () => {};
  }, [user, loadConversations]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    isStreaming,
    streamingContent,
    loadConversations,
    loadConversation,
    loadMessages,
    sendMessage,
    stopStreaming,
    createConversation,
    updateConversation,
    deleteConversation,
    searchConversations,
  };
}
