import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
} from "@vis.gl/react-google-maps";

import { useUserLocation } from "./user-location-provider";

export const GeolocationMarker = () => {
  const { userLocation } = useUserLocation();
  return !userLocation ? null : (
    <AdvancedMarker
      anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
      position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40">
        {/* Larger transparent blue circle for accuracy/range indication */}
        <circle cx="20" cy="20" r="18" fill="#4285F4" fillOpacity="0.2" />
        {/* Main blue dot */}
        <circle
          cx="20"
          cy="20"
          r="8"
          fill="#4285F4"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
      </svg>
    </AdvancedMarker>
  );
};
