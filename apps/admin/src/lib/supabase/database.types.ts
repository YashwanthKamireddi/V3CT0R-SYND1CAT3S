export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string | null
          event_id: string | null
          id: string
          notes: string | null
          points_awarded: number | null
          registration_id: string | null
          user_id: string | null
          verified_by: string | null
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          points_awarded?: number | null
          registration_id?: string | null
          user_id?: string | null
          verified_by?: string | null
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          points_awarded?: number | null
          registration_id?: string | null
          user_id?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "attendance_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          description: string | null
          events_required: number | null
          icon: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          points_bonus: number | null
          points_required: number | null
          requirement_type: string | null
          requirement_value: number | null
          slug: string | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          events_required?: number | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_bonus?: number | null
          points_required?: number | null
          requirement_type?: string | null
          requirement_value?: number | null
          slug?: string | null
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          events_required?: number | null
          icon?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_bonus?: number | null
          points_required?: number | null
          requirement_type?: string | null
          requirement_value?: number | null
          slug?: string | null
        }
        Relationships: []
      }
      clubs: {
        Row: {
          admin_ids: string[] | null
          banner_url: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          logo_url: string | null
          member_count: number | null
          name: string
          slug: string | null
          social_links: Json | null
          website: string | null
        }
        Insert: {
          admin_ids?: string[] | null
          banner_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name: string
          slug?: string | null
          social_links?: Json | null
          website?: string | null
        }
        Update: {
          admin_ids?: string[] | null
          banner_url?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          member_count?: number | null
          name?: string
          slug?: string | null
          social_links?: Json | null
          website?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number | null
          category: string | null
          club_id: string | null
          created_at: string | null
          current_attendees: number | null
          current_registrations: number | null
          date: string
          description: string | null
          end_date: string | null
          end_time: string | null
          event_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          max_attendees: number | null
          points: number | null
          points_reward: number | null
          price: number | null
          registration_deadline: string | null
          requirements: string | null
          short_description: string | null
          slug: string | null
          start_time: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          venue: string | null
          venue_address: string | null
        }
        Insert: {
          capacity?: number | null
          category?: string | null
          club_id?: string | null
          created_at?: string | null
          current_attendees?: number | null
          current_registrations?: number | null
          date: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          max_attendees?: number | null
          points?: number | null
          points_reward?: number | null
          price?: number | null
          registration_deadline?: string | null
          requirements?: string | null
          short_description?: string | null
          slug?: string | null
          start_time?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          venue?: string | null
          venue_address?: string | null
        }
        Update: {
          capacity?: number | null
          category?: string | null
          club_id?: string | null
          created_at?: string | null
          current_attendees?: number | null
          current_registrations?: number | null
          date?: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          max_attendees?: number | null
          points?: number | null
          points_reward?: number | null
          price?: number | null
          registration_deadline?: string | null
          requirements?: string | null
          short_description?: string | null
          slug?: string | null
          start_time?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          venue?: string | null
          venue_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          color: string | null
          created_at: string | null
          data: Json | null
          event_id: string | null
          icon: string | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          color?: string | null
          created_at?: string | null
          data?: Json | null
          event_id?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          color?: string | null
          created_at?: string | null
          data?: Json | null
          event_id?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          branch: string | null
          created_at: string | null
          email: string | null
          events_attended: number | null
          full_name: string | null
          id: string
          interests: string[] | null
          is_active: boolean | null
          phone: string | null
          role: string | null
          student_id: string | null
          total_points: number | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          branch?: string | null
          created_at?: string | null
          email?: string | null
          events_attended?: number | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          is_active?: boolean | null
          phone?: string | null
          role?: string | null
          student_id?: string | null
          total_points?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          branch?: string | null
          created_at?: string | null
          email?: string | null
          events_attended?: number | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          phone?: string | null
          role?: string | null
          student_id?: string | null
          total_points?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          check_in_time: string | null
          checked_in: boolean | null
          created_at: string | null
          event_id: string | null
          id: string
          qr_token: string | null
          registered_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          check_in_time?: string | null
          checked_in?: boolean | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          qr_token?: string | null
          registered_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          check_in_time?: string | null
          checked_in?: boolean | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          qr_token?: string | null
          registered_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          is_sent: boolean | null
          registration_id: string | null
          remind_at: string
          reminder_type: string | null
          scheduled_for: string | null
          sent: boolean | null
          sent_at: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_sent?: boolean | null
          registration_id?: string | null
          remind_at: string
          reminder_type?: string | null
          scheduled_for?: string | null
          sent?: boolean | null
          sent_at?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_sent?: boolean | null
          registration_id?: string | null
          remind_at?: string
          reminder_type?: string | null
          scheduled_for?: string | null
          sent?: boolean | null
          sent_at?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string | null
          earned_at: string | null
          event_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          earned_at?: string | null
          event_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          earned_at?: string | null
          event_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          badges_count: number | null
          branch: string | null
          events_attended: number | null
          full_name: string | null
          id: string | null
          rank: number | null
          total_points: number | null
          user_id: string | null
          year: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// =============================================
// HELPER TYPE ALIASES (added for app code)
// =============================================
type DefaultSchemaTables = Database['public']['Tables']
type DefaultSchemaViews = Database['public']['Views']

export type Profile = DefaultSchemaTables['profiles']['Row']
export type ProfileInsert = DefaultSchemaTables['profiles']['Insert']
export type ProfileUpdate = DefaultSchemaTables['profiles']['Update']

export type Club = DefaultSchemaTables['clubs']['Row']
export type ClubInsert = DefaultSchemaTables['clubs']['Insert']

export type Event = DefaultSchemaTables['events']['Row']
export type EventInsert = DefaultSchemaTables['events']['Insert']
export type EventUpdate = DefaultSchemaTables['events']['Update']

export type Registration = DefaultSchemaTables['registrations']['Row']
export type RegistrationInsert = DefaultSchemaTables['registrations']['Insert']

export type Attendance = DefaultSchemaTables['attendance']['Row']

export type Badge = DefaultSchemaTables['badges']['Row']
export type UserBadge = DefaultSchemaTables['user_badges']['Row']

export type Notification = DefaultSchemaTables['notifications']['Row']
export type NotificationInsert = DefaultSchemaTables['notifications']['Insert']

export type Reminder = DefaultSchemaTables['reminders']['Row']

export type LeaderboardEntry = DefaultSchemaViews['leaderboard']['Row']

// =============================================
// JOINED TYPES (for queries with relations)
// =============================================
export type EventWithClub = Event & {
  clubs: Club | null
}

export type RegistrationWithEvent = Registration & {
  events: Event & {
    clubs: Club | null
  }
}

export type UserBadgeWithDetails = UserBadge & {
  badges: Badge
}

export type NotificationWithEvent = Notification & {
  events?: Event | null
}
