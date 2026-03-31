// بطاقات الإحصائيات - 6 بطاقات مع أرقام ونسب نمو
"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Users,
  Activity,
  Crown,
  MessageSquare,
  Coins,
  FolderOpen,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { getSupabaseBrowser } from "@/lib/supabase-client";
import { formatNumber, formatTokenCount } from "@/utils/formatters";
import { cn } from "@/utils/cn";

interface StatData {
  totalUsers: number;
  activeToday: number;
  premiumAccounts: number;
  totalConversations: number;
  messagesToday: number;
  tokensToday: number;
  userGrowth: number;
}

/**
 * بطاقات الإحصائيات الست
 */
export default function StatsCards() {
  const t = useTranslations("admin");
  const supabase = getSupabaseBrowser();
  const [stats, setStats] = useState<StatData>({
    totalUsers: 0,
    activeToday: 0,
    premiumAccounts: 0,
    totalConversations: 0,
    messagesToday: 0,
    tokensToday: 0,
    userGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const [totalRes, premRes, convsRes, todayStatsRes, lastWeekRes, prevWeekRes] =
          await Promise.all([
            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "premium"),
            supabase.from("conversations").select("*", { count: "exact", head: true }),
            supabase.from("usage_stats").select("messages_sent, tokens_used").eq("date", today),
            supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
            supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", twoWeeksAgo.toISOString()).lt("created_at", weekAgo.toISOString()),
          ]);

        const todayMsgs = (todayStatsRes.data ?? []).reduce((s, r) => s + (r.messages_sent ?? 0), 0);
        const todayTkns = (todayStatsRes.data ?? []).reduce((s, r) => s + (r.tokens_used ?? 0), 0);

        const thisWeek = lastWeekRes.count ?? 0;
        const prevWeek = prevWeekRes.count ?? 1;
        const growth = prevWeek > 0 ? Math.round(((thisWeek - prevWeek) / prevWeek) * 100) : 0;

        if (isMountedRef.current) {
          setStats({
            totalUsers: totalRes.count ?? 0,
            activeToday: todayStatsRes.data?.length ?? 0,
            premiumAccounts: premRes.count ?? 0,
            totalConversations: convsRes.count ?? 0,
            messagesToday: todayMsgs,
            tokensToday: todayTkns,
            userGrowth: growth,
          });
        }
      } catch {
        // صامت
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    fetchStats();
    return () => { isMountedRef.current = false; };
  }, [supabase]);

  const cards = [
    {
      label: t("total_users"),
      value: formatNumber(stats.totalUsers),
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
      growth: stats.userGrowth,
    },
    {
      label: t("active_today"),
      value: formatNumber(stats.activeToday),
      icon: <Activity className="h-5 w-5" />,
      color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: t("premium_accounts"),
      value: formatNumber(stats.premiumAccounts),
      icon: <Crown className="h-5 w-5" />,
      color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      label: t("total_conversations_stat"),
      value: formatNumber(stats.totalConversations),
      icon: <FolderOpen className="h-5 w-5" />,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      label: t("messages_today"),
      value: formatNumber(stats.messagesToday),
      icon: <MessageSquare className="h-5 w-5" />,
      color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400",
    },
    {
      label: t("tokens_today"),
      value: formatTokenCount(stats.tokensToday),
      icon: <Coins className="h-5 w-5" />,
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className={cn(
            "rounded-xl p-4",
            "bg-white dark:bg-dark-card",
            "border border-gray-200 dark:border-dark-border",
            isLoading && "animate-pulse"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={cn("p-2 rounded-lg", card.color)}>{card.icon}</div>
            {card.growth !== undefined && card.growth !== 0 && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-[10px] font-semibold",
                  card.growth > 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {card.growth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(card.growth)}%</span>
              </div>
            )}
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {isLoading ? "—" : card.value}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
