import Link from "next/link";

import { DAY_ORDER, Z_INDEX } from "@f3/shared/app/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@f3/ui/dialog";
import { Skeleton } from "@f3/ui/skeleton";

import { api } from "~/trpc/react";
import { dayjs } from "~/utils/frontendDayjs";
import { useModalStore } from "~/utils/store/modal";
import { ImageWithFallback } from "../image-with-fallback";
import { EventChip } from "../map/event-chip";

export const WorkoutDetailsModal = () => {
  const { open, data } = useModalStore();
  const eventId = typeof data.eventId === "number" ? data.eventId : -1;
  const { data: workout, isLoading } =
    api.location.getIndividualWorkoutData.useQuery(
      { eventId },
      { enabled: eventId >= 0 },
    );

  const workoutFields = {
    Name: workout?.eventName,
    What: workout?.type,
    Where: workout?.locationAddress ? (
      <Link
        href={`https://maps.google.com/?q=${encodeURIComponent(workout?.locationAddress)}`}
        target="_blank"
        className="underline"
      >
        {workout.locationAddress}
      </Link>
    ) : null,
    When: workout ? getWhenFromWorkout(workout) : "",
    Website: workout?.aoWebsite ? (
      <Link href={workout?.aoWebsite} target="_blank" className="underline">
        {workout.aoWebsite}
      </Link>
    ) : null,
    Notes: workout?.description,
  };

  const regionFields = {
    Name: workout?.regionName,
    Website: workout?.regionWebsite ? (
      <Link href={workout?.regionWebsite} target="_blank" className="underline">
        {workout.regionWebsite}
      </Link>
    ) : null,
    Logo: workout?.regionLogo,
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => useModalStore.setState({ open: false })}
    >
      <DialogContent
        style={{ zIndex: Z_INDEX.WORKOUT_DETAILS_MODAL }}
        className="px-4 sm:px-6 lg:px-8"
      >
        {!workout || isLoading ? (
          <WorkoutDetailsSkeleton />
        ) : (
          <>
            <DialogHeader className="mt-8 flex flex-row flex-wrap items-end justify-start gap-x-2">
              <div className="flex flex-shrink-0 flex-col items-center">
                <ImageWithFallback
                  src={workout.aoLogo ? workout.aoLogo : "/f3_logo.png"}
                  fallbackSrc="/f3_logo.png"
                  loading="lazy"
                  width={64}
                  height={64}
                  alt={workout.aoLogo ?? "F3 logo"}
                  className="rounded-lg bg-black"
                />
              </div>
              <div className="flex flex-col items-start">
                <DialogTitle className="text-left text-lg font-bold sm:text-2xl">
                  {workout?.eventName ?? "Workout Information"}
                </DialogTitle>
                {workout ? (
                  <EventChip
                    event={{
                      id: workout.eventId,
                      locationId: workout.locationId,
                      dayOfWeek: workout.dayOfWeek,
                      startTime: workout.startTime,
                      endTime: workout.endTime,
                      type: workout.type,
                    }}
                    location={{
                      lat: workout.lat,
                      lon: workout.lon,
                    }}
                    size={"large"}
                  />
                ) : null}
              </div>
            </DialogHeader>
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
                      <dd className="mt-1 whitespace-pre text-sm text-foreground">
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
            <div className="w-full">
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
            <div className="h-8" />
          </>
        )}
      </DialogContent>
    </Dialog>
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
