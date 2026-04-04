"use client";

import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { isSlugSaved, toggleSavedSlug } from "@/lib/deal-local-storage";
import { track } from "@/lib/tracking";

type Props = {
  slug: string;
  className?: string;
  size?: ComponentProps<typeof Button>["size"];
  variant?: ComponentProps<typeof Button>["variant"];
};

export function DealSaveButton({
  slug,
  className,
  size = "default",
  variant = "secondary",
}: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isSlugSaved(slug));
  }, [slug]);

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={() => {
        const on = toggleSavedSlug(slug);
        setSaved(on);
        track({ type: "save_deal", slug, saved: on });
      }}
    >
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
