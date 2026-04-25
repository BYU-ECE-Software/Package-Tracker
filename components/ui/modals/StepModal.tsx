"use client";

import { useEffect, useId, useState } from "react";
import type { ReactNode, KeyboardEvent, FormEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalSize = "sm" | "md" | "lg";

export type StepConfig = {
  title?: string;      // optional subtitle shown below the stepper
  content: ReactNode;
  canAdvance?: boolean; // parent controls whether Next is enabled for this step
};

type StepModalProps = {
  open: boolean;
  title?: string;
  size?: ModalSize;
  onClose: () => void;

  steps: StepConfig[];
  onComplete: () => void; // called when user submits on the last step
  completingLabel?: string; // label for the submit button on last step
  completing?: boolean;     // loading state on last step submission
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function StepModal({
  open,
  title,
  size = "md",
  onClose,
  steps,
  onComplete,
  completingLabel = "Submit",
  completing = false,
}: StepModalProps) {
  const titleId = useId();

  // Stepper state lives here so the parent doesn't have to manage it
  const [currentStep, setCurrentStep] = useState(0);

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

  // Reset to first step when modal opens
  useEffect(() => {
    if (open) setCurrentStep(0);
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const isLast = currentStep === steps.length - 1;
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const activeStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canAdvanceStep = activeStepConfig?.canAdvance ?? true;

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

          {/* ── Stepper ────────────────────────────────────────────────────── */}
          <div className="bg-byu-navy/5 border-b border-gray-200 px-5 py-3 flex flex-col items-center gap-2">
            <StepperDots
              total={steps.length}
              current={currentStep}
            />
            {activeStepConfig?.title && (
              <p className="text-xs text-gray-500 text-center">
                {activeStepConfig.title}
              </p>
            )}
          </div>

          {/* ── Body + form ─────────────────────────────────────────────────── */}
          <form
            onSubmit={handleFormSubmit}
            className="overflow-y-auto max-h-[70vh]"
          >
            <div className="px-5 py-4 space-y-4">
              {activeStepConfig?.content}
            </div>

            <div className="h-px bg-gray-200" />

            {/* ── Footer ──────────────────────────────────────────────────────── */}
            <div className="px-5 py-4">
              <div className="flex justify-between">
                <div>
                  {currentStep > 0 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((s) => s - 1)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-byu-navy hover:bg-gray-50 transition cursor-pointer text-sm"
                    >
                      Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-byu-navy hover:bg-gray-50 transition cursor-pointer text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!canAdvanceStep || completing}
                  className="px-3 py-1.5 rounded-lg bg-byu-royal text-white text-sm shadow-sm transition enabled:hover:bg-[#003C9E] enabled:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completing
                    ? "Submitting…"
                    : isLastStep
                      ? completingLabel
                      : "Next"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Stepper dots ─────────────────────────────────────────────────────────────

function StepperDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                done
                  ? "bg-byu-navy text-white"
                  : active
                    ? "bg-byu-royal text-white ring-2 ring-byu-royal/30"
                    : "bg-gray-200 text-gray-400"
              }`}
            >
              {done ? (
                // Checkmark for completed steps
                <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < total - 1 && (
              <div
                className={`h-px w-6 transition-colors ${
                  done ? "bg-byu-navy" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}