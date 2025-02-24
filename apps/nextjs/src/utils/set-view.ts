import { CLOSE_ZOOM } from "@f3/shared/app/constants";

import { isTouchDevice } from "./is-touch-device";
import { mapStore } from "./store/map";
import { modalStore, ModalType } from "./store/modal";

export const setView = ({
  lat,
  lng,
  zoom,
  options,
}: {
  lat: number;
  lng: number;
  zoom?: number;
  options?: { animate?: boolean };
}) => {
  const isMobile = isTouchDevice();
  const [openModal] = modalStore.get("modals").slice(-1);
  const type = openModal?.type;
  const mapRef = mapStore.get("ref");
  const workoutModalOpen = openModal && type === ModalType.WORKOUT_DETAILS;
  let center = { lat, lng };
  const newZoom = zoom ?? Math.max(mapStore.get("zoom"), CLOSE_ZOOM);
  mapStore.setState({ hasMovedMap: true });
  if (!isMobile && workoutModalOpen && mapRef.current) {
    const targetPoint = mapRef.current.project(center, newZoom);
    const adjustedTargetPoint = targetPoint.subtract(new L.Point(200, 0));
    const newCenterPoint = mapRef.current.unproject(
      adjustedTargetPoint,
      newZoom,
    );
    center = newCenterPoint;
  }
  mapRef.current?.setView(center, newZoom, {
    animate: options?.animate ?? mapStore.get("zoom") === CLOSE_ZOOM,
  });
};

// Move view
/**
 * Move the view to the point, but not too close to the edge of the map
 * de
 * @param point
 * @returns
 */
export const moveView = (point = new L.Point(200, 0)) => {
  const center = mapStore.get("center");
  const mapRef = mapStore.get("ref");
  const zoom = mapStore.get("zoom");
  if (!mapRef.current || !center) return;
  const targetPoint = mapRef.current.project(center, zoom);
  const adjustedTargetPoint = targetPoint.subtract(point);
  const newCenterPoint = mapRef.current.unproject(adjustedTargetPoint, zoom);
  mapStore.setState({ hasMovedMap: true });
  mapRef.current?.setView(newCenterPoint, zoom, {
    animate: true,
  });
};
