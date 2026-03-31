// تخطيط لوحة الإدارة - شريط جانبي بـ 9 روابط مع شريط علوي
"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Key,
  Cpu,
  Theater,
  Share2,
  Ticket,
  Bell,
  Settings,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";

import { getSupabaseBrowser } from "@/lib/supabase-client";
import { cn } from "@/utils/cn";

interface AdminLayoutProps {
  children: ReactNode;
  locale: string;
}

interface NavItem {
  key: string;
  labelKey: string;
  icon: ReactNode;
  href: string;
}

/**
 * تخطيط لوحة الإدارة مع شريط جانبي وشريط علوي
 */
export default function AdminLayout({ children, locale }: AdminLayoutProps) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const isRTL = locale === "ar";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isMountedRef = useRef(true);

  const navItems: NavItem[] = [
    { key: "dashboard", labelKey: "dashboard", icon: <LayoutDashboard className="h-4 w-4" />, href: `/${locale}/admin` },
    { key: "users", labelKey: "users", icon: <Users className="h-4 w-4" />, href: `/${locale}/admin/users` },
    { key: "api-keys", labelKey: "api_keys", icon: <Key className="h-4 w-4" />, href: `/${locale}/admin/api-keys` },
    { key: "models", labelKey: "models", icon: <Cpu className="h-4 w-4" />, href: `/${locale}/admin/models` },
    { key: "personas", labelKey: "personas", icon: <Theater className="h-4 w-4" />, href: `/${locale}/admin/personas` },
    { key: "shared-personas", labelKey: "shared_personas", icon: <Share2 className="h-4 w-4" />, href: `/${locale}/admin/shared-personas` },
    { key: "invite-codes", labelKey: "invite_codes", icon: <Ticket className="h-4 w-4" />, href: `/${locale}/admin/invite-codes` },
    { key: "notifications", labelKey: "notifications", icon: <Bell className="h-4 w-4" />, href: `/${locale}/admin/notifications` },
    { key: "settings", labelKey: "system_settings", icon: <Settings className="h-4 w-4" />, href: `/${locale}/admin/settings` },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) {
      return pathname === `/${locale}/admin`;
    }
    return pathname.startsWith(href);
  };

  const currentPage = navItems.find((item) => isActive(item.href));
  const pageTitle = currentPage ? t(currentPage.labelKey as Parameters<typeof t>[0]) : t("dashboard");

  // جلب عدد الإشعارات غير المقروءة
  useEffect(() => {
    isMountedRef.current = true;

    const fetchUnread = async () => {
      try {
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("is_read", false);

        if (isMountedRef.current) {
          setUnreadCount(count ?? 0);
        }
      } catch {
        // صامت
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [supabase]);

  return (
    <div className="flex h-screen overflow-hidden bg-light-bg dark:bg-dark-bg">
      {/* خلفية الموبايل */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* الشريط الجانبي */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 z-50 w-64 flex flex-col",
          "bg-white dark:bg-dark-sidebar",
          "border-gray-200 dark:border-dark-border",
          "transition-transform duration-300",
          isRTL ? "right-0 border-l" : "left-0 border-r",
          sidebarOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full",
          "lg:relative lg:translate-x-0"
        )}
      >
        {/* رأس الشريط */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-dark-border">
          <button
            onClick={() => router.push(`/${locale}/chat`)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <ArrowRight className="h-4 w-4 rtl-flip" />
            <span>العودة للمحادثة</span>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* التنقل */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                router.push(item.href);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                "transition-colors duration-150",
                isActive(item.href)
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover"
              )}
            >
              <span className={cn(isActive(item.href) ? "text-primary" : "text-gray-400")}>
                {item.icon}
              </span>
              <span className="flex-1 text-start">
                {t(item.labelKey as Parameters<typeof t>[0])}
              </span>
              {item.key === "notifications" && unreadCount > 0 && (
                <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* الشريط العلوي */}
        <header
          className={cn(
            "flex items-center justify-between",
            "px-4 lg:px-6 py-3",
            "border-b border-gray-200 dark:border-dark-border",
            "bg-white dark:bg-dark-card"
          )}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {pageTitle}
            </h1>
          </div>

          {/* جرس الإشعارات */}
          <button
            onClick={() => router.push(`/${locale}/admin/notifications`)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* محتوى الصفحة */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
