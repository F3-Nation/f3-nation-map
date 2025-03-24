"use client";

import { LocateFixed } from "lucide-react";

import { cn } from "@acme/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

import { isTouchDevice } from "~/utils/is-touch-device";
import { ModalType, openModal } from "~/utils/store/modal";
import { UserLocationContent } from "../modal/user-location-content";
import { useUserLocation } from "./user-location-provider";

export const UserLocationIcon = () => {
  const { updateUserLocation, status, permissions } = useUserLocation();

  return (
    <Tooltip disableHoverableContent>
      <TooltipTrigger>
        <div className={"flex flex-col lg:mx-2.5"}>
          <button
            onClick={() => {
              console.log("updateUserLocation");
              const touchDevice = isTouchDevice();
              if (touchDevice && status !== "success") {
                openModal(ModalType.USER_LOCATION_INFO);
              } else {
                updateUserLocation();
              }
            }}
            draggable="false"
            aria-label="My Location"
            title="My Location"
            type="button"
            className={cn(
              "cursor-pointer appearance-none overflow-hidden",
              "relative block",
              "h-10 w-10", // 40px x 40px
              "bg-white",
              "m-0 border-0 p-0",
              "user-select-none",
              "shadow-[0_1px_4px_-1px_rgba(0,0,0,0.3)]", // Google Maps shadow
              "flex items-center justify-center",
            )}
          >
            <div
              className={cn({
                "animate-spin":
                  permissions !== "denied" && status === "loading",
              })}
            >
              <LocateFixed
                strokeWidth={1.75}
                className={cn("size-7 text-[#666]")} // Matching the Settings icon style
              />
            </div>
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="mr-4 flex max-w-40 flex-col gap-2">
        <UserLocationContent />
      </TooltipContent>
    </Tooltip>
  );
};
