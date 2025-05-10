import { useWindowWidth } from "@react-hook/window-size";
import { Edit, MapPinPlusInside, Trash, X } from "lucide-react";

import { BreakPoints } from "@acme/shared/app/constants";
import { TestId } from "@acme/shared/common/enums";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

import { api } from "~/trpc/react";
import { appStore } from "~/utils/store/app";
import {
  eventDefaults,
  locationDefaults,
  ModalType,
  openModal,
} from "~/utils/store/modal";
import { closePanel, selectedItemStore } from "~/utils/store/selected-item";
import { WorkoutDetailsContent } from "../workout/workout-details-content";

// Custom arrow-to-dot icon component for moving things to a new location
const ArrowToDot = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="18" cy="12" r="3" />
    <path d="M14 12H4" />
    <path d="M7 8l-3 4 3 4" />
  </svg>
);

export const DesktopLocationPanelContent = () => {
  const panelLocationId = selectedItemStore.use.panelLocationId();
  const panelEventId = selectedItemStore.use.panelEventId();
  const width = useWindowWidth();
  const isLarge = width > Number(BreakPoints.LG);
  const isMedium = width > Number(BreakPoints.MD);
  const mode = appStore.use.mode();

  // Get location data including events
  const { data: locationData } = api.location.getLocationWorkoutData.useQuery(
    { locationId: panelLocationId ?? -1 },
    { enabled: panelLocationId !== null },
  );

  // Get AO name and selected event name
  const aoName = locationData?.location.parentName ?? "AO";
  const selectedEvent = locationData?.location.events.find(
    (event) => event.id === panelEventId,
  );
  const eventName = selectedEvent?.name ?? "Workout";

  // Get short day of week and format time
  const getShortDayOfWeek = (day: string | null | undefined) => {
    if (!day) return "";

    switch (day.toLowerCase()) {
      case "monday":
        return "M";
      case "tuesday":
        return "Tu";
      case "wednesday":
        return "W";
      case "thursday":
        return "Th";
      case "friday":
        return "F";
      case "saturday":
        return "Sa";
      case "sunday":
        return "Su";
      default:
        return "";
    }
  };

  const formatTime = (time: string | null | undefined) => {
    if (!time || time.length !== 4) return "";

    const hour = parseInt(time.substring(0, 2));
    const minute = time.substring(2, 4);
    const period = hour >= 12 ? "p" : "a";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

    return `${displayHour}:${minute}${period}`;
  };

  const shortDayOfWeek = getShortDayOfWeek(selectedEvent?.dayOfWeek);
  const formattedTime = formatTime(selectedEvent?.startTime);
  const timeDisplay =
    shortDayOfWeek && formattedTime ? `${shortDayOfWeek} ${formattedTime}` : "";

  if (!panelLocationId) return null;

  return (
    <div
      data-testid={TestId.PANEL}
      className="pointer-events-auto relative flex flex-col rounded-lg bg-background p-4 shadow dark:border"
    >
      {/* Close button in the top right */}
      <button
        className="absolute right-2 top-2 rounded-full bg-muted-foreground px-1 py-1 text-sm text-background"
        onClick={(e) => {
          closePanel();
          e.stopPropagation();
        }}
      >
        <X className="h-4 w-4" />
      </button>

      {/* Edit buttons at the top */}
      {mode === "edit" && (
        <div className="mb-4 flex flex-col gap-2">
          {/* AO Edit Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between border-blue-500 bg-blue-500 text-white transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <span className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit AO: {aoName} ({locationData?.location.events.length}{" "}
                  workouts)
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem
                className="flex cursor-pointer items-center px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                onClick={() => {
                  openModal(ModalType.UPDATE_LOCATION, {
                    requestType: "edit",
                    ...eventDefaults,
                    ...locationDefaults,
                    locationId: panelLocationId,
                    lat: 0, // Will be updated by data fetch
                    lng: 0, // Will be updated by data fetch
                  });
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit AO details
              </DropdownMenuItem>

              <DropdownMenuItem
                className="flex cursor-pointer items-center px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                onClick={() => {
                  openModal(ModalType.UPDATE_LOCATION, {
                    requestType: "move_ao_to_different_region",
                    ...eventDefaults,
                    ...locationDefaults,
                    locationId: panelLocationId,
                    lat: 0, // Will be updated by data fetch
                    lng: 0, // Will be updated by data fetch
                  });
                }}
              >
                <ArrowToDot className="mr-2 h-4 w-4" />
                Move to different region
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                className="flex cursor-pointer items-center px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => {
                  openModal(ModalType.UPDATE_LOCATION, {
                    requestType: "delete_ao",
                    ...eventDefaults,
                    ...locationDefaults,
                    locationId: panelLocationId,
                    lat: 0, // Will be updated by data fetch
                    lng: 0, // Will be updated by data fetch
                  });
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete this AO
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Event Edit Button - only show if an event is selected */}
          {panelEventId && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between border-green-500 bg-green-500 text-white transition-colors hover:border-green-600 hover:bg-green-600 hover:text-white"
                >
                  <span className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Workout: {eventName}{" "}
                    {timeDisplay ? `(${timeDisplay})` : ""}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem
                  className="flex cursor-pointer items-center px-3 py-2 hover:bg-green-50 dark:hover:bg-green-900/30"
                  onClick={() => {
                    openModal(ModalType.UPDATE_LOCATION, {
                      requestType: "edit",
                      ...eventDefaults,
                      ...locationDefaults,
                      locationId: panelLocationId,
                      eventId: panelEventId,
                      lat: 0, // Will be updated by data fetch
                      lng: 0, // Will be updated by data fetch
                    });
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit workout details
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex cursor-pointer items-center px-3 py-2 hover:bg-green-50 dark:hover:bg-green-900/30"
                  onClick={() => {
                    openModal(ModalType.UPDATE_LOCATION, {
                      requestType: "move_event_to_different_ao",
                      ...eventDefaults,
                      ...locationDefaults,
                      locationId: panelLocationId,
                      eventId: panelEventId,
                      lat: 0, // Will be updated by data fetch
                      lng: 0, // Will be updated by data fetch
                    });
                  }}
                >
                  <ArrowToDot className="mr-2 h-4 w-4" />
                  Move to different AO
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  className="flex cursor-pointer items-center px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    openModal(ModalType.UPDATE_LOCATION, {
                      requestType: "delete_event",
                      ...eventDefaults,
                      ...locationDefaults,
                      locationId: panelLocationId,
                      eventId: panelEventId,
                      lat: 0, // Will be updated by data fetch
                      lng: 0, // Will be updated by data fetch
                    });
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete this workout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Add Event Button - only show if no event is selected */}
          {!panelEventId && (
            <Button
              variant="outline"
              className="w-full justify-start border-green-500 bg-green-500 text-white transition-colors hover:border-green-600 hover:bg-green-600 hover:text-white"
              onClick={() => {
                openModal(ModalType.UPDATE_LOCATION, {
                  requestType: "create_event",
                  ...eventDefaults,
                  ...locationDefaults,
                  locationId: panelLocationId,
                  lat: 0, // Will be updated by data fetch
                  lng: 0, // Will be updated by data fetch
                });
              }}
            >
              <MapPinPlusInside className="mr-2 h-4 w-4" />
              Add Workout to AO: {aoName}
            </Button>
          )}
        </div>
      )}

      <WorkoutDetailsContent
        locationId={panelLocationId}
        providedEventId={panelEventId}
        chipSize={isLarge ? "large" : isMedium ? "medium" : "small"}
      />
    </div>
  );
};
