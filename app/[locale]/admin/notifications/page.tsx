// صفحة إدارة الإشعارات
"use client";

import { useTranslations } from "next-intl";
import NotificationsList from "@/components/admin/NotificationsList";

export default function AdminNotificationsPage() {
  const t = useTranslations("admin");
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("notifications")}</h2>
      <NotificationsList />
    </div>
  );
}
