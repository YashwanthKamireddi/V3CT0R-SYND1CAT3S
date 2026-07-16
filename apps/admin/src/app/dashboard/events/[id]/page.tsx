"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: string;
  capacity: number;
  category: string;
  image_url: string | null;
  created_at: string;
  club: {
    id: string;
    name: string;
  } | null;
}

interface Registration {
  id: string;
  created_at: string;
  status: string;
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  check_in: {
    checked_in_at: string;
  } | null;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchEventDetails();
  }, [params.id]);

  const fetchEventDetails = async () => {
    try {
      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(`
          *,
          club:clubs(id, name)
        `)
        .eq("id", params.id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch registrations
      const { data: regData, error: regError } = await supabase
        .from("registrations")
        .select(`
          id,
          created_at,
          status,
          profile:profiles(id, full_name, email, avatar_url),
          attendance:attendance(check_in_time)
        `)
        .eq("event_id", params.id)
        .order("created_at", { ascending: false });

      if (regError) throw regError;

      // Transform the data to match the Registration interface
      const transformedData = (regData || []).map((reg: any) => ({
        id: reg.id,
        created_at: reg.created_at,
        status: reg.status,
        profile: Array.isArray(reg.profile) ? reg.profile[0] : reg.profile,
        check_in: Array.isArray(reg.attendance) ? reg.attendance[0] ? { checked_in_at: reg.attendance[0].check_in_time } : null : reg.attendance ? { checked_in_at: reg.attendance.check_in_time } : null,
      }));

      setRegistrations(transformedData);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Failed to load event details");
      router.push("/dashboard/events");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      ongoing: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
    return statusStyles[status] || statusStyles.upcoming;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) return null;

  const checkedInCount = registrations.filter((r) => r.check_in).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/events">
            <Button variant="ghost" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {event.title}
              </h1>
              <Badge className={getStatusBadge(event.status)}>
                {event.status}
              </Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Created on {formatDate(event.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/events/${event.id}/edit`}>
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Event Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-[#FF6B35]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatDate(event.date)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Time</p>
                <p className="font-semibold text-slate-900 dark:text-white">{event.time}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Registrations</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {registrations.length} / {event.capacity}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Checked In</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {checkedInCount} / {registrations.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Description
              </h4>
              <p className="text-slate-900 dark:text-white whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Location
                </h4>
                <p className="text-slate-900 dark:text-white">{event.location}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Category
                </h4>
                <p className="text-slate-900 dark:text-white capitalize">{event.category}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Organizing Club
                </h4>
                <p className="text-slate-900 dark:text-white">
                  {event.club?.name || "No club"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Capacity
                </h4>
                <p className="text-slate-900 dark:text-white">{event.capacity} attendees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Event QR Code</CardTitle>
            <CardDescription>
              Share this code for attendees to register
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-48 h-48 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p className="text-sm">QR Code</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR Code
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Registrations Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>
            {registrations.length} registered attendee{registrations.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No registrations yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Share the event to get attendees to register
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Checked In</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                            {reg.profile?.full_name?.charAt(0) || "?"}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {reg.profile?.full_name || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {reg.profile?.email || "—"}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {formatTime(reg.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(reg.status)}>
                          {reg.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {reg.check_in ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {formatTime(reg.check_in.checked_in_at)}
                          </div>
                        ) : (
                          <span className="text-slate-400">Not checked in</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
