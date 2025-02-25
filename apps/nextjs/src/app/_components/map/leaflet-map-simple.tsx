import { useEffect, useState } from "react";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import { DEFAULT_CENTER } from "@f3/shared/app/constants";

const MapUpdater = ({
  lat,
  lng,
  setZoom,
}: {
  lat: number;
  lng: number;
  setZoom: (zoom: number) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng]);
    }

    const handleZoom = () => {
      setZoom(map.getZoom());
    };

    map.on("zoomend", handleZoom);
    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [lat, lng, map, setZoom]);

  return null;
};

interface LeafletMapSimpleProps {
  latitude: number;
  longitude: number;
  dragEventHandler?: {
    dragend?: (e: { target: L.Marker }) => void;
  };
}

export const LeafletMapSimple = ({
  latitude,
  longitude,
  dragEventHandler,
}: LeafletMapSimpleProps) => {
  const [zoom, setZoom] = useState(14);

  return (
    <MapContainer
      center={[latitude ?? DEFAULT_CENTER[0], longitude ?? DEFAULT_CENTER[1]]}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      <Marker
        position={[
          latitude ?? DEFAULT_CENTER[0],
          longitude ?? DEFAULT_CENTER[1],
        ]}
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
        draggable={true}
        eventHandlers={dragEventHandler}
      />
      <MapUpdater
        lat={latitude ?? DEFAULT_CENTER[0]}
        lng={longitude ?? DEFAULT_CENTER[1]}
        setZoom={setZoom}
      />
    </MapContainer>
  );
};

export default LeafletMapSimple;
