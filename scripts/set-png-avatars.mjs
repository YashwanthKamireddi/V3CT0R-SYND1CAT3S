// Sets PNG dicebear avatars for seeded peer profiles.
// PNG variant renders correctly in React Native <Image> on iOS (SVG does not).
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://usmjkvbzktxxmaffwdyd.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error("Set SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const sb = createClient(SUPABASE_URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: peers } = await sb
  .from("profiles")
  .select("id, full_name, email")
  .neq("email", "demo@gitam.edu");

const styles = ["avataaars", "personas", "bottts", "lorelei", "notionists"];
const palettes = [
  "ffd5dc,b6e3f4,c0aede",
  "d1d4f9,ffdfbf,f1c0e8",
  "e0bbE4,b3deef,e5d9b6",
];

let updated = 0;
const list = peers ?? [];
for (let i = 0; i < list.length; i++) {
  const p = list[i];
  const style = styles[i % styles.length];
  const palette = palettes[i % palettes.length];
  const url = `https://api.dicebear.com/9.x/${style}/png?seed=${encodeURIComponent(p.full_name ?? p.id)}&backgroundColor=${palette}&size=200`;
  const { error } = await sb.from("profiles").update({ avatar_url: url }).eq("id", p.id);
  if (!error) updated++;
}
console.log(`✅ ${updated} peer profiles got PNG dicebear avatars`);
