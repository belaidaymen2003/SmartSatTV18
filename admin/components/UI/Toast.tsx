"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose: () => void;
  duration?: number;
};

export default function Toast({ message, type = "info", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const color =
    type === "success"
      ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
      : type === "error"
      ? "border-red-500/40 text-red-300 bg-red-500/10"
      : type === "warning"
      ? "border-yellow-500/40 text-yellow-300 bg-yellow-500/10"
      : "border-white/20 text-white/80 bg-white/10";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 left-4 sm:left-auto z-[60] max-w-sm sm:max-w-md rounded-lg border px-4 py-3 backdrop-blur-md shadow-lg ${color}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 text-sm">{message}</div>
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="px-2 py-1 rounded hover:bg-white/10"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
