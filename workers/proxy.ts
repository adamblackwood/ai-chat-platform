// بروكسي Cloudflare Worker: يوجه الطلبات لمزودي الذكاء الاصطناعي
// يفك تشفير المفاتيح على الخادم ولا يكشفها للعميل أبداً

export interface Env {
  ENCRYPTION_KEY: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface ProxyRequest {
  messages: Array<{ role: string; content: string }>;
  model: string;
  platform: string;
  userId: string;
  role: string;
  encryptedKey?: string;
  isGlobal: boolean;
}

const PLATFORM_URLS: Record<string, string> = {
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  together: 'https://api.together.xyz/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // التحقق من طريقة الطلب
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (request.method !== 'POST') {
      return jsonError('Method not allowed', 405);
    }

    try {
      const body = await request.json() as ProxyRequest;
      const { messages, model, platform, userId, role: userRole, isGlobal } = body;

      if (!messages || !model || !platform || !userId) {
        return jsonError('Missing required fields', 400);
      }

      // الحصول على مفتاح API
      let apiKey: string;

      if (isGlobal) {
        // جلب المفتاح العام من Supabase
        const keyData = await fetchGlobalKey(env, platform);
        if (!keyData) {
          return jsonError('No global key available for this platform', 404);
        }
        apiKey = await decryptKey(keyData, env.ENCRYPTION_KEY);
      } else if (body.encryptedKey) {
        apiKey = await decryptKey(body.encryptedKey, env.ENCRYPTION_KEY);
      } else {
        return jsonError('No API key provided', 400);
      }

      // بناء الطلب حسب المنصة
      let providerUrl: string;
      let providerHeaders: Record<string, string>;
      let providerBody: string;

      if (platform === 'anthropic') {
        providerUrl = PLATFORM_URLS.anthropic!;
        providerHeaders = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        };

        let systemPrompt = '';
        const anthropicMsgs: Array<{ role: string; content: string }> = [];

        for (const msg of messages) {
          if (msg.role === 'system') {
            systemPrompt += (systemPrompt ? '\n' : '') + msg.content;
          } else {
            anthropicMsgs.push({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content,
            });
          }
        }

        if (anthropicMsgs.length > 0 && anthropicMsgs[0]?.role !== 'user') {
          anthropicMsgs.unshift({ role: 'user', content: 'Hello' });
        }

        const anthropicBody: Record<string, unknown> = {
          model,
          messages: anthropicMsgs,
          stream: true,
          max_tokens: 4096,
        };
        if (systemPrompt) anthropicBody.system = systemPrompt;
        providerBody = JSON.stringify(anthropicBody);
      } else if (platform === 'gemini') {
        let systemInstruction = '';
        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

        for (const msg of messages) {
          if (msg.role === 'system') {
            systemInstruction += (systemInstruction ? '\n' : '') + msg.content;
          } else {
            contents.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }],
            });
          }
        }

        if (contents.length > 0 && contents[0]?.role !== 'user') {
          contents.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
        }

        const geminiBody: Record<string, unknown> = {
          contents,
          generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
        };
        if (systemInstruction) {
          geminiBody.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        providerUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;
        providerHeaders = { 'Content-Type': 'application/json' };
        providerBody = JSON.stringify(geminiBody);
      } else {
        // OpenAI-compatible platforms
        providerUrl = PLATFORM_URLS[platform] ?? PLATFORM_URLS.openai!;
        providerHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        };

        if (platform === 'openrouter') {
          providerHeaders['HTTP-Referer'] = 'https://ai-chat-platform.pages.dev';
          providerHeaders['X-Title'] = 'AI Chat Platform';
        }

        providerBody = JSON.stringify({
          model,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
          max_tokens: 4096,
          temperature: 0.7,
        });
      }

      // إرسال الطلب للمزود
      const providerResponse = await fetch(providerUrl, {
        method: 'POST',
        headers: providerHeaders,
        body: providerBody,
      });

      if (!providerResponse.ok) {
        const status = providerResponse.status;
        const errorText = await providerResponse.text().catch(() => 'Unknown error');

        // إشعار عند أخطاء الرصيد
        if (status === 402 || status === 429) {
          await sendNotification(env, platform, status, errorText);
        }

        return jsonError(`Provider error: ${status}`, status);
      }

      // تمرير البث مباشرة
      return new Response(providerResponse.body, {
        status: 200,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Internal error';
      return jsonError(msg, 500);
    }
  },
};

/**
 * جلب المفتاح العام من Supabase
 */
async function fetchGlobalKey(env: Env, platform: string): Promise<string | null> {
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/api_keys?platform=eq.${platform}&is_global=eq.true&is_active=eq.true&select=encrypted_key&limit=1`;

  const res = await fetch(url, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) return null;

  const data = await res.json() as Array<{ encrypted_key: string }>;
  return data[0]?.encrypted_key ?? null;
}

/**
 * فك تشفير المفتاح
 */
async function decryptKey(encryptedText: string, secret: string): Promise<string> {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted format');

  const [saltB64, ivB64, cipherB64] = parts as [string, string, string];

  const salt = base64ToUint8(saltB64);
  const iv = base64ToUint8(ivB64);
  const cipherData = base64ToUint8(cipherB64);

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const cryptoKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    cryptoKey,
    cipherData
  );

  return new TextDecoder().decode(decrypted);
}

function base64ToUint8(b64: string): Uint8Array {
  const binStr = atob(b64);
  const arr = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) {
    arr[i] = binStr.charCodeAt(i);
  }
  return arr;
}

/**
 * إرسال إشعار لـ Supabase
 */
async function sendNotification(env: Env, platform: string, status: number, error: string): Promise<void> {
  try {
    const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        type: status === 402 ? 'api_depleted' : 'api_low_balance',
        title: status === 402 ? 'نفاد رصيد API' : 'رصيد API منخفض',
        message: `خطأ ${status} من ${platform}: ${error.substring(0, 200)}`,
        priority: 'urgent',
        metadata: { platform, status },
      }),
    });
  } catch {
    // تجاهل أخطاء الإشعارات
  }
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
    },
  });
}
