import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "App",
  robots: { index: false, follow: false },
};

export default function AppPlaceholderPage() {
  return (
    <main className="shell page prose">
      <h1>Application console</h1>
      <p>
        Signed-in workspace tools are not available in this phase.{" "}
        <Link href="/en/">Return to the public site</Link>.
      </p>
    </main>
  );
}
