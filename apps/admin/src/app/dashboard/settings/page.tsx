"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Building2,
  Bell,
  Shield,
  Palette,
  Mail,
  Globe,
  Save,
  Loader2,
} from "lucide-react";

interface AppSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  timezone: string;
  allowPublicRegistration: boolean;
  requireEmailVerification: boolean;
  enableNotifications: boolean;
  enableQrCheckIn: boolean;
  maxEventsPerClub: number;
  maxRegistrationsPerEvent: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    siteName: "CampusPulse",
    siteDescription: "Campus Event Management Platform",
    contactEmail: "admin@campuspulse.edu",
    timezone: "America/New_York",
    allowPublicRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    enableQrCheckIn: true,
    maxEventsPerClub: 50,
    maxRegistrationsPerEvent: 500,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Try to fetch settings from database
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .single();

      if (data) {
        setSettings({
          siteName: data.site_name || settings.siteName,
          siteDescription: data.site_description || settings.siteDescription,
          contactEmail: data.contact_email || settings.contactEmail,
          timezone: data.timezone || settings.timezone,
          allowPublicRegistration: data.allow_public_registration ?? settings.allowPublicRegistration,
          requireEmailVerification: data.require_email_verification ?? settings.requireEmailVerification,
          enableNotifications: data.enable_notifications ?? settings.enableNotifications,
          enableQrCheckIn: data.enable_qr_checkin ?? settings.enableQrCheckIn,
          maxEventsPerClub: data.max_events_per_club || settings.maxEventsPerClub,
          maxRegistrationsPerEvent: data.max_registrations_per_event || settings.maxRegistrationsPerEvent,
        });
      }
    } catch (error) {
      // Settings table might not exist yet, use defaults
      console.log("Using default settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("app_settings")
        .upsert({
          id: 1, // Single row for app settings
          site_name: settings.siteName,
          site_description: settings.siteDescription,
          contact_email: settings.contactEmail,
          timezone: settings.timezone,
          allow_public_registration: settings.allowPublicRegistration,
          require_email_verification: settings.requireEmailVerification,
          enable_notifications: settings.enableNotifications,
          enable_qr_checkin: settings.enableQrCheckIn,
          max_events_per_club: settings.maxEventsPerClub,
          max_registrations_per_event: settings.maxRegistrationsPerEvent,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Settings table may not exist.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your application settings and preferences
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="gradient-primary hover:opacity-90"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Limits</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Site Information
              </CardTitle>
              <CardDescription>
                Basic information about your campus platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSetting("siteName", e.target.value)}
                    placeholder="CampusPulse"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSetting("contactEmail", e.target.value)}
                    placeholder="admin@campus.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting("siteDescription", e.target.value)}
                  placeholder="Your campus event management platform"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => updateSetting("timezone", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="Europe/London">British Time (GMT/BST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how notifications are sent to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableNotifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send push notifications for events and updates
                  </p>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked: boolean) => updateSetting("enableNotifications", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableQrCheckIn">QR Code Check-in</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow attendees to check in via QR code scanning
                  </p>
                </div>
                <Switch
                  id="enableQrCheckIn"
                  checked={settings.enableQrCheckIn}
                  onCheckedChange={(checked: boolean) => updateSetting("enableQrCheckIn", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security & Authentication
              </CardTitle>
              <CardDescription>
                Control user registration and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowPublicRegistration">Public Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register without invitation
                  </p>
                </div>
                <Switch
                  id="allowPublicRegistration"
                  checked={settings.allowPublicRegistration}
                  onCheckedChange={(checked: boolean) => updateSetting("allowPublicRegistration", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireEmailVerification">Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require users to verify their email before accessing features
                  </p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked: boolean) => updateSetting("requireEmailVerification", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits Settings */}
        <TabsContent value="limits" className="space-y-6">
          <Card className="card-interactive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Platform Limits
              </CardTitle>
              <CardDescription>
                Set maximum limits for events and registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxEventsPerClub">Max Events per Club</Label>
                  <Input
                    id="maxEventsPerClub"
                    type="number"
                    min={1}
                    max={1000}
                    value={settings.maxEventsPerClub}
                    onChange={(e) => updateSetting("maxEventsPerClub", parseInt(e.target.value) || 50)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of active events a club can have
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRegistrationsPerEvent">Max Registrations per Event</Label>
                  <Input
                    id="maxRegistrationsPerEvent"
                    type="number"
                    min={1}
                    max={10000}
                    value={settings.maxRegistrationsPerEvent}
                    onChange={(e) => updateSetting("maxRegistrationsPerEvent", parseInt(e.target.value) || 500)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default maximum attendees for new events
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
