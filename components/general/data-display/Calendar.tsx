"use client";

import React from "react";
import clsx from "clsx";
import type { CalendarEvent } from "@/types/general/CalendarEvent";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventVariant =
  | "Short Tutorial"
  | "Long Tutorial"
  | "Lunch"
  | "Breakfast"
  | "Lunch and Posters"
  | "Excursion"
  | "Break";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Pixel height of a single time-grid row (one stepMinutes block). */
const ROW_HEIGHT_PX = 40;

/** Maps each variant to its Tailwind bg + border classes. */
const VARIANT_CLASSES: Record<string, string> = {
  "Short Tutorial": "bg-blue-50 border-blue-200",
  "Long Tutorial": "bg-amber-50 border-amber-200",
  Excursion: "bg-purple-50 border-purple-200",
  Break: "bg-slate-50 border-slate-200",
};

/** Fallback class for meal-type variants and anything unrecognised. */
const MEAL_VARIANTS = new Set(["Lunch", "Breakfast", "Lunch and Posters"]);
const MEAL_CLASS = "bg-emerald-50 border-emerald-200";
const DEFAULT_CLASS = "bg-emerald-50 border-emerald-200";

function variantClass(variant?: string): string {
  if (!variant) return DEFAULT_CLASS;
  if (MEAL_VARIANTS.has(variant)) return MEAL_CLASS;
  return VARIANT_CLASSES[variant] ?? DEFAULT_CLASS;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CalendarHeader({ days }: { days: string[] }) {
  return (
    <>
      <div />
      {days.map((d) => (
        <div key={d} className="px-2 pb-3 text-sm font-medium text-slate-700">
          {d}
        </div>
      ))}
    </>
  );
}

function TimeGutter({
  rows,
  start,
  stepMinutes,
}: {
  rows: number;
  start: string;
  stepMinutes: number;
}) {
  return (
    <div className="relative">
      {Array.from({ length: rows + 1 }).map((_, i) => {
        const t = addMinutes(start, i * stepMinutes);
        return (
          <div
            key={i}
            className="flex h-10 -mt-[1px] items-start justify-end pr-2 text-[11px] text-slate-500"
          >
            <span className="translate-y-[-7px]">{t}</span>
          </div>
        );
      })}
    </div>
  );
}

function EventBlock({ event, start, stepMinutes }: { event: CalendarEvent; start: string; stepMinutes: number }) {
  const top = (diffMinutes(start, event.start) / stepMinutes) * ROW_HEIGHT_PX;
  const height = (diffMinutes(event.start, event.end) / stepMinutes) * ROW_HEIGHT_PX;

  return (
    <div
      className={clsx(
        "absolute left-2 right-2 rounded-lg border text-xs shadow-sm overflow-hidden",
        variantClass(event.variant)
      )}
      style={{ top, height }}
      title={`${event.title} — ${event.start}–${event.end}`}
    >
      <div className="p-2">
        <div className="font-medium leading-tight line-clamp-2">{event.title}</div>
        {event.speakers?.length ? (
          <div className="mt-1 text-slate-600 line-clamp-2">
            {event.speakers.join(", ")}
          </div>
        ) : null}
        {event.location ? (
          <div className="mt-1 text-slate-500">{event.location}</div>
        ) : null}
      </div>
    </div>
  );
}

function DayColumn({
  day,
  colIdx,
  rows,
  events,
  start,
  stepMinutes,
}: {
  day: string;
  colIdx: number;
  rows: number;
  events: CalendarEvent[];
  start: string;
  stepMinutes: number;
}) {
  const colEvents = events.filter((e) => e.dayIndex === colIdx);

  return (
    <div key={day} className="relative border-l border-slate-200">
      {/* Horizontal row lines */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 border-b border-slate-100" />
      ))}
      {/* Events */}
      {colEvents.map((e) => (
        <EventBlock key={e.id} event={e} start={start} stepMinutes={stepMinutes} />
      ))}
    </div>
  );
}

function CalendarLegend() {
  const items = [
    { color: "bg-emerald-200", label: "Meal" },
    { color: "bg-amber-200", label: "Long Tutorial" },
    { color: "bg-blue-200", label: "Short Tutorial" },
    { color: "bg-purple-200", label: "Excursion" },
    { color: "bg-slate-200", label: "Break" },
  ];

  return (
    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
      {items.map(({ color, label }) => (
        <span key={label} className="inline-flex items-center gap-2">
          <i className={`inline-block h-3 w-3 rounded ${color}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * A Mon–Fri time-grid calendar for conference programs.
 *
 * @param days       Column labels (default Mon–Fri)
 * @param start      Start time string, e.g. "08:00"
 * @param end        End time string, e.g. "18:00"
 * @param stepMinutes Grid resolution in minutes (default 30)
 * @param events     Array of CalendarEvent objects
 * @param showLegend Whether to render the colour legend (default true)
 */
export default function Calendar({
  days = ["Mon", "Tue", "Wed", "Thu", "Fri"],
  start = "08:00",
  end = "20:00",
  stepMinutes = 30,
  events = [],
  showLegend = true,
}: {
  days?: string[];
  start?: string;
  end?: string;
  stepMinutes?: number;
  events?: CalendarEvent[];
  showLegend?: boolean;
}) {
  const totalMinutes = diffMinutes(start, end);
  const rows = Math.ceil(totalMinutes / stepMinutes);

  const gridStyle = {
    gridTemplateColumns: `100px repeat(${days.length}, minmax(0, 1fr))`,
  };

  return (
    <div className="card p-4">
      {/* Column headers */}
      <div className="grid" style={gridStyle}>
        <CalendarHeader days={days} />
      </div>

      {/* Time grid */}
      <div className="relative grid border-t border-slate-200" style={gridStyle}>
        <TimeGutter rows={rows} start={start} stepMinutes={stepMinutes} />
        {days.map((d, colIdx) => (
          <DayColumn
            key={d}
            day={d}
            colIdx={colIdx}
            rows={rows}
            events={events}
            start={start}
            stepMinutes={stepMinutes}
          />
        ))}
      </div>

      {showLegend && <CalendarLegend />}
    </div>
  );
}

// ─── Time utilities (exported for reuse in data files) ────────────────────────

export function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function diffMinutes(a: string, b: string): number {
  return Math.max(0, toMinutes(b) - toMinutes(a));
}

export function addMinutes(a: string, m: number): string {
  const total = toMinutes(a) + m;
  const hh = Math.floor(total / 60).toString().padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}