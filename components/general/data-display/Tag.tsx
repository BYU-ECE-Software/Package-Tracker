import type { ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TagVariant =
  | 'royal' // byu-royal bg — primary/brand
  | 'navy' // byu-navy bg — dark emphasis
  | 'success' // green — positive status
  | 'error' // red — destructive / alert
  | 'warning' // yellow — caution
  | 'info' // blue — neutral info
  | 'gray'; // muted — drafts, disabled, secondary

export type TagSize = 'sm' | 'md';

export type TagProps = {
  label: ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  /** Renders a dismiss × button and calls this when clicked */
  onDismiss?: () => void;
  className?: string;
};

// ─── Style maps ───────────────────────────────────────────────────────────────

const VARIANT_CLASSES: Record<TagVariant, string> = {
  royal: 'bg-byu-royal text-white',
  navy: 'bg-byu-navy text-white',
  success: 'bg-green-50 text-byu-green-dark ring-1 ring-green-200',
  error: 'bg-red-50 text-byu-red-dark ring-1 ring-red-200',
  warning: 'bg-amber-50 text-byu-brown ring-1 ring-amber-200',
  info: 'bg-blue-50 text-byu-info-blue-dark ring-1 ring-blue-200',
  gray: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
};

const SIZE_CLASSES: Record<TagSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
};

const DISMISS_HOVER: Record<TagVariant, string> = {
  royal: 'hover:bg-byu-royal/80',
  navy: 'hover:bg-byu-navy/80',
  success: 'hover:bg-green-100',
  error: 'hover:bg-red-100',
  warning: 'hover:bg-amber-100',
  info: 'hover:bg-blue-100',
  gray: 'hover:bg-gray-200',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A compact label/badge for statuses, categories, filters, and metadata.
 *
 * @param label      Text or JSX content inside the tag
 * @param variant    Colour scheme (default: "royal")
 * @param size       "sm" or "md" (default: "md")
 * @param onDismiss  If provided, renders a × dismiss button
 *
 * @example
 * <Tag label="Live" variant="success" />
 * <Tag label="Draft" variant="gray" size="sm" />
 * <Tag label="TypeScript" variant="info" onDismiss={() => removeTag('ts')} />
 */
export default function Tag({
  label,
  variant = 'royal',
  size = 'md',
  onDismiss,
  className = '',
}: TagProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full font-medium',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Remove ${typeof label === 'string' ? label : 'tag'}`}
          className={['ml-0.5 rounded-full p-0.5 transition-colors', DISMISS_HOVER[variant]].join(
            ' ',
          )}
        >
          <svg viewBox="0 0 12 12" fill="currentColor" className="h-2.5 w-2.5" aria-hidden>
            <path
              d="M1 1l10 10M11 1L1 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
