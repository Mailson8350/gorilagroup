import { ReactNode } from "react";
import SeoHead from "./SeoHead";
import CookieConsent from "./CookieConsent";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <SeoHead title={title} />
      <Navbar />
      <CookieConsent />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
