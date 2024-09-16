"use client";

import { Pane } from "react-leaflet/Pane";

import { Z_INDEX } from "@f3/shared/app/constants";
import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { api } from "~/trpc/react";
import { filterData } from "~/utils/filtered-data";
import { filterStore } from "~/utils/store/filter";
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

  const filters = filterStore.useBoundStore();

  const [filteredSelectedItem] = filterData(
    selectedItem ? [selectedItem] : [],
    filters,
  );

  return (
    <Pane
      name="selected-item-marker"
      style={{ zIndex: Z_INDEX.SELECTED_ICON_MARKER_PANE }}
      className="pointer-events-none"
    >
      {!filteredSelectedItem ? null : (
        <MemoSelectedGroupMarker
          group={filteredSelectedItem}
          selectedEventIdInGroup={
            filteredSelectedItem?.events.find((event) => event.id === eventId)
              ?.id ??
            filteredSelectedItem?.events[0]?.id ??
            null
          }
        />
      )}
    </Pane>
  );
};
