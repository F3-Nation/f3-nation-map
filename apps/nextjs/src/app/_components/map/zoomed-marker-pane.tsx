"use client";

import { useMemo } from "react";
import { Pane } from "react-leaflet";

import { CLOSE_ZOOM, Z_INDEX } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { appStore } from "~/utils/store/app";
import { mapStore } from "~/utils/store/map";
import { useFilteredMapResults } from "./filtered-map-results-provider";
import { MemoGroupMarker } from "./group-marker";

export const ZoomedMarkerPane = () => {
  RERENDER_LOGS && console.log("ZoomedMarkerPane rerender");
  const bounds = mapStore.use.bounds();
  const zoom = mapStore.use.zoom();
  const mode = appStore.use.mode();
  const { filteredLocationMarkers } = useFilteredMapResults();

  const isClose = zoom >= CLOSE_ZOOM;

  const viewMarkers = useMemo(() => {
    return !isClose
      ? []
      : filteredLocationMarkers
          ?.filter(
            (group) =>
              group.lat !== null &&
              group.lon !== null &&
              !!bounds?.contains([group.lat, group.lon]),
          )
          // more than 50 should only happen if there is a bug
          .slice(0, 50)
          .map((group, groupIdx) => {
            const show =
              group.lat !== null &&
              group.lon !== null &&
              !!bounds?.contains([group.lat, group.lon]);
            return (
              <MemoGroupMarker
                key={groupIdx}
                group={group}
                show={show}
                mode={mode}
              />
            );
          });
  }, [isClose, filteredLocationMarkers, bounds, mode]);

  return (
    <Pane
      name="zoomed-marker-pane"
      style={{ zIndex: Z_INDEX.ZOOMED_MARKER_PANE }}
    >
      {viewMarkers}
    </Pane>
  );
};
