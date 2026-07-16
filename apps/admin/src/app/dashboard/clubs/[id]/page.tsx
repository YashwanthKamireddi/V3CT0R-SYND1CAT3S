"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Club {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  category: string | null;
  email: string | null;
  member_count: number | null;
  is_active: boolean;
  created_at: string;
}

interface ClubEvent {
  id: string;
  title: string;
  date: string;
  end_date: string | null;
  location: string | null;
  category: string | null;
  current_attendees: number | null;
  max_attendees: number | null;
  is_active: boolean;
  image_url: string | null;
}

interface RegistrationRow {
  id: string;
  status: string;
  checked_in: boolean;
  created_at: string;
  events: { id: string; title: string; date: string } | null;
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
}

export default function ClubDetailPage() {
  const params = useParams();
  const clubId = params?.id as string;

  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    if (!clubId) return;
    const load = async () => {
      setIsLoading(true);
      // Lookup club by uuid first, fall back to slug
      let { data: clubData } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", clubId)
        .maybeSingle();
      if (!clubData) {
        const r = await supabase
          .from("clubs")
          .select("*")
          .eq("slug", clubId)
          .maybeSingle();
        clubData = r.data;
      }
      if (!clubData) {
        setIsLoading(false);
        return;
      }
      setClub(clubData);

      const { data: evs } = await supabase
        .from("events")
        .select(
          "id, title, date, end_date, location, category, current_attendees, max_attendees, is_active, image_url",
        )
        .eq("club_id", clubData.id)
        .order("date", { ascending: false });
      setEvents(evs ?? []);

      const eventIds = (evs ?? []).map((e) => e.id);
      if (eventIds.length > 0) {
        const { data: regs } = await supabase
          .from("registrations")
          .select(
            "id, status, checked_in, created_at, events:event_id (id, title, date), profiles:user_id (id, full_name, email, avatar_url)",
          )
          .in("event_id", eventIds)
          .order("created_at", { ascending: false })
          .limit(100);
        setRegistrations((regs as unknown as RegistrationRow[]) ?? []);
      }

      setIsLoading(false);
    };
    load();
  }, [clubId]);

  if (isLoading) {
    return (
      <div className="p-8 text-muted-foreground">Loading club…</div>
    );
  }
  if (!club) {
    return (
      <div className="p-8">
        <p className="mb-4">Club not found.</p>
        <Link href="/dashboard/clubs">
          <Button variant="outline">← Back to clubs</Button>
        </Link>
      </div>
    );
  }

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);
  const checkedInCount = registrations.filter((r) => r.checked_in).length;
  const attendeeRate =
    registrations.length > 0
      ? Math.round((checkedInCount / registrations.length) * 100)
      : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header / banner */}
      <div className="relative overflow-hidden rounded-xl border bg-card">
        {club.banner_url && (
          <div className="relative h-40 w-full bg-muted">
            <Image
              src={club.banner_url}
              alt={club.name}
              fill
              className="object-cover opacity-60"
              unoptimized
            />
          </div>
        )}
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {club.logo_url ? (
              <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={club.logo_url}
                  alt={club.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                {club.name[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">{club.name}</h1>
                {club.category && (
                  <Badge variant="secondary">{club.category}</Badge>
                )}
                {club.is_active ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
              {club.description && (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {club.description}
                </p>
              )}
              {club.email && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {club.email}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/events/new?club_id=${club.id}`}
              className="inline-flex"
            >
              <Button>+ New event</Button>
            </Link>
            <Link href="/dashboard/clubs">
              <Button variant="outline">All clubs</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Members</CardDescription>
            <CardTitle className="text-3xl">
              {club.member_count ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total events</CardDescription>
            <CardTitle className="text-3xl">{events.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming</CardDescription>
            <CardTitle className="text-3xl">{upcoming.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Check-in rate</CardDescription>
            <CardTitle className="text-3xl">{attendeeRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabbed content */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="registrations">
            Registrations ({registrations.length})
          </TabsTrigger>
          <TabsTrigger value="attendees">
            Checked-in ({checkedInCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>All events</CardTitle>
              <CardDescription>
                Newest first. Click a row to manage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Registrations</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No events yet — create the first one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((ev) => {
                      const isUpcoming = new Date(ev.date) >= now;
                      return (
                        <TableRow key={ev.id} className="cursor-pointer">
                          <TableCell className="font-medium">
                            <Link
                              href={`/dashboard/events/${ev.id}`}
                              className="hover:underline"
                            >
                              {ev.title}
                            </Link>
                            {ev.category && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs"
                              >
                                {ev.category}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(ev.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {ev.location ?? "—"}
                          </TableCell>
                          <TableCell>
                            {ev.current_attendees ?? 0}
                            {ev.max_attendees ? ` / ${ev.max_attendees}` : ""}
                          </TableCell>
                          <TableCell>
                            {isUpcoming ? (
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                Upcoming
                              </Badge>
                            ) : (
                              <Badge variant="outline">Past</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>Recent registrations</CardTitle>
              <CardDescription>
                Latest 100 across all events for this club.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No registrations yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrations.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              {r.profiles?.avatar_url && (
                                <AvatarImage src={r.profiles.avatar_url} />
                              )}
                              <AvatarFallback>
                                {(r.profiles?.full_name ?? "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">
                                {r.profiles?.full_name ?? "Anonymous"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {r.profiles?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{r.events?.title ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {r.checked_in ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Checked in
                            </Badge>
                          ) : r.status === "cancelled" ? (
                            <Badge variant="destructive">Cancelled</Badge>
                          ) : r.status === "waitlist" ? (
                            <Badge variant="outline">Waitlist</Badge>
                          ) : (
                            <Badge variant="secondary">Confirmed</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendees">
          <Card>
            <CardHeader>
              <CardTitle>Checked-in attendees</CardTitle>
              <CardDescription>
                People who actually showed up.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attendee</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.filter((r) => r.checked_in).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No check-ins yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrations
                      .filter((r) => r.checked_in)
                      .map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                {r.profiles?.avatar_url && (
                                  <AvatarImage src={r.profiles.avatar_url} />
                                )}
                                <AvatarFallback>
                                  {(r.profiles?.full_name ?? "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {r.profiles?.full_name ?? "Anonymous"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{r.events?.title ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.events?.date
                              ? new Date(r.events.date).toLocaleDateString()
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
