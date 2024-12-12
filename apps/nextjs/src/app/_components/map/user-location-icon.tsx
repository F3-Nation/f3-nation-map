"use client";

import { LocateFixed } from "lucide-react";

import { cn } from "@f3/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@f3/ui/tooltip";

import { isTouchDevice } from "~/utils/is-touch-device";
import { ModalType, openModal } from "~/utils/store/modal";
import { UserLocationContent } from "../modal/user-location-content";
import { useUserLocation } from "./user-location-provider";

export const UserLocationIcon = () => {
  const { updateUserLocation, status, permissions } = useUserLocation();
  console.log("UserLocationIcon permissions", permissions);

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={() => {
          const isMobile = isTouchDevice();
          if (isMobile && status !== "success") {
            openModal(ModalType.USER_LOCATION_INFO);
          } else {
            updateUserLocation();
          }
        }}
      >
        <div className={"flex flex-col"}>
          <div
            // variant="outline"
            // size="icon"
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              "hover:bg-background focus:bg-background",
              "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
              "size-9",
            )}
          >
            <div
              className={cn({
                "animate-spin":
                  permissions !== "denied" && status === "loading",
              })}
            >
              <LocateFixed
                strokeWidth={1.25}
                className={cn("size-6 scale-100 text-foreground")}
              />
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="mr-4 flex max-w-40 flex-col gap-2"
      >
        <UserLocationContent />
      </TooltipContent>
    </Tooltip>
  );
};
