"use client";

import { LocateFixed } from "lucide-react";

import { cn } from "@f3/ui";
import { Button } from "@f3/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@f3/ui/tooltip";

import { useUserLocation } from "./user-location-provider";

export const UserLocationIcon = () => {
  const { updateUserLocation, status, permissions } = useUserLocation();

  return (
    <div className={"absolute right-4 top-4 z-[400]"}>
      <Tooltip>
        <TooltipTrigger>
          <div className={"flex flex-col"}>
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-background focus:bg-background"
              onClick={updateUserLocation}
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
                : "Location permissions need to be granted"}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};