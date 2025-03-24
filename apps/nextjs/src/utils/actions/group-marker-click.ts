import { queryClientUtils } from "~/trpc/react";
import {
  selectedItemStore,
  setSelectedItem,
} from "~/utils/store/selected-item";
import { isTouchDevice } from "../is-touch-device";
import { setView } from "../set-view";

export const groupMarkerClick = async ({
  locationId,
  eventId,
}: {
  locationId: number;
  eventId?: number;
}) => {
  const touchDevice = isTouchDevice();
  const isAlreadySelected =
    selectedItemStore.get("locationId") === locationId &&
    selectedItemStore.get("eventId") === eventId;
  const location = await queryClientUtils.location.getLocationMarker.fetch({
    id: locationId,
  });
  if (!location) return;

  const { lat, lon } = location;
  if (lat === null || lon === null) return;

  setSelectedItem({
    locationId,
    eventId,
    showPanel: !touchDevice || isAlreadySelected,
  });
  setView({ lat, lng: lon, zoom: 15 });
};
