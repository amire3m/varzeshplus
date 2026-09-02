"use client";

import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink-pitch/95 backdrop-blur-md border-b border-panel-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-club-green flex items-center justify-center">
              <Zap className="w-5 h-5 text-ink-pitch" fill="currentColor" />
            </div>
            <span className="text-xl font-black tracking-tight text-floodlight">
              ورزش <span className="text-club-green">پلاس</span>
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#dashboard" className="text-floodlight/80 hover:text-club-green transition-colors">داشبورد</a>
            <a href="#matches" className="text-floodlight/80 hover:text-club-green transition-colors">مسابقات</a>
            <a href="#games" className="text-floodlight/80 hover:text-club-green transition-colors">بازی‌ها</a>
            <a href="#leaderboard" className="text-floodlight/80 hover:text-club-green transition-colors">رتبه‌بندی</a>
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-medium text-floodlight/80 hover:text-floodlight transition-colors px-4 py-2">
              ورود
            </button>
            <button className="text-sm font-bold text-ink-pitch bg-club-green hover:bg-club-green-dark transition-colors px-5 py-2 rounded-lg">
              ثبت‌نام
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-floodlight/80 hover:text-floodlight"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "بستن منو" : "باز کردن منو"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-panel-dark border-t border-panel-border">
          <div className="px-4 py-4 space-y-3">
            <a href="#dashboard" className="block text-floodlight/80 hover:text-club-green transition-colors py-2">داشبورد</a>
            <a href="#matches" className="block text-floodlight/80 hover:text-club-green transition-colors py-2">مسابقات</a>
            <a href="#games" className="block text-floodlight/80 hover:text-club-green transition-colors py-2">بازی‌ها</a>
            <a href="#leaderboard" className="block text-floodlight/80 hover:text-club-green transition-colors py-2">رتبه‌بندی</a>
            <div className="pt-3 flex gap-3">
              <button className="flex-1 text-sm font-medium text-floodlight/80 border border-panel-border-hover rounded-lg py-2">
                ورود
              </button>
              <button className="flex-1 text-sm font-bold text-ink-pitch bg-club-green rounded-lg py-2">
                ثبت‌نام
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
