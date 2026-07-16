"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalClubs: number;
  activeClubs: number;
  totalUsers: number;
  totalRegistrations: number;
  checkInsToday: number;
}

interface RecentEvent {
  id: string;
  title: string;
  date: string;
  registrations: number;
  status: string;
}

interface TopClub {
  id: string;
  name: string;
  members: number;
  events: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    totalClubs: 0,
    activeClubs: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    checkInsToday: 0,
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [topClubs, setTopClubs] = useState<TopClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total events
      const { count: totalEvents } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true });

      // Fetch upcoming events
      const { count: upcomingEvents } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .gte("date", new Date().toISOString());

      // Fetch total clubs
      const { count: totalClubs } = await supabase
        .from("clubs")
        .select("*", { count: "exact", head: true });

      // Fetch active clubs
      const { count: activeClubs } = await supabase
        .from("clubs")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch total registrations
      const { count: totalRegistrations } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true });

      // Fetch check-ins today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: checkInsToday } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .gte("check_in_time", today.toISOString());

      setStats({
        totalEvents: totalEvents || 0,
        upcomingEvents: upcomingEvents || 0,
        totalClubs: totalClubs || 0,
        activeClubs: activeClubs || 0,
        totalUsers: totalUsers || 0,
        totalRegistrations: totalRegistrations || 0,
        checkInsToday: checkInsToday || 0,
      });

      // Fetch recent events
      const { data: events } = await supabase
        .from("events")
        .select(`
          id,
          title,
          date,
          end_date,
          is_active,
          registrations:registrations(count)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (events) {
        setRecentEvents(
          events.map((event: any) => {
            const now = new Date();
            const eventDate = new Date(event.date);
            const endDate = event.end_date ? new Date(event.end_date) : eventDate;
            let status = "upcoming";
            if (!event.is_active) status = "cancelled";
            else if (now >= eventDate && now <= endDate) status = "ongoing";
            else if (now > endDate) status = "completed";

            return {
              id: event.id,
              title: event.title,
              date: event.date,
              registrations: event.registrations?.[0]?.count || 0,
              status,
            };
          })
        );
      }

      // Fetch top clubs (with real member_count column)
      const { data: clubs } = await supabase
        .from("clubs")
        .select(`
          id,
          name,
          member_count,
          events:events(count)
        `)
        .eq("is_active", true)
        .order("member_count", { ascending: false, nullsFirst: false })
        .limit(5);

      if (clubs) {
        setTopClubs(
          clubs.map((club: any) => ({
            id: club.id,
            name: club.name,
            members: club.member_count ?? 0,
            events: club.events?.[0]?.count || 0,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      description: `${stats.upcomingEvents} upcoming`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "text-[#FF6B35] bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Active Clubs",
      value: stats.activeClubs,
      description: `${stats.totalClubs} total`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered members",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Registrations",
      value: stats.totalRegistrations,
      description: "Event sign-ups",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Check-ins Today",
      value: stats.checkInsToday,
      description: "Verified attendance",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      ongoing: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return statusStyles[status] || statusStyles.upcoming;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back! Here's an overview of your campus activity.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/events/new">
            <Button className="gradient-primary hover:opacity-90">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                  {stat.title}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Events</CardTitle>
              <CardDescription>Latest events created on the platform</CardDescription>
            </div>
            <Link href="/dashboard/events">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No events yet</p>
                <Link href="/dashboard/events/new">
                  <Button variant="link" className="mt-2 text-primary">
                    Create your first event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(event.date)} • {event.registrations} registered
                      </p>
                    </div>
                    <Badge className={getStatusBadge(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Clubs */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Top Clubs</CardTitle>
              <CardDescription>Most active clubs on campus</CardDescription>
            </div>
            <Link href="/dashboard/clubs">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {topClubs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No clubs yet</p>
                <Link href="/dashboard/clubs/new">
                  <Button variant="link" className="mt-2 text-primary">
                    Create your first club
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {topClubs.map((club, index) => (
                  <div
                    key={club.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full gradient-primary text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {club.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {club.members} members • {club.events} events
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your campus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/events/new" className="block">
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-[#FF6B35] group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="font-medium text-slate-900 dark:text-white">New Event</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create an event</p>
              </div>
            </Link>
            <Link href="/dashboard/clubs/new" className="block">
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-all text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <p className="font-medium text-slate-900 dark:text-white">New Club</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Register a club</p>
              </div>
            </Link>
            <Link href="/dashboard/qr-scanner" className="block">
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <p className="font-medium text-slate-900 dark:text-white">QR Scanner</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check-in attendees</p>
              </div>
            </Link>
            <Link href="/dashboard/analytics" className="block">
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-medium text-slate-900 dark:text-white">Analytics</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">View insights</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
