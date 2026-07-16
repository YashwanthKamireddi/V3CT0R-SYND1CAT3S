// Adds 12 demo peer students with varied points/events for a realistic leaderboard.
// Idempotent: ensures users by email; updates if exists.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://usmjkvbzktxxmaffwdyd.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error("Need SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const sb = createClient(SUPABASE_URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const PEERS = [
  { email: "priya.sharma@gitam.edu", name: "Priya Sharma", branch: "Computer Science", year: 3, points: 1240, events: 24 },
  { email: "arjun.reddy@gitam.edu", name: "Arjun Reddy", branch: "Electronics", year: 2, points: 1080, events: 21 },
  { email: "sneha.patel@gitam.edu", name: "Sneha Patel", branch: "Mechanical", year: 4, points: 920, events: 19 },
  { email: "rahul.gupta@gitam.edu", name: "Rahul Gupta", branch: "Computer Science", year: 3, points: 780, events: 16 },
  { email: "ananya.iyer@gitam.edu", name: "Ananya Iyer", branch: "Electronics & Communication", year: 2, points: 720, events: 15 },
  { email: "vikram.singh@gitam.edu", name: "Vikram Singh", branch: "Civil", year: 4, points: 650, events: 13 },
  { email: "kavya.menon@gitam.edu", name: "Kavya Menon", branch: "IT", year: 3, points: 590, events: 12 },
  // Demo user goes here at 530 pts / 11 events
  { email: "rohan.desai@gitam.edu", name: "Rohan Desai", branch: "Computer Science", year: 1, points: 480, events: 9 },
  { email: "isha.kapoor@gitam.edu", name: "Isha Kapoor", branch: "Mechanical", year: 2, points: 410, events: 8 },
  { email: "aditya.rao@gitam.edu", name: "Aditya Rao", branch: "Electronics", year: 3, points: 350, events: 7 },
  { email: "meera.nair@gitam.edu", name: "Meera Nair", branch: "Biotech", year: 2, points: 280, events: 6 },
  { email: "karan.malhotra@gitam.edu", name: "Karan Malhotra", branch: "Computer Science", year: 1, points: 210, events: 4 },
];

const { data: existing } = await sb.auth.admin.listUsers({ perPage: 1000 });
const existingByEmail = new Map((existing?.users ?? []).map((u) => [u.email, u]));

let created = 0, updated = 0;
for (const p of PEERS) {
  let user = existingByEmail.get(p.email);
  if (!user) {
    const { data, error } = await sb.auth.admin.createUser({
      email: p.email,
      password: "demo1234",
      email_confirm: true,
      user_metadata: { full_name: p.name },
    });
    if (error) { console.warn(`skip ${p.email}: ${error.message}`); continue; }
    user = data.user;
    created++;
  } else {
    updated++;
  }

  await sb.from("profiles").update({
    full_name: p.name,
    email: p.email,
    branch: p.branch,
    year: p.year,
    total_points: p.points,
    events_attended: p.events,
    avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=ffd5dc,b6e3f4,c0aede,d1d4f9,ffdfbf`,
    is_active: true,
    role: "student",
  }).eq("id", user.id);
}

const { count } = await sb.from("profiles").select("*", { count: "exact", head: true });
console.log(`✅ ${created} created, ${updated} updated. Total profiles: ${count}`);
