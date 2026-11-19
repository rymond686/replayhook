import { NextResponse } from "next/server";
import { parseAnalyticsRequestBody } from "@/lib/analytics";
import { getSupabaseServiceClient } from "@/lib/supabase";

/**
 * Optional server route for a future Node host. It is not part of the
 * GitHub Pages static export (which posts to the Supabase Edge Function).
 * Success is returned only when the sanitized event is persisted.
 * Missing credentials are a failure, not a silent ok.
 */
export async function POST(request: Request) {
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = parseAnalyticsRequestBody(raw);
  if ("error" in parsed) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: parsed.status });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, persisted: false, error: "Analytics persistence is not configured." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("analytics_events").insert({
    event: parsed.event,
    path: parsed.path,
    source: parsed.source,
  });
  if (error) {
    return NextResponse.json({ ok: false, persisted: false, error: "Unable to store event." }, { status: 503 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
