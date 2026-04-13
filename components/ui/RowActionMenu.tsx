"use client";

import React from "react";
import { createPortal } from "react-dom";

export type RowActionMenuItem = {
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  onClick: () => void;
};

type RowActionMenuProps = {
  items: RowActionMenuItem[];
  trigger: React.ReactNode;
  triggerTitle?: string;
  menuWidth?: number;
  className?: string;
};

export default function RowActionMenu({
  items,
  trigger,
  triggerTitle = "More",
  menuWidth = 150,
  className = "",
}: RowActionMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const MENU_H = Math.max(48, items.length * 36 + 16);

  const close = () => setOpen(false);

  const computePos = () => {
    const btn = buttonRef.current;
    if (!btn) return;

    const r = btn.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < MENU_H + 12;

    const top = (openUp ? r.top - MENU_H - 8 : r.bottom + 8) + window.scrollY;
    const left = r.right - menuWidth + window.scrollX;

    setPos({ top, left });
  };

  React.useEffect(() => {
    if (!open) return;

    computePos();

    const onDown = (e: MouseEvent) => {
      const root = rootRef.current;
      const btn = buttonRef.current;
      const target = e.target as Node;

      if ((btn && btn.contains(target)) || (root && root.contains(target)))
        return;

      close();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    const onReposition = () => computePos();

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items.length, menuWidth]);

  return (
    <div className={className}>
      <button
        ref={buttonRef}
        type="button"
        title={triggerTitle}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center text-byu-navy transition cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (open) {
            close();
          } else {
            computePos();
            setOpen(true);
          }
        }}
      >
        {trigger}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={rootRef}
            role="menu"
            style={{ top: pos.top, left: pos.left, width: menuWidth }}
            className="absolute z-[9999] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
          >
            {items.map((item, idx) => {
              const danger = item.variant === "danger";
              return (
                <button
                  key={`${item.label}-${idx}`}
                  role="menuitem"
                  type="button"
                  className={[
                    "flex w-full items-center gap-2 px-3 py-2 text-xs whitespace-nowrap cursor-pointer",
                    danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-byu-navy hover:bg-byu-navy/10",
                  ].join(" ")}
                  onClick={(e) => {
                    e.stopPropagation();
                    close();
                    item.onClick();
                  }}
                >
                  {item.icon ? (
                    <span className="shrink-0">{item.icon}</span>
                  ) : null}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
