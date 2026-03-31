// جدول المستخدمين - بحث وتصفية وفرز مع إجراءات الإدارة
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Crown,
  ShieldCheck,
  Ban,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreHorizontal,
  UserCog,
  ArrowUpCircle,
  ArrowDownCircle,
  ShieldOff,
} from "lucide-react";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getSupabaseBrowser } from "@/lib/supabase-client";
import { useAuthStore } from "@/stores/authStore";
import { formatRelativeTime, formatNumber } from "@/utils/formatters";
import { getInitials } from "@/utils/helpers";
import { cn } from "@/utils/cn";

import type { Profile, Role } from "@/types/user";

type SortField = "created_at" | "email" | "role";
type SortDir = "asc" | "desc";

/**
 * جدول إدارة المستخدمين
 */
export default function UsersTable() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const supabase = getSupabaseBrowser();
  const currentUser = useAuthStore((s) => s.user);
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);

  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [premiumDays, setPremiumDays] = useState(30);
  const [showDurationPicker, setShowDurationPicker] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const perPage = 20;

  /**
   * جلب المستخدمين
   */
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order(sortField, { ascending: sortDir === "asc" })
        .range(page * perPage, (page + 1) * perPage - 1);

      if (searchQuery.trim()) {
        query = query.or(`email.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
      }
      if (roleFilter !== "all") query = query.eq("role", roleFilter);
      if (statusFilter === "banned") query = query.eq("is_banned", true);
      if (statusFilter === "active") query = query.eq("is_banned", false);

      const { data, count, error } = await query;
      if (error) throw error;

      if (isMountedRef.current) {
        setUsers((data as Profile[]) ?? []);
        setTotal(count ?? 0);
      }
    } catch {
      // صامت
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [supabase, searchQuery, roleFilter, statusFilter, sortField, sortDir, page]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchUsers();
    return () => { isMountedRef.current = false; };
  }, [fetchUsers]);

  /**
   * تغيير الدور
   */
  const changeRole = useCallback(async (userId: string, newRole: Role, days?: number) => {
    setActionLoading(userId);
    try {
      const updateData: Record<string, unknown> = {
        role: newRole,
        updated_at: new Date().toISOString(),
      };

      if (newRole === "premium" && days) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);
        updateData.premium_expires_at = expiry.toISOString();
      } else if (newRole === "free") {
        updateData.premium_expires_at = null;
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", userId);
      if (error) throw error;

      await fetchUsers();
    } catch {
      // صامت
    } finally {
      setActionLoading(null);
      setActionMenu(null);
      setShowDurationPicker(null);
    }
  }, [supabase, fetchUsers]);

  /**
   * حظر / إلغاء حظر
   */
  const toggleBan = useCallback(async (userId: string, ban: boolean) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: ban, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;
      await fetchUsers();
    } catch {
      // صامت
    } finally {
      setActionLoading(null);
      setActionMenu(null);
    }
  }, [supabase, fetchUsers]);

  /**
   * حذف مستخدم
   */
  const deleteUser = useCallback(async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) throw error;
      await fetchUsers();
    } catch {
      // صامت
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  }, [supabase, fetchUsers]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  };

  const SortIcon = sortDir === "asc" ? ChevronUp : ChevronDown;
  const totalPages = Math.ceil(total / perPage);

  const roleBadge = (role: string) => {
    const m: Record<string, string> = {
      admin: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      premium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
      free: "bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400",
    };
    return m[role] ?? m.free;
  };

  return (
    <div className="space-y-4">
      {/* أدوات التصفية */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            placeholder={`${tCommon("search")}...`}
            className={cn(
              "w-full ps-9 pe-3 py-2 rounded-lg border text-sm",
              "bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as Role | "all"); setPage(0); }}
          className="px-3 py-2 rounded-lg border text-sm bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border"
        >
          <option value="all">{tCommon("all")} ({t("user_table_role")})</option>
          <option value="admin">Admin</option>
          <option value="premium">Premium</option>
          <option value="free">Free</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as "all" | "active" | "banned"); setPage(0); }}
          className="px-3 py-2 rounded-lg border text-sm bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border"
        >
          <option value="all">{tCommon("all")} ({t("user_table_status")})</option>
          <option value="active">{tCommon("active")}</option>
          <option value="banned">{tCommon("banned")}</option>
        </select>
      </div>

      {/* الجدول */}
      <div className="rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">{tCommon("no_results")}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface">
                  <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{t("user_table_name")}</th>
                  <th
                    className="text-start py-3 px-4 text-xs font-medium text-gray-500 cursor-pointer select-none"
                    onClick={() => toggleSort("email")}
                  >
                    <span className="flex items-center gap-1">
                      {t("user_table_email")}
                      {sortField === "email" && <SortIcon className="h-3 w-3" />}
                    </span>
                  </th>
                  <th
                    className="text-start py-3 px-4 text-xs font-medium text-gray-500 cursor-pointer select-none"
                    onClick={() => toggleSort("role")}
                  >
                    <span className="flex items-center gap-1">
                      {t("user_table_role")}
                      {sortField === "role" && <SortIcon className="h-3 w-3" />}
                    </span>
                  </th>
                  <th
                    className="text-start py-3 px-4 text-xs font-medium text-gray-500 cursor-pointer select-none"
                    onClick={() => toggleSort("created_at")}
                  >
                    <span className="flex items-center gap-1">
                      {t("user_table_joined")}
                      {sortField === "created_at" && <SortIcon className="h-3 w-3" />}
                    </span>
                  </th>
                  <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{t("user_table_status")}</th>
                  <th className="text-start py-3 px-4 text-xs font-medium text-gray-500">{t("user_table_actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSuper = u.is_super_admin;
                  const isSelf = u.id === currentUser?.id;

                  return (
                    <tr key={u.id} className="border-b border-gray-100 dark:border-dark-border last:border-0 hover:bg-gray-50 dark:hover:bg-dark-hover/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {getInitials(u.display_name ?? u.email)}
                          </div>
                          <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                            {u.display_name ?? u.email.split("@")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600 dark:text-gray-400" dir="ltr">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", roleBadge(u.role))}>
                          {u.role}{isSuper ? " ⭐" : ""}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">{formatRelativeTime(u.created_at, "ar")}</td>
                      <td className="py-3 px-4">
                        {u.is_banned ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium">{tCommon("banned")}</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium">{tCommon("active")}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isSuper && !isSuperAdmin ? (
                          <span className="text-[10px] text-gray-400">—</span>
                        ) : isSelf ? (
                          <span className="text-[10px] text-gray-400">—</span>
                        ) : (
                          <div className="relative">
                            <button
                              onClick={() => setActionMenu(actionMenu === u.id ? null : u.id)}
                              disabled={actionLoading === u.id}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                              aria-label="User actions"
                            >
                              {actionLoading === u.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              )}
                            </button>

                            {actionMenu === u.id && (
                              <div className={cn(
                                "absolute top-full mt-1 z-20 end-0",
                                "w-52 py-1 rounded-xl shadow-xl",
                                "bg-white dark:bg-dark-card",
                                "border border-gray-200 dark:border-dark-border",
                                "animate-fade-in"
                              )}>
                                {/* ترقية/تخفيض مميز */}
                                {u.role !== "premium" && u.role !== "admin" && (
                                  <button
                                    onClick={() => setShowDurationPicker(u.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover"
                                  >
                                    <Crown className="h-3.5 w-3.5 text-yellow-500" />
                                    {t("upgrade_premium")}
                                  </button>
                                )}
                                {u.role === "premium" && (
                                  <button
                                    onClick={() => changeRole(u.id, "free")}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover"
                                  >
                                    <ArrowDownCircle className="h-3.5 w-3.5" />
                                    {t("downgrade_free")}
                                  </button>
                                )}
                                {/* ترقية/تخفيض مدير */}
                                {isSuperAdmin && u.role !== "admin" && (
                                  <button
                                    onClick={() => changeRole(u.id, "admin")}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5 text-red-500" />
                                    {t("upgrade_admin")}
                                  </button>
                                )}
                                {isSuperAdmin && u.role === "admin" && !u.is_super_admin && (
                                  <button
                                    onClick={() => changeRole(u.id, "free")}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover"
                                  >
                                    <ShieldOff className="h-3.5 w-3.5" />
                                    {t("downgrade_admin")}
                                  </button>
                                )}
                                <div className="my-1 border-t border-gray-100 dark:border-dark-border" />
                                {/* حظر */}
                                {!u.is_banned ? (
                                  <button
                                    onClick={() => toggleBan(u.id, true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10"
                                  >
                                    <Ban className="h-3.5 w-3.5" />
                                    {t("ban_user")}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => toggleBan(u.id, false)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10"
                                  >
                                    <UserCog className="h-3.5 w-3.5" />
                                    {t("unban_user")}
                                  </button>
                                )}
                                {/* حذف */}
                                {!u.is_super_admin && (
                                  <button
                                    onClick={() => { setActionMenu(null); setDeleteTarget(u); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {t("delete_user")}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* اختيار مدة الاشتراك */}
                            {showDurationPicker === u.id && (
                              <div className={cn(
                                "absolute top-full mt-1 z-30 end-0",
                                "w-48 p-3 rounded-xl shadow-xl",
                                "bg-white dark:bg-dark-card",
                                "border border-gray-200 dark:border-dark-border",
                                "animate-fade-in space-y-3"
                              )}>
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t("set_duration")}</p>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={premiumDays}
                                    onChange={(e) => setPremiumDays(Math.max(1, parseInt(e.target.value) || 1))}
                                    min={1}
                                    className="flex-1 px-2 py-1.5 rounded border text-xs bg-white dark:bg-dark-input border-gray-300 dark:border-dark-border"
                                  />
                                  <span className="text-xs text-gray-500">{t("duration_days")}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => changeRole(u.id, "premium", premiumDays)}
                                    className="flex-1 px-2 py-1.5 rounded-lg bg-primary text-white text-xs font-medium"
                                  >
                                    {tCommon("confirm")}
                                  </button>
                                  <button
                                    onClick={() => changeRole(u.id, "premium")}
                                    className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-dark-border text-xs"
                                  >
                                    {t("duration_permanent")}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* الترقيم */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-dark-border">
            <p className="text-xs text-gray-500">{total} {t("users")}</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={cn(
                    "h-7 w-7 rounded-lg text-xs font-medium transition-colors",
                    page === i
                      ? "bg-primary text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* حوار تأكيد الحذف */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteUser(deleteTarget.id); }}
        title={t("delete_user")}
        description={t("delete_user_confirm")}
        variant="danger"
        requireConfirmText="حذف"
      />
    </div>
  );
}
