import { MapPinIcon } from "lucide-react";
import { Z_INDEX } from "node_modules/@f3/shared/src/app/constants";
import ReactDOMServer from "react-dom/server";
import { Marker } from "react-leaflet/Marker";
import { Pane } from "react-leaflet/Pane";

import { filterDataWithinMiles } from "~/utils/filtered-data";
import { mapStore } from "~/utils/store/map";
import FeedbackTooltip from "./feedback-tooltip";
import { useFilteredMapResults } from "./filtered-map-results-provider";

export const PlaceResultIconPane = () => {
  const placeResultLocation = mapStore.use.placeResultLocation();
  const { locationOrderedLocationMarkers } = useFilteredMapResults();
  const locationWithinRadius = filterDataWithinMiles({
    data: locationOrderedLocationMarkers,
  });
  const expansionPopupOpen = mapStore.use.expansionPopupOpen();

  return (
    <Pane
      name="place-result-icon-pane"
      style={{ zIndex: Z_INDEX.PLACE_RESULTS_ICON_PANE }}
    >
      {placeResultLocation ? (
        <>
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
            eventHandlers={{
              click: () => {
                mapStore.setState({
                  expansionAreaSelected: {
                    area: null,
                    lat: null,
                    lng: null,
                  },
                  expansionPopupOpen: true,
                });
              },
            }}
          >
            {(!locationWithinRadius || locationWithinRadius.length === 0) &&
              expansionPopupOpen && <FeedbackTooltip />}
          </Marker>
        </>
      ) : null}
    </Pane>
  );
};
