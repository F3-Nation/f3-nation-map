import { MapPinIcon } from "lucide-react";
import ReactDOMServer from "react-dom/server";
import { Marker } from "react-leaflet/Marker";
import { Pane } from "react-leaflet/Pane";

import { mapStore } from "~/utils/store/map";

export const PlaceResultIconPane = () => {
  const placeResultLocation = mapStore.use.placeResultLocation();
  return (
    <Pane name="place-result-icon-pane" style={{ zIndex: 1000 }}>
      {placeResultLocation ? (
        <Marker
          position={placeResultLocation}
          icon={L.divIcon({
            iconSize: [31, 31],
            iconAnchor: [16, 16],
            className: "",
            html: ReactDOMServer.renderToString(
              <MapPinIcon className="fill-red-600 text-foreground" />,
            ),
          })}
        />
      ) : null}
    </Pane>
  );
};
