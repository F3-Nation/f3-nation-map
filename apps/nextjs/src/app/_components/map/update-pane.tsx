import { MapPinPlusInside } from "lucide-react";
import ReactDOMServer from "react-dom/server";
import { Marker } from "react-leaflet/Marker";
import { Pane } from "react-leaflet/Pane";

import { Z_INDEX } from "@acme/shared/app/constants";

import { mapStore } from "~/utils/store/map";
import { ModalType, openModal } from "~/utils/store/modal";

export const UpdatePane = () => {
  const updateLocation = mapStore.use.updateLocation();

  return (
    <Pane name="update-pane" style={{ zIndex: Z_INDEX.UPDATE_PANE }}>
      {updateLocation ? (
        <>
          <Marker
            draggable
            eventHandlers={{
              click: () => {
                openModal(ModalType.UPDATE_LOCATION, {
                  mode: "new-location",
                  lat: updateLocation.lat,
                  lng: updateLocation.lng,
                });
              },
            }}
            position={updateLocation}
            icon={L.divIcon({
              iconSize: [31, 31],
              iconAnchor: [16, 16],
              className: "",
              html: ReactDOMServer.renderToString(
                <MapPinPlusInside className="fill-blue-500 text-foreground dark:fill-blue-600" />,
              ),
            })}
          ></Marker>
        </>
      ) : null}
    </Pane>
  );
};
