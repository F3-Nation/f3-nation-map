"use client";

import Link from "next/link";
import { Maximize2, X } from "lucide-react";

import { RERENDER_LOGS } from "@acme/shared/common/constants";
import { cn } from "@acme/ui";

import type { F3Marker } from "~/utils/types";
import {
  clearSelectedItem,
  setSelectedItem,
} from "~/utils/store/selected-item";
import textLink from "~/utils/text-link";
import { ImageWithFallback } from "../image-with-fallback";
import { EventChip } from "./event-chip";

export const SelectedItem = (props: {
  selectedLocation: F3Marker["location"];
  selectedEvent: F3Marker["location"]["events"][number];
  hideCloseButton?: boolean;
}) => {
  RERENDER_LOGS && console.log("SelectedItem rerender");

  const { hideCloseButton, selectedLocation, selectedEvent } = props;

  // TODO: Styles need to be cleaned up a little and I need to come back as a perfectionist to make sure everything looks beautiful

  return (
    <>
      <button
        className={cn(
          "text-left",
          "pointer-events-auto relative w-full lg:w-[450px]",
          "bg-background",
          "overflow-hidden overflow-y-auto rounded-lg p-2 text-sm text-foreground shadow-xl transition-all",
          "dark:border-[1px] dark:border-muted",
        )}
        onMouseLeave={() => {
          clearSelectedItem();
        }}
        onClick={() => {
          // There is a problem here where the selected item is clicked through
          // the search results when they are open. Needed e.stop() somewhere else to resolve
          setSelectedItem({
            locationId: selectedLocation.id,
            eventId: selectedEvent.id,
            showPanel: true,
          });
        }}
      >
        <div className="text-lg font-bold">{selectedEvent.name}</div>
        <div className="mt-2 flex flex-row items-start gap-2">
          <div className="flex flex-shrink-0 flex-col items-center">
            <ImageWithFallback
              src={
                selectedLocation.regionLogo
                  ? selectedLocation.regionLogo
                  : "/f3_logo.png"
              }
              fallbackSrc="/f3_logo.png"
              loading="lazy"
              width={64}
              height={64}
              alt={selectedLocation.regionLogo ?? "F3 logo"}
              className="rounded-lg bg-black"
            />
          </div>
          {/* Use flex-col to stack items vertically */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex flex-row items-center">
              <div className="mr-8 flex flex-row items-center gap-2">
                <EventChip
                  event={selectedEvent}
                  location={selectedLocation}
                  size="medium"
                  variant="non-interactive"
                  hideName
                />
              </div>
            </div>
            {selectedLocation.locationDescription ? (
              <Link
                // href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.locationDescription)}`}
                href={`https://maps.google.com/?q=${encodeURIComponent(selectedLocation.locationDescription)}`}
                target="_blank"
                className="line-clamp-1 underline"
              >
                {selectedLocation.locationDescription}
              </Link>
            ) : null}
            <div>
              <span className="font-semibold">Type: </span>
              {selectedEvent.types.join(", ")}
            </div>
            {selectedEvent.description ? (
              <p className="leading-4">
                <span className="font-semibold">Notes: </span>
                {textLink(selectedEvent.description)}
              </p>
            ) : null}
          </div>
        </div>
        <div className="pointer-events-auto absolute right-3 top-3">
          <Maximize2 className="text-gray-700 transition-all hover:scale-110" />
        </div>
      </button>
      {hideCloseButton ? null : (
        <button
          className="pointer-events-auto absolute right-3 top-3"
          onClick={() =>
            setSelectedItem({
              locationId: null,
              eventId: null,
              showPanel: false,
            })
          }
        >
          <div className="rounded-full border-[1px] border-black">
            <X />
          </div>
        </button>
      )}
    </>
  );
};
