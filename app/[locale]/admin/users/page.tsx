// صفحة إدارة المستخدمين - جدول المستخدمين مع البحث والتصفية
"use client";

import { useTranslations } from "next-intl";

import UsersTable from "@/components/admin/UsersTable";

export default function AdminUsersPage() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
        {t("users")}
      </h2>
      <UsersTable />
    </div>
  );
}
