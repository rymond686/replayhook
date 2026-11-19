import { NextResponse } from "next/server";
import { sanitizeAnalyticsEvent } from "@/lib/analytics";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const sanitized = sanitizeAnalyticsEvent(body);
  if ("error" in sanitized) {
    return NextResponse.json({ ok: false, error: sanitized.error }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("analytics_events").insert({
      event: sanitized.event,
      path: sanitized.path,
      source: sanitized.source,
    });
    if (error) {
      return NextResponse.json({ ok: false, error: "Unable to store event." }, { status: 503 });
    }
  }

  return NextResponse.json({ ok: true, persisted: Boolean(supabase) });
}
