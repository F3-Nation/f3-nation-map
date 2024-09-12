/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
"use client";

import { useWindowSize } from "@react-hook/window-size";
import { LocateFixed } from "lucide-react";

import { BreakPoints } from "@f3/shared/app/constants";
import { cn } from "@f3/ui";
import { Button } from "@f3/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@f3/ui/tooltip";

import { ModalType, useModalStore } from "~/utils/store/modal";
import { useUserLocation } from "./user-location-provider";

export const UserLocationIcon = () => {
  const { updateUserLocation, status, permissions } = useUserLocation();
  const [width] = useWindowSize();

  const content = (
    <div className="flex flex-col items-start gap-4">
      <div>
        {status === "error"
          ? "There was an error loading your position"
          : status === "loading"
            ? "Your position is loading"
            : "Your position has been successfully loaded"}
      </div>
      <div>
        {permissions === "denied"
          ? "This application does not have permissions to access your location. Please grant your browser location permissions"
          : permissions === "granted"
            ? "Location permissions have been granted"
            : "Location permissions need to be granted. If the button below does not work, then you need to update your browser settings"}
      </div>
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
    <div
      style={{
        bottom: width < BreakPoints.LG ? 8 : 16,
        right: width < BreakPoints.LG ? 8 : 16,
      }}
      className={"absolute z-[1001]"}
    >
      <Tooltip>
        <TooltipTrigger>
          <div className={"flex flex-col"}>
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-background focus:bg-background"
              onClick={() => {
                if (width < BreakPoints.LG && status !== "success") {
                  useModalStore.setState({
                    open: true,
                    type: ModalType.USER_LOCATION_INFO,
                    content,
                  });
                } else {
                  updateUserLocation();
                }
              }}
            >
              <div className={cn({ "animate-spin": status === "loading" })}>
                <LocateFixed
                  className={cn("size-5 scale-100 text-foreground")}
                />
              </div>
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="mr-4 flex max-w-40 flex-col gap-2"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
