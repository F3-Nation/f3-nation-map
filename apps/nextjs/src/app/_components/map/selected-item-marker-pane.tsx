"use client";

import { Pane } from "react-leaflet/Pane";

import { CLOSE_ZOOM, Z_INDEX } from "@acme/shared/app/constants";
import { RERENDER_LOGS } from "@acme/shared/common/constants";

import { filterData } from "~/utils/filtered-data";
import { isTouchDevice } from "~/utils/is-touch-device";
import { filterStore } from "~/utils/store/filter";
import { mapStore } from "~/utils/store/map";
import { selectedItemStore } from "~/utils/store/selected-item";
import { useFilteredMapResults } from "./filtered-map-results-provider";
import { MemoSelectedGroupMarker } from "./selected-group-marker";

// NOT USED
export const SelectedIconMarkerPane = () => {
  RERENDER_LOGS && console.log("SelectedIconMarker rerender");
  const zoom = mapStore.use.zoom();
  const isMobile = isTouchDevice();
  const isEditDragging = selectedItemStore.use.isEditDragging();
  const eventId = selectedItemStore.use.eventId();
  const locationId = selectedItemStore.use.locationId();
  const panelLocationId = selectedItemStore.use.panelLocationId();
  const panelEventId = selectedItemStore.use.panelEventId();
  const { allLocationMarkersWithLatLngAndFilterData } = useFilteredMapResults();

  const selectedItem = allLocationMarkersWithLatLngAndFilterData?.find(
    (location) => location.id === locationId,
  );

  const panelItem = allLocationMarkersWithLatLngAndFilterData?.find(
    (location) => location.id === panelLocationId,
  );

  const filters = filterStore.useBoundStore();

  const [filteredSelectedItem] = filterData(
    selectedItem ? [selectedItem] : [],
    filters,
  );

  const [filteredPanelItem] = filterData(panelItem ? [panelItem] : [], filters);

  return (
    <>
      <Pane
        name="selected-item-marker"
        style={{ zIndex: Z_INDEX.SELECTED_ICON_MARKER_PANE }}
        className="pointer-events-none"
      >
        {isEditDragging || !filteredSelectedItem ? null : (
          <MemoSelectedGroupMarker
            alwaysShowFillInsteadOfOutline={isMobile}
            group={filteredSelectedItem}
            isFar={zoom < CLOSE_ZOOM}
            selectedEventIdInGroup={
              filteredSelectedItem?.events.find((event) => event.id === eventId)
                ?.id ??
              filteredSelectedItem?.events[0]?.id ??
              null
            }
          />
        )}
      </Pane>
      <Pane
        name="panel-item-marker"
        style={{ zIndex: Z_INDEX.SELECTED_ICON_MARKER_PANE }}
        className="pointer-events-none"
      >
        {isEditDragging || !filteredPanelItem ? null : (
          <MemoSelectedGroupMarker
            panel
            group={filteredPanelItem}
            isFar={zoom < CLOSE_ZOOM}
            selectedEventIdInGroup={
              filteredPanelItem?.events.find(
                (event) => event.id === panelEventId,
              )?.id ??
              filteredPanelItem?.events[0]?.id ??
              null
            }
          />
        )}
      </Pane>
    </>
  );
};
