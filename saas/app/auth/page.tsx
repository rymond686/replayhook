import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function AuthPlaceholderPage() {
  return (
    <main className="shell page prose">
      <h1>Sign in</h1>
      <p>
        Authentication is reserved for a later phase. The public demo does not require sign-in.{" "}
        <Link href="/en/">Return to the public site</Link>.
      </p>
    </main>
  );
}
