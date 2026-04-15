"use client";

import type { ReactNode } from "react";
import BaseModal from "@/components/ui/BaseModal";

type Variant = "danger" | "primary";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: string;

  confirmLabel?: string;
  cancelLabel?: string;

  busy?: boolean;
  busyLabel?: string;

  variant?: Variant;

  closeOnBackdrop?: boolean;

  onConfirm: () => void;
  onCancel: () => void;

  icon?: ReactNode;
  children?: ReactNode; // optional custom body (replaces message)
};

export default function ConfirmModal({
  open,
  title = "Confirm action",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busy = false,
  busyLabel = "Working…",
  variant = "danger",
  closeOnBackdrop = true,
  onConfirm,
  onCancel,
  icon,
  children,
}: ConfirmModalProps) {
  const confirmBtnClass =
    variant === "danger"
      ? "bg-red-600 hover:brightness-95 active:brightness-90"
      : "bg-byu-royal enabled:hover:bg-[#003C9E]";

  return (
    <BaseModal
      open={open}
      title={title}
      size="sm"
      saving={busy}
      saveLabel={busy ? busyLabel : confirmLabel}
      submitDisabled={busy}
      onClose={() => {
        if (!closeOnBackdrop) return;
        if (busy) return;
        onCancel();
      }}
      onSubmit={() => {
        if (busy) return;
        onConfirm();
      }}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-3 py-1 rounded-lg border text-byu-navy hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>

          <button
            type="submit"
            disabled={busy}
            className={`px-3 py-1 rounded-lg text-white shadow-sm transition enabled:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${confirmBtnClass}`}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {icon ? <div>{icon}</div> : null}

        {children ? (
          children
        ) : message ? (
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {message}
          </div>
        ) : null}
      </div>
    </BaseModal>
  );
}
