import { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

import { DEFAULT_CENTER } from "@acme/shared/app/constants";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultOptions = {
  disableDefaultUI: true,
  zoomControl: true,
};

interface GoogleMapSimpleProps {
  latitude: number;
  longitude: number;
  onMarkerDragEnd?: (position: google.maps.LatLngLiteral) => void;
}

export const GoogleMapSimple = ({
  latitude,
  longitude,
  onMarkerDragEnd,
}: GoogleMapSimpleProps) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (map && latitude && longitude) {
      map.panTo({ lat: latitude, lng: longitude });
    }
  }, [map, latitude, longitude]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={14}
      center={{
        lat: latitude ?? DEFAULT_CENTER[0],
        lng: longitude ?? DEFAULT_CENTER[1],
      }}
      options={defaultOptions}
      onLoad={setMap}
    >
      <Marker
        position={{
          lat: latitude ?? DEFAULT_CENTER[0],
          lng: longitude ?? DEFAULT_CENTER[1],
        }}
        draggable={true}
        onDragEnd={(e) => {
          if (onMarkerDragEnd && e.latLng) {
            onMarkerDragEnd({
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            });
          }
        }}
      />
    </GoogleMap>
  );
};

export default GoogleMapSimple;
