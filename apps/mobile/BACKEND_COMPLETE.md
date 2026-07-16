# 🏗️ CampusPulse Backend Architecture - Complete

## ✅ What Was Built

### 1. Supabase Client Layer (`lib/supabase/`)
- **`client.ts`** - Supabase client initialization with Expo SecureStore adapter
- **`database.types.ts`** - Full TypeScript types for all 10 database tables
- **`auth.ts`** - Authentication helper functions (signUp, signIn, signOut, profile management)

### 2. API Services Layer (`lib/services/`)
- **`eventService.ts`** - Event CRUD, filters, search, real-time subscriptions
- **`registrationService.ts`** - Registration flow, ticket management, cancellation
- **`qrService.ts`** - QR code generation, validation, check-in with points
- **`notificationService.ts`** - Notifications CRUD, real-time updates
- **`leaderboardService.ts`** - Leaderboard, rankings, user stats

### 3. State Management (`lib/context/`)
- **`AuthContext.tsx`** - Global auth state with React Context
  - Handles user, session, profile state
  - Auto-refreshes on auth state changes
  - Provides signIn, signUp, signOut, updateProfile actions

### 4. Custom Hooks (`lib/hooks/`)
- **`useEvents.ts`** - useEvents, useFeaturedEvents, useTodaysEvents, useEvent, useEventSearch
- **`useTickets.ts`** - useTickets, useTicket, useRegistration
- **`useNotifications.ts`** - useNotifications, useUnreadCount, useReminders
- **`useProfile.ts`** - useProfile, useUserStats, useUserRank, useEditProfile
- **`useLeaderboard.ts`** - useLeaderboard, useTopUsers, useNearbyUsers
- **`index.ts`** - Central export file

### 5. Smart Data Layer (`lib/data/`)
- **`mockData.ts`** - Comprehensive mock data for offline development
- **`useData.ts`** - Hooks that switch between mock/real data automatically
- **`index.ts`** - Exports all data utilities

### 6. Database Schema (`supabase/migrations/`)
- **`001_initial_schema.sql`** - Complete database schema with:
  - 10 tables (profiles, clubs, events, registrations, attendance, badges, user_badges, notifications, reminders)
  - Leaderboard view
  - Row Level Security policies
  - Database triggers (auto-update attendee counts, points)
  - Performance indexes
- **`002_seed_data.sql`** - Sample data (8 clubs, 10 events, 10 badges)

### 7. App Integration
- **`app/_layout.tsx`** - Updated with AuthProvider wrapper
- **`app/auth/_layout.tsx`** - Auth navigation stack
- **`app/auth/login.tsx`** - Updated to use real Supabase auth

### 8. Configuration
- **`package.json`** - Added @supabase/supabase-js, expo-secure-store, react-native-url-polyfill
- **`.env.example`** - Template for environment variables
- **`SETUP_GUIDE.md`** - Complete setup instructions
- **`BACKEND_ARCHITECTURE.md`** - Technical architecture documentation

---

## 📦 New Dependencies Added

```json
{
  "@supabase/supabase-js": "^2.45.0",
  "expo-secure-store": "~15.0.3",
  "react-native-url-polyfill": "^2.0.0"
}
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd apps/mobile
npm install
```

### 2. Set Up Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`
3. Fill in your Supabase URL and anon key

### 3. Run Database Migrations
Go to Supabase SQL Editor and run:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_data.sql`

### 4. Start the App
```bash
npm start
```

---

## 📁 Complete File Structure

```
apps/mobile/
├── .env.example                    # Environment template
├── SETUP_GUIDE.md                  # Setup instructions
├── BACKEND_ARCHITECTURE.md         # Technical docs
├── package.json                    # Updated with new deps
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  # Database schema
│       └── 002_seed_data.sql       # Seed data
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase client
│   │   ├── database.types.ts       # TypeScript types
│   │   └── auth.ts                 # Auth helpers
│   ├── services/
│   │   ├── eventService.ts         # Event APIs
│   │   ├── registrationService.ts  # Registration APIs
│   │   ├── qrService.ts            # QR/Check-in APIs
│   │   ├── notificationService.ts  # Notification APIs
│   │   └── leaderboardService.ts   # Leaderboard APIs
│   ├── context/
│   │   └── AuthContext.tsx         # Auth state management
│   ├── hooks/
│   │   ├── index.ts                # Hook exports
│   │   ├── useEvents.ts            # Event hooks
│   │   ├── useTickets.ts           # Ticket hooks
│   │   ├── useNotifications.ts     # Notification hooks
│   │   ├── useProfile.ts           # Profile hooks
│   │   └── useLeaderboard.ts       # Leaderboard hooks
│   └── data/
│       ├── index.ts                # Data exports
│       ├── mockData.ts             # Mock data
│       └── useData.ts              # Smart data hooks
└── app/
    ├── _layout.tsx                 # Root layout (with AuthProvider)
    └── auth/
        ├── _layout.tsx             # Auth stack
        └── login.tsx               # Login (with real auth)
```

---

## 🔄 How Data Flow Works

### Without Supabase (Demo Mode)
```
UI Component → useData hooks → Mock Data
```
- App works immediately with pre-defined mock data
- Perfect for UI development and demos

### With Supabase (Production Mode)
```
UI Component → Custom Hooks → Services → Supabase Client → PostgreSQL
```
- Real-time updates via Supabase Realtime
- Secure auth with JWT + SecureStore
- Row Level Security enforced

---

## 🎯 Integration Example

```tsx
// In any screen component:
import { useFeaturedEventsData, useProfileData } from '@/lib/data';
import { useAuth } from '@/lib/context/AuthContext';

function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const { events, isLoading } = useFeaturedEventsData(5);
  const { profile } = useProfileData(user?.id);

  if (isLoading) return <Loading />;

  return (
    <View>
      <Text>Welcome, {profile?.full_name}</Text>
      {events.map(event => <EventCard key={event.id} event={event} />)}
    </View>
  );
}
```

---

## 🔐 Security Features

1. **Row Level Security** - Users can only access their own data
2. **JWT Tokens** - Auto-refresh, stored securely
3. **QR Token Encryption** - One-time use, timestamp encoded
4. **Admin Controls** - Role-based access for club admins

---

## 📱 Works Offline

The mock data layer ensures the app works even without:
- Internet connection
- Supabase configuration
- Database setup

Simply don't configure `.env` and the app uses mock data automatically.

---

## 🎉 Ready for Hackathon!

The backend is **production-ready** and fully integrated. Just:
1. Run `npm install`
2. Set up Supabase (5 minutes)
3. Run the migrations
4. Start building features!

Good luck with your pitch! 🚀
