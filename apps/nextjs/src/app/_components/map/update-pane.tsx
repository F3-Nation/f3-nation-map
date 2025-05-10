import { useEffect } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapPin, MapPinPlusInside, X } from "lucide-react";

import { Z_INDEX } from "@acme/shared/app/constants";
import { TestId } from "@acme/shared/common/enums";
import { Button } from "@acme/ui/button";

import { appStore } from "~/utils/store/app";
import { mapStore } from "~/utils/store/map";
import {
  eventDefaults,
  locationDefaults,
  ModalType,
  openModal,
} from "~/utils/store/modal";

// Custom arrow-to-dot icon component for moving existing things to a new location
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

export const UpdatePane = () => {
  const updateLocation = mapStore.use.updateLocation();
  const mode = appStore.use.mode();

  // Add debugging logs
  console.log("UpdatePane render:", { updateLocation, mode });

  useEffect(() => {
    console.log("UpdatePane updateLocation changed:", updateLocation);
  }, [updateLocation]);

  // Function to clear the update location pin
  const clearUpdateLocation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    mapStore.setState({ updateLocation: null });
  };

  // Create new location with new AO and event
  const handleCreateNew = () => {
    if (!updateLocation) return;

    openModal(ModalType.UPDATE_LOCATION, {
      requestType: "create_location",
      ...eventDefaults,
      ...locationDefaults,
      lat: updateLocation.lat,
      lng: updateLocation.lng,
    });
  };

  // Move existing AO to this location
  const handleMoveAO = () => {
    if (!updateLocation) return;

    openModal(ModalType.UPDATE_LOCATION, {
      requestType: "move_ao_to_new_location",
      ...eventDefaults,
      ...locationDefaults,
      lat: updateLocation.lat,
      lng: updateLocation.lng,
    });
  };

  // Move existing event to new AO here
  const handleMoveEvent = () => {
    if (!updateLocation) return;

    openModal(ModalType.UPDATE_LOCATION, {
      requestType: "move_event_to_new_ao",
      ...eventDefaults,
      ...locationDefaults,
      lat: updateLocation.lat,
      lng: updateLocation.lng,
    });
  };

  return (
    <>
      <div>
        {/* New Location Pin - when clicking on map */}
        {updateLocation && mode === "edit" ? (
          <>
            {/* Position the marker exactly where clicked */}
            <AdvancedMarker
              zIndex={Z_INDEX.UPDATE_PANE}
              draggable
              onClick={(e) => {
                e.stop();
                if (!e.latLng) throw new Error("No latLng");

                // Store latest coordinates
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                mapStore.setState({
                  updateLocation: { lat, lng },
                });
              }}
              onDragEnd={(e) => {
                if (!e.latLng) throw new Error("No latLng");
                mapStore.setState({
                  updateLocation: {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                  },
                });
              }}
              position={updateLocation}
            >
              <div className="relative size-8">
                <MapPinPlusInside
                  data-testid={TestId.UPDATE_PANE_MARKER}
                  className="absolute size-8 fill-blue-500 text-foreground dark:fill-blue-600"
                />
                <div
                  className="absolute top-[110%] z-50 w-[300px]"
                  style={{
                    left: "50%",
                    bottom: "20px",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-1 text-center font-medium">
                      Create options
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500 bg-blue-500 text-white hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                      onClick={handleCreateNew}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      New location with new AO
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-500 bg-green-500 text-white hover:border-green-600 hover:bg-green-600 hover:text-white"
                      onClick={handleMoveAO}
                    >
                      <ArrowToDot className="mr-2 h-4 w-4" />
                      Move existing AO here
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500 bg-purple-500 text-white hover:border-purple-600 hover:bg-purple-600 hover:text-white"
                      onClick={handleMoveEvent}
                    >
                      <ArrowToDot className="mr-2 h-4 w-4" />
                      Move existing event here
                    </Button>
                  </div>

                  <div className="mt-2">
                    <button
                      className="absolute -right-2 -top-2 rounded-full bg-muted-foreground px-1 py-1 text-sm text-background"
                      onClick={clearUpdateLocation}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </AdvancedMarker>

            {/* Options menu positioned in the center bottom of the screen */}
          </>
        ) : null}
      </div>
    </>
  );
};
