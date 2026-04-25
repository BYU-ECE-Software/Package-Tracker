'use client';

import { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import type { IconType } from 'react-icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastProps = {
  type: ToastType;
  title: string;
  message: string;
  onClose?: () => void;
  duration?: number; // ms
};

const typeStyles: Record<
  ToastType,
  {
    borderColor: string;
    iconColor: string;
    Icon: IconType;
  }
> = {
  success: {
    borderColor: 'border-byu-green-bright',
    iconColor: 'text-byu-green-bright',
    Icon: FaCheckCircle,
  },
  error: {
    borderColor: 'border-byu-red-bright',
    iconColor: 'text-byu-red-bright',
    Icon: FaTimesCircle,
  },
  info: {
    borderColor: 'border-byu-info-blue-bright',
    iconColor: 'text-byu-info-blue-bright',
    Icon: FaInfoCircle,
  },
  warning: {
    borderColor: 'border-byu-yellow-bright',
    iconColor: 'text-byu-yellow-bright',
    Icon: FaExclamationTriangle,
  },
};

export default function Toast({ type, title, message, onClose, duration = 5000 }: ToastProps) {
  const { borderColor, iconColor, Icon } = typeStyles[type];

  // controls animation state
  const [visible, setVisible] = useState(false);

  // how long the fade-out takes (keep in sync with class duration)
  const EXIT_MS = 180;

  // animate in on mount
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 10);
    return () => window.clearTimeout(t);
  }, []);

  // auto-dismiss with fade-out
  useEffect(() => {
    if (!onClose) return;

    const closeTimer = window.setTimeout(() => {
      setVisible(false); // start fade-out
      window.setTimeout(() => onClose(), EXIT_MS); // unmount after fade-out
    }, duration);

    return () => window.clearTimeout(closeTimer);
  }, [onClose, duration]);

  const handleClose = () => {
    if (!onClose) return;
    setVisible(false);
    window.setTimeout(() => onClose(), EXIT_MS);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'flex items-start rounded border-l-4 bg-white p-4 shadow-md',
        borderColor,

        // animation
        'transform transition-all ease-out',
        `duration-[${EXIT_MS}ms]`,
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      ].join(' ')}
    >
      {/* Icon */}
      <div className="mt-1 mr-3">
        <Icon className={`text-xl ${iconColor}`} />
      </div>

      {/* Title + message */}
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-600">{message}</p>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close notification"
          className="ml-4 text-lg font-bold text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      )}
    </div>
  );
}
