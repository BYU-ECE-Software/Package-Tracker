// Generic 2-column form grid wrapper. Extracted so the same layout primitive
// can be reused inside FormModal, step/tab modal content, or anywhere a
// form-grid look is needed. Uses CSS subgrid via auto-rows-[auto_auto_auto]
// so FieldWrapper rows align horizontally across columns.
//
// Usage: drop fields (or any children) inside. For full-width children,
// use Tailwind's `md:col-span-2` on the child.
'use client';

import type { ReactNode } from 'react';

type FormGridProps = {
  children: ReactNode;
  className?: string;
};

export default function FormGrid({ children, className = '' }: FormGridProps) {
  return (
    <div
      className={`grid auto-rows-[auto_auto_auto] grid-cols-1 gap-x-4 md:grid-cols-2 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
