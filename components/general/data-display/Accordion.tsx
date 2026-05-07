"use client";

import { useState } from "react";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccordionItem = {
  /** Optional stable key; falls back to index */
  id?: string;
  /** Header text */
  title: string;
  /** Body content — plain string or any JSX */
  content: ReactNode;
};

export type AccordionVariant = "default" | "light" | "minimal";

export type AccordionProps = {
  items: AccordionItem[];
  /**
   * Visual style of each item header.
   * - "default"  → navy background, white text (original style)
   * - "light"    → light grey background, navy text
   * - "minimal"  → no background, bottom-border only
   */
  variant?: AccordionVariant;
  /**
   * When true, multiple items can be open simultaneously.
   * When false (default), opening one closes the others.
   */
  allowMultiple?: boolean;
  /** Index of the item that should be open on first render */
  defaultOpenIndex?: number;
};

// ─── Chevron icon ─────────────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={`h-5 w-5 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.939l3.71-3.71a.75.75 0 111.06 1.061l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
      />
    </svg>
  );
}

// ─── Variant style maps ───────────────────────────────────────────────────────

const HEADER_CLASSES: Record<AccordionVariant, string> = {
  default: "bg-(--color-byu-navy) text-white",
  light:   "bg-gray-100 text-byu-navy hover:bg-gray-200",
  minimal: "bg-transparent text-byu-navy border-b border-gray-200",
};

const WRAPPER_CLASSES: Record<AccordionVariant, string> = {
  default: "card overflow-hidden",
  light:   "card overflow-hidden",
  minimal: "overflow-hidden",
};

// ─── AccordionItem ────────────────────────────────────────────────────────────

function AccordionItemRow({
  title,
  content,
  open,
  onToggle,
  variant = "default",
}: {
  title: string;
  content: ReactNode;
  open: boolean;
  onToggle: () => void;
  variant?: AccordionVariant;
}) {
  return (
    <div className={WRAPPER_CLASSES[variant]}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 ${HEADER_CLASSES[variant]}`}
      >
        <span className="font-medium leading-tight">{title}</span>
        <Chevron open={open} />
      </button>

      {/* Max-height animation — inline style avoids relying on arbitrary Tailwind values */}
      <div
        style={{ maxHeight: open ? "1000px" : "0px" }}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
      >
        <div
          className={`px-4 pb-4 pt-3 leading-relaxed text-slate-700 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* No <p> wrapper — content may be multi-block JSX */}
          <div className="space-y-3">{content}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Accordion (group) ────────────────────────────────────────────────────────

/**
 * Collapsible accordion group.
 *
 * @param items            Array of `{ id?, title, content }` objects
 * @param variant          Header style: "default" | "light" | "minimal"
 * @param allowMultiple    Allow more than one item open at a time (default: false)
 * @param defaultOpenIndex Index of the item open on first render (default: none)
 *
 * @example
 * // FAQ usage
 * <Accordion items={faqs} variant="default" defaultOpenIndex={0} />
 *
 * @example
 * // Settings panel, multiple open
 * <Accordion items={sections} variant="light" allowMultiple />
 */
export default function Accordion({
  items,
  variant = "default",
  allowMultiple = false,
  defaultOpenIndex,
}: AccordionProps) {
  const [openSet, setOpenSet] = useState<Set<number>>(
    () => new Set(defaultOpenIndex !== undefined ? [defaultOpenIndex] : [])
  );

  const toggle = (idx: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        if (!allowMultiple) next.clear();
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <AccordionItemRow
          key={item.id ?? idx}
          title={item.title}
          content={item.content}
          open={openSet.has(idx)}
          onToggle={() => toggle(idx)}
          variant={variant}
        />
      ))}
    </div>
  );
}