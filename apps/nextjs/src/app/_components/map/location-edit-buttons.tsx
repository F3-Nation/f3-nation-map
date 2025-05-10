import { ArrowRight, CirclePlus, Edit, Trash } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

import {
  eventDefaults,
  locationDefaults,
  ModalType,
  openModal,
} from "~/utils/store/modal";

interface LocationEditButtonsProps {
  locationId: number;
  eventId?: number | null;
  aoName?: string;
  eventName?: string;
  timeDisplay?: string;
  eventCount?: number;
}

export const LocationEditButtons = ({
  locationId,
  eventId,
  aoName = "AO",
  eventName = "Workout",
  timeDisplay = "",
  eventCount = 0,
}: LocationEditButtonsProps) => {
  return (
    <div className="flex flex-col gap-2">
      {/* AO Edit Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between border-blue-500 bg-blue-500 text-white transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <span className="inline-flex items-center">
              <Edit className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="whitespace-normal break-words leading-none">
                Edit AO: {aoName} ({eventCount} workouts)
              </span>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-w-[calc(100vw-2rem)]">
          <DropdownMenuItem
            className="flex cursor-pointer items-center px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            onClick={() => {
              openModal(ModalType.UPDATE_LOCATION, {
                requestType: "edit",
                ...eventDefaults,
                ...locationDefaults,
                locationId,
                lat: 0, // Will be updated by data fetch
                lng: 0, // Will be updated by data fetch
              });
            }}
          >
            <span className="inline-flex items-center">
              <Edit className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="whitespace-normal break-words leading-none">
                Edit AO details
              </span>
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex cursor-pointer items-center px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            onClick={() => {
              openModal(ModalType.UPDATE_LOCATION, {
                requestType: "move_ao_to_different_region",
                ...eventDefaults,
                ...locationDefaults,
                locationId,
                lat: 0, // Will be updated by data fetch
                lng: 0, // Will be updated by data fetch
              });
            }}
          >
            <span className="inline-flex items-center">
              <ArrowRight className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="whitespace-normal break-words leading-none">
                Move to different region
              </span>
            </span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            className="flex cursor-pointer items-center px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => {
              openModal(ModalType.UPDATE_LOCATION, {
                requestType: "delete_ao",
                ...eventDefaults,
                ...locationDefaults,
                locationId,
                lat: 0, // Will be updated by data fetch
                lng: 0, // Will be updated by data fetch
              });
            }}
          >
            <span className="inline-flex items-center">
              <Trash className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="whitespace-normal break-words leading-none">
                Delete this AO
              </span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Event Edit Button - only show if an event is selected */}
      {eventId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between border-blue-500 bg-blue-500 text-white transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
            >
              <span className="inline-flex items-center">
                <Edit className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-normal break-words leading-none">
                  Edit Workout: {eventName}{" "}
                  {timeDisplay ? `(${timeDisplay})` : ""}
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-w-[calc(100vw-2rem)]">
            <DropdownMenuItem
              className="flex cursor-pointer items-center px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              onClick={() => {
                openModal(ModalType.UPDATE_LOCATION, {
                  requestType: "edit",
                  ...eventDefaults,
                  ...locationDefaults,
                  locationId,
                  eventId,
                  lat: 0, // Will be updated by data fetch
                  lng: 0, // Will be updated by data fetch
                });
              }}
            >
              <span className="inline-flex items-center">
                <Edit className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-normal break-words leading-none">
                  Edit workout details
                </span>
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex cursor-pointer items-center px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              onClick={() => {
                openModal(ModalType.UPDATE_LOCATION, {
                  requestType: "move_event_to_different_ao",
                  ...eventDefaults,
                  ...locationDefaults,
                  locationId,
                  eventId,
                  lat: 0, // Will be updated by data fetch
                  lng: 0, // Will be updated by data fetch
                });
              }}
            >
              <span className="inline-flex flex-wrap items-center">
                <ArrowRight className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-normal break-words leading-none">
                  Move to different AO
                </span>
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              className="flex cursor-pointer items-center px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => {
                openModal(ModalType.UPDATE_LOCATION, {
                  requestType: "delete_event",
                  ...eventDefaults,
                  ...locationDefaults,
                  locationId,
                  eventId,
                  lat: 0, // Will be updated by data fetch
                  lng: 0, // Will be updated by data fetch
                });
              }}
            >
              <span className="inline-flex flex-wrap items-center">
                <Trash className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="whitespace-normal break-words leading-none">
                  Delete this workout
                </span>
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Add Event Button */}
      <Button
        variant="outline"
        className="w-full justify-start border-blue-500 bg-blue-500 text-white transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
        onClick={() => {
          openModal(ModalType.UPDATE_LOCATION, {
            requestType: "create_event",
            ...eventDefaults,
            ...locationDefaults,
            locationId,
            lat: 0, // Will be updated by data fetch
            lng: 0, // Will be updated by data fetch
          });
        }}
      >
        <span className="inline-flex flex-wrap items-center">
          <CirclePlus className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="whitespace-normal break-words leading-none">
            Add Workout to AO
          </span>
        </span>
      </Button>
    </div>
  );
};

export const getShortDayOfWeek = (day: string | null | undefined) => {
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

export const formatTime = (time: string | null | undefined) => {
  if (!time || time.length !== 4) return "";

  const hour = parseInt(time.substring(0, 2));
  const minute = time.substring(2, 4);
  const period = hour >= 12 ? "p" : "a";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

  return `${displayHour}:${minute}${period}`;
};
