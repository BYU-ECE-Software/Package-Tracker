'use client';

import { useEffect } from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { ToastProps } from '@/types/toast';

// ─── Types ────────────────────────────────────────────────────────────────────

const typeStyles: Record<
  'success' | 'error' | 'info' | 'warning',
  { borderColor: string; iconColor: string; Icon: IconType }
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function Toast({
  type,
  title,
  message,
  onClose,
  duration = 4000,
}: ToastProps) {
  const { borderColor, iconColor, Icon } = typeStyles[type];

  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in-out">
      <div
        className={`flex items-start gap-3 p-4 bg-white rounded-lg shadow-md border-l-4 ${borderColor}`}
      >
        <Icon className={`text-xl mt-0.5 shrink-0 ${iconColor}`} />

        <div className="flex-1">
          <h4 className="font-semibold text-byu-navy">{title}</h4>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold leading-none"
            aria-label="Dismiss"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}