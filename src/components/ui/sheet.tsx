"use client";

import * as React from "react";
import { Drawer } from "vaul";

import { cn } from "@/lib/utils";

function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
      {children}
    </Drawer.Root>
  );
}

const SheetTrigger = Drawer.Trigger;
const SheetClose = Drawer.Close;

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Drawer.Content> & { title?: string }
>(({ className, children, title = "Menu", ...props }, ref) => (
  <Drawer.Portal>
    <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
    <Drawer.Content
      ref={ref}
      className={cn(
        "fixed bottom-0 right-0 top-0 z-50 flex w-[min(100%,380px)] flex-col border-l border-neutral-200 bg-white shadow-xl outline-none",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <Drawer.Title className="text-lg font-semibold text-neutral-900">
          {title}
        </Drawer.Title>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </Drawer.Content>
  </Drawer.Portal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetClose, SheetContent, SheetTrigger };
