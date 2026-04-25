'use client';

import type { ReactNode } from 'react';
import BaseModal from '@/components/general/overlays/BaseModal';
import Button from '../actions/Button';

// Visual intent of the confirm button
type Variant = 'danger' | 'primary';

type ConfirmModalProps = {
  open: boolean;

  // Header + body content
  title?: string;
  message?: ReactNode;

  // Button labels
  confirmLabel?: string;
  cancelLabel?: string;

  // Busy state (locks UI + swaps label)
  busy?: boolean;
  busyLabel?: string;

  // Controls confirm button styling
  variant?: Variant;

  // Whether clicking backdrop should close modal
  closeOnBackdrop?: boolean;

  // Actions
  onConfirm: () => void;
  onCancel: () => void;

  // Optional visual + custom content
  icon?: ReactNode;
  children?: ReactNode; // overrides message if provided
};

export default function ConfirmModal({
  open,
  title = 'Confirm action',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  busyLabel = 'Working…',
  variant = 'danger',
  closeOnBackdrop = true,
  onConfirm,
  onCancel,
  icon,
  children,
}: ConfirmModalProps) {
  // Determines styling for confirm button based on intent
  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-600 hover:brightness-95 active:brightness-90'
      : 'bg-byu-royal enabled:hover:bg-[#003C9E]';

  return (
    <BaseModal
      open={open}
      title={title}
      size="sm"
      // Sync modal "saving" state with busy state
      saving={busy}
      saveLabel={busy ? busyLabel : confirmLabel}
      submitDisabled={busy}
      // Prevent accidental close while busy or when disabled
      onClose={() => {
        if (!closeOnBackdrop) return;
        if (busy) return;
        onCancel();
      }}
      // Prevent double submits while busy
      onSubmit={() => {
        if (busy) return;
        onConfirm();
      }}
      // Custom footer overrides BaseModal default buttons
      footer={
        <div className="flex justify-end gap-2">
          {/* Cancel button */}
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={busy}
            label={cancelLabel}
          />

          {/* Confirm button */}
          <Button
            type="submit"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            disabled={busy}
            loading={busy}
            loadingLabel={busyLabel}
            label={confirmLabel}
          />
        </div>
      }
    >
      {/* Body content */}
      <div className="space-y-3">
        {/* Optional icon (top-aligned) */}
        {icon ? <div>{icon}</div> : null}

        {/* Prefer custom children over message */}
        {children ? (
          children
        ) : message ? (
          <div className="text-sm whitespace-pre-line text-gray-700">{message}</div>
        ) : null}
      </div>
    </BaseModal>
  );
}
