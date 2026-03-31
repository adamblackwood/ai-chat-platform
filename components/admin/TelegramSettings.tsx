// إعدادات تيليجرام - رمز البوت ومعرف الدردشة واختبار والمفاتيح
"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Send, CheckCircle, XCircle, Loader2, Save,
  Eye, EyeOff, Bell,
} from "lucide-react";

import { NOTIFICATION_TYPES } from "@/utils/constants";
import { cn } from "@/utils/cn";

export default function TelegramSettings() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "failed" | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NOTIFICATION_TYPES.forEach((nt) => { initial[nt.value] = true; });
    return initial;
  });

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const testConnection = useCallback(async () => {
    if (!botToken.trim() || !chatId.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/webhook/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "system_error",
          title: "اختبار الاتصال",
          message: "هذه رسالة اختبار من لوحة الإدارة ✅",
          priority: "info",
          botToken: botToken.trim(),
          chatId: chatId.trim(),
        }),
      });
      setTestResult(res.ok ? "success" : "failed");
    } catch {
      setTestResult("failed");
    } finally {
      setIsTesting(false);
    }
  }, [botToken, chatId]);

  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      // في بيئة الإنتاج يتم حفظ الإعدادات في قاعدة البيانات أو متغيرات البيئة
      await new Promise((r) => setTimeout(r, 500));
    } catch { /* silent */ }
    finally { setIsSaving(false); }
  }, []);

  return (
    <div className="space-y-8 max-w-2xl">
      {/* إعدادات تيليجرام */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" /> Telegram Bot
        </h3>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-500">{t("telegram_token")}</label>
            <div className="relative">
              <input type={showToken ? "text" : "password"} value={botToken} onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456:ABC-DEF..." dir="ltr"
                className="w-full ps-3 pe-9 py-2.5 rounded-lg border text-sm font-mono bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border focus:ring-2 focus:ring-primary/50 focus:outline-none" />
              <button onClick={() => setShowToken(!showToken)} className="absolute end-2.5 top-1/2 -translate-y-1/2 text-gray-400" aria-label="Toggle visibility">
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500">{t("telegram_chat_id")}</label>
            <input type="text" value={chatId} onChange={(e) => setChatId(e.target.value)}
              placeholder="-1001234567890" dir="ltr"
              className="w-full px-3 py-2.5 rounded-lg border text-sm font-mono bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border focus:ring-2 focus:ring-primary/50 focus:outline-none" />
          </div>

          <button onClick={testConnection} disabled={isTesting || !botToken.trim() || !chatId.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover disabled:opacity-50 transition-colors">
            {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("test_connection")}
          </button>

          {testResult === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-fade-in">
              <CheckCircle className="h-4 w-4" /> {t("test_success")}
            </div>
          )}
          {testResult === "failed" && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 animate-fade-in">
              <XCircle className="h-4 w-4" /> {t("test_failed")}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-dark-border" />

      {/* مفاتيح تشغيل الإشعارات */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> {t("notification_toggles")}
        </h3>

        <div className="space-y-2">
          {NOTIFICATION_TYPES.map((nt) => (
            <div key={nt.value} className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-3">
                <span className="text-base">{nt.icon}</span>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{nt.labelAr}</p>
                  <p className="text-[10px] text-gray-400">{nt.value}</p>
                </div>
              </div>
              <button onClick={() => handleToggle(nt.value)} className="transition-colors">
                {toggles[nt.value] ? (
                  <div className="h-6 w-11 rounded-full bg-primary relative transition-colors">
                    <div className="absolute top-0.5 end-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </div>
                ) : (
                  <div className="h-6 w-11 rounded-full bg-gray-300 dark:bg-dark-border relative transition-colors">
                    <div className="absolute top-0.5 start-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-dark-border" />

      {/* حفظ */}
      <button onClick={saveSettings} disabled={isSaving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-medium disabled:opacity-50 transition-colors">
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t("save_settings")}
      </button>
    </div>
  );
}
