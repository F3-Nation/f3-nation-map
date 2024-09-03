"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";

import { BreakPoints, SHORT_DAY_ORDER } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";

import type { RouterOutputs } from "~/trpc/types";
import { dayjs } from "~/utils/frontendDayjs";
import { Responsive } from "~/utils/responsive";
import { ModalType, useModalStore } from "~/utils/store/modal";
import { selectedItemStore } from "~/utils/store/selected-item";
import { ImageWithFallback } from "../image-with-fallback";
import BootSvgComponent from "../SVGs/boot-camp";
import RuckSvgComponent from "../SVGs/ruck";
import SwimSvgComponent from "../SVGs/swim";

const SelectedItem = (props: {
  selectedLocation: RouterOutputs["location"]["getAllLocationMarkers"][number];
  selectedEvent: RouterOutputs["location"]["getAllLocationMarkers"][number]["events"][number];
}) => {
  RERENDER_LOGS && console.log("SelectedItem rerender");

  const { selectedLocation, selectedEvent } = props;

  // TODO: Styles need to be cleaned up a little and I need to come back as a perfectionist to make sure everything looks beautiful

  const dayOfWeek =
    selectedEvent.dayOfWeek === null
      ? undefined
      : SHORT_DAY_ORDER[selectedEvent.dayOfWeek];
  const startTime =
    selectedEvent.startTime === null
      ? undefined
      : dayjs(selectedEvent.startTime, "HH:mm:ss").format("h:mmA");

  const _endTime =
    selectedEvent.endTime === null
      ? undefined
      : dayjs(selectedEvent.endTime, "HH:mm:ss").format("h:mmA");

  const duration = dayjs(selectedEvent.endTime, "HH:mm:ss").diff(
    dayjs(selectedEvent.startTime, "HH:mm:ss"),
    "minutes",
  );

  return (
    <>
      <div className="pointer-events-auto relative h-40 w-full max-w-[450px] overflow-hidden overflow-y-auto rounded-lg bg-background p-2 text-sm text-foreground shadow-xl dark:border-[1px] dark:border-muted">
        <div className="text-lg font-bold">{selectedEvent.name}</div>
        <div className="mt-2 flex flex-row items-start gap-2">
          <div className="flex flex-shrink-0 flex-col items-center">
            <ImageWithFallback
              src={
                selectedLocation.logo ? selectedLocation.logo : "/f3_logo.png"
              }
              fallbackSrc="/f3_logo.png"
              loading="lazy"
              width={64}
              height={64}
              alt={selectedLocation.logo ?? "F3 logo"}
            />
            <button
              className="cursor-pointer text-center text-sm text-blue-500 underline"
              onClick={() =>
                useModalStore.setState({
                  open: true,
                  type: ModalType.HOW_TO_JOIN,
                })
              }
            >
              How to join
            </button>
          </div>
          {/* Use flex-col to stack items vertically */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex flex-row items-center">
              <div className="mr-8 flex flex-row gap-2">
                <div className="flex-shrink-0 rounded-sm bg-red-600 p-1 text-white">
                  {dayOfWeek} {startTime} ({duration}m)
                </div>
                <div>
                  {selectedEvent.type === "Bootcamp" ? (
                    <BootSvgComponent height={24} />
                  ) : selectedEvent.type === "Swimming" ? (
                    <SwimSvgComponent height={24} />
                  ) : selectedEvent.type === "Ruck" ? (
                    <RuckSvgComponent height={24} />
                  ) : null}
                </div>
              </div>
            </div>
            {selectedLocation.locationDescription ? (
              <Link
                // href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.locationDescription)}`}
                href={`https://maps.google.com/?q=${encodeURIComponent(selectedLocation.locationDescription)}`}
                className="underline"
              >
                {selectedLocation.locationDescription}
              </Link>
            ) : null}
            <div>
              <span className="font-semibold">Type: </span>
              {selectedEvent.type}
            </div>
            {selectedEvent.description ? (
              <div>
                <span className="font-semibold">Notes: </span>
                {selectedEvent.description}
              </div>
            ) : null}
            {selectedLocation.website ? (
              <a
                href={
                  selectedLocation.website ? selectedLocation.website : "f3.com"
                }
                target="_blank"
                className="mb-1 flex items-center justify-end"
                rel="noreferrer"
              >
                <div className="flex text-xs">Visit group site</div>
                <div className="flex">
                  <ExternalLink className="m-1 h-3 w-3" />
                </div>
              </a>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
      <button
        className="pointer-events-auto absolute right-5 top-6"
        onClick={() =>
          selectedItemStore.setState({
            locationId: null,
            eventId: null,
          })
        }
      >
        <div className="rounded-full border-[1px] border-black">
          <X />
        </div>
      </button>
    </>
  );
};

const MobileWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="pointer-events-none absolute bottom-full left-0 right-0 flex justify-end px-4">
      {children}
    </div>
  );
};

const DesktopWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <div className="absolute bottom-2 right-2" style={{ zIndex: 2000 }}>
      {children}
    </div>
  );
};

const SelectedItemWrapper = (props: {
  selectedLocation: RouterOutputs["location"]["getAllLocationMarkers"][number];
  selectedEvent: RouterOutputs["location"]["getAllLocationMarkers"][number]["events"][number];
}) => {
  return (
    <>
      <Responsive maxWidth={BreakPoints.LG}>
        <MobileWrapper>
          <SelectedItem {...props} />
        </MobileWrapper>
      </Responsive>
      <Responsive minWidth={BreakPoints.LG}>
        <DesktopWrapper>
          <SelectedItem {...props} />
        </DesktopWrapper>
      </Responsive>
    </>
  );
};

export default SelectedItemWrapper;
