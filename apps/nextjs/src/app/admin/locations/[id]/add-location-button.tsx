"use client";

import { Plus } from "lucide-react";

import { cn } from "@f3/ui";

import { ModalType, openModal } from "~/utils/store/modal";

export const AddLocationButton = () => {
  return (
    <button
      onClick={() => {
        openModal(ModalType.ADMIN_LOCATIONS, { id: -1 });
      }}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        "h-9 px-4 py-2",
      )}
    >
      <Plus />
      Add Location
    </button>
  );
};
