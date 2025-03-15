import { queryClientUtils } from "~/trpc/react";
import { isTouchDevice } from "../is-touch-device";
import { setView } from "../set-view";
import { openPanel, selectedItemStore } from "../store/selected-item";

export const groupMarkerClick = ({
  locationId,
  eventId,
}: {
  locationId?: number | null;
  eventId?: number | null;
}) => {
  const isMobile = isTouchDevice();
  const isAlreadySelected =
    selectedItemStore.get("locationId") === locationId &&
    selectedItemStore.get("eventId") === eventId;
  if (!isMobile || isAlreadySelected) {
    openPanel({ locationId, eventId });
  } else {
    selectedItemStore.setState({
      ...(locationId !== undefined ? { locationId: locationId } : {}),
      ...(eventId !== undefined ? { eventId: eventId } : {}),
      hideSelectedItem: false,
    });
  }
  const location = queryClientUtils.location.getLocationMarkersSparse
    .getData()
    ?.find((marker) => marker.id === locationId);
  if (typeof location?.lat === "number" && typeof location?.lon === "number") {
    setView({ lat: location.lat, lng: location.lon });
  }
};
