import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { ConditionalWrapper } from "@f3/shared/app/components";
import { Z_INDEX } from "@f3/shared/app/constants";

import { cn } from ".";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    renderAsChild?: boolean;
  }
>(
  (
    { className, renderAsChild, align = "center", sideOffset = 4, ...props },
    ref,
  ) => (
    <ConditionalWrapper
      condition={!renderAsChild}
      wrapper={() => (
        <PopoverPrimitive.Portal>{props.children}</PopoverPrimitive.Portal>
      )}
    >
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        style={{ zIndex: Z_INDEX.POPOVER_CONTENT }}
        className={cn(
          "w-72 rounded-md border border-slate-200 bg-white p-4 text-slate-950 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",
          className,
        )}
        {...props}
      />
    </ConditionalWrapper>
  ),
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverContent, PopoverTrigger };
