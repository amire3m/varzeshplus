"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end" aria-modal="true" role="dialog">
      <button
        aria-label="بستن"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />
      <div className="relative bg-[#101610] border-t border-white/10 rounded-t-2xl max-h-[85vh] flex flex-col animate-[sheetIn_0.28s_cubic-bezier(0.22,1,0.36,1)]">
        <div className="flex items-center justify-center pt-2 pb-1">
          <span className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <h3 className="text-sm font-black text-white">{title}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-4 flex-1">{children}</div>
      </div>
      <style>{`@keyframes sheetIn { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}
