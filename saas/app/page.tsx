"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/en/");
  }, [router]);

  return (
    <main className="shell page">
      <p>
        Redirecting to the <Link href="/en/">ReplayHook overview</Link>.
      </p>
    </main>
  );
}
