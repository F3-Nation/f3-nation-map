"use client";

import { Settings } from "lucide-react";

import { cn } from "@acme/ui";

import { ModalType, openModal } from "~/utils/store/modal";

export const SettingsButton = () => {
  return (
    <div className={"flex flex-col"}>
      <button
        // variant="outline"
        // size="icon"
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          "hover:bg-background focus:bg-background",
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
          "size-9",
        )}
        onClick={() => {
          openModal(ModalType.SETTINGS);
        }}
      >
        <Settings
          strokeWidth={1.5}
          className={cn("size-6 scale-90 text-foreground")}
        />
      </button>
    </div>
  );
};
