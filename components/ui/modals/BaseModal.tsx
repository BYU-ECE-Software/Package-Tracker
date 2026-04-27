'use client';

import type { ReactNode, KeyboardEvent } from 'react';
import Button from '@/components/ui/Button';

type ModalSize = 'sm' | 'md' | 'lg';

type BaseModalProps = {
  open: boolean;
  title?: string;
  saving?: boolean;
  saveLabel?: string;
  size?: ModalSize;
  submitDisabled?: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export default function BaseModal({
  open,
  title = '',
  saving = false,
  saveLabel = 'Save',
  size = 'md',
  submitDisabled = false,
  onClose,
  onSubmit,
  children,
  footer,
}: BaseModalProps) {
  // Do not render anything when modal is closed
  if (!open) return null;

  // Pick max width based on modal size
  const sizeClass = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  // Close modal when user presses Escape
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  // Prevent full page form submission
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  // Only connect aria-labelledby when a title exists
  const titleId = title ? 'base-modal-title' : undefined;

  // Use a wrapper so disabled buttons can still show a tooltip
  const Wrapper = submitDisabled ? 'span' : 'div';

  return (
    <div
      className="fixed inset-0 z-50"
      onKeyDown={handleKeyDown}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
    >
      {/* Dark page overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={[
            'border-byu-navy w-full overflow-hidden rounded-2xl border bg-white shadow-2xl',
            sizeClass,
            // leave a buffer so it never hits the viewport edges
            'max-h-[calc(100vh-3rem)]', // 3rem buffer (top+bottom)
            // layout to pin header/footer and scroll body
            'flex flex-col',
          ].join(' ')}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header (fixed) */}
          <div className="bg-byu-navy flex shrink-0 items-center justify-between border-b px-5 py-4">
            <div className="flex items-start gap-2.5">
              {title && (
                <h3 id={titleId} className="text-lg font-semibold text-white">
                  {title}
                </h3>
              )}
            </div>

            <button
              type="button"
              className="cursor-pointer rounded-lg p-2 transition hover:bg-[#335A86]"
              onClick={onClose}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 8.586 5.293 3.879 3.879 5.293 8.586 10l-4.707 4.707 1.414 1.414L10 11.414l4.707 4.707 1.414-1.414L11.414 10l4.707-4.707-1.414-1.414L10 8.586z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Body (scrolls) + Footer (fixed) */}
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            {/* Scroll region */}
            <div className="min-h-0 space-y-4 overflow-y-auto px-5 py-4">{children}</div>

            {/* Divider + footer pinned to bottom */}
            <div className="h-px shrink-0 bg-gray-200" />

            <div className="shrink-0 px-5 py-4">
              {footer ? (
                footer
              ) : (
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={onClose} label="Cancel" />

                  <Wrapper
                    title={submitDisabled ? 'All required fields must be filled.' : undefined}
                  >
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving || submitDisabled}
                      loading={saving}
                      loadingLabel="Saving…"
                      label={saveLabel}
                    />
                  </Wrapper>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
