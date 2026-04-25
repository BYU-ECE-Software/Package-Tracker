'use client';

import { useState, useCallback, useRef } from 'react';
import type { ReactElement } from 'react';
import Toast from '@/components/general/feedback/Toast';
import type { ToastProps, ToastType } from '@/components/general/feedback/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastEntry = ToastProps & { id: number };

type ShowToastOptions = {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
};

export type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type UseToastOptions = {
  position?: ToastPosition;
};

export type UseToastReturn = {
  toasts: ToastEntry[];
  showToast: (options: ShowToastOptions) => void;
  ToastContainer: () => ReactElement;
};

// ─── Position classes ─────────────────────────────────────────────────────────

const POSITION_CLASSES: Record<ToastPosition, string> = {
  'top-left':     'top-6 left-6',
  'top-right':    'top-6 right-6',
  'bottom-left':  'bottom-6 left-6',
  'bottom-right': 'bottom-6 right-6',
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages a queue of toasts. Returns a `showToast` trigger and a
 * `ToastContainer` component to render wherever toasts should appear.
 *
 * @param position  Where toasts appear on screen (default: "bottom-right")
 *
 * @example
 * const { showToast, ToastContainer } = useToast({ position: 'top-right' });
 *
 * // In JSX:
 * <ToastContainer />
 *
 * // On an event:
 * showToast({ type: 'success', title: 'Saved', message: 'Your changes were saved.' });
 */
export function useToast({ position = 'bottom-right' }: UseToastOptions = {}): UseToastReturn {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ShowToastOptions) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { ...options, id, onClose: () => dismiss(id) }]);
    },
    [dismiss],
  );

  const ToastContainer = useCallback(
    () => (
      <div
        aria-live="polite"
        className={`fixed z-50 flex flex-col gap-3 w-80 pointer-events-none ${POSITION_CLASSES[position]}`}
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} />
          </div>
        ))}
      </div>
    ),
    [toasts, position],
  );

  return { toasts, showToast, ToastContainer };
}