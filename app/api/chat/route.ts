// مسار API للدردشة: يعالج الطلبات ويبثها عبر SSE
import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { getProvider, isSupportedPlatform } from '@/lib/ai-providers/index';
import { decrypt } from '@/lib/encryption';
import type { AIMessage } from '@/types/chat';
import type { PlatformName } from '@/types/platform';

interface ChatRequestBody {
  messages: AIMessage[];
  model: string;
  platform: string;
  conversationId: string;
  personaName?: string | null;
  apiType: 'global' | 'private';
}

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // جلب الملف الشخصي
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'ملف شخصي غير موجود' }, { status: 404 });
    }

    if (profile.is_banned) {
      return NextResponse.json({ error: 'الحساب محظور' }, { status: 403 });
    }

    // قراءة الجسم
    const body = await request.json() as ChatRequestBody;
    const { messages, model, platform, apiType } = body;

    if (!messages || !model || !platform) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    if (!isSupportedPlatform(platform)) {
      return NextResponse.json({ error: 'منصة غير مدعومة' }, { status: 400 });
    }

    const platformName = platform as PlatformName;

    // الحصول على مفتاح API
    let apiKey: string;

    if (apiType === 'global') {
      // استخدام المفتاح العام
      const adminClient = createSupabaseAdminClient();
      const { data: globalKey } = await adminClient
        .from('api_keys')
        .select('encrypted_key')
        .eq('platform', platform)
        .eq('is_global', true)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (!globalKey) {
        return NextResponse.json(
          { error: 'لا يوجد مفتاح عام متاح لهذه المنصة' },
          { status: 404 }
        );
      }

      try {
        apiKey = await decrypt(globalKey.encrypted_key);
      } catch {
        return NextResponse.json(
          { error: 'خطأ في فك تشفير المفتاح' },
          { status: 500 }
        );
      }
    } else {
      // المفتاح الخاص - يأتي من العميل مشفراً
      return NextResponse.json(
        { error: 'المفاتيح الخاصة تُرسل مباشرة من المتصفح' },
        { status: 400 }
      );
    }

    // تحديث last_used_at
    const adminClient = createSupabaseAdminClient();
    await adminClient
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('platform', platform)
      .eq('is_global', true)
      .eq('is_active', true);

    // إنشاء طلب المزود
    const provider = getProvider(platformName);
    const streamReq = provider.createStreamRequest({
      apiKey,
      model,
      messages,
    });

    // إرسال الطلب للمزود
    const providerResponse = await fetch(streamReq.url, {
      method: 'POST',
      headers: streamReq.headers,
      body: streamReq.body,
    });

    if (!providerResponse.ok) {
      const errorText = await providerResponse.text().catch(() => 'Unknown error');

      // إشعار إذا كان خطأ رصيد
      if (providerResponse.status === 402 || providerResponse.status === 429) {
        await adminClient.from('notifications').insert({
          type: providerResponse.status === 402 ? 'api_depleted' : 'api_low_balance',
          title: providerResponse.status === 402 ? 'نفاد رصيد API' : 'رصيد API منخفض',
          message: \`خطأ \${providerResponse.status} من منصة \${platform}: \${errorText.substring(0, 200)}\`,
          priority: 'urgent',
          metadata: { platform, status: providerResponse.status },
        });
      }

      return NextResponse.json(
        { error: \`خطأ من المنصة: \${providerResponse.status}\` },
        { status: providerResponse.status }
      );
    }

    // إنشاء بث SSE
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = providerResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            const lines = text.split('\n');

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              let dataContent = trimmed;
              if (trimmed.startsWith('data: ')) {
                dataContent = trimmed.slice(6);
              }

              if (dataContent === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              const content = provider.parseStreamChunk(dataContent);
              if (content) {
                const sseData = JSON.stringify({ content });
                controller.enqueue(encoder.encode(\`data: \${sseData}\n\n\`));
              }
            }
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(
            encoder.encode(\`data: \${JSON.stringify({ error: errorMsg })}\n\n\`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطأ داخلي';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
