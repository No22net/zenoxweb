import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import VisitTracker from "@/components/VisitTracker";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { ensureSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  await ensureSeed();
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);

  return (
    <CartProvider>
      <VisitTracker />
      <Navbar
        user={user ? { name: user.name, role: user.role } : null}
        siteName={settings.siteName}
      />
      <main className="mx-auto w-full max-w-6xl px-3 py-8">{children}</main>
      <Footer settings={settings} />
    </CartProvider>
  );
}
