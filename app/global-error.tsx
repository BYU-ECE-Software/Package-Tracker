'use client';

// Catches errors that thrown by the root layout itself (cookies(), providers,
// etc.) — these bubble *past* app/error.tsx because error.tsx only catches
// errors in its own segment. Without this file you get Next's bare
// "Internal Server Error" page.
//
// global-error.tsx REPLACES the root layout when it triggers, so it must
// render its own <html> + <body>. Also must be a client component.

import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Root-layout error caught by global-error.tsx:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-mono">
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
          <div className="w-full max-w-md text-center">
            <h1 className="text-byu-navy mb-0 text-center text-8xl font-black tracking-tight">
              500
            </h1>
            <p className="text-byu-navy mb-8 text-center text-lg">
              something broke before we could even start
            </p>

            <div className="mb-4 flex justify-center">
              <div
                className="h-32 w-32 animate-spin rounded-full"
                style={{
                  background:
                    'conic-gradient(#ef4444 0deg, #f97316 45deg, #eab308 90deg, #22c55e 135deg, #3b82f6 180deg, #8b5cf6 225deg, #ec4899 270deg, #ef4444 315deg)',
                  animationDuration: '1.5s',
                  animationTimingFunction: 'linear',
                }}
              />
            </div>

            <p className="mb-8 text-sm text-gray-400">
              The root layout itself failed. The wheel is the only thing left
              standing, and even it doesn&apos;t know what happened.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={reset}
                className="bg-byu-navy rounded-lg px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                try again
              </button>

              <a
                href="/"
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
