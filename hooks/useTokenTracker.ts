// خطاف تتبع الرموز: يتتبع استخدام الرموز لكل رسالة ومحادثة ومستخدم
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';

interface TokenStats {
  conversationTokens: number;
  todayTokens: number;
  totalTokens: number;
  todayMessages: number;
}

interface UseTokenTrackerReturn {
  stats: TokenStats;
  isLoading: boolean;
  addTokens: (count: number) => void;
  refreshStats: () => Promise<void>;
}

export function useTokenTracker(): UseTokenTrackerReturn {
  const supabase = createSupabaseBrowserClient();
  const { user } = useAuthStore();
  const { totalTokens: convTokens } = useChatStore();

  const [stats, setStats] = useState<TokenStats>({
    conversationTokens: 0,
    todayTokens: 0,
    totalTokens: 0,
    todayMessages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const loadedRef = useRef(false);

  /**
   * تحديث الإحصائيات من قاعدة البيانات
   */
  const refreshStats = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      // إحصائيات اليوم
      const { data: todayStats } = await supabase
        .from('usage_stats')
        .select('messages_sent, tokens_used')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      // إجمالي الرموز من جميع المحادثات
      const { data: conversations } = await supabase
        .from('conversations')
        .select('total_tokens')
        .eq('user_id', user.id);

      const totalTokens = (conversations ?? []).reduce(
        (sum, c) => sum + ((c as { total_tokens: number }).total_tokens ?? 0),
        0
      );

      setStats({
        conversationTokens: convTokens,
        todayTokens: (todayStats as { tokens_used?: number } | null)?.tokens_used ?? 0,
        totalTokens,
        todayMessages: (todayStats as { messages_sent?: number } | null)?.messages_sent ?? 0,
      });
    } catch {
      // تجاهل
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user, convTokens]);

  /**
   * إضافة رموز جديدة
   */
  const addTokens = useCallback(
    (count: number) => {
      setStats((prev) => ({
        ...prev,
        conversationTokens: prev.conversationTokens + count,
        todayTokens: prev.todayTokens + count,
        totalTokens: prev.totalTokens + count,
        todayMessages: prev.todayMessages + 1,
      }));

      // تحديث usage_stats في قاعدة البيانات بشكل غير متزامن
      if (user) {
        const today = new Date().toISOString().split('T')[0]!;

        supabase
          .from('usage_stats')
          .upsert(
            {
              user_id: user.id,
              date: today,
              messages_sent: stats.todayMessages + 1,
              tokens_used: stats.todayTokens + count,
            },
            { onConflict: 'user_id,date' }
          )
          .then(() => {})
          .catch(() => {});
      }
    },
    [user, supabase, stats.todayMessages, stats.todayTokens]
  );

  useEffect(() => {
    if (user && !loadedRef.current) {
      loadedRef.current = true;
      refreshStats();
    }
    return () => {};
  }, [user, refreshStats]);

  // تحديث الرموز المحلية عند تغيير المحادثة
  useEffect(() => {
    setStats((prev) => ({ ...prev, conversationTokens: convTokens }));
    return () => {};
  }, [convTokens]);

  return { stats, isLoading, addTokens, refreshStats };
}
