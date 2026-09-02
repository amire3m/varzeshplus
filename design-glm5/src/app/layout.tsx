import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ورزش پلاس — باشگاه پیش‌بینی ورزشی",
  description: "باشگاه پیش‌بینی ورزشی گیمیفای‌شده شبکه ورزش پلاس. پیش‌بینی کن، رقابت کن، برنده باش.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-ink-pitch text-floodlight antialiased font-vazir min-h-screen">
        {children}
      </body>
    </html>
  );
}
