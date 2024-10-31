import Image from "next/image";
import ReactDOMServer from "react-dom/server";
import { Marker } from "react-leaflet/Marker";

import { useTheme } from "@f3/ui/theme";

import { mapStore } from "~/utils/store/map";
import FeedbackPopup from "./feedback-popup";

const PlaceExpansionNearbyMarker = ({
  nearbyUsers,
}: {
  nearbyUsers: {
    id: string;
    lat: number;
    lng: number;
    area: string;
  };
}) => {
  const zoom = mapStore.use.zoom();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const iconUrl =
    zoom < 7
      ? isDark
        ? "/icon_white.png"
        : "/icon_black.png"
      : isDark
        ? "/icon_outline_white.png"
        : "/icon_outline_black.png";

  return (
    <Marker
      key={`nearby-user-marker-${nearbyUsers.id}`}
      position={{ lat: nearbyUsers.lat, lng: nearbyUsers.lng }}
      icon={L.divIcon({
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: "",
        html: ReactDOMServer.renderToString(
          <Image src={iconUrl} width={31} height={31} alt="" />,
        ),
      })}
      eventHandlers={{
        click: () => {
          mapStore.setState({
            expansionPopupOpen: false,
            expansionAreaSelected: {
              area: nearbyUsers.area,
              lat: nearbyUsers.lat,
              lng: nearbyUsers.lng,
            },
          });
        },
      }}
    >
      <FeedbackPopup />
    </Marker>
  );
};

export default PlaceExpansionNearbyMarker;
