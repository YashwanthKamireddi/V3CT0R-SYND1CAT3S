// Wipes avatar_url for seeded peer profiles so the Avatar component falls back to initials.
// Demo user (Yashwanth) keeps their uploaded portrait.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://usmjkvbzktxxmaffwdyd.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error("Set SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const sb = createClient(SUPABASE_URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const { error, count } = await sb
  .from("profiles")
  .update({ avatar_url: null }, { count: "exact" })
  .neq("email", "demo@gitam.edu")
  .like("avatar_url", "%dicebear%");

if (error) { console.error(error); process.exit(1); }
console.log(`✅ wiped dicebear avatars from ${count} profiles (kept demo user portrait)`);
