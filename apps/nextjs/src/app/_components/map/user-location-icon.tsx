/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
"use client";

import { useWindowSize } from "@react-hook/window-size";
import { LocateFixed } from "lucide-react";

import { BreakPoints } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@f3/ui/tooltip";

import { ModalType, openModal } from "~/utils/store/modal";
import { useUserLocation } from "./user-location-provider";

export const UserLocationIcon = () => {
  const { updateUserLocation, status, permissions } = useUserLocation();
  const [width] = useWindowSize();
  console.log("UserLocationIcon permissions", permissions);

  const content = (
    <div className="flex flex-col items-start gap-4 text-sm">
      {permissions === "denied"
        ? "Permissions have been denied. Please grant location permissions for your browser and try again"
        : // : permissions === "prompt"
          //   ? "Your location is being requested. Please grant location permissions for your browser and try again"
          status === "error"
          ? "There was an error loading your position"
          : status === "loading"
            ? "Your position is loading"
            : "Your permissions are ok. Requesting location"}

      {permissions !== "granted" ? (
        <button
          className={cn(
            "self-center rounded-md bg-foreground px-4 py-2 text-background shadow hover:bg-foreground/90",
          )}
          onClick={() => updateUserLocation()}
        >
          Request location permissions
        </button>
      ) : null}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={() => {
          if (width < BreakPoints.LG && status !== "success") {
            openModal(ModalType.USER_LOCATION_INFO, { content });
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
        {content}
      </TooltipContent>
    </Tooltip>
  );
};
