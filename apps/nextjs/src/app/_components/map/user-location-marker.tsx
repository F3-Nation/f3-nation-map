"use client";

import ReactDOMServer from "react-dom/server";
import { Marker } from "react-leaflet";

import { useUserLocation } from "./user-location-provider";

export const UserLocationMarker = () => {
  const { userLocation } = useUserLocation();

  if (!userLocation) return null;
  return (
    <Marker
      position={[userLocation.latitude, userLocation.longitude]}
      icon={L.divIcon({
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        className: "bg-transparent",
        html: ReactDOMServer.renderToString(
          <div className="bg-transparent">
            <div className="flex h-6 w-6  items-center justify-center rounded-full bg-blue-500/30">
              <div className="h-3 w-3 rounded-full border-[1px] border-white bg-blue-500" />
            </div>
          </div>,
        ),
      })}
    />
  );
};
