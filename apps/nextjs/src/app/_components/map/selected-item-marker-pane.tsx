"use client";

import { Pane } from "react-leaflet/Pane";

import { Z_INDEX } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { api } from "~/trpc/react";
import { selectedItemStore } from "~/utils/store/selected-item";
import { MemoSelectedGroupMarker } from "./selected-group-marker";

export const SelectedIconMarkerPane = () => {
  RERENDER_LOGS && console.log("SelectedIconMarker rerender");
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
      className="pointer-events-none"
    >
      {!selectedItem ? null : (
        <MemoSelectedGroupMarker
          group={selectedItem}
          selectedEventIdInGroup={
            selectedItem.events.find((event) => event.id === eventId)?.id ??
            selectedItem.events[0]?.id ??
            null
          }
        />
      )}
    </Pane>
  );
};
