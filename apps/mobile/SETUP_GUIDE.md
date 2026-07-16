# 🚀 CampusPulse Backend Setup Guide

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Organization**: Your org name
   - **Project name**: `campuspulse`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., Mumbai for India)
4. Wait for project to be created (~2 minutes)

### 2. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - `Project URL` → This is your `SUPABASE_URL`
   - `anon public` key → This is your `SUPABASE_ANON_KEY`

### 3. Configure Mobile App

Create a `.env` file in `apps/mobile/`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Migrations

Go to **SQL Editor** in Supabase and run the SQL files in order:

1. Copy and paste `supabase/migrations/001_initial_schema.sql`
2. Click "Run"
3. Repeat for other migration files

### 5. Install Dependencies

```bash
cd apps/mobile
npm install
```

### 6. Start the App

```bash
npm start
```

---

## Database Schema

The app uses the following tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles extending Supabase auth |
| `clubs` | Campus clubs/organizations |
| `events` | All events created by clubs |
| `registrations` | User event registrations (tickets) |
| `attendance` | Check-in records |
| `badges` | Achievement badges |
| `user_badges` | Badges earned by users |
| `notifications` | User notifications |
| `reminders` | Event reminders |
| `leaderboard` (view) | Computed leaderboard rankings |

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for client-side access | Yes |

---

## Project Structure

```
apps/mobile/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Supabase client initialization
│   │   ├── database.types.ts  # TypeScript types for all tables
│   │   └── auth.ts            # Authentication helpers
│   ├── services/
│   │   ├── eventService.ts    # Event API calls
│   │   ├── registrationService.ts  # Registration/ticket APIs
│   │   ├── qrService.ts       # QR code generation & check-in
│   │   ├── notificationService.ts  # Notification APIs
│   │   └── leaderboardService.ts   # Leaderboard & points
│   ├── context/
│   │   └── AuthContext.tsx    # Global auth state
│   ├── hooks/
│   │   ├── index.ts           # Hook exports
│   │   ├── useEvents.ts       # Event data hooks
│   │   ├── useTickets.ts      # Ticket data hooks
│   │   ├── useNotifications.ts # Notification hooks
│   │   ├── useProfile.ts      # Profile hooks
│   │   └── useLeaderboard.ts  # Leaderboard hooks
│   └── data/
│       ├── mockData.ts        # Mock data for development
│       └── useData.ts         # Smart hooks (mock ↔ real)
```

---

## Authentication Flow

### Sign Up
1. User fills registration form
2. `signUp()` creates Supabase auth user
3. Database trigger creates `profiles` row
4. User receives email verification

### Sign In
1. User enters credentials
2. `signIn()` validates with Supabase
3. Session stored in SecureStore (mobile) or AsyncStorage (web)
4. `AuthContext` updates with user data

### Session Management
- JWT tokens auto-refresh
- SecureStore provides secure token storage on mobile
- Auth state listener updates context on changes

---

## API Services

### Event Service
```typescript
// Get featured events
const featured = await getFeaturedEvents(5);

// Get events with filters
const events = await getEvents({
  category: 'hackathon',
  clubId: 'github-community',
  page: 1,
  limit: 10,
});

// Search events
const results = await searchEvents('hackathon');

// Real-time subscription
subscribeToEventUpdates(eventId, (event) => {
  console.log('Event updated:', event);
});
```

### Registration Service
```typescript
// Register for event
const { success, registration, error } = await registerForEvent(userId, eventId);

// Get user tickets
const upcoming = await getUserRegistrations(userId, 'upcoming');
const past = await getUserRegistrations(userId, 'past');

// Cancel registration
await cancelRegistration(registrationId);
```

### QR Service
```typescript
// Generate QR data
const qrData = generateQRData(registration);

// Process check-in
const { success, points, badges } = await processCheckIn(qrToken);
```

### Notification Service
```typescript
// Get notifications
const notifications = await getUserNotifications(userId);

// Mark as read
await markNotificationAsRead(notificationId);

// Real-time subscription
subscribeToNotifications(userId, (notification) => {
  console.log('New notification:', notification);
});
```

---

## Security

### Row Level Security (RLS)
All tables have RLS policies:
- Users can only read/write their own data
- Public events are readable by all
- Admin actions require admin role

### API Keys
- `anon` key: Client-side, limited access
- `service_role` key: Server-side only, full access

### Token Storage
- Mobile: `expo-secure-store` (encrypted)
- Web: `localStorage` (fallback)

---

## Deployment

### For Demo/Hackathon
1. Supabase free tier is sufficient
2. App runs in Expo Go for testing
3. Share expo link with judges

### For Production
1. Upgrade to Supabase Pro for better performance
2. Build standalone app with EAS Build
3. Configure push notifications
4. Set up monitoring (Sentry)

---

## Troubleshooting

### "Invalid API key"
- Check `.env` file exists
- Verify keys match Supabase dashboard
- Restart Expo bundler after changing env

### "Network request failed"
- Check internet connection
- Verify Supabase project is running
- Check if URL is correct (no trailing slash)

### "Permission denied"
- Check RLS policies in Supabase
- Verify user is authenticated
- Check if user has correct role

### Auth not working
- Clear app data/cache
- Check email verification settings
- Verify auth providers in Supabase

---

## Mock Data Mode

The app works without Supabase using mock data:

```typescript
// lib/data/mockData.ts
export const IS_SUPABASE_CONFIGURED = false; // Auto-detected

// When Supabase is not configured:
// - All screens show mock data
// - Auth flows are simulated
// - Perfect for UI development
```

To use mock data, simply don't configure the `.env` file.

---

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Configure environment variables
3. ✅ Run database migrations
4. ⬜ Add initial seed data (clubs, events)
5. ⬜ Test authentication flow
6. ⬜ Verify event registration
7. ⬜ Test QR check-in process

---

## Support

- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [Expo Docs](https://docs.expo.dev)
- 💬 Ask in project Discord/Slack
