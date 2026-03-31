// الصفحة الرئيسية للوحة الإدارة - إحصائيات وأكثر الشخصيات استخداماً وآخر الإشعارات
"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import StatsCards from "@/components/admin/StatsCards";
import TopPersonasChart from "@/components/admin/TopPersonasChart";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getSupabaseBrowser } from "@/lib/supabase-client";
import { formatRelativeTime } from "@/utils/formatters";
import { cn } from "@/utils/cn";

import type { Profile } from "@/types/user";
import type { Notification } from "@/types/notification";

/**
 * لوحة الإدارة الرئيسية
 */
export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const supabase = getSupabaseBrowser();

  const [recentUsers, setRecentUsers] = useState<Profile[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchDashboardData = async () => {
      try {
        const [usersRes, notifRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        if (isMountedRef.current) {
          setRecentUsers((usersRes.data as Profile[]) ?? []);
          setRecentNotifications((notifRes.data as Notification[]) ?? []);
        }
      } catch {
        // صامت
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMountedRef.current = false; };
  }, [supabase]);

  const roleBadge = (role: string) => {
    const classes: Record<string, string> = {
      admin: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      premium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      free: "bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400",
    };
    return classes[role] ?? classes.free;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* بطاقات الإحصائيات */}
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* أكثر الشخصيات استخداماً */}
        <div
          className={cn(
            "rounded-xl border border-gray-200 dark:border-dark-border",
            "bg-white dark:bg-dark-card p-5"
          )}
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {t("top_personas")}
          </h3>
          <TopPersonasChart />
        </div>

        {/* آخر الإشعارات */}
        <div
          className={cn(
            "rounded-xl border border-gray-200 dark:border-dark-border",
            "bg-white dark:bg-dark-card p-5"
          )}
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            {t("recent_notifications")}
          </h3>
          <div className="space-y-3">
            {recentNotifications.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">لا توجد إشعارات</p>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg",
                    "border border-gray-100 dark:border-dark-border",
                    !notif.is_read && "bg-primary/5"
                  )}
                >
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                      notif.priority === "urgent"
                        ? "bg-red-500"
                        : notif.priority === "normal"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {formatRelativeTime(notif.created_at, "ar")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* آخر المستخدمين */}
      <div
        className={cn(
          "rounded-xl border border-gray-200 dark:border-dark-border",
          "bg-white dark:bg-dark-card p-5"
        )}
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {t("recent_users")}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border">
                <th className="text-start py-2 px-3 text-xs font-medium text-gray-500">{t("user_table_email")}</th>
                <th className="text-start py-2 px-3 text-xs font-medium text-gray-500">{t("user_table_role")}</th>
                <th className="text-start py-2 px-3 text-xs font-medium text-gray-500">{t("user_table_joined")}</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-dark-border last:border-0">
                  <td className="py-2.5 px-3 text-xs text-gray-700 dark:text-gray-300">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", roleBadge(u.role))}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-gray-500">{formatRelativeTime(u.created_at, "ar")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
