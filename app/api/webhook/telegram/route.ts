// مسار Webhook تيليجرام - إنشاء إشعار وإرسال عبر تيليجرام
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendTelegramMessage } from "@/lib/telegram";

/**
 * POST - إنشاء إشعار وإرساله عبر تيليجرام
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const {
      type, title, message, priority, userId,
      botToken: customBotToken, chatId: customChatId,
    } = body as {
      type: string;
      title: string;
      message: string;
      priority?: string;
      userId?: string;
      botToken?: string;
      chatId?: string;
    };

    if (!type || !title || !message) {
      return NextResponse.json({ error: "Missing required fields: type, title, message" }, { status: 400 });
    }

    const adminClient = createSupabaseAdminClient();

    // إنشاء الإشعار في قاعدة البيانات
    const { error: dbError } = await adminClient.from("notifications").insert({
      type,
      title,
      message,
      priority: priority ?? "normal",
      related_user_id: userId ?? null,
      is_read: false,
      metadata: { source: "webhook", timestamp: new Date().toISOString() },
    });

    if (dbError) {
      // لا نوقف العملية بسبب خطأ قاعدة البيانات
    }

    // إرسال عبر تيليجرام
    const telegramBotToken = customBotToken ?? process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = customChatId ?? process.env.TELEGRAM_CHAT_ID;

    if (telegramBotToken && telegramChatId) {
      try {
        await sendTelegramMessage({
          botToken: telegramBotToken,
          chatId: telegramChatId,
          type,
          title,
          message,
          priority: priority ?? "normal",
        });
      } catch {
        // فشل تيليجرام لا يمنع نجاح العملية
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
