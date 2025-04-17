import type { Feature, Point } from "geojson";

import { adjustBounds } from "~/utils/adjust-bounds";
import { getBoundsOfLeaves } from "~/utils/get-bounds-of-leaves";

export const getMapPosForLeaves = (params: {
  leaves: Feature<Point>[];
  map: google.maps.Map;
  lngScale?: number;
  latScale?: number;
}) => {
  const { leaves, map, lngScale = 1, latScale = 1 } = params;

  const boundsOfLeaves = getBoundsOfLeaves(leaves);
  const adjustedBounds = adjustBounds({
    bounds: boundsOfLeaves,
    lngScale,
    latScale,
  });

  const currentBounds = map.getBounds() ?? new google.maps.LatLngBounds();
  const currentZoom = map.getZoom() ?? 0;

  const ne = adjustedBounds.getNorthEast();
  const sw = adjustedBounds.getSouthWest();
  const center = {
    lat: (ne.lat() + sw.lat()) / 2,
    lng: (ne.lng() + sw.lng()) / 2,
  };

  // Calculate spans
  const latSpan = ne.lat() - sw.lat();
  const lngSpan = ne.lng() - sw.lng();

  const currentNe = currentBounds.getNorthEast();
  const currentSw = currentBounds.getSouthWest();
  const currentLatSpan = currentNe.lat() - currentSw.lat();
  const currentLngSpan = currentNe.lng() - currentSw.lng();

  // Calculate zoom offset based on span ratios
  const latZoomOffset = Math.log2(latSpan / currentLatSpan);
  const lngZoomOffset = Math.log2(lngSpan / currentLngSpan);

  // Calculate new zoom levels
  const latZoom = currentZoom - latZoomOffset;
  const lngZoom = currentZoom - lngZoomOffset;

  // Use the smaller zoom to ensure all points are visible
  const zoomValue = Math.min(latZoom, lngZoom);

  // It seems that fractional zoom is applied automatically
  // const zoom = IS_FRACTIONAL_ZOOM_ENABLED ? zoomValue : Math.floor(zoomValue);
  const zoom = zoomValue;

  console.log("getMapPosForLeaves", {
    currentZoom,
    latZoom,
    lngZoom,
    finalZoom: zoom,
  });

  return { center, zoom };
};
