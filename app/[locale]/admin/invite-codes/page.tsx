// صفحة إدارة رموز الدعوة
"use client";

import { useTranslations } from "next-intl";
import InviteCodesTable from "@/components/admin/InviteCodesTable";

export default function AdminInviteCodesPage() {
  const t = useTranslations("admin");
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("invite_codes")}</h2>
      <InviteCodesTable />
    </div>
  );
}
