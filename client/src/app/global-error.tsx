'use client';

import './globals.css';

// Last resort: replaces the root layout, so it brings its own <html>, <body> and styles.
// Only plain elements here: nothing that depends on providers or the theme.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-svh items-center justify-center bg-white p-4 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        <div className="grid max-w-md justify-items-center gap-3 text-center">
          <title>Something went wrong | Doctor Tracker</title>
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            The app hit an unexpected error. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={retry}
            className="h-10 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
