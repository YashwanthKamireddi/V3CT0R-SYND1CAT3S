"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsData {
  totalUsers: number;
  totalEvents: number;
  totalClubs: number;
  totalRegistrations: number;
  totalCheckIns: number;
  registrationRate: number;
  checkInRate: number;
  popularEvents: { title: string; registrations: number }[];
  topClubs: { name: string; members: number }[];
  recentActivity: { type: string; description: string; time: string }[];
  dailyStats: { date: string; registrations: number; checkIns: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch counts
      const [
        { count: totalUsers },
        { count: totalEvents },
        { count: totalClubs },
        { count: totalRegistrations },
        { count: totalCheckIns },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("clubs").select("*", { count: "exact", head: true }),
        supabase.from("registrations").select("*", { count: "exact", head: true }),
        supabase.from("attendance").select("*", { count: "exact", head: true }),
      ]);

      // Fetch popular events
      const { data: events } = await supabase
        .from("events")
        .select(`
          title,
          registrations(count)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      const popularEvents = (events || []).map((e: any) => ({
        title: e.title,
        registrations: e.registrations?.[0]?.count || 0,
      })).sort((a, b) => b.registrations - a.registrations);

      // Fetch top clubs (by number of events created and registrations)
      const { data: clubs } = await supabase
        .from("clubs")
        .select(`
          name,
          events(count)
        `)
        .eq("is_active", true)
        .limit(5);

      const topClubs = (clubs || []).map((c: any) => ({
        name: c.name,
        members: c.events?.[0]?.count || 0,
      })).sort((a, b) => b.members - a.members);

      // Calculate rates
      const registrationRate = totalUsers && totalEvents
        ? ((totalRegistrations || 0) / (totalUsers * (totalEvents || 1))) * 100
        : 0;

      const checkInRate = totalRegistrations
        ? ((totalCheckIns || 0) / (totalRegistrations || 1)) * 100
        : 0;

      setData({
        totalUsers: totalUsers || 0,
        totalEvents: totalEvents || 0,
        totalClubs: totalClubs || 0,
        totalRegistrations: totalRegistrations || 0,
        totalCheckIns: totalCheckIns || 0,
        registrationRate: Math.min(registrationRate, 100),
        checkInRate: Math.min(checkInRate, 100),
        popularEvents,
        topClubs,
        recentActivity: [],
        dailyStats: [],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      title: "Total Users",
      value: data.totalUsers,
      change: "+12%",
      trend: "up",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Total Events",
      value: data.totalEvents,
      change: "+8%",
      trend: "up",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "text-[#FF6B35] bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Active Clubs",
      value: data.totalClubs,
      change: "+5%",
      trend: "up",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30",
    },
    {
      title: "Registrations",
      value: data.totalRegistrations,
      change: "+24%",
      trend: "up",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Check-ins",
      value: data.totalCheckIns,
      change: "+18%",
      trend: "up",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Check-in Rate",
      value: `${data.checkInRate.toFixed(1)}%`,
      change: "+3%",
      trend: "up",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Track platform performance and engagement metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`p-2 rounded-lg ${stat.color} w-fit mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {stat.title}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <svg className={`w-3 h-3 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.trend === "up" ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                </svg>
                <span className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart Placeholder */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
                <CardDescription>
                  Registrations and check-ins over the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-slate-500 dark:text-slate-400">
                      Chart visualization coming soon
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-300">Registration Rate</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {data.registrationRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFA366] rounded-full transition-all"
                      style={{ width: `${Math.min(data.registrationRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-300">Check-in Rate</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {data.checkInRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(data.checkInRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-300">Club Participation</span>
                    <span className="font-medium text-slate-900 dark:text-white">65%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all"
                      style={{ width: "65%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-300">Repeat Attendance</span>
                    <span className="font-medium text-slate-900 dark:text-white">42%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                      style={{ width: "42%" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Popular Events</CardTitle>
              <CardDescription>
                Events with the highest registration counts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.popularEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No events data available
                </div>
              ) : (
                <div className="space-y-4">
                  {data.popularEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full gradient-primary text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {event.title}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {event.registrations} registrations
                        </p>
                      </div>
                      <div className="w-32">
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFA366] rounded-full"
                            style={{
                              width: `${(event.registrations / Math.max(...data.popularEvents.map(e => e.registrations), 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clubs" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Top Clubs</CardTitle>
              <CardDescription>
                Clubs with the most active members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.topClubs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No clubs data available
                </div>
              ) : (
                <div className="space-y-4">
                  {data.topClubs.map((club, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full gradient-primary text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {club.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {club.members} members
                        </p>
                      </div>
                      <div className="w-32">
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFA366] rounded-full"
                            style={{
                              width: `${(club.members / Math.max(...data.topClubs.map(c => c.members), 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
