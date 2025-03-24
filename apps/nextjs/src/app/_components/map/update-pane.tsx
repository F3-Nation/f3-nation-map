import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapPinPlusInside } from "lucide-react";

import { Z_INDEX } from "@acme/shared/app/constants";

import { mapStore } from "~/utils/store/map";
import {
  eventDefaults,
  locationDefaults,
  ModalType,
  openModal,
} from "~/utils/store/modal";

export const UpdatePane = () => {
  const updateLocation = mapStore.use.updateLocation();

  return (
    <div style={{ zIndex: Z_INDEX.UPDATE_PANE }}>
      {updateLocation ? (
        <>
          <AdvancedMarker
            draggable
            onClick={(e) => {
              if (!e.latLng) throw new Error("No latLng");
              openModal(ModalType.UPDATE_LOCATION, {
                requestType: "create_location",
                ...eventDefaults,
                ...locationDefaults,
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
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
            <MapPinPlusInside className="size-8 fill-blue-500 text-foreground dark:fill-blue-600" />
          </AdvancedMarker>
        </>
      ) : null}
    </div>
  );
};
