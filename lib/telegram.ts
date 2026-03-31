// مكتبة تيليجرام - إرسال رسائل عبر Telegram Bot API مع تنسيق HTML
/**
 * خصائص رسالة تيليجرام
 */
interface TelegramMessageParams {
  botToken: string;
  chatId: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
}

/**
 * أيقونات الأولوية
 */
const PRIORITY_EMOJI: Record<string, string> = {
  urgent: "🔴",
  normal: "🟡",
  info: "🔵",
};

/**
 * أيقونات نوع الإشعار
 */
const TYPE_EMOJI: Record<string, string> = {
  user_registered: "👤",
  trial_requested: "🎁",
  trial_expired: "⏰",
  premium_expired: "👑",
  persona_shared: "🎭",
  api_low_balance: "⚠️",
  api_depleted: "🚫",
  system_error: "❌",
  invite_code_used: "🎟️",
};

/**
 * إرسال رسالة عبر Telegram Bot API
 * يستخدم parse_mode: HTML لدعم التنسيق
 * الأخطاء لا توقف العملية الرئيسية
 */
export async function sendTelegramMessage(params: TelegramMessageParams): Promise<boolean> {
  const { botToken, chatId, type, title, message, priority = "normal" } = params;

  if (!botToken || !chatId) {
    return false;
  }

  const priorityEmoji = PRIORITY_EMOJI[priority] ?? PRIORITY_EMOJI.info;
  const typeEmoji = TYPE_EMOJI[type] ?? "📌";

  const now = new Date();
  const timeStr = now.toLocaleString("ar-SA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "AI Chat Platform";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  // تنسيق الرسالة بـ HTML
  const formattedMessage = [
    `${priorityEmoji} <b>${escapeHtml(title)}</b>`,
    "",
    `${typeEmoji} <b>النوع:</b> <code>${escapeHtml(type)}</code>`,
    `🕐 <b>الوقت:</b> ${escapeHtml(timeStr)}`,
    "",
    `📝 ${escapeHtml(message)}`,
    "",
    `━━━━━━━━━━━━━━━`,
    `🤖 <i>${escapeHtml(appName)}</i>`,
    appUrl ? `🔗 <a href="${escapeHtml(appUrl)}/admin">${escapeHtml(appUrl)}</a>` : "",
  ].filter(Boolean).join("\n");

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedMessage,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (process.env.NODE_ENV === "development") {
        console.error("Telegram API error:", errorData);
      }
      return false;
    }

    return true;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Telegram send error:", error);
    }
    return false;
  }
}

/**
 * تنظيف نص HTML لمنع الحقن
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * إرسال إشعار باستخدام متغيرات البيئة
 * اختصار للاستخدام الداخلي
 */
export async function sendNotification(
  type: string,
  title: string,
  message: string,
  priority: string = "normal"
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return false;
  }

  return sendTelegramMessage({
    botToken,
    chatId,
    type,
    title,
    message,
    priority,
  });
}
