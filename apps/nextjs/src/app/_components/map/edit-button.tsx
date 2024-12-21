"use client";

import { Pencil, PencilOff } from "lucide-react";

import { cn } from "@f3/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@f3/ui/tooltip";

import { appStore } from "~/utils/store/app";

export const EditButton = () => {
  const mode = appStore.use.mode();

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={() => {
          appStore.setState({ mode: mode === "view" ? "edit" : "view" });
        }}
      >
        <div className={"flex flex-col"}>
          <div
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              "hover:bg-background focus:bg-background",
              "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
              "size-9",
              {
                "bg-background text-foreground": mode === "view",
                "bg-blue-600 text-white hover:bg-blue-600/80 hover:text-white":
                  mode === "edit",
              },
            )}
          >
            {mode === "view" ? (
              <Pencil strokeWidth={1.25} className={cn("size-6 scale-100")} />
            ) : (
              <PencilOff
                strokeWidth={1.25}
                className={cn("size-6 scale-100")}
              />
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="mr-4 flex max-w-40 flex-col gap-2"
      >
        <p className="text-sm font-medium">
          {mode === "view" ? "Press to Edit" : "Press to View"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
