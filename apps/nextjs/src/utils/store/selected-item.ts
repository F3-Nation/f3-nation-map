import { ZustandStore } from "@acme/shared/common/classes";

import { isTouchDevice } from "../is-touch-device";
import { ModalType, openModal } from "./modal";

// TODO Rename to hoveredItemStore
export const selectedItemStore = new ZustandStore({
  initialState: {
    locationId: null as number | null,
    eventId: null as number | null,
    hideSelectedItem: false,
    panelLocationId: null as number | null,
    panelEventId: null as number | null,
    isEditDragging: false,
  },
  persistOptions: {
    name: "selected-item-store",
    persistedKeys: [],
    version: 1,
    getStorage: () => localStorage,
  },
});

export const hideSelectedItem = () => {
  selectedItemStore.setState({ hideSelectedItem: true });
};

export const clearSelectedItem = () => {
  selectedItemStore.setState({
    locationId: null,
    eventId: null,
    // Don't clear pagePosition so we can reuse it
  });
};

export const setSelectedItem = (item: {
  locationId?: number | null;
  eventId?: number | null;
}) => {
  const isMobile = isTouchDevice();
  selectedItemStore.setState({
    ...(item.locationId !== undefined ? { locationId: item.locationId } : {}),
    ...(item.eventId !== undefined ? { eventId: item.eventId } : {}),
    hideSelectedItem: false,
    ...(isMobile ? { panelLocationId: null, panelEventId: null } : {}),
  });
};

export const openPanel = (item: {
  locationId?: number | null;
  eventId?: number | null;
}) => {
  console.log("openPanel", item);
  openModal(ModalType.WORKOUT_DETAILS, {
    locationId: item.locationId,
    eventId: item.eventId,
  });
  selectedItemStore.setState({
    ...(item.locationId !== undefined
      ? { panelLocationId: item.locationId }
      : {}),
    ...(item.eventId !== undefined ? { panelEventId: item.eventId } : {}),
  });
};

export const closePanel = () => {
  console.log("closePanel");
  selectedItemStore.setState({
    panelLocationId: null,
    panelEventId: null,
  });
};
