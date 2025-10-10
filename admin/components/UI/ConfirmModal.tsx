"use client";

type ConfirmModalProps = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-md bg-black/40 border border-white/10 rounded-xl p-5 backdrop-blur-md shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        <div className="text-white/80 text-sm">{message}</div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} className="px-4 py-2 rounded border border-white/20 text-white/80 hover:bg-white/10">{cancelText}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded border border-red-500 text-red-400 hover:bg-red-500/10">{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
