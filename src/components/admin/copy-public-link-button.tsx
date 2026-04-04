"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyPublicLinkButton({
  href,
  label = "Copy link",
}: {
  href: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="text-xs"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(href);
          setDone(true);
          window.setTimeout(() => setDone(false), 2000);
        } catch {
          setDone(false);
        }
      }}
    >
      {done ? "Copied" : label}
    </Button>
  );
}
