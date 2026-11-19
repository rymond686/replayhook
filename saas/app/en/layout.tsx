import { SiteFooter, SiteHeader } from "@/app/components/SiteChrome";

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
