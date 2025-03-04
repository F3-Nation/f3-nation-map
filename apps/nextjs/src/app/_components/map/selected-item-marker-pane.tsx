"use client";

import { useMemo } from "react";
import { Pane } from "react-leaflet/Pane";

import { Z_INDEX } from "@acme/shared/app/constants";
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
  const modifiedLocationMarkers = mapStore.use.modifiedLocationMarkers();
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

  const filteredPanelItem = useMemo(() => {
    const [filteredPanelItem] = filterData(
      panelItem ? [panelItem] : [],
      filters,
    );

    const modifiedLocationMarker =
      panelLocationId != undefined
        ? modifiedLocationMarkers[panelLocationId]
        : null;

    return filteredPanelItem
      ? { ...filteredPanelItem, ...modifiedLocationMarker }
      : null;
  }, [panelItem, filters, panelLocationId, modifiedLocationMarkers]);

  const filteredSelectedItem = useMemo(() => {
    const [filteredSelectedItem] = filterData(
      selectedItem ? [selectedItem] : [],
      filters,
    );

    const modifiedLocationMarker =
      locationId != undefined ? modifiedLocationMarkers[locationId] : null;

    return filteredSelectedItem
      ? { ...filteredSelectedItem, ...modifiedLocationMarker }
      : null;
  }, [selectedItem, filters, locationId, modifiedLocationMarkers]);

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
            selectedIndex={filteredSelectedItem?.events.findIndex(
              (event) => event.id === eventId,
            )}
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
            selectedIndex={filteredPanelItem?.events.findIndex(
              (event) => event.id === panelEventId,
            )}
          />
        )}
      </Pane>
    </>
  );
};
