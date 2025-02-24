import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWindowWidth } from "@react-hook/window-size";
import { isNumber } from "lodash";
import { Edit, PlusCircle } from "lucide-react";

import type { DayOfWeek } from "@f3/shared/app/enums";
import {
  START_END_TIME_DB_FORMAT,
  START_END_TIME_DISPLAY_FORMAT,
  Z_INDEX,
} from "@f3/shared/app/constants";
import { getReadableDayOfWeek } from "@f3/shared/app/functions";
import { cn } from "@f3/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@f3/ui/dialog";
import { Skeleton } from "@f3/ui/skeleton";
import { toast } from "@f3/ui/toast";

import type { DataType } from "~/utils/store/modal";
import { api } from "~/trpc/react";
import { dayjs } from "~/utils/frontendDayjs";
import { appStore } from "~/utils/store/app";
import { closeModal, ModalType, openModal } from "~/utils/store/modal";
import textLink from "~/utils/text-link";
import { ImageWithFallback } from "../image-with-fallback";
import { EventChip } from "../map/event-chip";

export const WorkoutDetailsModal = ({
  data,
}: {
  data: DataType[ModalType.WORKOUT_DETAILS];
}) => {
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

  useEffect(() => {
    const resultsEventId = results?.events[0]?.eventId;
    if (isNumber(resultsEventId)) {
      setSelectedEventId(resultsEventId);
    }
  }, [results]);

  const workoutFields = {
    Name: workout?.eventName,
    What: workout?.types.map((type) => type.name).join(", "),
    Where: location?.fullAddress ? (
      <Link
        href={`https://maps.google.com/?q=${encodeURIComponent(location?.fullAddress)}`}
        target="_blank"
        className="underline"
      >
        {location.fullAddress}
      </Link>
    ) : null,
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
        {!results?.location || !results.events.length || isLoading ? (
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
                  const event = results?.events.find(
                    (event) => event.eventId === selectedEventId,
                  );
                  const lat = results?.location.lat;
                  const lng = results?.location.lon;
                  if (typeof lat !== "number" || typeof lng !== "number") {
                    toast.error("Invalid lat or lng");
                    return;
                  }
                  openModal(ModalType.UPDATE_LOCATION, {
                    mode: "edit-event",
                    locationId: locationId,
                    eventId: selectedEventId,
                    regionId: results?.location.regionId,
                    workoutName: event?.eventName,
                    workoutWebsite: results?.location.aoWebsite,
                    aoLogo: results?.location.aoLogo,
                    locationAddress: results?.location.locationAddress,
                    locationAddress2: results?.location.locationAddress2,
                    locationCity: results?.location.locationCity,
                    locationState: results?.location.locationState,
                    locationZip: results?.location.locationZip,
                    locationCountry: results?.location.locationCountry,
                    lat: lat,
                    lng: lng,
                    startTime: event?.startTime,
                    endTime: event?.endTime,
                    dayOfWeek: event?.dayOfWeek,
                    types: event?.types,
                    eventDescription: event?.description,
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
                      const lat = results?.location.lat ?? 0;
                      const lng = results?.location.lon ?? 0;
                      if (typeof lat !== "number" || typeof lng !== "number") {
                        toast.error("Invalid lat or lng");
                      }
                      openModal(ModalType.UPDATE_LOCATION, {
                        mode: "new-event",
                        locationId: locationId,
                        regionId: results?.location.regionId,
                        eventId: -1,
                        locationAddress: results?.location.locationAddress,
                        locationAddress2: results?.location.locationAddress2,
                        locationCity: results?.location.locationCity,
                        locationState: results?.location.locationState,
                        locationZip: results?.location.locationZip,
                        locationCountry: results?.location.locationCountry,
                        lat: lat,
                        lng: lng,
                        workoutWebsite: results?.location.aoWebsite,
                        aoLogo: results?.location.aoLogo,
                        startTime: "00:00:00",
                        endTime: "00:00:00",
                        dayOfWeek: "sunday",
                        types: [{ id: 1, name: "Bootcamp" }],
                        eventDescription: "",
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
          </>
        )}
        <div className="flex w-full flex-row justify-center gap-4">
          <button
            className="text-foreground-500 cursor-pointer justify-center text-center underline"
            onClick={() => closeModal()}
          >
            close
          </button>
          {mode === "edit" ? (
            <button
              className="rounded-md text-blue-600 underline"
              onClick={(e) => {
                const event = results?.events.find(
                  (event) => event.eventId === selectedEventId,
                );
                const lat = results?.location.lat;
                const lng = results?.location.lon;
                if (typeof lat !== "number" || typeof lng !== "number") {
                  toast.error("Invalid lat or lng");
                  return;
                }
                openModal(ModalType.UPDATE_LOCATION, {
                  mode: "edit-event",
                  locationId: locationId,
                  eventId: selectedEventId,
                  regionId: results?.location.regionId,
                  workoutName: event?.eventName,
                  workoutWebsite: results?.location.aoWebsite,
                  aoLogo: results?.location.aoLogo,
                  locationAddress: results?.location.locationAddress,
                  locationAddress2: results?.location.locationAddress2,
                  locationCity: results?.location.locationCity,
                  locationState: results?.location.locationState,
                  locationZip: results?.location.locationZip,
                  locationCountry: results?.location.locationCountry,
                  lat: lat,
                  lng: lng,
                  startTime: event?.startTime,
                  endTime: event?.endTime,
                  dayOfWeek: event?.dayOfWeek,
                  types: event?.types,
                  eventDescription: event?.description,
                });
                e.stopPropagation();
              }}
            >
              edit event
            </button>
          ) : null}
        </div>
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

const WorkoutDetailsSkeleton = () => {
  const workoutFields = {
    Name: <Skeleton className="h-[20px] w-full" />,
    What: <Skeleton className="h-[20px] w-full" />,
    Where: <Skeleton className="h-[20px] w-full" />,
    When: <Skeleton className="h-[20px] w-full" />,
    Website: <Skeleton className="h-[20px] w-full" />,
    Notes: <Skeleton className="h-[20px] w-full" />,
  };

  const regionFields = {
    Name: <Skeleton className="h-[20px] w-full" />,
    Website: <Skeleton className="h-[20px] w-full" />,
    Logo: <Skeleton className="h-[20px] w-full" />,
  };
  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 break-words sm:grid-cols-2">
          {Object.keys(workoutFields)
            .filter(
              (field) => !!workoutFields[field as keyof typeof workoutFields],
            )
            .map((field) => (
              <div key={field} className="sm:col-span-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  {field}
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {workoutFields[field as keyof typeof workoutFields]}
                </dd>
              </div>
            ))}

          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">How</dt>
            <dd className="mt-1 max-w-prose space-y-5 text-sm text-foreground">
              <Skeleton className="h-[20px] w-full" />
            </dd>
          </div>
        </dl>
      </div>
      <DialogTitle className="mt-4 px-4 sm:px-6 lg:px-8">
        Region Information
      </DialogTitle>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          {Object.keys(regionFields)
            .filter(
              (field) => !!regionFields[field as keyof typeof regionFields],
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
      <div className="h-8" />
    </>
  );
};
