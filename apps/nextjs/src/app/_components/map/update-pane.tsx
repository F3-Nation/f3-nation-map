import { useEffect } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { ArrowDownToDot, MapPin, MapPinPlusInside, X } from "lucide-react";

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
                  className="absolute top-[110%] z-50"
                  style={{
                    left: "50%",
                    bottom: "20px",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <Button
                      variant="outline"
                      size="sm"
                      className="grid grid-cols-[20px_1fr] border-blue-500 bg-blue-500 text-white hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                      onClick={handleCreateNew}
                    >
                      <MapPin className="h-4 w-4" />
                      New location with new AO
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="grid grid-cols-[20px_1fr] border-blue-500 bg-blue-500 text-white hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                      onClick={handleMoveAO}
                    >
                      <ArrowDownToDot className="h-4 w-4" />
                      Move existing AO here
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="grid grid-cols-[20px_1fr] border-blue-500 bg-blue-500 text-white hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                      onClick={handleMoveEvent}
                    >
                      <ArrowDownToDot className="h-4 w-4" />
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
