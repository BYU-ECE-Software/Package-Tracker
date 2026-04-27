// NOT IN Template-Repo — built locally and worth upstreaming.
// Multi-step wizard modal (numbered dots, Back/Next, Submit on last step).
// Composes BaseModal: shares overlay, header, close button, escape key,
// scroll lock, and footer styling. Stepper dots go into BaseModal's topBar
// slot; navigation buttons go into BaseModal's footer slot.
//
// Public API preserved for existing callers (CheckOutModal):
//   - StepConfig with optional render-prop content for step-helper access
//   - StepHelpers.goNext for in-content auto-advance
//   - canAdvance per step controls Next/Submit enablement
'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import BaseModal from '@/components/ui/modals/BaseModal';
import Button from '@/components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalSize = 'sm' | 'md' | 'lg';

export type StepHelpers = {
  goNext: () => void;
};

export type StepConfig = {
  title?: string; // optional subtitle shown below the stepper
  content: ReactNode | ((helpers: StepHelpers) => ReactNode);
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
  completing?: boolean; // loading state on last step submission
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function StepModal({
  open,
  title,
  size = 'md',
  onClose,
  steps,
  onComplete,
  completingLabel = 'Submit',
  completing = false,
}: StepModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset to first step when modal opens
  useEffect(() => {
    if (open) setCurrentStep(0);
  }, [open]);

  const activeStepConfig = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canAdvanceStep = activeStepConfig?.canAdvance ?? true;

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));

  const handleSubmit = () => {
    if (isLastStep) onComplete();
    else goNext();
  };

  // Step content can be a render prop (receives goNext) or a plain ReactNode
  const renderedContent =
    typeof activeStepConfig?.content === 'function'
      ? activeStepConfig.content({ goNext })
      : activeStepConfig?.content;

  const topBar = (
    <div className="bg-byu-navy/5 border-b border-gray-200 px-5 py-3 flex flex-col items-center gap-2">
      <StepperDots total={steps.length} current={currentStep} />
      {activeStepConfig?.title && (
        <p className="text-xs text-gray-500 text-center">{activeStepConfig.title}</p>
      )}
    </div>
  );

  const footer = (
    <div className="flex justify-between">
      {currentStep > 0 ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setCurrentStep((s) => s - 1)}
          label="Back"
        />
      ) : (
        <Button type="button" variant="secondary" onClick={onClose} label="Cancel" />
      )}
      <Button
        type="submit"
        variant="primary"
        disabled={!canAdvanceStep || completing}
        loading={completing}
        loadingLabel="Submitting…"
        label={isLastStep ? completingLabel : 'Next'}
      />
    </div>
  );

  return (
    <BaseModal
      open={open}
      title={title}
      size={size}
      onClose={onClose}
      onSubmit={handleSubmit}
      topBar={topBar}
      footer={footer}
    >
      {renderedContent}
    </BaseModal>
  );
}

// ─── Stepper dots ─────────────────────────────────────────────────────────────

function StepperDots({ total, current }: { total: number; current: number }) {
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
                  ? 'bg-byu-navy text-white'
                  : active
                    ? 'bg-byu-royal text-white ring-2 ring-byu-royal/30'
                    : 'bg-gray-200 text-gray-400'
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
                className={`h-px w-6 transition-colors ${done ? 'bg-byu-navy' : 'bg-gray-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
