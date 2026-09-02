"use client";

import { Tv, Archive, BookOpen, Headphones, User, ChevronLeft } from "lucide-react";

interface QuickLink {
  id: number;
  title: string;
  href: string;
  icon: string;
  order: number;
}

const iconMap: Record<string, React.ElementType> = {
  tv: Tv,
  archive: Archive,
  book: BookOpen,
  headphones: Headphones,
  user: User,
};

export default function QuickAccess({ links }: { links: QuickLink[] }) {
  return (
    <div className="card-panel p-4">
      <h2 className="text-base font-black text-floodlight tracking-tight mb-4">دسترسی سریع</h2>
      <div className="space-y-2">
        {links.map((link) => {
          const Icon = iconMap[link.icon] || Tv;
          return (
            <a
              key={link.id}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 border border-panel-border hover:border-club-green/30 hover:bg-club-green/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-glow-electric/10 flex items-center justify-center shrink-0 group-hover:bg-glow-electric/20 transition-colors">
                <Icon className="w-4 h-4 text-glow-electric" />
              </div>
              <span className="text-sm font-medium text-floodlight/70 group-hover:text-floodlight transition-colors flex-1">
                {link.title}
              </span>
              <ChevronLeft className="w-4 h-4 text-floodlight/20 group-hover:text-club-green transition-colors" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
