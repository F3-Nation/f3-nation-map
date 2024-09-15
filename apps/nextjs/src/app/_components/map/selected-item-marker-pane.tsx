"use client";

import { Pane } from "react-leaflet/Pane";

import { CLOSE_ZOOM, Z_INDEX } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { api } from "~/trpc/react";
import { mapStore } from "~/utils/store/map";
import { selectedItemStore } from "~/utils/store/selected-item";
import { MemoGroupMarker } from "./group-marker";

export const SelectedIconMarkerPane = () => {
  RERENDER_LOGS && console.log("SelectedIconMarker rerender");
  const zoom = mapStore.use.zoom();
  const eventId = selectedItemStore.use.eventId();
  const locationId = selectedItemStore.use.locationId();
  const { data: filteredLocationMarkers } =
    api.location.getAllLocationMarkers.useQuery();

  const selectedItem = filteredLocationMarkers?.find(
    (location) => location.id === locationId,
  );

  return (
    <Pane
      name="selected-item-marker"
      style={{ zIndex: Z_INDEX.SELECTED_ICON_MARKER_PANE }}
    >
      {!selectedItem ? null : (
        <MemoGroupMarker
          group={selectedItem}
          show={true}
          preventMouseMoveAction={zoom < CLOSE_ZOOM}
          selectedEventIdInGroup={
            selectedItem.events.find((event) => event.id === eventId)?.id ??
            null
          }
        />
      )}
    </Pane>
  );
};
