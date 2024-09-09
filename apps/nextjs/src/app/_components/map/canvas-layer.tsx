"use client";

import L from "leaflet";

// To update the canvas marker
import "~/utils/leaflet-canvas-markers";
// To ensure appearance is correct
import "leaflet/dist/leaflet.css";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMap } from "react-leaflet";

import { CLOSE_ZOOM } from "@f3/shared/app/constants";
import { isTruthy } from "@f3/shared/common/functions";
import { useTheme } from "@f3/ui/theme";

import type { RouterOutputs } from "~/trpc/types";
import { isTouchDevice } from "~/utils/is-touch-device";
import { mapStore } from "~/utils/store/map";
import { selectedItemStore } from "~/utils/store/selected-item";
import { useFilteredMapResults } from "./filtered-map-results-provider";

type CanvasEventData = {
  data: { options: { data: { item: MarkerLocation | Marker } } };
}[];

const getIconSizeForZoom = (zoom: number): number => {
  // these need to be even or else it looks like a square
  if (zoom > 11) return 13;
  if (zoom > 9) return 10;
  if (zoom > 7) return 8;
  if (zoom > 5) return 4;
  if (zoom > 3) return 2;
  return 2;
};

type MarkerLocation =
  RouterOutputs["location"]["getLocationMarkersSparse"][number];
type Marker = RouterOutputs["location"]["getAllLocationMarkers"][number];
interface MarkerType {
  idx: number;
  item: MarkerLocation | Marker;
}
export const CanvasIconLayer = ({
  markerLocations,
}: {
  markerLocations: MarkerLocation[];
}) => {
  const isOnTouchDevice = isTouchDevice();
  const map = useMap();
  const canvasIconLayer = useRef<L.CanvasIconLayer>();
  const zoom = mapStore.use.zoom();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { filteredLocationMarkers } = useFilteredMapResults();

  const isClose = zoom > CLOSE_ZOOM;

  const farMarkers = useMemo(() => {
    const markerData: (MarkerLocation | Marker)[] =
      filteredLocationMarkers ?? markerLocations;
    const iconUrl =
      zoom < 7
        ? isDark
          ? "/icon_white.png"
          : "/icon_black.png"
        : isDark
          ? "/icon_outline_white.png"
          : "/icon_outline_black.png";
    const clearIconUrl = "/icon_clear.png";

    return markerData
      .map((item, idx) => {
        const iconSize = getIconSizeForZoom(zoom);
        const iconProps: L.IconOptions = {
          iconUrl,
          iconSize: [iconSize, iconSize],
          iconAnchor: [iconSize / 2, iconSize / 2],
        };

        const clearIconProps: L.IconOptions = {
          iconUrl: clearIconUrl,
          iconSize: [iconSize * 4, iconSize * 4],
          iconAnchor: [iconSize * 2, iconSize * 2],
        };
        const markers =
          item.lat === null || item.lon === null
            ? null
            : [
                new L.Marker<MarkerType>([item.lat, item.lon], {
                  icon: L.icon(iconProps),
                  data: { idx, item },
                }),
                ...(isOnTouchDevice
                  ? [
                      // A larger clear icon to make it easier to click
                      new L.Marker<MarkerType>([item.lat, item.lon], {
                        icon: L.icon(clearIconProps),
                        data: { idx, item },
                      }),
                    ]
                  : []),
              ];
        return markers;
      })
      .filter(isTruthy);
  }, [filteredLocationMarkers, markerLocations, zoom, isDark, isOnTouchDevice]);

  const onZoomLevelsChange = useCallback(() => {
    if (canvasIconLayer.current && !isClose) {
      canvasIconLayer.current.redraw();
    }
  }, [isClose]);

  const onClick = useCallback(
    (_: L.LeafletMouseEvent, data: CanvasEventData) => {
      const item = data[0]?.data?.options?.data?.item;
      console.log("canvas-layer click", item);
      if (item?.id === selectedItemStore.get("locationId")) return;
      selectedItemStore.setState({ locationId: item?.id ?? null });
      if (typeof item?.lat === "number" && typeof item.lon === "number") {
        console.log("canvas-layer setView", item);
        map.setView({ lat: item?.lat, lng: item.lon }, 15);
      }
    },
    [map],
  );

  const onHover = useCallback(
    (_: L.LeafletMouseEvent, data: CanvasEventData) => {
      const item = data[0]?.data?.options?.data?.item;
      if (item?.id === selectedItemStore.get("locationId")) return;
      selectedItemStore.setState({
        locationId: item?.id ?? null,
        eventId: null,
      });
    },
    [],
  );

  // Initialization the canvas layer
  useEffect(() => {
    if (!map) return;
    map.on("zoom", onZoomLevelsChange);

    if (!isClose && !canvasIconLayer.current) {
      console.log("canvas-layer add things");
      canvasIconLayer.current = L.canvasIconLayer({}).addTo(map);
      canvasIconLayer.current.addOnClickListener(onClick);
      canvasIconLayer.current.addOnHoverListener(onHover);
      canvasIconLayer.current?.addMarkers(farMarkers.flat());
    } else if (isClose && canvasIconLayer.current) {
      canvasIconLayer.current.remove();
      canvasIconLayer.current = undefined;
    }

    return () => {
      map.off("zoom", onZoomLevelsChange);
      if (canvasIconLayer.current) {
        canvasIconLayer.current.remove();
        canvasIconLayer.current = undefined;
      }
    };
  }, [map, isClose, onClick, onHover, onZoomLevelsChange, farMarkers]);

  // Add markers to the canvas layer
  useEffect(() => {
    if (!map) return;
    canvasIconLayer.current?.addMarkers(farMarkers.flat());
  }, [farMarkers, map]);

  return null;
};
