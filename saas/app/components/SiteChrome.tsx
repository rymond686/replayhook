import Link from "next/link";
import { CONTACT_EMAIL, LEGAL_NAV, PRODUCT_NAME, PUBLIC_NAV } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/en/">
          {PRODUCT_NAME}
        </Link>
        <nav className="nav" aria-label="Primary">
          {PUBLIC_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/en/pricing/#apply">Apply for a paid pilot</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-meta">
          <strong>{PRODUCT_NAME}</strong>
          <span>Read-only Stripe payment and order reconciliation.</span>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
        <nav className="legal-nav" aria-label="Legal and site information">
          {LEGAL_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
