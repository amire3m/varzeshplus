import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FixedChrome } from "@/components/layout/FixedChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "ورزش پلاس — باشگاه شب مسابقه",
  description: "بازی کن، پیش‌بینی کن، رقابت کن. مکمل دیجیتال شبکه ورزش سیما — تم ترکیبی Match Night Club",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Vazirmatn:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen bg-background text-on-surface">
        <FixedChrome />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
