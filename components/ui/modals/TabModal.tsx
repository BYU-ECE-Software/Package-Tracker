"use client";

import { useEffect, useId } from "react";
import type { ReactNode, KeyboardEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalSize = "sm" | "md" | "lg";

export type TabConfig = {
  key: string;
  label: string;
  content: ReactNode;
};

type TabModalProps = {
  open: boolean;
  title?: string;
  size?: ModalSize;
  onClose: () => void;

  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (key: string) => void;

  footer?: ReactNode; // custom footer if needed
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TabModal({
  open,
  title,
  size = "md",
  onClose,
  tabs,
  activeTab,
  onTabChange,
  footer,
}: TabModalProps) {
  const titleId = useId();

  const sizeClass =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  // Scroll lock + scrollbar-shift compensation
  useEffect(() => {
    if (!open) return;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  const activeTabContent = tabs.find((t) => t.key === activeTab)?.content;

  return (
    <div
      className="fixed inset-0 z-50"
      onKeyDown={handleKeyDown}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? titleId : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`relative w-full ${sizeClass} rounded-2xl bg-white shadow-2xl border border-byu-navy overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="bg-byu-navy px-5 py-4 flex items-center justify-between">
            <div>
              {title && (
                <h3
                  id={titleId}
                  className="text-lg font-semibold text-white"
                >
                  {title}
                </h3>
              )}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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

          {/* ── Tab bar ──────────────────────────────────────────────────────── */}
          <div className="flex border-b border-gray-200 bg-white px-5 pt-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`mr-4 pb-2 text-sm font-medium transition border-b-2 ${
                  activeTab === tab.key
                    ? "border-byu-navy text-byu-navy"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Body ────────────────────────────────────────────────────────── */}
          <div className="overflow-y-auto max-h-[70vh]">
            <div className="px-5 py-4 space-y-4">
              {activeTabContent}
            </div>

            {footer && (
              <>
                <div className="h-px bg-gray-200" />
                <div className="px-5 py-4">{footer}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}