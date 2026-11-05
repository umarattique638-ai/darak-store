"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <h1 className="display text-4xl">Something went wrong</h1>
        <p className="mt-3 text-mute">Please try again. If it keeps happening, contact us.</p>
        <button onClick={reset} className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white">Try again</button>
      </div>
    </main>
  );
}
