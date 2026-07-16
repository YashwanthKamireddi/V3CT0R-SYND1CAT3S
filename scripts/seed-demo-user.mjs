// Creates a demo user with ~1 year of realistic activity:
// signups, attendance, points, badges, notifications, registrations.
//
// Login after running:  demo@gitam.edu  /  demo1234
//
// Usage:  SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-demo-user.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://usmjkvbzktxxmaffwdyd.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY env var.");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = "demo@gitam.edu";
const DEMO_PASSWORD = "demo1234";
const DEMO_NAME = "Yash Kamireddi";

// ---------- 1. Create or fetch the auth user ----------
async function ensureUser() {
  // Check if user already exists by listing
  const { data: list } = await sb.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === DEMO_EMAIL);
  if (existing) {
    console.log(`ℹ️  Demo user already exists (${existing.id}) — wiping prior activity`);
    // Wipe activity so we get a fresh 1-year history
    await sb.from("attendance").delete().eq("user_id", existing.id);
    await sb.from("registrations").delete().eq("user_id", existing.id);
    await sb.from("notifications").delete().eq("user_id", existing.id);
    await sb.from("user_badges").delete().eq("user_id", existing.id);
    await sb.from("reminders").delete().eq("user_id", existing.id);
    return existing;
  }
  const { data, error } = await sb.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: DEMO_NAME },
  });
  if (error) throw error;
  console.log(`✅ Created demo user ${data.user.id}`);
  return data.user;
}

// ---------- 2. Backfill profile with rich data ----------
async function fillProfile(userId) {
  const { error } = await sb
    .from("profiles")
    .update({
      full_name: DEMO_NAME,
      email: DEMO_EMAIL,
      avatar_url:
        "https://api.dicebear.com/9.x/avataaars/svg?seed=yashwanth&backgroundColor=b6e3f4",
      student_id: "GITAM-2023-CSE-1842",
      branch: "Computer Science Engineering",
      year: 3,
      phone: "+91-9876543210",
      bio: "3rd-year CSE student at GITAM. Open-source contributor, hackathon enthusiast, dance club regular.",
      interests: ["coding", "AI/ML", "dance", "photography", "hackathons"],
      role: "student",
      is_active: true,
    })
    .eq("id", userId);
  if (error) throw error;
  console.log("✅ Profile filled");
}

// ---------- 3. Generate ~1 year of activity ----------
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateActivity(userId) {
  // Pull all events
  const { data: events, error: evErr } = await sb
    .from("events")
    .select("id, title, points, date, club_id");
  if (evErr) throw evErr;
  if (!events || events.length === 0) {
    console.warn("⚠️  No events in DB — run seed-real-clubs first");
    return { totalPoints: 0, eventsAttended: 0 };
  }

  // Pull all clubs (for notifications)
  const { data: clubs } = await sb.from("clubs").select("id, name");

  // Generate 25 historical attendances spread across the past year.
  const now = new Date();
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const historicalAttendances = [];
  let totalPoints = 0;

  // Build varied attendance timeline (1-3 events per month)
  for (let monthOffset = 12; monthOffset >= 1; monthOffset--) {
    const monthEvents = randInt(1, 3);
    for (let i = 0; i < monthEvents; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - monthOffset);
      d.setDate(randInt(1, 28));
      d.setHours(randInt(9, 19), randInt(0, 59), 0, 0);
      historicalAttendances.push({ when: d, event: pick(events) });
    }
  }

  // De-dup so we don't double-register the same event
  const seen = new Set();
  const unique = historicalAttendances.filter(({ event }) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });

  for (const { when, event } of unique) {
    const points = event.points ?? randInt(20, 80);
    totalPoints += points;

    // Registration row (created_at = ~3 days before event)
    const registeredAt = new Date(when.getTime() - 3 * 24 * 60 * 60 * 1000);
    const qrToken = `qr_${userId.slice(0, 8)}_${event.id.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const { data: reg, error: regErr } = await sb
      .from("registrations")
      .insert({
        user_id: userId,
        event_id: event.id,
        qr_token: qrToken,
        status: "confirmed",
        checked_in: true,
        check_in_time: when.toISOString(),
        created_at: registeredAt.toISOString(),
        updated_at: when.toISOString(),
      })
      .select()
      .single();
    if (regErr) {
      console.warn(`  ⚠️  reg insert: ${regErr.message}`);
      continue;
    }

    // Attendance row
    const { error: attErr } = await sb.from("attendance").insert({
      registration_id: reg.id,
      user_id: userId,
      event_id: event.id,
      check_in_time: when.toISOString(),
      points_awarded: points,
      created_at: when.toISOString(),
    });
    if (attErr) console.warn(`  ⚠️  attendance: ${attErr.message}`);
  }

  // Add 3 future registrations (upcoming events the user has signed up for)
  const futureEvents = events
    .filter((e) => new Date(e.date) > now)
    .slice(0, 3);
  for (const event of futureEvents) {
    const qrToken = `qr_${userId.slice(0, 8)}_${event.id.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await sb.from("registrations").insert({
      user_id: userId,
      event_id: event.id,
      qr_token: qrToken,
      status: "confirmed",
      checked_in: false,
    });
  }

  // Update profile points + events_attended
  await sb
    .from("profiles")
    .update({
      total_points: totalPoints,
      events_attended: unique.length,
    })
    .eq("id", userId);

  console.log(
    `✅ Activity: ${unique.length} past events, ${futureEvents.length} upcoming, ${totalPoints} pts`,
  );
  return { totalPoints, eventsAttended: unique.length, clubs };
}

// ---------- 4. Award badges ----------
async function awardBadges(userId, totalPoints, eventsAttended) {
  const { data: badges } = await sb
    .from("badges")
    .select("id, name, requirement_type, requirement_value");
  if (!badges) return [];

  const earned = [];
  for (const b of badges) {
    let eligible = false;
    if (b.requirement_type === "events_attended") {
      eligible = eventsAttended >= (b.requirement_value ?? 0);
    } else if (b.requirement_type === "points_earned") {
      eligible = totalPoints >= (b.requirement_value ?? 0);
    } else if (b.requirement_type === "special") {
      eligible = Math.random() > 0.5; // half-and-half on specials
    }
    if (eligible) {
      const earnedAt = new Date(
        Date.now() - randInt(7, 300) * 24 * 60 * 60 * 1000,
      );
      const { error } = await sb.from("user_badges").insert({
        user_id: userId,
        badge_id: b.id,
        earned_at: earnedAt.toISOString(),
      });
      if (!error) earned.push(b.name);
    }
  }
  console.log(`✅ Earned ${earned.length} badges: ${earned.join(", ")}`);
  return earned;
}

// ---------- 5. Notifications ----------
async function seedNotifications(userId, clubs, badgesEarned) {
  const now = new Date();
  const notes = [];

  // Recent unread
  notes.push({
    user_id: userId,
    title: "Reminder: Phonia Auditions tomorrow",
    message:
      "Phonia Auditions starts tomorrow at 16:30 in Music Room, Cultural Center. Come prepared!",
    type: "reminder",
    icon: "bell",
    color: "#F59E0B",
    is_read: false,
    created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
  });
  notes.push({
    user_id: userId,
    title: "New event from GitHub Club",
    message: "Gitathon registration is now open. 100 points up for grabs!",
    type: "event",
    icon: "calendar",
    color: "#3B82F6",
    is_read: false,
    created_at: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
  });
  notes.push({
    user_id: userId,
    title: "You're in the top 10! 🏆",
    message: "You moved up to rank #4 on the campus leaderboard this month.",
    type: "social",
    icon: "trending-up",
    color: "#10B981",
    is_read: false,
    created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
  });

  // Older read
  for (const badgeName of badgesEarned.slice(0, 3)) {
    notes.push({
      user_id: userId,
      title: `New Badge: ${badgeName} 🏅`,
      message: `Congrats — you earned the ${badgeName} badge!`,
      type: "badge",
      icon: "award",
      color: "#A855F7",
      is_read: true,
      created_at: new Date(
        now.getTime() - randInt(14, 90) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  }

  notes.push({
    user_id: userId,
    title: "Check-in successful",
    message: "Your check-in for DevFest 2026 was confirmed. +100 points!",
    type: "points",
    icon: "check-circle",
    color: "#10B981",
    is_read: true,
    created_at: new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  });

  await sb.from("notifications").insert(notes);
  console.log(`✅ ${notes.length} notifications seeded`);
}

// ---------- main ----------
async function main() {
  const user = await ensureUser();
  await fillProfile(user.id);
  const { totalPoints, eventsAttended, clubs } = await generateActivity(user.id);
  const earned = await awardBadges(user.id, totalPoints, eventsAttended);
  await seedNotifications(user.id, clubs, earned);

  console.log("\n🎉 Demo user ready");
  console.log(`   Email:    ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
  console.log(`   Points:   ${totalPoints}`);
  console.log(`   Events:   ${eventsAttended}`);
  console.log(`   Badges:   ${earned.length}`);
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
