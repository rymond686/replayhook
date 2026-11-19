import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <main className="shell page prose">
      <h1>Dashboard</h1>
      <p>
        The ReplayHook workspace console is not part of this phase. The public diagnostic demo
        and event inspector do not require an account.{" "}
        <Link href="/en/">Return to the public site</Link>.
      </p>
    </main>
  );
}
