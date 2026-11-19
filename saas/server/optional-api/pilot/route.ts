import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/site";
import { getSupabaseClient } from "@/lib/supabase";
import { resolveSource } from "@/lib/analytics";

/**
 * Optional persistence for paid-pilot applications when Supabase is configured.
 * The public form uses mailto so applications work without credentials.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid body." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const message = typeof record.message === "string" ? record.message.trim().slice(0, 2000) : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "A work email is required." }, { status: 400 });
  }

  const source = resolveSource({
    searchParams: null,
    referrer: request.headers.get("referer"),
  });

  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("pilot_applications").insert({
      email,
      message: message || null,
      source,
    });
    if (error) {
      return NextResponse.json({ ok: false, error: "Unable to store application." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, persisted: true });
  }

  return NextResponse.json({
    ok: true,
    persisted: false,
    contact: CONTACT_EMAIL,
    message: "No database is configured. Send the application to the contact email instead.",
  });
}
