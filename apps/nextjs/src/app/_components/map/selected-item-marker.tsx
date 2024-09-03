"use client";

import { Pane } from "react-leaflet/Pane";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { api } from "~/trpc/react";
import { selectedItemStore } from "~/utils/store/selected-item";
import { MemoGroupMarker } from "./group-marker";

export const SelectedIconMarkerLayer = () => {
  RERENDER_LOGS && console.log("SelectedIconMarker rerender");
  const eventId = selectedItemStore.use.eventId();
  const locationId = selectedItemStore.use.locationId();
  const { data: filteredLocationMarkers } =
    api.location.getAllLocationMarkers.useQuery();

  const selectedItem = filteredLocationMarkers?.find(
    (location) => location.id === locationId,
  );

  // TODO: Styles need to be cleaned up a little and I need to come back as a perfectionist to make sure everything looks beautiful
  return (
    <Pane name="selected-item-marker" style={{ zIndex: 1000 }}>
      {!selectedItem ? null : (
        <MemoGroupMarker
          group={selectedItem}
          show={true}
          preventMouseMoveAction
          selectedEventIdInGroup={
            selectedItem.events.find((event) => event.id === eventId)?.id ??
            null
          }
        />
      )}
    </Pane>
  );
};
