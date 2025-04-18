import { CLOSE_ZOOM } from "@acme/shared/app/constants";

import { isTouchDevice } from "./is-touch-device";
import { mapStore } from "./store/map";
import { modalStore, ModalType } from "./store/modal";

export const setView = ({
  lat,
  lng,
  zoom,
  options: _options,
}: {
  lat: number;
  lng: number;
  zoom?: number;
  options?: { animate?: boolean; onlyIfNotMovedMap?: boolean };
}) => {
  if (_options?.onlyIfNotMovedMap && mapStore.get("hasMovedMap")) {
    console.log("Not redirecting because we've moved the map");
    return;
  }

  const map = mapStore.get("map");
  const touchDevice = isTouchDevice();
  const [openModal] = modalStore.get("modals").slice(-1);
  const type = openModal?.type;
  const workoutModalOpen = openModal && type === ModalType.WORKOUT_DETAILS;
  let center = { lat, lng };
  const newZoom = zoom ?? Math.max(mapStore.get("zoom"), CLOSE_ZOOM);

  if (!touchDevice && workoutModalOpen && map) {
    // 0.008 corresponds to about 100px at this zoom level
    center = { lat, lng: lng - 0.008 };
  }

  mapStore.setState({
    hasMovedMap: true,
    zoom: newZoom,
    center,
    nearbyLocationCenter: {
      ...center,
      name: null,
      type: "manual-update",
    },
  });
  map?.setZoom(newZoom);
  map?.setCenter(center);
};
