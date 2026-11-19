export type JobStatus = "queued" | "running" | "succeeded" | "failed";

export type Job = {
  id: string;
  name: string;
  payload: Record<string, never>;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  workspaceId?: string;
};

/**
 * In-process queue used when Supabase is not configured.
 * Phase 1 does not enqueue production webhook work.
 */
export class InMemoryJobQueue {
  private jobs = new Map<string, Job>();

  enqueue(job: Job): void {
    this.jobs.set(job.id, { ...job });
  }

  list(): Job[] {
    return [...this.jobs.values()].map((job) => ({ ...job }));
  }

  retryFailed(nowAttempt = (job: Job): Job => {
    if (job.status !== "failed") return job;
    if (job.attempts >= job.maxAttempts) return job;
    return { ...job, status: "queued", lastError: undefined };
  }): Job[] {
    const recovered: Job[] = [];
    for (const [id, job] of this.jobs) {
      const next = nowAttempt(job);
      this.jobs.set(id, next);
      if (job.status === "failed" && next.status === "queued") {
        recovered.push({ ...next });
      }
    }
    return recovered;
  }
}
