// قائمة الإشعارات - عرض وتصفية وقراءة وحذف
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { CheckCheck, Trash2, Loader2, Filter } from "lucide-react";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { getSupabaseBrowser } from "@/lib/supabase-client";
import { NOTIFICATION_TYPES } from "@/utils/constants";
import { formatRelativeTime } from "@/utils/formatters";
import { cn } from "@/utils/cn";

import type { Notification, NotificationType, NotificationPriority } from "@/types/notification";

export default function NotificationsList() {
  const t = useTranslations("admin");
  const tNotif = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const supabase = getSupabaseBrowser();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "read" | "unread">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(100);
      if (typeFilter !== "all") query = query.eq("type", typeFilter);
      if (priorityFilter !== "all") query = query.eq("priority", priorityFilter);
      if (statusFilter === "read") query = query.eq("is_read", true);
      if (statusFilter === "unread") query = query.eq("is_read", false);

      const { data } = await query;
      if (isMountedRef.current) setNotifications((data as Notification[]) ?? []);
    } catch { /* silent */ }
    finally { if (isMountedRef.current) setIsLoading(false); }
  }, [supabase, typeFilter, priorityFilter, statusFilter]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchNotifications();
    return () => { isMountedRef.current = false; };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* silent */ }
  }, [supabase]);

  const markAllRead = useCallback(async () => {
    setActionLoading("all");
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { /* silent */ }
    finally { setActionLoading(null); }
  }, [supabase]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await supabase.from("notifications").delete().eq("id", id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { /* silent */ }
  }, [supabase]);

  const deleteOld = useCallback(async () => {
    setActionLoading("deleteOld");
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      await supabase.from("notifications").delete().lt("created_at", weekAgo.toISOString()).eq("is_read", true);
      await fetchNotifications();
    } catch { /* silent */ }
    finally { setActionLoading(null); }
  }, [supabase, fetchNotifications]);

  const priorityColor = (p: string) => {
    const m: Record<string, string> = { urgent: "bg-red-500", normal: "bg-yellow-500", info: "bg-blue-500" };
    return m[p] ?? m.info;
  };

  const typeIcon = (type: string) => {
    return NOTIFICATION_TYPES.find((n) => n.value === type)?.icon ?? "📌";
  };

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      {/* أدوات التصفية */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as NotificationType | "all")}
          className="px-3 py-2 rounded-lg border text-xs bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border">
          <option value="all">{t("filter_by_type")}</option>
          {NOTIFICATION_TYPES.map((nt) => <option key={nt.value} value={nt.value}>{nt.icon} {nt.labelAr}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as NotificationPriority | "all")}
          className="px-3 py-2 rounded-lg border text-xs bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border">
          <option value="all">{t("filter_by_priority")}</option>
          <option value="urgent">🔴 عاجل</option>
          <option value="normal">🟡 عادي</option>
          <option value="info">🔵 معلومة</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "read" | "unread")}
          className="px-3 py-2 rounded-lg border text-xs bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border">
          <option value="all">{t("filter_by_status")}</option>
          <option value="unread">غير مقروء</option>
          <option value="read">مقروء</option>
        </select>
        <div className="flex-1" />
        <button onClick={markAllRead} disabled={actionLoading === "all"}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover disabled:opacity-50">
          {actionLoading === "all" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />} {t("mark_all_read")}
        </button>
        <button onClick={deleteOld} disabled={actionLoading === "deleteOld"}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-50">
          {actionLoading === "deleteOld" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} {t("delete_old")}
        </button>
      </div>

      {/* القائمة */}
      {notifications.length === 0 ? (
        <EmptyState title={tCommon("no_results")} />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
                "bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border",
                "hover:bg-gray-50 dark:hover:bg-dark-hover",
                !n.is_read && "border-s-4 border-s-primary bg-primary/5 dark:bg-primary/5"
              )}>
              <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0", priorityColor(n.priority))} />
              <span className="text-lg flex-shrink-0">{typeIcon(n.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn("text-sm font-medium", !n.is_read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400")}>{n.title}</h4>
                  {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(n.created_at, "ar")}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-400 hover:text-red-600 transition-colors flex-shrink-0" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
