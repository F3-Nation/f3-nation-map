"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

import { CLOSE_ZOOM } from "@f3/shared/app/constants";
import { isTruthy } from "@f3/shared/common/functions";
import { useTheme } from "@f3/ui/theme";

import type { F3Marker, F3MarkerLocation } from "~/utils/types";
import { isTouchDevice } from "~/utils/is-touch-device";
import { setView } from "~/utils/set-view";
import { mapStore } from "~/utils/store/map";
import {
  selectedItemStore,
  setSelectedItem,
} from "~/utils/store/selected-item";
import { useFilteredMapResults } from "./filtered-map-results-provider";

type CanvasEventData = {
  data: { options: { data: { item: F3MarkerLocation | F3Marker } } };
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

interface MarkerType {
  idx: number;
  item: F3MarkerLocation | F3Marker;
}
export const CanvasIconLayer = ({
  markerLocations,
}: {
  markerLocations: F3MarkerLocation[];
}) => {
  const isOnTouchDevice = isTouchDevice();
  const map = useMap();
  const canvasIconLayer = useRef<L.CanvasIconLayer>();
  const zoom = mapStore.use.zoom();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { filteredLocationMarkers } = useFilteredMapResults();

  const isClose = zoom >= CLOSE_ZOOM;

  const farMarkers = useMemo(() => {
    const markerData: (F3MarkerLocation | F3Marker)[] =
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
          // TODO Investigate if I could use a className instead
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
      // if (item?.id === selectedItemStore.get("locationId")) return;
      if (typeof item?.lat === "number" && typeof item.lon === "number") {
        // This is used to center the map on the nearby location
        mapStore.setState({
          nearbyLocationCenter: {
            lat: item.lat,
            lng: item.lon,
            name: "name" in item ? item.name : undefined,
          },
        });

        setView({ lat: item.lat, lng: item.lon });
        setTimeout(() => {
          setSelectedItem({
            locationId: item?.id ?? null,
            eventId: null,
          });
        }, 250);
      }
    },
    [],
  );

  const onHover = useCallback(
    (_: L.LeafletMouseEvent, data: CanvasEventData) => {
      const item = data[0]?.data?.options?.data?.item;
      if (item?.id === selectedItemStore.get("locationId")) return;
      setSelectedItem({
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
      // Turning off hover for now as it is overwhelming
      // canvasIconLayer.current.addOnHoverListener(onHover);
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
