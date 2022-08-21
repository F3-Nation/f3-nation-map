"use client";

import type { LatLngExpression } from "leaflet";
import { useState } from "react";
import { MapPinIcon } from "lucide-react";
import ReactDOMServer from "react-dom/server";
import { Marker, Pane } from "react-leaflet";

import { mapStore } from "~/utils/store/map";

export const CenterPointMarker = () => {
  const mapRef = mapStore.use.ref();
  const [curCenter, setCurCenter] = useState<LatLngExpression | undefined>(
    mapRef.current?.getCenter(),
  );
  return (
    <Pane name="center-point" style={{ zIndex: 1000 }}>
      {curCenter ? (
        <Marker
          eventHandlers={{
            click: (e) => {
              setCurCenter(mapRef.current?.getCenter());
              console.log("center point clicked", e);
            },
          }}
          position={curCenter}
          icon={L.divIcon({
            iconSize: [32, 32],
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
