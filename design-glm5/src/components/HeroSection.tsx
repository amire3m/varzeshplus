"use client";

import { Play, Trophy } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative rounded-2xl overflow-hidden mb-6">
      {/* Background image - real stadium/event photo */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-stadium.jpg"
          alt="استادیوم فوتبال در شب - دربی تهران"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay from bottom for text readability */}
        <div className="hero-gradient absolute inset-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 sm:px-8 py-12 sm:py-16">
        {/* Prize badge - small, next to content, NOT the hero focal point */}
        <div className="inline-flex items-center gap-2 bg-gold-medal/20 border border-gold-medal/30 rounded-full px-3 py-1 mb-4">
          <Trophy className="w-3.5 h-3.5 text-gold-medal" />
          <span className="text-xs font-bold text-gold-medal">جایزه: ۵۰ میلیون تومان</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-floodlight leading-tight tracking-tight mb-3">
          دربی تهران <span className="text-club-green">زنده</span> است
        </h1>

        <p className="text-base sm:text-lg text-floodlight/70 max-w-lg mb-6 leading-relaxed">
          پیش‌بینی نتیجه پرسپولیس و استقلال رو ثبت کن و با هزاران طرفدار رقابت کن.
          الان زنده پخش می‌شه!
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 bg-club-green hover:bg-club-green-dark text-ink-pitch font-bold text-base px-6 py-3 rounded-xl transition-colors shadow-lg shadow-club-green/20">
            <Play className="w-5 h-5" fill="currentColor" />
            شرکت در بازی
          </button>
          <button className="text-floodlight/70 hover:text-floodlight font-medium text-sm px-4 py-3 rounded-xl border border-panel-border-hover hover:border-floodlight/30 transition-colors">
            مشاهده دعوتنامه
          </button>
        </div>

        {/* Participant count */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex -space-x-2 space-x-reverse">
            <div className="w-7 h-7 rounded-full bg-glow-electric border-2 border-ink-pitch flex items-center justify-center text-[10px] font-bold">ع</div>
            <div className="w-7 h-7 rounded-full bg-club-green border-2 border-ink-pitch flex items-center justify-center text-[10px] font-bold text-ink-pitch">س</div>
            <div className="w-7 h-7 rounded-full bg-gold-medal border-2 border-ink-pitch flex items-center justify-center text-[10px] font-bold">ر</div>
            <div className="w-7 h-7 rounded-full bg-panel-dark border-2 border-ink-pitch flex items-center justify-center text-[10px] font-bold text-floodlight/60">+</div>
          </div>
          <span className="text-sm text-floodlight/50">
            <span className="font-bold text-floodlight/80 tabular-nums">۱۲,۸۴۷</span> نفر شرکت‌کننده
          </span>
        </div>
      </div>
    </section>
  );
}
