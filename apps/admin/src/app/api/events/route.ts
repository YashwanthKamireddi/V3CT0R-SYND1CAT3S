import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Create admin client that bypasses RLS
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Use service role if available, otherwise anon key
  const key = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase.from("events").insert({
      title: body.title,
      description: body.description || null,
      date: body.date,
      end_date: body.end_date || null,
      location: body.location || null,
      venue: body.venue || null,
      max_attendees: body.max_attendees ? parseInt(body.max_attendees) : null,
      club_id: body.club_id || null,
      image_url: body.image_url || null,
      category: body.category || "general",
      is_active: body.is_active ?? true,
      points: body.points ? parseInt(body.points) : 10,
    }).select().single();

    if (error) {
      console.error("Event creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data, success: true });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        clubs (id, name, logo_url)
      `)
      .order("date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
