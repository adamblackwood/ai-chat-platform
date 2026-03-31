// صفحة إدارة مفاتيح API العامة
"use client";

import { useTranslations } from "next-intl";

import ApiKeysTable from "@/components/admin/ApiKeysTable";

export default function AdminApiKeysPage() {
  const t = useTranslations("admin");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
        {t("api_keys")}
      </h2>
      <ApiKeysTable />
    </div>
  );
}
