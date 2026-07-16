"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeaderboardUser {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  total_points: number;
  rank: number;
  attendance_count: number;
  events_count: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"all" | "month" | "week">("all");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          total_points,
          attendance:attendance(count),
          registrations:registrations(count)
        `)
        .order("total_points", { ascending: false })
        .limit(50);

      if (error) throw error;

      const leaderboardData: LeaderboardUser[] = (data || []).map((user: any, index: number) => ({
        id: user.id,
        full_name: user.full_name || "Anonymous",
        email: user.email,
        avatar_url: user.avatar_url,
        total_points: user.total_points || 0,
        rank: index + 1,
        attendance_count: user.attendance?.[0]?.count || 0,
        events_count: user.registrations?.[0]?.count || 0,
      }));

      setUsers(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg">
          <span className="text-white text-lg">🏆</span>
        </div>
      );
    if (rank === 2)
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400">
          <span className="text-white text-lg">🥈</span>
        </div>
      );
    if (rank === 3)
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500">
          <span className="text-white text-lg">🥉</span>
        </div>
      );
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800">
        <span className="font-bold text-slate-600 dark:text-slate-300">{rank}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Top participants ranked by engagement points
        </p>
      </div>

      {/* Time Filter */}
      <div className="flex gap-2">
        {(["all", "month", "week"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeFilter === filter
                ? "gradient-primary text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {filter === "all" ? "All Time" : filter === "month" ? "This Month" : "This Week"}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-4 items-end">
          {/* 2nd Place */}
          <Card className="border-0 shadow-sm bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 order-1">
            <CardContent className="pt-6 pb-4 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-2xl shadow-lg overflow-hidden">
                {topThree[1]?.avatar_url ? (
                  <img
                    src={topThree[1].avatar_url}
                    alt={topThree[1].full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  topThree[1]?.full_name?.charAt(0) || "2"
                )}
              </div>
              <Badge className="mb-2 bg-slate-200 text-slate-700">2nd</Badge>
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {topThree[1]?.full_name || "—"}
              </h3>
              <p className="text-2xl font-bold text-slate-600 dark:text-slate-300 mt-2">
                {topThree[1]?.total_points?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">points</p>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="border-0 shadow-lg bg-gradient-to-b from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/20 order-2 transform scale-105">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-3xl">👑</span>
              </div>
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-3xl shadow-xl ring-4 ring-yellow-200 dark:ring-yellow-800 overflow-hidden">
                {topThree[0]?.avatar_url ? (
                  <img
                    src={topThree[0].avatar_url}
                    alt={topThree[0].full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  topThree[0]?.full_name?.charAt(0) || "1"
                )}
              </div>
              <Badge className="mb-2 bg-yellow-200 text-yellow-800">1st</Badge>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                {topThree[0]?.full_name || "—"}
              </h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent mt-2">
                {topThree[0]?.total_points?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">points</p>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="border-0 shadow-sm bg-gradient-to-b from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/10 order-3">
            <CardContent className="pt-6 pb-4 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-2xl shadow-lg overflow-hidden">
                {topThree[2]?.avatar_url ? (
                  <img
                    src={topThree[2].avatar_url}
                    alt={topThree[2].full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  topThree[2]?.full_name?.charAt(0) || "3"
                )}
              </div>
              <Badge className="mb-2 bg-orange-200 text-orange-700">3rd</Badge>
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {topThree[2]?.full_name || "—"}
              </h3>
              <p className="text-2xl font-bold text-slate-600 dark:text-slate-300 mt-2">
                {topThree[2]?.total_points?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">points</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
          <CardDescription>
            {users.length} active participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No rankings yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Users will appear here once they earn points
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {rest.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {getRankBadge(user.rank)}
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-semibold overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.full_name?.charAt(0) || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {user.full_name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {user.events_count} events • {user.attendance_count} check-ins
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {user.total_points.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
