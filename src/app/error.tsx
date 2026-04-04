"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
        Something went wrong
      </p>
      <h1 className="mt-3 text-2xl font-bold text-neutral-900">
        Something went wrong on our side
      </h1>
      <p className="mt-3 text-neutral-600">
        {error.message ||
          "Try again in a moment. If the database is offline, the app falls back to demo deals automatically."}
      </p>
      <Button className="mt-8" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
