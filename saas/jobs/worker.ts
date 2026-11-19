import { getSupabaseServiceClient, isSupabaseConfigured } from "../lib/supabase";
import { InMemoryJobQueue } from "./queue";

/**
 * Web process companion: a worker for later background processing and
 * failed-job recovery. Phase 1 does not ingest production webhooks, so
 * this process is a dry-run unless Supabase is configured with a jobs table.
 */
async function recoverFailedJobs(): Promise<number> {
  const client = getSupabaseServiceClient();
  if (!client) {
    const queue = new InMemoryJobQueue();
    return queue.retryFailed().length;
  }

  const { data, error } = await client
    .from("jobs")
    .select("id, attempts, max_attempts")
    .eq("status", "failed");

  if (error) {
    console.error("[replayhook-worker] failed to list jobs:", error.message);
    return 0;
  }

  let recovered = 0;
  for (const job of data ?? []) {
    if (job.attempts >= job.max_attempts) continue;
    const { error: updateError } = await client
      .from("jobs")
      .update({ status: "queued", last_error: null, updated_at: new Date().toISOString() })
      .eq("id", job.id)
      .eq("status", "failed");
    if (updateError) {
      console.error("[replayhook-worker] could not requeue", job.id, updateError.message);
    } else {
      recovered += 1;
    }
  }
  return recovered;
}

async function main(): Promise<void> {
  const supabaseReady = isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log(
    `[replayhook-worker] starting (supabase=${supabaseReady ? "configured" : "not configured"}; phase-1 dry-run is expected without credentials)`,
  );

  const recovered = await recoverFailedJobs();
  console.log(`[replayhook-worker] recovered ${recovered} failed job(s)`);

  if (process.argv.includes("--once")) {
    return;
  }

  const interval = setInterval(() => {
    void recoverFailedJobs()
      .then((count) => {
        if (count > 0) console.log(`[replayhook-worker] recovered ${count} failed job(s)`);
      })
      .catch((error: unknown) => {
        console.error("[replayhook-worker] poll failed", error);
      });
  }, 30_000);

  const shutdown = () => {
    clearInterval(interval);
    console.log("[replayhook-worker] stopped");
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void main();
