import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function NotificationToast({
  show,
  message,
  type = "info",
  onClose,
  duration = 2600,
}) {
  useEffect(() => {
    if (!show) return undefined;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, onClose, duration]);

  if (!show) return null;

  const toneClass =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className="fixed right-4 top-22 z-120 w-[min(92vw,360px)]">
      <div className={`flex items-start justify-between gap-2 rounded-xl border px-3 py-2 shadow-lg ${toneClass}`}>
        <p className="text-sm">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 opacity-70 transition hover:opacity-100"
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
