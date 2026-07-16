// Uploads the user's portrait as the demo user's avatar
// and updates the profile name to "Yashwanth Kamireddi"

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

const SUPABASE_URL = "https://usmjkvbzktxxmaffwdyd.supabase.co";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY) { console.error("Need SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

const sb = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "club-assets"; // reuse existing public bucket
const PATH = "demo/yashwanth-avatar.webp";
const LOCAL = "/tmp/yash-avatar.webp";

const buf = await readFile(LOCAL);
const { error: upErr } = await sb.storage
  .from(BUCKET)
  .upload(PATH, buf, { contentType: "image/webp", upsert: true });
if (upErr) { console.error("upload:", upErr); process.exit(1); }
const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(PATH);
console.log("avatar URL:", pub.publicUrl);

const { error: updErr } = await sb
  .from("profiles")
  .update({
    full_name: "Yashwanth Kamireddi",
    avatar_url: pub.publicUrl,
  })
  .eq("email", "demo@gitam.edu");
if (updErr) { console.error("update:", updErr); process.exit(1); }
console.log("✅ profile updated");
