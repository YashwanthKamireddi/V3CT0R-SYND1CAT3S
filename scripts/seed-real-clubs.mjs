// Uploads real club & event images to Supabase Storage and replaces
// placeholder seed data with the actual GITAM clubs.
//
// Run from repo root with:  node scripts/seed-real-clubs.mjs

import { createClient } from "@supabase/supabase-js";
import { readFile, readdir } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "..");

const SUPABASE_URL = "https://usmjkvbzktxxmaffwdyd.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY env var first.");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BUCKET = "club-assets";

// ---------- Real club data ----------
const CLUBS = [
  {
    slug: "gdg",
    name: "GDG GITAM",
    category: "technical",
    description:
      "Google Developer Group at GITAM. Cloud, AI/ML, web, and mobile dev workshops, study jams, and DevFest events.",
    email: "gdg@gitam.edu",
    folder: "Tech clubs/GDG",
    logo: "Logo.png",
    events: [
      {
        file: "Cloud Study Jams.png",
        title: "Cloud Study Jams",
        category: "workshop",
        description:
          "Hands-on Google Cloud labs covering compute, storage, networking and serverless. Earn Google badges as you complete quests.",
        days_from_now: 5,
        time: "10:00",
        venue: "Computer Lab 3, Tech Building",
        capacity: 60,
        points: 50,
      },
      {
        file: "DevFest.png",
        title: "DevFest 2026",
        category: "tech",
        description:
          "GITAM's flagship developer conference. Talks on Android, web, AI, and cloud. Hackathon, swag, and networking with industry speakers.",
        days_from_now: 21,
        time: "09:00",
        venue: "Main Auditorium",
        capacity: 300,
        points: 100,
      },
      {
        file: "Generative AI Session.png",
        title: "Generative AI Session",
        category: "seminar",
        description:
          "Deep-dive into LLMs, prompt engineering, RAG and building production GenAI apps with Gemini.",
        days_from_now: 12,
        time: "15:00",
        venue: "Seminar Hall 2",
        capacity: 120,
        points: 40,
      },
    ],
  },
  {
    slug: "github-club",
    name: "GitHub Club",
    category: "technical",
    description:
      "Open-source, version control, and competitive coding club. Hackathons, CTFs, and Git workflow workshops.",
    email: "github@gitam.edu",
    folder: "Tech clubs/GitHub",
    logo: "Logo.png",
    events: [
      {
        file: "Gitathon.png",
        title: "Gitathon",
        category: "competition",
        description:
          "24-hour open-source hackathon. Contribute to real projects, fix issues, and ship features. Prizes for top contributors.",
        days_from_now: 14,
        time: "09:00",
        venue: "Innovation Hub",
        capacity: 150,
        points: 100,
      },
      {
        file: "Code Warz.png",
        title: "Code Warz",
        category: "competition",
        description:
          "Competitive coding tournament. DSA problems, ACM-style. Solo and team rounds with leaderboard tracking.",
        days_from_now: 7,
        time: "10:00",
        venue: "Computer Lab 1 & 2",
        capacity: 80,
        points: 60,
      },
      {
        file: "Data Detective.png",
        title: "Data Detective",
        category: "competition",
        description:
          "Data-analytics challenge: explore real datasets, build insights, and present findings. Python/SQL skills welcome.",
        days_from_now: 18,
        time: "11:00",
        venue: "Computer Lab 4",
        capacity: 50,
        points: 50,
      },
      {
        file: "Escape the Web.png",
        title: "Escape the Web",
        category: "competition",
        description:
          "Web security CTF. Find vulnerabilities, exploit them, capture flags. Learn OWASP Top 10 the fun way.",
        days_from_now: 25,
        time: "14:00",
        venue: "Cyber Security Lab",
        capacity: 40,
        points: 75,
      },
    ],
  },
  {
    slug: "gusac",
    name: "GUSAC",
    category: "cultural",
    description:
      "GITAM University Students' Activity Council. Carnival, Holi Fiesta, and major campus celebrations.",
    email: "gusac@gitam.edu",
    folder: "Cultural clubs/Gusac",
    logo: "Gusac Logo.png",
    events: [
      {
        file: "Carnival 10.0.png",
        title: "Carnival 10.0",
        category: "cultural",
        description:
          "GITAM's biggest cultural fest. Music, dance, food stalls, celebrity nights, and competitions across departments.",
        days_from_now: 30,
        time: "16:00",
        venue: "Main Grounds",
        capacity: 1000,
        points: 30,
      },
      {
        file: "Holi Fiesta Poster.png",
        title: "Holi Fiesta",
        category: "cultural",
        description:
          "Festival of colours celebration with music, organic colours, sweets, and dance performances.",
        days_from_now: 9,
        time: "10:00",
        venue: "Cultural Center Lawn",
        capacity: 500,
        points: 25,
      },
    ],
  },
  {
    slug: "kalakriti-dance",
    name: "Kalakriti — Dance Club",
    category: "cultural",
    description:
      "Dance wing of Kalakriti. Choreography, flash mobs, performances at every campus event.",
    email: "dance@gitam.edu",
    folder: "Cultural clubs/Kalakriti/Dance Club",
    logo: "Logo.png",
    events: [
      {
        file: "Auditions poster.png",
        title: "Dance Club Auditions",
        category: "cultural",
        description:
          "Open auditions for the Dance Club. All styles welcome — hip-hop, classical, contemporary, freestyle.",
        days_from_now: 4,
        time: "17:00",
        venue: "Cultural Center Hall A",
        capacity: 100,
        points: 20,
      },
      {
        file: "FlashMob poster.png",
        title: "FlashMob",
        category: "cultural",
        description:
          "Surprise flash mob performance across campus. Practice sessions all week, performance day announced.",
        days_from_now: 11,
        time: "12:30",
        venue: "Main Quad",
        capacity: 200,
        points: 30,
      },
    ],
  },
  {
    slug: "kalakriti-phonia",
    name: "Kalakriti — Phonia",
    category: "cultural",
    description:
      "Music wing of Kalakriti. Live jam sessions, harmony hours, vocal & instrumental performances.",
    email: "music@gitam.edu",
    folder: "Cultural clubs/Kalakriti/Phonia Club",
    logo: "Logo.png",
    events: [
      {
        file: "Auditions.png",
        title: "Phonia Auditions",
        category: "cultural",
        description:
          "Phonia music club auditions. Vocalists, guitarists, drummers, keyboardists — everyone welcome.",
        days_from_now: 3,
        time: "16:30",
        venue: "Music Room, Cultural Center",
        capacity: 60,
        points: 20,
      },
      {
        file: "Harmony Hour.png",
        title: "Harmony Hour",
        category: "cultural",
        description:
          "Open mic + collaborative jam. Bring your instrument, sing along, or just listen. Refreshments provided.",
        days_from_now: 8,
        time: "18:00",
        venue: "Campus Cafe Stage",
        capacity: 80,
        points: 25,
      },
    ],
  },
];

// ---------- Bucket setup ----------
async function ensureBucket() {
  const { data: buckets } = await sb.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await sb.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    });
    if (error) throw error;
    console.log(`✅ Created bucket "${BUCKET}"`);
  } else {
    console.log(`ℹ️  Bucket "${BUCKET}" already exists`);
  }
}

async function uploadImage(localPath, remotePath) {
  const buf = await readFile(localPath);
  const ext = extname(localPath).toLowerCase();
  const contentType =
    ext === ".png" ? "image/png" : ext === ".jpg" ? "image/jpeg" : "image/png";
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(remotePath, buf, { contentType, upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from(BUCKET).getPublicUrl(remotePath);
  return data.publicUrl;
}

// ---------- Main seed flow ----------
async function reseed() {
  await ensureBucket();

  // Wipe existing placeholder data (cascades to dependent tables via FK).
  // Safer than DELETE because of foreign keys.
  console.log("Clearing old events + clubs...");
  await sb.from("events").delete().not("id", "is", null);
  await sb.from("clubs").delete().not("id", "is", null);

  for (const c of CLUBS) {
    const folder = join(repoRoot, c.folder);
    const logoUrl = await uploadImage(
      join(folder, c.logo),
      `${c.slug}/${c.logo}`,
    );
    console.log(`📷 ${c.name} logo → ${logoUrl}`);

    const { data: club, error: clubErr } = await sb
      .from("clubs")
      .insert({
        name: c.name,
        slug: c.slug,
        category: c.category,
        description: c.description,
        email: c.email,
        logo_url: logoUrl,
        banner_url: logoUrl,
        member_count: Math.floor(Math.random() * 200) + 50,
        is_active: true,
      })
      .select()
      .single();
    if (clubErr) throw clubErr;
    console.log(`✅ Inserted club ${club.name} (${club.id})`);

    for (const ev of c.events) {
      const evUrl = await uploadImage(
        join(folder, ev.file),
        `${c.slug}/events/${ev.file}`,
      );
      const date = new Date();
      date.setDate(date.getDate() + ev.days_from_now);
      const [hh, mm] = ev.time.split(":").map(Number);
      date.setHours(hh, mm, 0, 0);
      const endDate = new Date(date.getTime() + 3 * 60 * 60 * 1000); // +3h

      const { error: evErr } = await sb.from("events").insert({
        club_id: club.id,
        title: ev.title,
        slug: `${c.slug}-${ev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
        description: ev.description,
        date: date.toISOString(),
        end_date: endDate.toISOString(),
        location: ev.venue,
        venue: ev.venue,
        venue_address: ev.venue,
        category: ev.category,
        max_attendees: ev.capacity,
        current_attendees: Math.floor(Math.random() * (ev.capacity * 0.6)),
        points: ev.points,
        image_url: evUrl,
        is_active: true,
        is_featured: ev.points >= 75,
      });
      if (evErr) throw evErr;
      console.log(`  ✓ Event "${ev.title}"`);
    }
  }

  const { count: clubCount } = await sb
    .from("clubs")
    .select("*", { count: "exact", head: true });
  const { count: eventCount } = await sb
    .from("events")
    .select("*", { count: "exact", head: true });
  console.log(`\n🎉 Done. ${clubCount} clubs, ${eventCount} events seeded.`);
}

reseed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
