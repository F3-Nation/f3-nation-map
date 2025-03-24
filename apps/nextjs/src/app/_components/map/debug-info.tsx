"use client";

import { useMap } from "@vis.gl/react-google-maps";

import { Z_INDEX } from "@acme/shared/app/constants";
import { cn } from "@acme/ui";

import { useFilteredMapResults } from "./filtered-map-results-provider";

export const DebugInfo = () => {
  const map = useMap();
  const zoom = map?.getZoom();
  const bounds = map?.getBounds();
  const { filteredLocationMarkers } = useFilteredMapResults();

  return (
    <div
      style={{ zIndex: Z_INDEX.DEBUG_INFO }}
      className={cn(
        `absolute right-0 top-48 h-min bg-foreground/10 p-2 lg:bottom-0 lg:right-0`,
      )}
    >
      <div className="m-0 p-0">Zoom: {zoom?.toFixed(1)}</div>
      <div className="m-0 p-0">
        North: {bounds?.getNorthEast().lat().toFixed(5)}
      </div>
      <div className="m-0 p-0">
        East: {bounds?.getNorthEast().lng().toFixed(5)}
      </div>
      <div className="m-0 p-0">
        South: {bounds?.getSouthWest().lat().toFixed(5)}
      </div>
      <div className="m-0 p-0">
        West: {bounds?.getSouthWest().lng().toFixed(5)}
      </div>
      <div className="m-0 p-0">Workouts: {filteredLocationMarkers?.length}</div>
    </div>
  );
};
