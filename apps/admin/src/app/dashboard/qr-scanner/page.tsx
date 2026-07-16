"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

interface Event {
  id: string;
  title: string;
  date: string;
}

interface CheckInResult {
  success: boolean;
  message: string;
  user?: {
    name: string;
    email: string;
  };
  event?: {
    title: string;
  };
}

export default function QRScannerPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInResult[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, title, date")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true });
    setEvents(data || []);
    if (data && data.length > 0) {
      setSelectedEventId(data[0].id);
    }
  };

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: total } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true });

    const { count: todayCount } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .gte("check_in_time", today.toISOString());

    setStats({ total: total || 0, today: todayCount || 0 });
  };

  const processCheckIn = async (code: string) => {
    if (!selectedEventId) {
      toast.error("Please select an event first");
      return;
    }

    setIsProcessing(true);

    try {
      // Try to parse the code - it could be:
      // 1. A QR token (CP-xxxxx-xxxxx-timestamp-random)
      // 2. A base64 encoded JSON object
      // 3. A registration ID (UUID)

      let registrationId: string | null = null;
      let qrToken: string | null = null;
      const trimmedCode = code.trim();

      // Check if it's a QR token format (starts with CP-)
      if (trimmedCode.startsWith('CP-')) {
        qrToken = trimmedCode;
      } else {
        // Try to decode as base64 JSON
        try {
          const decoded = atob(trimmedCode);
          const parsed = JSON.parse(decoded);
          if (parsed.token) {
            qrToken = parsed.token;
          } else if (parsed.registrationId) {
            registrationId = parsed.registrationId;
          }
        } catch {
          // Not base64, treat as registration ID
          registrationId = trimmedCode;
        }
      }

      // Get the registration - either by QR token or by ID
      let query = supabase
        .from("registrations")
        .select(`
          id,
          user_id,
          event_id,
          qr_token,
          checked_in,
          profile:profiles(full_name, email),
          event:events(title, points)
        `);

      if (qrToken) {
        query = query.eq("qr_token", qrToken);
      } else {
        query = query.eq("id", registrationId!);
      }

      const { data: registration, error: regError } = await query.single();

      if (regError || !registration) {
        const result: CheckInResult = {
          success: false,
          message: "Registration not found. Please check the QR code.",
        };
        setRecentCheckIns([result, ...recentCheckIns.slice(0, 9)]);
        toast.error("Registration not found");
        return;
      }

      if (registration.event_id !== selectedEventId) {
        const result: CheckInResult = {
          success: false,
          message: "This ticket is for a different event",
          user: {
            name: (registration.profile as any)?.full_name || "Unknown",
            email: (registration.profile as any)?.email || "",
          },
        };
        setRecentCheckIns([result, ...recentCheckIns.slice(0, 9)]);
        toast.error("Registration is for a different event");
        return;
      }

      // Check if already checked in using the checked_in field
      if (registration.checked_in) {
        const result: CheckInResult = {
          success: false,
          message: "Already checked in",
          user: {
            name: (registration.profile as any)?.full_name || "Unknown",
            email: (registration.profile as any)?.email || "",
          },
          event: {
            title: (registration.event as any)?.title || "",
          },
        };
        setRecentCheckIns([result, ...recentCheckIns.slice(0, 9)]);
        toast.warning("User already checked in");
        return;
      }

      // Also check attendance table
      const { data: existingCheckIn } = await supabase
        .from("attendance")
        .select("id")
        .eq("registration_id", registration.id)
        .single();

      if (existingCheckIn) {
        const result: CheckInResult = {
          success: false,
          message: "Already checked in",
          user: {
            name: (registration.profile as any)?.full_name || "Unknown",
            email: (registration.profile as any)?.email || "",
          },
          event: {
            title: (registration.event as any)?.title || "",
          },
        };
        setRecentCheckIns([result, ...recentCheckIns.slice(0, 9)]);
        toast.warning("User already checked in");
        return;
      }

      // Get event points
      const pointsToAward = (registration.event as any)?.points || 10;

      // Create check-in attendance record
      const { error: checkInError } = await supabase.from("attendance").insert({
        registration_id: registration.id,
        user_id: registration.user_id,
        event_id: selectedEventId,
        check_in_time: new Date().toISOString(),
        points_awarded: pointsToAward,
      });

      if (checkInError) throw checkInError;

      // Update registration checked_in status
      await supabase
        .from("registrations")
        .update({
          checked_in: true,
          check_in_time: new Date().toISOString()
        })
        .eq("id", registration.id);

      // Award points - get current points and increment
      const { data: profileData } = await supabase
        .from("profiles")
        .select("total_points, events_attended")
        .eq("id", registration.user_id)
        .single();

      if (profileData) {
        await supabase
          .from("profiles")
          .update({
            total_points: (profileData.total_points || 0) + pointsToAward,
            events_attended: (profileData.events_attended || 0) + 1
          })
          .eq("id", registration.user_id);
      }

      const result: CheckInResult = {
        success: true,
        message: `Check-in successful! +${pointsToAward} points`,
        user: {
          name: (registration.profile as any)?.full_name || "Unknown",
          email: (registration.profile as any)?.email || "",
        },
        event: {
          title: (registration.event as any)?.title || "",
        },
      };

      setRecentCheckIns([result, ...recentCheckIns.slice(0, 9)]);
      setStats({ ...stats, today: stats.today + 1, total: stats.total + 1 });
      toast.success(`${(registration.profile as any)?.full_name} checked in successfully! +${pointsToAward} points`);
    } catch (error: any) {
      console.error("Check-in error:", error);
      toast.error("Failed to process check-in");
    } finally {
      setIsProcessing(false);
      setManualCode("");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processCheckIn(manualCode);
    }
  };

  // QR Code Scanner callbacks
  const onScanSuccess = useCallback((decodedText: string) => {
    // Stop scanning on success to prevent multiple scans
    if (scannerRef.current) {
      scannerRef.current.clear();
      setIsScannerActive(false);
    }
    processCheckIn(decodedText);
  }, [selectedEventId, recentCheckIns, stats]);

  const onScanError = (errorMessage: string) => {
    // Ignore scan errors (they happen when no QR code is detected)
    console.debug("Scan error:", errorMessage);
  };

  // Start camera scanner
  const startScanner = () => {
    if (!selectedEventId) {
      toast.error("Please select an event first");
      return;
    }

    setIsScannerActive(true);

    // Initialize scanner after state update
    setTimeout(() => {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      };

      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        config,
        /* verbose= */ false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
    }, 100);
  };

  // Stop camera scanner
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        setIsScannerActive(false);
      }).catch((error: any) => {
        console.error("Failed to clear scanner:", error);
        setIsScannerActive(false);
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          QR Scanner
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Scan QR codes to check in event attendees
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.today}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Check-ins Today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-[#FF6B35]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Check-ins
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>
              Select an event and scan attendee QR codes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-white">
                Select Event
              </label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Camera Scanner */}
            <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
              {isScannerActive ? (
                <div id="qr-reader" className="w-full h-full" />
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 border-4 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mb-2">
                    Camera access required
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Click below to enable camera scanning
                  </p>
                </div>
              )}
            </div>

            {isScannerActive ? (
              <Button className="w-full" variant="destructive" onClick={stopScanner}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Stop Camera
              </Button>
            ) : (
              <Button className="w-full" variant="outline" onClick={startScanner}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Enable Camera
              </Button>
            )}

            {/* Manual Entry */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-slate-900 px-4 text-sm text-slate-500 dark:text-slate-400">
                  or enter code manually
                </span>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <Input
                placeholder="Enter registration code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isProcessing || !manualCode.trim()}
                className="gradient-primary hover:opacity-90"
              >
                {isProcessing ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  "Check In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
            <CardDescription>
              Latest check-in activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCheckIns.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No check-ins yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Scan a QR code to check in an attendee
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCheckIns.map((checkIn, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      checkIn.success
                        ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
                        : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-1.5 rounded-full ${
                          checkIn.success
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600"
                        }`}
                      >
                        {checkIn.success ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        {checkIn.user && (
                          <p className="font-medium text-slate-900 dark:text-white">
                            {checkIn.user.name}
                          </p>
                        )}
                        <p
                          className={`text-sm ${
                            checkIn.success
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          }`}
                        >
                          {checkIn.message}
                        </p>
                        {checkIn.event && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {checkIn.event.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
