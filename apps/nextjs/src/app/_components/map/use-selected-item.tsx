import { useEffect, useMemo } from "react";

import { RERENDER_LOGS } from "@f3/shared/common/constants";

import { api } from "~/trpc/react";
import {
  selectedItemStore,
  setSelectedItem,
} from "~/utils/store/selected-item";
import { useMapRef } from "./map-ref-provider";

export const useSelectedItem = () => {
  RERENDER_LOGS && console.log("useSelectedItem rerender");
  const locationId = selectedItemStore.use.locationId();
  const eventId = selectedItemStore.use.eventId();
  const { data: selectedLocation } = api.location.getLocationMarker.useQuery(
    { id: locationId ?? -1 },
    { enabled: !!locationId },
  );
  const { mapRef } = useMapRef();
  const position = useMemo(() => {
    if (
      typeof selectedLocation?.lat !== "number" ||
      typeof selectedLocation?.lon !== "number"
    )
      return undefined;
    return mapRef.current?.latLngToContainerPoint({
      lat: selectedLocation.lat,
      lng: selectedLocation.lon,
    });
  }, [selectedLocation?.lat, selectedLocation?.lon, mapRef]);

  const selectedEvent = !selectedLocation
    ? undefined
    : // check for null or undefined
      eventId === null || eventId === undefined
      ? selectedLocation.events[0]
      : // use == incase it is a string
        selectedLocation.events.find((event) => event.id == eventId);

  useEffect(() => {
    if (selectedLocation && eventId === null) {
      setSelectedItem({
        eventId: selectedLocation.events[0]?.id,
      });
    }
  }, [eventId, selectedLocation]);

  // TODO: Styles need to be cleaned up a little and I need to come back as a perfectionist to make sure everything looks beautiful
  return {
    locationId,
    eventId,
    selectedLocation,
    selectedEvent,
    pagePosition: position,
  };
};
