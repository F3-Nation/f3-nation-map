import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWindowWidth } from "@react-hook/window-size";
import { isNumber } from "lodash";
import { X } from "lucide-react";

import { DAY_ORDER } from "@f3/shared/app/constants";
import { Skeleton } from "@f3/ui/skeleton";

import { api } from "~/trpc/react";
import { dayjs } from "~/utils/frontendDayjs";
import { closePanel, selectedItemStore } from "~/utils/store/selected-item";
import textLink from "~/utils/text-link";
import { ImageWithFallback } from "../image-with-fallback";
import { EventChip } from "../map/event-chip";

export const DesktopLocationPanelContent = () => {
  const panelLocationId = selectedItemStore.use.panelLocationId();
  const panelEventId = selectedItemStore.use.panelEventId();
  const open = panelLocationId !== null;
  const locationId = panelLocationId ?? -1;
  const { data: results, isLoading } = api.location.getAoWorkoutData.useQuery(
    { locationId },
    { enabled: locationId >= 0 && open },
  );
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    panelEventId,
  );
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

  useEffect(() => {
    setSelectedEventId(panelEventId);
  }, [panelEventId]);

  const workoutFields = {
    Name: workout?.eventName,
    What: workout?.type,
    Where: location?.locationAddress ? (
      <Link
        href={`https://maps.google.com/?q=${encodeURIComponent(location?.locationAddress)}`}
        target="_blank"
        className="underline"
      >
        {location.locationAddress}
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

  return !open ? null : (
    <div className="flex flex-col rounded-lg bg-background p-4 shadow">
      {!results?.location || !results.events.length || isLoading ? (
        <WorkoutDetailsSkeleton />
      ) : (
        <>
          <div className="flex flex-row flex-wrap items-center justify-start gap-x-2">
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
            <div className="line-clamp-2 flex-1 text-left text-2xl font-bold sm:text-4xl">
              {workout?.eventName ?? "Workout Information"}
            </div>
          </div>

          <div>
            {(results?.events.length ?? 0) > 1 ? (
              <span className="text-sm">
                There are {results?.events.length} workouts at this location
              </span>
            ) : (
              <div className="h-1" />
            )}
            <div className="flex flex-row flex-wrap gap-1">
              {results?.events.map((event) => (
                <EventChip
                  key={event.eventId}
                  onClick={() => setSelectedEventId(event.eventId)}
                  selected={selectedEventId === event.eventId}
                  event={{
                    id: event.eventId,
                    name: event.eventName,
                    locationId: results.location.locationId,
                    dayOfWeek: event.dayOfWeek,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    type: event.type,
                  }}
                  location={{
                    lat: results.location.lat,
                    lon: results.location.lon,
                    id: results.location.locationId,
                  }}
                  size={isLarge ? "large" : isMedium ? "medium" : "small"}
                  hideName={results.events.length === 1}
                />
              ))}
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
                  first time, simply show up at the time and place and join us.
                  Be prepared to sweat! We look forward to meeting you.
                </dd>
              </div>
            </dl>
          </div>
          <div className="mt-4">Region Information</div>
          <div className="w-full [&_dd]:[overflow-wrap:anywhere]">
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
          <Link
            className="flex cursor-pointer text-blue-500 underline"
            target="_blank"
            href={"https://f3nation.com/about-f3"}
          >
            FAQs
          </Link>
          <div className="h-8" />
          <button
            className="absolute right-2 top-2"
            onClick={(e) => {
              closePanel();
              e.stopPropagation();
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};

const getWhenFromWorkout = (params: {
  startTime: string | null;
  endTime: string | null;
  dayOfWeek: number | null;
  condensed?: boolean;
}) => {
  const event = params;
  const condensed = params.condensed ?? false;
  const dayOfWeek =
    event.dayOfWeek === null ? undefined : DAY_ORDER[event.dayOfWeek];
  const startTimeRaw =
    event.startTime === null
      ? undefined
      : dayjs(event.startTime, "HH:mm:ss").format("h:mmA");

  const startTime = !condensed
    ? startTimeRaw
    : startTimeRaw?.replace(":00", "");

  const endTime = dayjs(event.endTime, "HH:mm:ss").format("h:mmA");

  const duration = dayjs(event.endTime, "HH:mm:ss").diff(
    dayjs(event.startTime, "HH:mm:ss"),
    "minutes",
  );
  return `${dayOfWeek} ${startTime} - ${endTime} (${duration}min)`;
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
      <div className="mt-4 px-4 sm:px-6 lg:px-8">Region Information</div>
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
