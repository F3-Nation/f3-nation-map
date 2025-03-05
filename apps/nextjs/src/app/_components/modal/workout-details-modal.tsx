import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWindowWidth } from "@react-hook/window-size";
import { isNumber } from "lodash";
import { Edit, PlusCircle, Trash } from "lucide-react";
import { useSession } from "next-auth/react";

import type { DayOfWeek } from "@acme/shared/app/enums";
import {
  START_END_TIME_DB_FORMAT,
  START_END_TIME_DISPLAY_FORMAT,
  Z_INDEX,
} from "@acme/shared/app/constants";
import { getReadableDayOfWeek } from "@acme/shared/app/functions";
import { isTruthy } from "@acme/shared/common/functions";
import { cn } from "@acme/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { toast } from "@acme/ui/toast";

import type { DataType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { vanillaApi } from "~/trpc/vanilla";
import { dayjs } from "~/utils/frontendDayjs";
import { appStore } from "~/utils/store/app";
import {
  closeModal,
  DeleteType,
  eventAndLocationToUpdateRequest,
  eventDefaults,
  modalStore,
  ModalType,
  openModal,
} from "~/utils/store/modal";
import textLink from "~/utils/text-link";
import { ImageWithFallback } from "../image-with-fallback";
import { EventChip } from "../map/event-chip";
import { WorkoutDetailsSkeleton } from "./workout-details-skeleton";

export const WorkoutDetailsModal = ({
  data,
}: {
  data: DataType[ModalType.WORKOUT_DETAILS];
}) => {
  const utils = api.useUtils();
  const router = useRouter();
  const { data: session } = useSession();
  const mode = appStore.use.mode();
  const locationId = typeof data.locationId === "number" ? data.locationId : -1;
  const { data: results, isLoading } = api.location.getAoWorkoutData.useQuery(
    { locationId },
    { enabled: locationId >= 0 },
  );
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const workout = useMemo(
    () => results?.events.find((event) => event.eventId === selectedEventId),
    [selectedEventId, results],
  );
  const location = useMemo(() => results?.location, [results]);
  const width = useWindowWidth();
  const isLarge = width > 1024;
  const isMedium = width > 640;
  const event = useMemo(
    () => results?.events.find((event) => event.eventId === selectedEventId),
    [selectedEventId, results],
  );

  useEffect(() => {
    const resultsEventId = results?.events[0]?.eventId;
    if (isNumber(resultsEventId)) {
      setSelectedEventId(resultsEventId);
    }
  }, [results]);

  const workoutFields = {
    Name: workout?.eventName,
    What: workout?.types.join(", "),
    Where: [
      location?.locationName ? <p>{location.locationName}</p> : null,
      location?.fullAddress ? (
        <Link
          href={`https://maps.google.com/?q=${encodeURIComponent(location?.fullAddress)}`}
          target="_blank"
          className="underline"
        >
          {location.fullAddress}
        </Link>
      ) : null,
      location?.locationDescription ? (
        <p className="text-sm text-muted-foreground">
          {location.locationDescription}
        </p>
      ) : null,
    ].filter(isTruthy),
    When: workout ? getWhenFromWorkout(workout) : "",
    Website: location?.aoWebsite ? (
      <Link href={location.aoWebsite} target="_blank" className="underline">
        {location.aoWebsite}
      </Link>
    ) : null,
    Notes: workout?.description ? textLink(workout.description) : null,
  };

  const regionFields = {
    Name: location?.regionName,
    Website: location?.regionWebsite ? (
      <Link
        href={location?.regionWebsite}
        target="_blank"
        className="underline"
      >
        {location.regionWebsite}
      </Link>
    ) : null,
    Logo: location?.regionLogo,
  };

  return (
    <Dialog open={true} onOpenChange={closeModal}>
      <DialogContent
        style={{ zIndex: Z_INDEX.WORKOUT_DETAILS_MODAL }}
        className="mb-40 rounded-lg px-4 sm:px-6 lg:rounded-none lg:px-8"
      >
        {!location || !event || isLoading ? (
          <WorkoutDetailsSkeleton />
        ) : (
          <>
            <DialogHeader className="flex flex-row flex-wrap items-center justify-start gap-x-2">
              <div className="flex flex-shrink-0 flex-col items-center">
                <ImageWithFallback
                  src={location?.aoLogo ? location.aoLogo : "/f3_logo.png"}
                  fallbackSrc="/f3_logo.png"
                  loading="lazy"
                  width={64}
                  height={64}
                  alt={location?.aoLogo ?? "F3 logo"}
                  className="rounded-lg bg-black"
                />
              </div>
              <DialogTitle className="line-clamp-2 flex-1 text-left text-2xl font-bold leading-6 sm:text-4xl">
                {workout?.eventName ?? "Workout Information"}
              </DialogTitle>
            </DialogHeader>
            {mode === "edit" ? (
              <button
                className="-mt-2 flex w-fit flex-row items-center gap-2 rounded-sm bg-blue-600 px-2 text-white"
                onClick={() => {
                  openModal(ModalType.UPDATE_LOCATION, {
                    requestType: "edit",
                    ...eventAndLocationToUpdateRequest({
                      event,
                      location,
                    }),
                  });
                }}
              >
                <Edit className="h-4 w-4" />
                <span>Edit Event</span>
              </button>
            ) : null}

            <div>
              {(results?.events.length ?? 0) > 1
                ? `There are ${results?.events.length} workouts at this location`
                : null}
              <div className="flex flex-row flex-wrap gap-1">
                {results?.events.map((event) => (
                  <EventChip
                    key={event.eventId}
                    onClick={() => {
                      setSelectedEventId(event.eventId);
                    }}
                    selected={selectedEventId === event.eventId}
                    event={{
                      id: event.eventId,
                      name: event.eventName,
                      locationId: results.location.locationId,
                      dayOfWeek: event.dayOfWeek,
                      startTime: event.startTime,
                      endTime: event.endTime,
                      types: event.types,
                    }}
                    location={{
                      lat: results.location.lat,
                      lon: results.location.lon,
                      id: results.location.locationId,
                    }}
                    size={isLarge ? "large" : isMedium ? "medium" : "large"}
                  />
                ))}
                {mode === "edit" ? (
                  <button
                    className={cn(
                      "flex cursor-pointer flex-row items-center",
                      "rounded-sm",
                      "text-base text-white",
                      "px-2 shadow",
                      { "pointer-events-auto bg-blue-600": true },
                      { "gap-2 py-[0px]": true },
                    )}
                    onClick={() => {
                      openModal(ModalType.UPDATE_LOCATION, {
                        requestType: "create_event",
                        ...eventDefaults,
                        ...eventAndLocationToUpdateRequest({
                          event: undefined,
                          location,
                        }),
                      });
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add Event</span>
                  </button>
                ) : null}
              </div>
            </div>
            <div className="w-full">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 break-words sm:grid-cols-2">
                {Object.keys(workoutFields)
                  .filter(
                    (field) =>
                      !!workoutFields[field as keyof typeof workoutFields],
                  )
                  .map((field) => (
                    <div key={field} className="sm:col-span-1">
                      <dt className="text-sm font-medium text-muted-foreground">
                        {field}
                      </dt>
                      <dd className="mt-1 whitespace-pre-line text-sm text-foreground">
                        {workoutFields[field as keyof typeof workoutFields]}
                      </dd>
                    </div>
                  ))}

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    How
                  </dt>
                  <dd className="mt-1 max-w-prose space-y-5 text-sm text-foreground">
                    All F3 events are free and open to all men. If this is your
                    first time, simply show up at the time and place and join
                    us. Be prepared to sweat! We look forward to meeting you.
                  </dd>
                </div>
              </dl>
            </div>
            <DialogTitle className="mt-4">Region Information</DialogTitle>
            <div className="w-full [&_dd]:[overflow-wrap:anywhere]">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                {Object.keys(regionFields)
                  .filter(
                    (field) =>
                      !!regionFields[field as keyof typeof regionFields],
                  )
                  .map((field) => (
                    <div key={field} className="sm:col-span-1">
                      <dt className="text-sm font-medium text-muted-foreground">
                        {field}
                      </dt>
                      <dd className="mt-1 text-sm text-foreground">
                        {regionFields[field as keyof typeof regionFields]}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
            <Link
              className="flex cursor-pointer text-blue-500 underline"
              target="_blank"
              href={"https://f3nation.com/about-f3"}
            >
              FAQs
            </Link>
            <div className="h-2" />
            <div className="flex w-full flex-col justify-center gap-4">
              {mode === "edit" ? (
                <>
                  <button
                    className="mt-4 flex flex-row items-center justify-center gap-2 rounded-md bg-blue-600 px-2 py-1 text-white"
                    onClick={(e) => {
                      openModal(ModalType.UPDATE_LOCATION, {
                        requestType: "edit",
                        ...eventAndLocationToUpdateRequest({
                          event,
                          location,
                        }),
                      });
                      e.stopPropagation();
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Event</span>
                  </button>
                </>
              ) : null}
              <button
                className="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-md bg-muted-foreground px-2 py-1 text-background"
                onClick={() => closeModal()}
              >
                Close
              </button>
              {mode === "edit" ? (
                <>
                  <button
                    className="flex flex-row items-center justify-center gap-2 rounded-md px-2 py-1 text-red-600"
                    onClick={(e) => {
                      openModal(ModalType.DELETE_CONFIRMATION, {
                        type: DeleteType.EVENT,
                        onConfirm: () => {
                          if (location.regionId == null) {
                            toast.error(
                              "Location is not associated with a region",
                            );
                            return;
                          }
                          void vanillaApi.request.submitDeleteRequest
                            .mutate({
                              regionId: location.regionId,
                              eventId: event.eventId,
                              eventName: event.eventName,
                              submittedBy: session?.user?.email ?? "",
                            })
                            .then((result) => {
                              void utils.location.invalidate();
                              router.refresh();
                              toast.success(
                                result.status === "pending"
                                  ? "Delete request submitted"
                                  : "Successfully deleted event",
                              );
                              // Close all modals
                              modalStore.setState({ modals: [] });
                            });
                        },
                      });
                      e.stopPropagation();
                    }}
                  >
                    <Trash className="h-4 w-4" />
                    <span>Delete Event</span>
                  </button>
                </>
              ) : null}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const getWhenFromWorkout = (params: {
  startTime: string | null;
  endTime: string | null;
  dayOfWeek: DayOfWeek | null;
  condensed?: boolean;
}) => {
  const event = params;
  const condensed = params.condensed ?? false;
  const startTimeRaw =
    event.startTime === null
      ? undefined
      : dayjs(event.startTime, START_END_TIME_DB_FORMAT).format(
          START_END_TIME_DISPLAY_FORMAT,
        );

  const startTime = !condensed
    ? startTimeRaw
    : startTimeRaw?.replace(":00", "");

  const endTime = dayjs(event.endTime, START_END_TIME_DB_FORMAT).format(
    START_END_TIME_DISPLAY_FORMAT,
  );

  const duration = dayjs(event.endTime, START_END_TIME_DB_FORMAT).diff(
    dayjs(event.startTime, START_END_TIME_DB_FORMAT),
    "minutes",
  );
  return `${getReadableDayOfWeek(event.dayOfWeek)} ${startTime} - ${endTime} (${duration}min)`;
};
