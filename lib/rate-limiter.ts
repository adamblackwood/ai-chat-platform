// محدد المعدل: يتحقق من إمكانية إرسال رسالة بناءً على الدور والحدود الزمنية
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import {
  FREE_MESSAGES_BEFORE_DELAY,
  FREE_DELAY_SECONDS,
  PREMIUM_DELAY_SECONDS,
  MESSAGE_LIMIT_PER_CHAT,
} from '@/utils/constants';
import type { Role } from '@/types/user';

/**
 * نتيجة فحص حد المعدل
 */
export interface RateLimitResult {
  /** هل مسموح بالإرسال؟ */
  allowed: boolean;
  /** عدد الثواني المتبقية للانتظار */
  waitSeconds: number;
  /** سبب المنع */
  reason: 'none' | 'rate_limited' | 'message_limit' | 'banned';
  /** عدد الرسائل المرسلة في هذا الدور الحالي */
  messagesSentInWindow: number;
}

/**
 * فحص حد المعدل لمستخدم في محادثة معينة
 * @param userId - معرف المستخدم
 * @param role - دور المستخدم
 * @param conversationId - معرف المحادثة
 * @param isPublicApi - هل يستخدم API عام؟
 * @returns نتيجة الفحص
 */
export async function checkRateLimit(
  userId: string,
  role: Role,
  conversationId: string,
  isPublicApi: boolean = true
): Promise<RateLimitResult> {
  // المدير لا يخضع لأي حدود
  if (role === 'admin') {
    return { allowed: true, waitSeconds: 0, reason: 'none', messagesSentInWindow: 0 };
  }

  // المفتاح الخاص لا يخضع لحدود المعدل
  if (!isPublicApi) {
    return { allowed: true, waitSeconds: 0, reason: 'none', messagesSentInWindow: 0 };
  }

  const adminClient = createSupabaseAdminClient();

  // فحص حد الرسائل لكل محادثة
  const { count: messageCount } = await adminClient
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('role', 'user');

  const currentCount = messageCount ?? 0;

  if (currentCount >= MESSAGE_LIMIT_PER_CHAT) {
    return {
      allowed: false,
      waitSeconds: 0,
      reason: 'message_limit',
      messagesSentInWindow: currentCount,
    };
  }

  // فحص حد المعدل الزمني
  if (role === 'premium') {
    // المميز: تأخير 60 ثانية بين الرسائل
    const { data: lastMsg } = await adminClient
      .from('messages')
      .select('created_at')
      .eq('conversation_id', conversationId)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastMsg) {
      const lastTime = new Date(lastMsg.created_at).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - lastTime) / 1000);

      if (elapsed < PREMIUM_DELAY_SECONDS) {
        return {
          allowed: false,
          waitSeconds: PREMIUM_DELAY_SECONDS - elapsed,
          reason: 'rate_limited',
          messagesSentInWindow: currentCount,
        };
      }
    }
  }

  if (role === 'free') {
    // المجاني: 4 رسائل مجانية ثم 180 ثانية
    // نحسب عدد الرسائل منذ آخر فترة تأخير
    const windowStart = new Date(Date.now() - FREE_DELAY_SECONDS * 1000).toISOString();

    const { count: recentCount } = await adminClient
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('role', 'user')
      .gte('created_at', windowStart);

    const recentMessages = recentCount ?? 0;

    if (recentMessages >= FREE_MESSAGES_BEFORE_DELAY) {
      // تحقق من آخر رسالة لحساب الوقت المتبقي
      const { data: lastMsg } = await adminClient
        .from('messages')
        .select('created_at')
        .eq('conversation_id', conversationId)
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lastMsg) {
        const lastTime = new Date(lastMsg.created_at).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - lastTime) / 1000);

        if (elapsed < FREE_DELAY_SECONDS) {
          return {
            allowed: false,
            waitSeconds: FREE_DELAY_SECONDS - elapsed,
            reason: 'rate_limited',
            messagesSentInWindow: recentMessages,
          };
        }
      }
    }
  }

  return {
    allowed: true,
    waitSeconds: 0,
    reason: 'none',
    messagesSentInWindow: currentCount,
  };
}
