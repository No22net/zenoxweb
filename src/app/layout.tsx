import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://zenoxweb.ir"),
  title: {
    default: "ZeNOxWeb | طراحی سایت حرفه‌ای با Next.js",
    template: "%s | ZeNOxWeb",
  },
  description:
    "ZeNOxWeb مارکت‌پلیس قالب‌های آماده و طراحی سایت اختصاصی با Next.js؛ سایت فروشگاهی، رزومه‌ای و شرکتی همراه با میزبانی و پشتیبانی.",
  keywords: [
    "سایت ساز",
    "طراح سایت Next.js",
    "طراحی سایت حرفه ای",
    "ساخت سایت فروشگاهی",
    "ساخت سایت رزومه",
  ],
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "ZeNOxWeb",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
