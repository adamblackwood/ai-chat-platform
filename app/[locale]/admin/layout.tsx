// تخطيط لوحة الإدارة - حماية الوصول وتغليف بمكون AdminLayout
"use client";

import type { ReactNode } from "react";

import RouteGuard from "@/components/auth/RouteGuard";
import AdminLayout from "@/components/admin/AdminLayout";

interface AdminRootLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

/**
 * تخطيط لوحة الإدارة
 * يتحقق من صلاحية المدير ويعرض التخطيط الإداري
 */
export default function AdminRootLayout({
  children,
  params: { locale },
}: AdminRootLayoutProps) {
  return (
    <RouteGuard requireAdmin>
      <AdminLayout locale={locale}>{children}</AdminLayout>
    </RouteGuard>
  );
}
