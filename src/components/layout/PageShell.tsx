"use client";

/**
 * PageShell — قالب مشترک محتوای صفحات Plus Varzesh
 * هدر و داک شناور در FixedChrome (RootLayout) رندر می‌شوند؛ این کامپوننت فقط
 * padding پایین برای فضای داک و badge اختیاری تامین می‌کند (رفع باگ هدر در هدر).
 */

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** بک‌ورورد سازگاری — دیگر رندر نمی‌شود (هدر در FixedChrome است) */
  badge?: string;
  /** بک‌ورورد سازگاری — دیگر رندر نمی‌شود */
  activeDock?: "home" | "matches" | "videos" | "favorites" | "profile";
};

export function PageShell({ children }: Props) {
  return <div className="min-h-screen pb-24" style={{ background: "#252525" }}>{children}</div>;
}
