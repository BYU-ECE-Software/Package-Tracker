"use client";

import { useEffect, useId, useState } from "react";
import type { Dispatch, SetStateAction, ReactNode, KeyboardEvent, FormEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalSize = "sm" | "md" | "lg";

export type TabConfig = {
  key: string;
  label: string;
  content: ReactNode;
};

export type StepConfig = {
  title?: string;      // optional subtitle shown below the stepper
  content: ReactNode;
  canAdvance?: boolean; // parent controls whether Next is enabled for this step
};

type BaseModalProps = {
  open: boolean;
  title?: string;
  size?: ModalSize;
  onClose: () => void;

  // Plain modal (no tabs or steps)
  children?: ReactNode;
  saving?: boolean;
  saveLabel?: string;
  submitDisabled?: boolean;
  onSubmit?: () => void;
  footer?: ReactNode; // overrides default Cancel/Save footer

  // Tab mode — mutually exclusive with steps
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (key: string) => void;

  // Workflow/stepper mode — mutually exclusive with tabs
  steps?: StepConfig[];
  onComplete?: () => void; // called when user submits on the last step
  completingLabel?: string; // label for the submit button on last step
  completing?: boolean;     // loading state on last step submission
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function BaseModal({
  open,
  title,
  size = "md",
  onClose,
  children,
  saving = false,
  saveLabel = "Save",
  submitDisabled = false,
  onSubmit,
  footer,
  tabs,
  activeTab,
  onTabChange,
  steps,
  onComplete,
  completingLabel = "Submit",
  completing = false,
}: BaseModalProps) {
  const titleId = useId();

  // Determine mode
  const mode: "tabs" | "workflow" | "plain" = steps
    ? "workflow"
    : tabs
      ? "tabs"
      : "plain";

  // Stepper state lives here so the parent doesn't have to manage it
  // The parent controls canAdvance per step, but step index is internal
  // TODO: expose currentStep via a callback if parent needs to react to step changes
  const [currentStep, setCurrentStep] = useStepState(steps?.length ?? 0, open);

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

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "workflow") {
      const isLast = currentStep === (steps?.length ?? 1) - 1;
      if (isLast) {
        onComplete?.();
      } else {
        setCurrentStep((s) => s + 1);
      }
    } else {
      onSubmit?.();
    }
  };

  const activeStepConfig = mode === "workflow" ? steps![currentStep] : null;
  const isLastStep =
    mode === "workflow" && currentStep === (steps?.length ?? 1) - 1;
  const canAdvanceStep = activeStepConfig?.canAdvance ?? true;

  return (
    <div
      className="fixed inset-0 z-50"
      onKeyDown={handleKeyDown}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? titleId : undefined}
    >
      {/* Backdrop — clicking it closes the modal */}
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

          {/* ── Stepper (workflow mode only) ────────────────────────────────── */}
          {mode === "workflow" && steps && (
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
          )}

          {/* ── Tab bar (tab mode only) ──────────────────────────────────────── */}
          {mode === "tabs" && tabs && (
            <div className="flex border-b border-gray-200 bg-white px-5 pt-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange?.(tab.key)}
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
          )}

          {/* ── Body + form ─────────────────────────────────────────────────── */}
          <form
            onSubmit={handleFormSubmit}
            className="overflow-y-auto max-h-[70vh]"
          >
            <div className="px-5 py-4 space-y-4">
              {mode === "workflow"
                ? activeStepConfig?.content
                : mode === "tabs"
                  ? tabs?.find((t) => t.key === activeTab)?.content
                  : children}
            </div>

            <div className="h-px bg-gray-200" />

            {/* ── Footer ──────────────────────────────────────────────────────── */}
            <div className="px-5 py-4">
              {mode === "workflow" ? (
                <WorkflowFooter
                  currentStep={currentStep}
                  isLastStep={isLastStep}
                  canAdvance={canAdvanceStep}
                  completing={completing}
                  completingLabel={completingLabel}
                  onBack={() => setCurrentStep((s) => s - 1)}
                  onClose={onClose}
                />
              ) : footer ? (
                footer
              ) : (
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-byu-navy hover:bg-gray-50 transition cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || submitDisabled}
                    className="px-3 py-1.5 rounded-lg bg-byu-royal text-white text-sm shadow-sm transition enabled:hover:bg-[#003C9E] enabled:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving…" : saveLabel}
                  </button>
                </div>
              )}
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

// ─── Workflow footer ──────────────────────────────────────────────────────────

function WorkflowFooter({
  currentStep,
  isLastStep,
  canAdvance,
  completing,
  completingLabel,
  onBack,
  onClose,
}: {
  currentStep: number;
  isLastStep: boolean;
  canAdvance: boolean;
  completing: boolean;
  completingLabel: string;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex justify-between">
      <div>
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={onBack}
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
        disabled={!canAdvance || completing}
        className="px-3 py-1.5 rounded-lg bg-byu-royal text-white text-sm shadow-sm transition enabled:hover:bg-[#003C9E] enabled:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {completing
          ? "Submitting…"
          : isLastStep
            ? completingLabel
            : "Next"}
      </button>
    </div>
  );
}

// ─── Internal hook ────────────────────────────────────────────────────────────

// Resets to step 0 whenever the modal opens
function useStepState(
  _totalSteps: number,
  open: boolean
): [number, Dispatch<SetStateAction<number>>] {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  return [step, setStep];
}